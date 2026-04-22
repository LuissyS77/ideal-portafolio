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
