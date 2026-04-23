'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSaleById, addPayment, deletePayment } from '@/lib/store';
import { Sale } from '@/lib/types';
import { formatCurrency, formatDate, formatShortDate } from '@/lib/utils';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  FileText,
  CheckCircle,
  AlertCircle,
  Package,
  Plus,
  Trash2,
  X,
  Banknote,
} from 'lucide-react';

export default function VentaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  useEffect(() => {
    if (params.id) {
      const foundSale = getSaleById(params.id as string);
      setSale(foundSale);
      setLoading(false);
    }
  }, [params.id]);

  const handleAddPayment = () => {
    if (!sale || !paymentAmount) return;
    
    const amount = parseFloat(paymentAmount);
    if (amount <= 0) return;

    const updatedSale = addPayment(
      sale.id, 
      amount, 
      paymentMethod || undefined,
      paymentNotes || undefined
    );
    
    if (updatedSale) {
      setSale(updatedSale);
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentMethod('');
      setPaymentNotes('');
    }
  };

  const handleDeletePayment = (paymentId: string) => {
    if (!sale) return;
    const updatedSale = deletePayment(sale.id, paymentId);
    if (updatedSale) {
      setSale(updatedSale);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Venta no encontrada
        </h2>
        <Link
          href="/dashboard/ventas"
          className="text-primary hover:underline"
        >
          Volver a ventas
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/ventas"
          className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            Venta #{sale.id.slice(-6).toUpperCase()}
          </h1>
          <p className="text-muted-foreground">
            {formatDate(sale.createdAt)}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
            sale.status === 'completed'
              ? 'bg-success/10 text-success'
              : sale.status === 'partial'
              ? 'bg-warning/10 text-warning'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {sale.status === 'completed'
            ? 'Pagado'
            : sale.status === 'partial'
            ? 'Pago Parcial'
            : 'Pendiente'}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Informacion del Cliente
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium text-card-foreground">
                  {sale.clientName}
                </p>
              </div>
              {sale.clientPhone && (
                <div>
                  <p className="text-sm text-muted-foreground">Telefono</p>
                  <p className="font-medium text-card-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {sale.clientPhone}
                  </p>
                </div>
              )}
              {sale.clientEmail && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-card-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {sale.clientEmail}
                  </p>
                </div>
              )}
              {sale.vendorName && (
                <div>
                  <p className="text-sm text-muted-foreground">Vendedor</p>
                  <p className="font-medium text-card-foreground">
                    {sale.vendorName}
                  </p>
                </div>
              )}
            </div>
            {sale.notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4" />
                  Notas
                </p>
                <p className="text-card-foreground">{sale.notes}</p>
              </div>
            )}
          </div>

          {/* Products */}
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-semibold text-card-foreground flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos ({sale.items.length})
              </h2>
            </div>
            <div className="divide-y divide-border">
              {sale.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.product.price)}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium text-card-foreground">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-border px-5 py-4">
              <div className="flex justify-between text-lg font-semibold text-card-foreground">
                <span>Total</span>
                <span>{formatCurrency(sale.total)}</span>
              </div>
            </div>
          </div>

          {/* Payments / Abonos */}
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-card-foreground flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Historial de Pagos ({sale.payments.length})
              </h2>
              {sale.status !== 'completed' && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Abono
                </button>
              )}
            </div>

            {sale.payments.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No hay pagos registrados
              </div>
            ) : (
              <div className="divide-y divide-border">
                {sale.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between px-5 py-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatShortDate(payment.date)}
                          {payment.method && ` - ${payment.method}`}
                        </p>
                        {payment.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {payment.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePayment(payment.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Eliminar pago"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Payment Summary */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-card-foreground mb-4">
              Resumen de Pago
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo de pago</span>
                <span className="font-medium text-card-foreground">
                  {sale.paymentType === 'full' ? 'Contado' : 'Con Abonos'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium text-card-foreground">
                  {formatCurrency(sale.total)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pagado</span>
                <span className="font-medium text-success">
                  {formatCurrency(sale.paidAmount)}
                </span>
              </div>
              {sale.remainingAmount > 0 && (
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="text-muted-foreground">Por cobrar</span>
                  <span className="font-medium text-warning">
                    {formatCurrency(sale.remainingAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-card-foreground mb-4">
              Progreso de Pago
            </h2>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <span className="text-xs font-semibold text-primary">
                  {Math.round((sale.paidAmount / sale.total) * 100)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {sale.payments.length} pago(s)
                </span>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded-full bg-secondary">
                <div
                  style={{ width: `${Math.min(100, (sale.paidAmount / sale.total) * 100)}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
                ></div>
              </div>
            </div>
          </div>

          {/* Add Payment CTA */}
          {sale.status !== 'completed' && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full py-3 rounded-lg bg-success text-white font-medium hover:bg-success/90 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Registrar Abono
            </button>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="font-semibold text-card-foreground">Registrar Abono</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground">Por cobrar</p>
                <p className="text-xl font-semibold text-card-foreground">
                  {formatCurrency(sale.remainingAmount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">
                  Monto del Abono *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">
                  Metodo de Pago
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Pago Movil">Pago Movil</option>
                  <option value="Zelle">Zelle</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">
                  Notas (opcional)
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Ej: Referencia #1234"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-border font-medium hover:bg-secondary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddPayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Registrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
