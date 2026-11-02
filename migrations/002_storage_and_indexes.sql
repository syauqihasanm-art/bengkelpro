-- ==============================================================================
-- BENGKELPRO - STORAGE POLICIES & PRODUCTION OPTIMIZATION INDEXES
-- Supabase Storage Buckets & Multi-Tenant Access Control
-- ==============================================================================

-- 1. STORAGE BUCKET CREATION (Supabase Storage)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('workshop-media', 'workshop-media', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('vehicle-photos', 'vehicle-photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('invoice-attachments', 'invoice-attachments', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
    ('workshop-documents', 'workshop-documents', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- 2. STORAGE RLS POLICIES

-- Workshop Media (Public logos & banners)
CREATE POLICY "Public Workshop Media Read" ON storage.objects
    FOR SELECT USING (bucket_id = 'workshop-media');

CREATE POLICY "Workshop Owner Upload Media" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'workshop-media' 
        AND auth.role() = 'authenticated'
    );

-- Vehicle Photos (Private, authenticated members only)
CREATE POLICY "Workshop Members View Vehicle Photos" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'vehicle-photos' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Workshop Members Upload Vehicle Photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'vehicle-photos' 
        AND auth.role() = 'authenticated'
    );

-- Invoice Attachments (Private, authenticated members only)
CREATE POLICY "Workshop Members View Invoice Attachments" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'invoice-attachments' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Workshop Members Upload Invoice Attachments" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'invoice-attachments' 
        AND auth.role() = 'authenticated'
    );

-- 3. ADDITIONAL PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_work_orders_workshop_status ON work_orders(workshop_id, status);
CREATE INDEX IF NOT EXISTS idx_work_orders_created_at ON work_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_workshop_status ON invoices(workshop_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_workshop_date ON bookings(workshop_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate_number ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_audit_logs_workshop_created ON audit_logs(workshop_id, created_at DESC);
