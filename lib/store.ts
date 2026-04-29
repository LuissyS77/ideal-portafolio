import { 
  Sale, 
  Product, 
  SalesStats, 
  StatsPeriod,
  Seller,
  SellerAssignment,
  SellerPayment,
  AssignmentFraction
} from './types';
import { supabase } from './supabase';

// Helper types for Supabase responses
interface SaleItemResponse {
  product_id: number;
  product_name: string;
  quantity: number;
  price_at_sale: string | number;
}

interface PaymentResponse {
  id: string;
  amount: string | number;
  payment_date: string;
  method?: string;
  notes?: string;
}

interface SellerPaymentResponse {
  id: string;
  assignment_id: string;
  amount: string | number;
  payment_method: string;
  reference: string;
  notes?: string;
  payment_date: string;
}

interface SaleData {
  clientName: string;
  clientPhone?: string;
  vendorId?: string;
  vendorName?: string;
  subtotal: number;
  total: number;
  paymentType: 'full' | 'credit';
  paidAmount: number;
  remainingAmount: number;
  status: 'pending' | 'partial' | 'completed';
  notes?: string;
  items: {
    product: { id: number; name: string; price: number };
    quantity: number;
  }[];
}

interface ProductSalesStat {
  productId: number;
  productName: string;
  category: string;
  quantitySold: number;
  totalRevenue: number;
}

// ------------------------------------------------------------------
// PRODUCTOS
// ------------------------------------------------------------------

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error cargando productos:', error);
    return [];
  }

  return data.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    categoryLabel: p.category_label,
    price: Number(p.price),
    description: p.description,
    image: p.image,
    badge: p.badge,
    isCustom: p.is_custom
  }));
}

export async function saveProduct(product: Partial<Product>): Promise<Product | null> {
  const productToSave: any = {
    name: product.name,
    category: product.category,
    category_label: product.categoryLabel,
    price: product.price,
    description: product.description,
    image: product.image,
    badge: product.badge,
    is_custom: true
  };

  if (product.id) {
    productToSave.id = product.id;
  }

  const { data, error } = await supabase
    .from('products')
    .upsert(productToSave)
    .select()
    .single();

  if (error) {
    console.error('Error al guardar producto:', error.message, error.details);
    return null;
  }
  
  return { ...data, categoryLabel: data.category_label, isCustom: data.is_custom, price: Number(data.price) };
}

export async function deleteProduct(productId: number): Promise<boolean> {
  const { error } = await supabase.from('products').delete().eq('id', productId);
  return !error;
}

// ------------------------------------------------------------------
// VENTAS
// ------------------------------------------------------------------

export async function getSales(): Promise<Sale[]> {
  const { data, error } = await supabase
    .from('sales')
    .select(`*, items:sale_items(*), payments(*)`)
    .order('created_at', { ascending: false });

  if (error) return [];

  return data.map(s => ({
    id: s.id,
    clientName: s.client_name,
    clientPhone: s.client_phone,
    clientEmail: s.client_email,
    vendorId: s.vendor_id,
    vendorName: s.vendor_name,
    subtotal: Number(s.subtotal),
    total: Number(s.total),
    paymentType: s.payment_type,
    paidAmount: Number(s.paid_amount),
    remainingAmount: Number(s.remaining_amount),
    status: s.status,
    notes: s.notes,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    items: s.items.map((i: SaleItemResponse) => ({
      product: { id: i.product_id, name: i.product_name, price: Number(i.price_at_sale) },
      quantity: i.quantity
    })),
    payments: s.payments.map((p: PaymentResponse) => ({
      id: p.id,
      amount: Number(p.amount),
      date: p.payment_date,
      method: p.method,
      notes: p.notes
    }))
  }));
}

export async function getSaleById(saleId: string): Promise<Sale | null> {
  const sales = await getSales();
  return sales.find(s => s.id === saleId) || null;
}

