-- ==============================================================================
-- BENGKELPRO - PRODUCTION POSTGRESQL SCHEMA (34 RELATIONAL TABLES)
-- Multi-Tenant Architecture with Row Level Security (RLS)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ROLES
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

INSERT INTO roles (name, description) VALUES
    ('super_admin', 'Platform Administrator with global oversight'),
    ('workshop_owner', 'Workshop Owner with full tenant control'),
    ('workshop_admin', 'Workshop Admin managing daily operations'),
    ('mechanic', 'Workshop Mechanic performing repair & inspection work'),
    ('customer', 'Vehicle owner and customer')
ON CONFLICT (name) DO NOTHING;

-- 3. PERMISSIONS
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    description TEXT
);

-- 4. WORKSHOPS (Multi-tenant Root)
CREATE TABLE IF NOT EXISTS workshops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    workshop_type TEXT NOT NULL CHECK (workshop_type IN ('motor', 'mobil', 'umum')),
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'business')),
    capacity_per_day INT NOT NULL DEFAULT 15,
    is_public_listed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WORKSHOP MEMBERS (RBAC & Tenant Isolation)
CREATE TABLE IF NOT EXISTS workshop_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('workshop_owner', 'workshop_admin', 'mechanic')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workshop_id, user_id)
);

-- 6. WORKSHOP BRANCHES
CREATE TABLE IF NOT EXISTS workshop_branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    is_main BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    notes TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_customers_workshop_phone ON customers(workshop_id, phone);

-- 8. CUSTOMER ACCOUNTS (Links customer record to authenticated user)
CREATE TABLE IF NOT EXISTS customer_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id, user_id)
);

-- 9. VEHICLES
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('motor', 'mobil', 'truk', 'lainnya')),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    production_year INT,
    license_plate TEXT NOT NULL,
    chassis_number TEXT,
    engine_number TEXT,
    current_odometer INT NOT NULL DEFAULT 0 CHECK (current_odometer >= 0),
    notes TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(workshop_id, license_plate);

-- 10. SERVICES (Standard Workshop Labor & Packages)
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    standard_duration_minutes INT NOT NULL DEFAULT 60,
    base_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workshop_id, code)
);

-- 11. BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    booking_code TEXT NOT NULL,
    service_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    customer_complaint TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'in_service', 'completed', 'cancelled', 'rejected')),
    estimated_cost NUMERIC(15, 2) DEFAULT 0.00,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workshop_id, booking_code)
);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(workshop_id, service_date);

-- 12. BOOKING STATUS HISTORY
CREATE TABLE IF NOT EXISTS booking_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    status_from TEXT,
    status_to TEXT NOT NULL,
    changed_by UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. WORK ORDERS
CREATE TABLE IF NOT EXISTS work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    work_order_number TEXT NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    odometer_in INT NOT NULL DEFAULT 0,
    customer_complaint TEXT NOT NULL,
    inspection_findings TEXT,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'inspection', 'waiting_approval', 'in_progress', 'waiting_parts', 'completed', 'delivered', 'cancelled')),
    total_labor NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_parts NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    customer_approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (customer_approval_status IN ('pending', 'approved', 'rejected')),
    approved_at TIMESTAMPTZ,
    final_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workshop_id, work_order_number)
);

-- 14. WORK ORDER ITEMS
CREATE TABLE IF NOT EXISTS work_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('service', 'part')),
    reference_id UUID,
    name TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    is_approved BOOLEAN NOT NULL DEFAULT true,
    is_parts_deducted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. WORK ORDER STATUS HISTORY
CREATE TABLE IF NOT EXISTS work_order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    status_from TEXT,
    status_to TEXT NOT NULL,
    changed_by UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. MECHANICS
CREATE TABLE IF NOT EXISTS mechanics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    specialization TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    rating NUMERIC(3, 2) DEFAULT 5.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. MECHANIC ASSIGNMENTS
CREATE TABLE IF NOT EXISTS mechanic_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    mechanic_id UUID NOT NULL REFERENCES mechanics(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'lead' CHECK (role IN ('lead', 'assistant')),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    notes TEXT
);

-- 18. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('service', 'part')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. PRODUCTS (Inventory / Spare Parts)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    purchase_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 5,
    unit TEXT NOT NULL DEFAULT 'pcs',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workshop_id, sku)
);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(workshop_id, sku);

-- 20. SUPPLIERS
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. PURCHASES (Purchase Orders to Suppliers)
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    purchase_number TEXT NOT NULL,
    purchase_date DATE NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ordered', 'received', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workshop_id, purchase_number)
);

-- 22. PURCHASE ITEMS
CREATE TABLE IF NOT EXISTS purchase_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(15, 2) NOT NULL,
    total_cost NUMERIC(15, 2) NOT NULL,
    is_received BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. STOCK MOVEMENTS (Immutable Audit Log for Inventory)
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    reference_type TEXT NOT NULL CHECK (reference_type IN ('purchase', 'work_order', 'adjustment')),
    reference_id UUID,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
    quantity INT NOT NULL,
    previous_stock INT NOT NULL,
    current_stock INT NOT NULL,
    unit_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. INVOICES
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('draft', 'unpaid', 'partially_paid', 'paid', 'cancelled', 'refunded')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workshop_id, invoice_number)
);

