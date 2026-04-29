-- NUEVA MIGRACIÓN PARA MÓDULO DE VENDEDORAS Y COLECCIONES

-- 1. Tabla de Vendedoras
CREATE TABLE sellers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Tabla de Asignaciones de Colecciones (Cajas)
CREATE TABLE seller_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE NOT NULL,
  collection_name TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  fraction DECIMAL(3,2) NOT NULL DEFAULT 1.0, -- 1.0, 0.5, 0.25
  total_debt DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  remaining_amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'partial', 'completed')) DEFAULT 'pending',
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabla de Pagos de Vendedoras (Abonos)
CREATE TABLE seller_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES seller_assignments(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  reference TEXT NOT NULL,
  notes TEXT,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- HABILITAR RLS (Row Level Security)
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_payments ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS (Permitir todo a usuarios autenticados para simplificar)
CREATE POLICY "Permitir todo a autenticados en sellers" ON sellers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a autenticados en assignments" ON seller_assignments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a autenticados en seller_payments" ON seller_payments FOR ALL USING (auth.role() = 'authenticated');
