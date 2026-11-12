-- ==============================================================================
-- BENGKELPRO - MIGRATION 003: MECHANIC COMPLETION & PAYMENT WORKFLOW
-- Adds 'work_done' & 'awaiting_payment' SPK states, mechanic completion metadata,
-- atomic runtime state sync table, and ACID completion/payment procedures.
-- ==============================================================================

-- 1. Extend work_orders status check constraint & completion metadata columns
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    SELECT con.conname INTO constraint_name
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'work_orders'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%waiting_approval%';

    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE work_orders DROP CONSTRAINT %I', constraint_name);
    END IF;
END $$;

ALTER TABLE work_orders
    ADD CONSTRAINT work_orders_status_check
    CHECK (status IN (
        'waiting',
        'inspection',
        'waiting_approval',
        'in_progress',
        'waiting_parts',
        'work_done',
        'awaiting_payment',
        'completed',
        'delivered',
        'cancelled'
    ));

ALTER TABLE work_orders
    ADD COLUMN IF NOT EXISTS work_result TEXT,
    ADD COLUMN IF NOT EXISTS completed_by_mechanic_id UUID REFERENCES mechanics(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS mechanic_completed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_work_orders_completed_mechanic
    ON work_orders(workshop_id, completed_by_mechanic_id, status);

-- 2. Runtime state table for seamless serverless hydration when using JSON-synced operational state
CREATE TABLE IF NOT EXISTS app_runtime_state (
    id TEXT PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 1,
    payload JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ACID PL/pgSQL Function: Mechanic marks Work Order as Selesai Dikerjakan (work_done)
-- Does NOT mark invoice paid or insert fake revenue.
CREATE OR REPLACE FUNCTION complete_work_order_by_mechanic(
    p_workshop_id UUID,
    p_work_order_id UUID,
    p_mechanic_id UUID,
    p_inspection_findings TEXT DEFAULT NULL,
    p_work_result TEXT DEFAULT NULL
)
RETURNS work_orders
LANGUAGE plpgsql
AS $$
DECLARE
    v_wo work_orders%ROWTYPE;
    v_is_assigned BOOLEAN;
    v_item RECORD;
    v_prev_stock INT;
BEGIN
    SELECT * INTO v_wo
    FROM work_orders
    WHERE id = p_work_order_id AND workshop_id = p_workshop_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Work order tidak ditemukan';
    END IF;

    IF v_wo.status IN ('work_done', 'awaiting_payment', 'completed', 'delivered', 'cancelled') THEN
        RAISE EXCEPTION 'Status SPK saat ini (%) tidak dapat diselesaikan lagi oleh mekanik', v_wo.status;
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM mechanic_assignments
        WHERE work_order_id = p_work_order_id AND mechanic_id = p_mechanic_id
    ) INTO v_is_assigned;

    IF NOT v_is_assigned THEN
        RAISE EXCEPTION 'Pekerjaan SPK ini tidak ditugaskan kepada mekanik tersebut';
    END IF;

    -- Deduct any un-deducted approved spare parts safely
    FOR v_item IN
        SELECT * FROM work_order_items
        WHERE work_order_id = p_work_order_id
          AND item_type = 'part'
          AND is_approved = true
          AND is_parts_deducted = false
          AND reference_id IS NOT NULL
    LOOP
        SELECT stock_quantity INTO v_prev_stock
        FROM products
        WHERE id = v_item.reference_id AND workshop_id = p_workshop_id
        FOR UPDATE;

        IF NOT FOUND OR v_prev_stock < v_item.quantity THEN
            RAISE EXCEPTION 'Stok spare part % tidak mencukupi', v_item.name;
        END IF;

        UPDATE products
        SET stock_quantity = stock_quantity - v_item.quantity,
            updated_at = NOW()
        WHERE id = v_item.reference_id;

        UPDATE work_order_items
        SET is_parts_deducted = true
        WHERE id = v_item.id;

        INSERT INTO stock_movements (
            workshop_id, product_id, reference_type, reference_id,
            movement_type, quantity, previous_stock, current_stock,
            unit_cost, notes
        )
        SELECT
            p_workshop_id, id, 'work_order', p_work_order_id,
            'out', v_item.quantity, v_prev_stock, stock_quantity,
            purchase_price, format('Penggunaan suku cadang SPK #%s', v_wo.work_order_number)
        FROM products WHERE id = v_item.reference_id;
    END LOOP;

    UPDATE work_orders
    SET status = 'work_done',
        customer_approval_status = 'approved',
        approved_at = COALESCE(approved_at, NOW()),
        inspection_findings = COALESCE(NULLIF(BTRIM(p_inspection_findings), ''), inspection_findings),
        work_result = COALESCE(NULLIF(BTRIM(p_work_result), ''), work_result),
        final_notes = COALESCE(NULLIF(BTRIM(p_work_result), ''), final_notes),
        completed_by_mechanic_id = p_mechanic_id,
        mechanic_completed_at = COALESCE(mechanic_completed_at, NOW()),
        updated_at = NOW()
    WHERE id = p_work_order_id
    RETURNING * INTO v_wo;

    INSERT INTO work_order_status_history (work_order_id, status_from, status_to, notes)
    VALUES (p_work_order_id, v_wo.status, 'work_done', COALESCE(p_work_result, 'Selesai dikerjakan oleh mekanik'));

    RETURN v_wo;
END;
$$;

-- 4. ACID PL/pgSQL Function: Cashier confirms payment & transitions SPK to completed (Lunas)
CREATE OR REPLACE FUNCTION confirm_invoice_payment(
    p_workshop_id UUID,
    p_invoice_id UUID,
    p_amount NUMERIC,
    p_payment_method TEXT,
    p_external_reference TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS invoices
LANGUAGE plpgsql
AS $$
DECLARE
    v_inv invoices%ROWTYPE;
    v_new_paid NUMERIC;
    v_new_status TEXT;
BEGIN
    SELECT * INTO v_inv
    FROM invoices
    WHERE id = p_invoice_id AND workshop_id = p_workshop_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice tidak ditemukan';
    END IF;

    IF p_idempotency_key IS NOT NULL AND EXISTS (
        SELECT 1 FROM payments WHERE idempotency_key = p_idempotency_key
    ) THEN
        RETURN v_inv;
    END IF;

    IF v_inv.payment_status = 'paid' THEN
        RAISE EXCEPTION 'Invoice % sudah lunas', v_inv.invoice_number;
    END IF;

    IF p_amount <= 0 OR p_amount > (v_inv.total_amount - v_inv.paid_amount) THEN
        RAISE EXCEPTION 'Nominal pembayaran tidak valid terhadap sisa tagihan';
    END IF;

    INSERT INTO payments (
        workshop_id, invoice_id, payment_number, amount,
        payment_method, external_reference, status, notes, idempotency_key
    ) VALUES (
        p_workshop_id, p_invoice_id,
        format('PAY-%s', to_char(NOW(), 'YYMM-HH24MISS')),
        p_amount, p_payment_method, p_external_reference, 'success', p_notes, p_idempotency_key
    );

    v_new_paid := v_inv.paid_amount + p_amount;
    IF v_new_paid >= v_inv.total_amount THEN
        v_new_status := 'paid';
    ELSE
        v_new_status := 'partially_paid';
    END IF;

    UPDATE invoices
    SET paid_amount = v_new_paid,
        payment_status = v_new_status,
        updated_at = NOW()
    WHERE id = p_invoice_id
    RETURNING * INTO v_inv;

    IF v_new_status = 'paid' AND v_inv.work_order_id IS NOT NULL THEN
        UPDATE work_orders
        SET status = CASE WHEN status = 'delivered' THEN 'delivered' ELSE 'completed' END,
            paid_at = COALESCE(paid_at, NOW()),
            updated_at = NOW()
        WHERE id = v_inv.work_order_id;
    END IF;

    RETURN v_inv;
END;
$$;