export async function saveSale(saleData: SaleData): Promise<boolean> {
  console.log('Iniciando guardado de venta:', saleData);
  
  // 1. Insertar la venta
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      client_name: saleData.clientName,
      client_phone: saleData.clientPhone,
      vendor_id: saleData.vendorId || null,
      vendor_name: saleData.vendorName,
      subtotal: saleData.subtotal,
      total: saleData.total,
      payment_type: saleData.paymentType,
      paid_amount: saleData.paidAmount,
      remaining_amount: saleData.remainingAmount,
      status: saleData.status,
      notes: saleData.notes
    })
    .select()
    .single();

  if (saleError) {
    console.error('Error de Supabase al insertar venta:', saleError.message, saleError.details);
    return false;
  }

  console.log('Venta creada con ID:', sale.id);

  // 2. Insertar los items de la venta
  const itemsToInsert = saleData.items.map((item) => ({
    sale_id: sale.id,
    product_id: item.product.id,
    product_name: item.product.name,
    quantity: item.quantity,
    price_at_sale: item.product.price
  }));

  const { error: itemsError } = await supabase.from('sale_items').insert(itemsToInsert);
  
  if (itemsError) {
    console.error('Error al insertar items de venta:', itemsError.message);
    // Intentamos continuar aunque fallen los items para no dejar la UI colgada
  }

  // 3. Registrar el pago inicial si existe
  if (saleData.paidAmount > 0) {
    const { error: payError } = await supabase.from('payments').insert({
      sale_id: sale.id,
      amount: saleData.paidAmount,
      method: saleData.paymentType === 'full' ? 'Pago completo' : 'Abono inicial',
      notes: saleData.notes || 'Pago registrado al crear la venta'
    });
    
    if (payError) {
      console.error('Error al insertar pago inicial:', payError.message);
    }
  }

  return true;
}

export async function deleteSale(saleId: string): Promise<boolean> {
  const { error } = await supabase.from('sales').delete().eq('id', saleId);
  return !error;
}

// ------------------------------------------------------------------
// PAGOS / ABONOS (RECALCULO REAL)
// ------------------------------------------------------------------

async function syncSaleBalances(saleId: string) {
  // 1. Obtener todos los pagos de esta venta
  const { data: payments } = await supabase
    .from('payments')
    .select('amount')
    .eq('sale_id', saleId);
  
  // 2. Obtener el total de la venta
  const { data: sale } = await supabase
    .from('sales')
    .select('total')
    .eq('id', saleId)
    .single();

  if (!sale) return;

  const totalPaid = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
  const totalSale = Number(sale.total);
  const remaining = Math.max(0, totalSale - totalPaid);
  
  let status: 'pending' | 'partial' | 'completed' = 'pending';
  if (remaining <= 0) status = 'completed';
  else if (totalPaid > 0) status = 'partial';

  // 3. Actualizar la venta con los valores reales
  await supabase
    .from('sales')
    .update({
      paid_amount: totalPaid,
      remaining_amount: remaining,
      status: status,
      updated_at: new Date().toISOString()
    })
    .eq('id', saleId);
}

export async function addPayment(saleId: string, amount: number, method?: string, notes?: string): Promise<boolean> {
  const { error } = await supabase.from('payments').insert({
    sale_id: saleId,
    amount,
    method,
    notes
  });

  if (error) return false;
  await syncSaleBalances(saleId);
  return true;
}

export async function deletePayment(saleId: string, paymentId: string): Promise<boolean> {
  const { error } = await supabase.from('payments').delete().eq('id', paymentId);
  if (error) return false;
  await syncSaleBalances(saleId);
  return true;
}

// ------------------------------------------------------------------
// ESTADÍSTICAS
// ------------------------------------------------------------------

export async function getSalesStats(period: StatsPeriod = 'all'): Promise<SalesStats> {
  const sales = await getSales();
  const now = new Date();
  const filtered = sales.filter(sale => {
    if (period === 'all') return true;
    const saleDate = new Date(sale.createdAt);
    if (period === 'daily') return saleDate.toDateString() === now.toDateString();
    if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return saleDate >= weekAgo;
    }
    if (period === 'monthly') return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
    return true;
  });
  
  return {
    totalSales: filtered.length,
    totalRevenue: filtered.reduce((sum, s) => sum + s.total, 0),
    totalPaid: filtered.reduce((sum, s) => sum + s.paidAmount, 0),
    pendingAmount: filtered.reduce((sum, s) => sum + s.remainingAmount, 0),
    completedSales: filtered.filter(s => s.status === 'completed').length,
    pendingSales: filtered.filter(s => s.status !== 'completed').length,
  };
}