-- 25. INVOICE ITEMS
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('service', 'part')),
    name TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    payment_number TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'qris', 'other')),
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    external_reference TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    verified_by UUID REFERENCES profiles(id),
    notes TEXT,
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 27. EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('operasional', 'gaji', 'listrik_air', 'sewa', 'peralatan', 'lainnya')),
    title TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'cash',
    receipt_url TEXT,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 28. SERVICE HISTORIES
CREATE TABLE IF NOT EXISTS service_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id),
    service_date DATE NOT NULL,
    odometer INT NOT NULL,
    complaint TEXT NOT NULL,
    findings TEXT,
    work_completed TEXT NOT NULL,
    parts_replaced TEXT,
    total_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    next_maintenance_odometer INT,
    next_maintenance_date DATE,
    reminder_status TEXT NOT NULL DEFAULT 'pending' CHECK (reminder_status IN ('pending', 'sent', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 29. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('booking', 'work_order', 'stock_alert', 'payment', 'reminder', 'system')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 30. SUBSCRIPTIONS (Platform billing)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL UNIQUE REFERENCES workshops(id) ON DELETE CASCADE,
    plan_code TEXT NOT NULL CHECK (plan_code IN ('free', 'basic', 'pro', 'business')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'expired')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price_monthly NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    max_staff INT NOT NULL DEFAULT 2,
    max_work_orders_per_month INT NOT NULL DEFAULT 30,
    has_ai BOOLEAN NOT NULL DEFAULT false,
    has_multi_branch BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 31. SUBSCRIPTION PAYMENTS
CREATE TABLE IF NOT EXISTS subscription_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'success',
    external_transaction_id TEXT,
    invoice_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 32. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID REFERENCES workshops(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_email TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 33. SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID REFERENCES workshops(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 34. AI USAGE LOGS
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID REFERENCES workshops(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    feature_type TEXT NOT NULL,
    prompt_tokens INT DEFAULT 0,
    response_tokens INT DEFAULT 0,
    estimated_cost NUMERIC(10, 4) DEFAULT 0.0000,
    status TEXT NOT NULL DEFAULT 'success',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Multi-tenant isolation based on authenticated user's workshop membership
-- ==============================================================================

ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is member of a workshop
CREATE OR REPLACE FUNCTION is_workshop_member(target_workshop_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM workshop_members
        WHERE workshop_id = target_workshop_id
          AND user_id = auth.uid()
          AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles p
        JOIN workshop_members wm ON wm.user_id = p.id
        WHERE p.id = auth.uid() AND wm.role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Workshops RLS
CREATE POLICY "Public workshops can be viewed if listed" ON workshops
    FOR SELECT USING (is_public_listed = true OR is_workshop_member(id) OR is_super_admin());

CREATE POLICY "Workshop owners can update their workshop" ON workshops
    FOR UPDATE USING (owner_id = auth.uid() OR is_super_admin());

-- Customers RLS
CREATE POLICY "Members can view customers in their workshop" ON customers
    FOR SELECT USING (is_workshop_member(workshop_id) OR is_super_admin());

CREATE POLICY "Members can insert customers in their workshop" ON customers
    FOR INSERT WITH CHECK (is_workshop_member(workshop_id));

CREATE POLICY "Members can update customers in their workshop" ON customers
    FOR UPDATE USING (is_workshop_member(workshop_id));

-- Vehicles RLS
CREATE POLICY "Members can view vehicles in their workshop" ON vehicles
    FOR SELECT USING (is_workshop_member(workshop_id) OR is_super_admin());

CREATE POLICY "Members can insert vehicles in their workshop" ON vehicles
    FOR INSERT WITH CHECK (is_workshop_member(workshop_id));

CREATE POLICY "Members can update vehicles in their workshop" ON vehicles
    FOR UPDATE USING (is_workshop_member(workshop_id));

-- Work Orders RLS
CREATE POLICY "Members can view work orders in their workshop" ON work_orders
    FOR SELECT USING (is_workshop_member(workshop_id) OR is_super_admin());

CREATE POLICY "Members can insert work orders in their workshop" ON work_orders
    FOR INSERT WITH CHECK (is_workshop_member(workshop_id));

CREATE POLICY "Members can update work orders in their workshop" ON work_orders
    FOR UPDATE USING (is_workshop_member(workshop_id));

-- Invoices RLS
CREATE POLICY "Members can view invoices in their workshop" ON invoices
    FOR SELECT USING (is_workshop_member(workshop_id) OR is_super_admin());

CREATE POLICY "Members can manage invoices in their workshop" ON invoices
    FOR ALL USING (is_workshop_member(workshop_id) OR is_super_admin());

-- Products & Stock RLS
CREATE POLICY "Members can view products in their workshop" ON products
    FOR SELECT USING (is_workshop_member(workshop_id) OR is_super_admin());

CREATE POLICY "Members can manage products in their workshop" ON products
    FOR ALL USING (is_workshop_member(workshop_id) OR is_super_admin());

CREATE POLICY "Members can view stock movements in their workshop" ON stock_movements
    FOR SELECT USING (is_workshop_member(workshop_id) OR is_super_admin());
