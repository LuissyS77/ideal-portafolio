'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getProducts, saveSale, generateId, generateInstallments } from '@/lib/store';
import { Product, CartItem, Sale } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  User,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Loader2,
  Check,
} from 'lucide-react';

export default function NuevaVentaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const products = useMemo(() => getProducts(), []);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentType, setPaymentType] = useState<'full' | 'installments'>('full');
  const [installmentsCount, setInstallmentsCount] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.categoryLabel.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const total = subtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !clientName.trim()) return;

    setIsSubmitting(true);

    const now = new Date().toISOString();
    const saleId = generateId();

    const sale: Sale = {
      id: saleId,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || undefined,
      clientEmail: clientEmail.trim() || undefined,
      vendorId: user?.id,
      vendorName: user?.name,
      items: cart,
      subtotal,
      total,
      paymentType,
      installmentsCount: paymentType === 'installments' ? installmentsCount : undefined,
      installments:
        paymentType === 'installments'
          ? generateInstallments(total, installmentsCount)
          : undefined,
      paidAmount: paymentType === 'full' ? total : 0,
      remainingAmount: paymentType === 'full' ? 0 : total,
      status: paymentType === 'full' ? 'completed' : 'pending',
      notes: notes.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    saveSale(sale);
    setShowSuccess(true);

    setTimeout(() => {
      router.push(`/dashboard/ventas/${saleId}`);
    }, 1500);
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="rounded-full bg-success/10 p-4 mb-4">
          <Check className="h-12 w-12 text-success" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Venta Registrada
        </h2>
        <p className="text-muted-foreground">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nueva Venta</h1>
        <p className="text-muted-foreground">Registra una nueva venta</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Products Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredProducts.map((product) => {
              const inCart = cart.find((item) => item.product.id === product.id);
              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <div className="h-14 w-14 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-card-foreground truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  {inCart ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, -1)}
                        className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {inCart.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, 1)}
                        className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart & Form Section */}
        <div className="space-y-4">
          {/* Cart */}
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h2 className="font-semibold text-card-foreground flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrito ({cart.length})
              </h2>
            </div>

            {cart.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                Agrega productos al carrito
              </div>
            ) : (
              <>
                <div className="divide-y divide-border max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-card-foreground text-sm truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} x {formatCurrency(item.product.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-card-foreground">
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border px-4 py-3">
                  <div className="flex justify-between text-lg font-semibold text-card-foreground">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Client Form */}
          <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4 space-y-4">
            <h3 className="font-semibold text-card-foreground">Datos del Cliente</h3>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">
                Nombre del Cliente *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Nombre completo"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">
                Telefono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0412-1234567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="cliente@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">
                Notas
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Notas adicionales..."
                  rows={2}
                />
              </div>
            </div>

            {/* Payment Type */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Tipo de Pago
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentType('full')}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    paymentType === 'full'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  Pago Completo
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('installments')}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    paymentType === 'installments'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  Cuotas
                </button>
              </div>
            </div>

            {paymentType === 'installments' && (
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Numero de Cuotas
                </label>
                <select
                  value={installmentsCount}
                  onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {[2, 3, 4, 5, 6, 12].map((n) => (
                    <option key={n} value={n}>
                      {n} cuotas de {formatCurrency(total / n)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={cart.length === 0 || !clientName.trim() || isSubmitting}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Registrar Venta
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
