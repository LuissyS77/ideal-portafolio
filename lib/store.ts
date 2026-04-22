import { Sale, Product, SalesStats, Payment, StatsPeriod } from './types';
import { IDEAL_PRODUCTS } from './products';

// Simulated database storage (will be replaced with Supabase)
let sales: Sale[] = [];
let customProducts: Product[] = [];

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Sales functions
export function getSales(): Sale[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('ideal_sales');
    if (stored) {
      sales = JSON.parse(stored);
    }
  }
  return sales;
}

export function saveSale(sale: Sale): Sale {
  const existingSales = getSales();
  const existingIndex = existingSales.findIndex(s => s.id === sale.id);
  
  if (existingIndex >= 0) {
    existingSales[existingIndex] = sale;
  } else {
    existingSales.push(sale);
  }
  
  sales = existingSales;
  if (typeof window !== 'undefined') {
    localStorage.setItem('ideal_sales', JSON.stringify(sales));
  }
  return sale;
}

export function deleteSale(saleId: string): boolean {
  const existingSales = getSales();
  const filtered = existingSales.filter(s => s.id !== saleId);
  
  if (filtered.length < existingSales.length) {
    sales = filtered;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ideal_sales', JSON.stringify(sales));
    }
    return true;
  }
  return false;
}

export function getSaleById(saleId: string): Sale | null {
  const existingSales = getSales();
  return existingSales.find(s => s.id === saleId) || null;
}

// Add a payment (abono) to a sale
export function addPayment(
  saleId: string, 
  amount: number, 
  method?: string,
  notes?: string
): Sale | null {
  const sale = getSaleById(saleId);
  if (!sale) return null;

  const payment: Payment = {
    id: generateId(),
    amount,
    date: new Date().toISOString(),
    method,
    notes,
  };

  sale.payments.push(payment);

  // Recalculate paid amount
  sale.paidAmount = sale.payments.reduce((sum, p) => sum + p.amount, 0);
  sale.remainingAmount = Math.max(0, sale.total - sale.paidAmount);
  
  // Update sale status
  if (sale.remainingAmount <= 0) {
    sale.status = 'completed';
  } else if (sale.paidAmount > 0) {
    sale.status = 'partial';
  } else {
    sale.status = 'pending';
  }

  sale.updatedAt = new Date().toISOString();
  return saveSale(sale);
}

// Delete a payment
export function deletePayment(saleId: string, paymentId: string): Sale | null {
  const sale = getSaleById(saleId);
  if (!sale) return null;

  sale.payments = sale.payments.filter(p => p.id !== paymentId);

  // Recalculate paid amount
  sale.paidAmount = sale.payments.reduce((sum, p) => sum + p.amount, 0);
  sale.remainingAmount = Math.max(0, sale.total - sale.paidAmount);
  
  // Update sale status
  if (sale.remainingAmount <= 0) {
    sale.status = 'completed';
  } else if (sale.paidAmount > 0) {
    sale.status = 'partial';
  } else {
    sale.status = 'pending';
  }

  sale.updatedAt = new Date().toISOString();
  return saveSale(sale);
}

// Product functions
export function getProducts(): Product[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('ideal_custom_products');
    if (stored) {
      customProducts = JSON.parse(stored);
    }
  }
  return [...IDEAL_PRODUCTS, ...customProducts];
}

export function getCustomProducts(): Product[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('ideal_custom_products');
    if (stored) {
      customProducts = JSON.parse(stored);
    }
  }
  return customProducts;
}

export function saveProduct(product: Product): Product {
  const existing = getCustomProducts();
  const newProduct = {
    ...product,
    id: product.id || Date.now(),
    isCustom: true,
  };
  
  const existingIndex = existing.findIndex(p => p.id === newProduct.id);
  if (existingIndex >= 0) {
    existing[existingIndex] = newProduct;
  } else {
    existing.push(newProduct);
  }
  
  customProducts = existing;
  if (typeof window !== 'undefined') {
    localStorage.setItem('ideal_custom_products', JSON.stringify(customProducts));
  }
  return newProduct;
}

export function deleteProduct(productId: number): boolean {
  const existing = getCustomProducts();
  const filtered = existing.filter(p => p.id !== productId);
  
  if (filtered.length < existing.length) {
    customProducts = filtered;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ideal_custom_products', JSON.stringify(customProducts));
    }
    return true;
  }
  return false;
}

// Filter sales by period
export function filterSalesByPeriod(allSales: Sale[], period: StatsPeriod): Sale[] {
  if (period === 'all') return allSales;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let filterDate: Date;
  
  switch (period) {
    case 'daily':
      filterDate = startOfDay;
      break;
    case 'weekly':
      filterDate = new Date(startOfDay);
      filterDate.setDate(filterDate.getDate() - 7);
      break;
    case 'monthly':
      filterDate = new Date(startOfDay);
      filterDate.setMonth(filterDate.getMonth() - 1);
      break;
    default:
      return allSales;
  }

  return allSales.filter(sale => new Date(sale.createdAt) >= filterDate);
}

// Statistics with period filter
export function getSalesStats(period: StatsPeriod = 'all'): SalesStats {
  const allSales = getSales();
  const filteredSales = filterSalesByPeriod(allSales, period);
  
  return {
    totalSales: filteredSales.length,
    totalRevenue: filteredSales.reduce((sum, s) => sum + s.total, 0),
    totalPaid: filteredSales.reduce((sum, s) => sum + s.paidAmount, 0),
    pendingAmount: filteredSales.reduce((sum, s) => sum + s.remainingAmount, 0),
    completedSales: filteredSales.filter(s => s.status === 'completed').length,
    pendingSales: filteredSales.filter(s => s.status !== 'completed').length,
  };
}
