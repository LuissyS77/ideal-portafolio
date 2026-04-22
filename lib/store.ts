import { Sale, Product, SalesStats } from './types';
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

export function updateInstallmentStatus(
  saleId: string, 
  installmentId: string, 
  status: 'paid' | 'pending',
  paidDate?: string
): Sale | null {
  const sale = getSaleById(saleId);
  if (!sale || !sale.installments) return null;

  const installment = sale.installments.find(i => i.id === installmentId);
  if (!installment) return null;

  installment.status = status;
  installment.paidDate = status === 'paid' ? (paidDate || new Date().toISOString()) : null;

  // Recalculate paid amount
  sale.paidAmount = sale.installments
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0);
  sale.remainingAmount = sale.total - sale.paidAmount;
  
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

// Statistics
export function getSalesStats(): SalesStats {
  const allSales = getSales();
  
  return {
    totalSales: allSales.length,
    totalRevenue: allSales.reduce((sum, s) => sum + s.total, 0),
    pendingAmount: allSales.reduce((sum, s) => sum + s.remainingAmount, 0),
    completedSales: allSales.filter(s => s.status === 'completed').length,
    pendingSales: allSales.filter(s => s.status !== 'completed').length,
  };
}

// Generate installments for a sale
export function generateInstallments(total: number, count: number): Omit<Sale, 'id' | 'clientName' | 'clientPhone' | 'clientEmail' | 'vendorId' | 'vendorName' | 'items' | 'subtotal' | 'notes' | 'createdAt' | 'updatedAt'>['installments'] {
  const installmentAmount = Math.round((total / count) * 100) / 100;
  const installments = [];
  
  for (let i = 0; i < count; i++) {
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i + 1);
    
    installments.push({
      id: generateId(),
      number: i + 1,
      amount: i === count - 1 ? Math.round((total - installmentAmount * (count - 1)) * 100) / 100 : installmentAmount,
      dueDate: dueDate.toISOString(),
      paidDate: null,
      status: 'pending' as const,
    });
  }
  
  return installments;
}
