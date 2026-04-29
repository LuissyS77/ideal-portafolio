// Tipos para el sistema de control de ventas IDEAL

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'vendedor' | 'viewer';
}

export interface Product {
  id: number;
  name: string;
  category: string;
  categoryLabel: string;
  price: number;
  description: string;
  image: string;
  badge: string | null;
  isCustom?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method?: string;
  notes?: string;
}

export interface Sale {
  id: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  vendorId?: string;
  vendorName?: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  paymentType: 'full' | 'credit';
  payments: Payment[];
  paidAmount: number;
  remainingAmount: number;
  status: 'pending' | 'partial' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  totalPaid: number;
  pendingAmount: number;
  completedSales: number;
  pendingSales: number;
}

export type StatsPeriod = 'daily' | 'weekly' | 'monthly' | 'all';

// --- NUEVOS TIPOS PARA VENDEDORAS Y COLECCIONES ---

export interface Seller {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export type AssignmentFraction = 1 | 0.5 | 0.25;

export interface SellerAssignment {
  id: string;
  sellerId: string;
  collectionName: string;
  basePrice: number;
  fraction: AssignmentFraction;
  totalDebt: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'pending' | 'partial' | 'completed';
  assignedDate: string;
  updatedAt: string;
  payments?: SellerPayment[];
}

export interface SellerPayment {
  id: string;
  assignmentId: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  notes?: string;
  paymentDate: string;
}
