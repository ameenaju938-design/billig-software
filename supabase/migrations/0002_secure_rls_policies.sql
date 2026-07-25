-- 0002_secure_rls_policies.sql

-- 1. Drop existing insecure policies from 0000_schema.sql
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.customers;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.product_variants;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.invoices;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.expenses;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.purchase_bills;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.purchase_items;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.suppliers;

-- 2. Create helper function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- 3. Apply New Secure Policies

-- ==========================================
-- USERS TABLE
-- ==========================================
-- Everyone can read their own profile
CREATE POLICY "Users can view own profile" ON public.users 
  FOR SELECT USING (auth.uid() = id);
  
-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.users 
  FOR SELECT USING (public.get_user_role() = 'Admin');

-- Admins can update/delete all profiles
CREATE POLICY "Admins can manage profiles" ON public.users 
  FOR ALL USING (public.get_user_role() = 'Admin');

-- ==========================================
-- GENERAL TABLES (Customers, Products, Variants)
-- ==========================================
-- All authenticated users (Admin, Manager, Cashier) can READ products and customers
CREATE POLICY "All authenticated users can read core data" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "All authenticated users can read core data" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "All authenticated users can read core data" ON public.product_variants FOR SELECT TO authenticated USING (true);

-- Only Admins and Managers can INSERT/UPDATE/DELETE core data
CREATE POLICY "Admins and Managers can manage customers" ON public.customers FOR ALL USING (public.get_user_role() IN ('Admin', 'Manager'));
CREATE POLICY "Admins and Managers can manage products" ON public.products FOR ALL USING (public.get_user_role() IN ('Admin', 'Manager'));
CREATE POLICY "Admins and Managers can manage product_variants" ON public.product_variants FOR ALL USING (public.get_user_role() IN ('Admin', 'Manager'));

-- ==========================================
-- SALES TABLES (Invoices, Invoice Items)
-- ==========================================
-- Cashiers can create and read invoices/items they created. Admins/Managers can read all.
CREATE POLICY "Cashiers can view own sales, Admins view all" ON public.invoices
  FOR SELECT USING (auth.uid() = cashier_id OR public.get_user_role() IN ('Admin', 'Manager'));

CREATE POLICY "Cashiers can create sales" ON public.invoices
  FOR INSERT WITH CHECK (auth.uid() = cashier_id);

CREATE POLICY "Invoice Items are readable based on invoice" ON public.invoice_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND (i.cashier_id = auth.uid() OR public.get_user_role() IN ('Admin', 'Manager')))
  );

CREATE POLICY "Cashiers can create invoice items" ON public.invoice_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND i.cashier_id = auth.uid())
  );

-- Only Admins and Managers can UPDATE or DELETE invoices (e.g. issuing refunds)
CREATE POLICY "Admins and Managers can update invoices" ON public.invoices FOR UPDATE USING (public.get_user_role() IN ('Admin', 'Manager'));
CREATE POLICY "Admins and Managers can delete invoices" ON public.invoices FOR DELETE USING (public.get_user_role() IN ('Admin', 'Manager'));
CREATE POLICY "Admins and Managers can update invoice_items" ON public.invoice_items FOR UPDATE USING (public.get_user_role() IN ('Admin', 'Manager'));
CREATE POLICY "Admins and Managers can delete invoice_items" ON public.invoice_items FOR DELETE USING (public.get_user_role() IN ('Admin', 'Manager'));


-- ==========================================
-- SENSITIVE TABLES (Expenses, Purchases, Suppliers)
-- ==========================================
-- Only Admins and Managers can access these tables. Cashiers have NO access.
CREATE POLICY "Admins and Managers can manage expenses" ON public.expenses FOR ALL USING (public.get_user_role() IN ('Admin', 'Manager'));
CREATE POLICY "Admins and Managers can manage purchase_bills" ON public.purchase_bills FOR ALL USING (public.get_user_role() IN ('Admin', 'Manager'));
CREATE POLICY "Admins and Managers can manage purchase_items" ON public.purchase_items FOR ALL USING (public.get_user_role() IN ('Admin', 'Manager'));
CREATE POLICY "Admins and Managers can manage suppliers" ON public.suppliers FOR ALL USING (public.get_user_role() IN ('Admin', 'Manager'));