export async function getProductSalesStats(period: StatsPeriod = 'all'): Promise<ProductSalesStat[]> {
  const [sales, products] = await Promise.all([getSales(), getProducts()]);
  const productMap = new Map<number, ProductSalesStat>();
  const productCategoryMap = new Map<number, string>();
  
  products.forEach(p => {
    productCategoryMap.set(Number(p.id), p.categoryLabel || p.category);
  });

  const now = new Date();

  for (const sale of sales) {
    // Filtrar por periodo si no es 'all'
    if (period !== 'all') {
      const saleDate = new Date(sale.createdAt);
      if (period === 'daily' && saleDate.toDateString() !== now.toDateString()) continue;
      if (period === 'weekly') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        if (saleDate < weekAgo) continue;
      }
      if (period === 'monthly' && (saleDate.getMonth() !== now.getMonth() || saleDate.getFullYear() !== now.getFullYear())) continue;
    }

    for (const item of sale.items) {
      const productId = Number(item.product.id);
      const existing = productMap.get(productId);
      if (existing) {
        existing.quantitySold += item.quantity;
        existing.totalRevenue += (item.product.price * item.quantity);
      } else {
        productMap.set(productId, {
          productId,
          productName: item.product.name,
          category: productCategoryMap.get(productId) || 'Sin categoría',
          quantitySold: item.quantity,
          totalRevenue: item.product.price * item.quantity,
        });
      }
    }
  }
  return Array.from(productMap.values()).sort((a, b) => b.quantitySold - a.quantitySold);
}

// ------------------------------------------------------------------
// VENDEDORAS Y ASIGNACIONES
// ------------------------------------------------------------------

export async function getSellers(): Promise<Seller[]> {
  const { data, error } = await supabase
    .from('sellers')
    .select('*')
    .order('name', { ascending: true });

  if (error) return [];

  return data.map(s => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
    email: s.email,
    createdAt: s.created_at
  }));
}

export async function saveSeller(seller: Partial<Seller>): Promise<Seller | null> {
  const { data, error } = await supabase
    .from('sellers')
    .upsert({
      id: seller.id,
      name: seller.name,
      phone: seller.phone,
      email: seller.email
    })
    .select()
    .single();

  if (error) return null;
  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    email: data.email,
    createdAt: data.created_at
  };
}

export async function getSellerAssignments(sellerId: string): Promise<SellerAssignment[]> {
  const { data, error } = await supabase
    .from('seller_assignments')
    .select('*, payments:seller_payments(*)')
    .eq('seller_id', sellerId)
    .order('assigned_date', { ascending: false });

  if (error) return [];

  return data.map(a => ({
    id: a.id,
    sellerId: a.seller_id,
    collectionName: a.collection_name,
    basePrice: Number(a.base_price),
    fraction: a.fraction as AssignmentFraction,
    totalDebt: Number(a.total_debt),
    paidAmount: Number(a.paid_amount),
    remainingAmount: Number(a.remaining_amount),
    status: a.status,
    assignedDate: a.assigned_date,
    updatedAt: a.updated_at,
    payments: a.payments.map((p: SellerPaymentResponse) => ({
      id: p.id,
      assignmentId: p.assignment_id,
      amount: Number(p.amount),
      paymentMethod: p.payment_method,
      reference: p.reference,
      notes: p.notes,
      paymentDate: p.payment_date
    }))
  }));
}

export async function saveAssignment(assignment: Partial<SellerAssignment>): Promise<boolean> {
  const totalDebt = (assignment.basePrice || 0) * (assignment.fraction || 1);
  
  const { error } = await supabase
    .from('seller_assignments')
    .insert({
      seller_id: assignment.sellerId,
      collection_name: assignment.collectionName,
      base_price: assignment.basePrice,
      fraction: assignment.fraction,
      total_debt: totalDebt,
      paid_amount: 0,
      remaining_amount: totalDebt,
      status: 'pending'
    });

  return !error;
}

export async function syncAssignmentBalances(assignmentId: string) {
  const { data: payments } = await supabase
    .from('seller_payments')
    .select('amount')
    .eq('assignment_id', assignmentId);

  const { data: assignment } = await supabase
    .from('seller_assignments')
    .select('total_debt')
    .eq('id', assignmentId)
    .single();

  if (!assignment) return;

  const totalPaid = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
  const totalDebt = Number(assignment.total_debt);
  const remaining = Math.max(0, totalDebt - totalPaid);

  let status: 'pending' | 'partial' | 'completed' = 'pending';
  if (remaining <= 0) status = 'completed';
  else if (totalPaid > 0) status = 'partial';

  await supabase
    .from('seller_assignments')
    .update({
      paid_amount: totalPaid,
      remaining_amount: remaining,
      status: status,
      updated_at: new Date().toISOString()
    })
    .eq('id', assignmentId);
}

export async function addSellerPayment(payment: Partial<SellerPayment>): Promise<boolean> {
  const { error } = await supabase
    .from('seller_payments')
    .insert({
      assignment_id: payment.assignmentId,
      amount: payment.amount,
      payment_method: payment.paymentMethod,
      reference: payment.reference,
      notes: payment.notes
    });

  if (error) return false;
  
  if (payment.assignmentId) {
    await syncAssignmentBalances(payment.assignmentId);
  }
  
  return true;
}

