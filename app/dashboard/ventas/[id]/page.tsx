'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSaleById, updateInstallmentStatus } from '@/lib/store';
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
  Clock,
  AlertCircle,
  Package,
} from 'lucide-react';

export default function VentaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      const foundSale = getSaleById(params.id as string);
      setSale(foundSale);
      setLoading(false);
    }
  }, [params.id]);

  const handleInstallmentToggle = (installmentId: string, currentStatus: string) => {
    if (!sale) return;
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    const updatedSale = updateInstallmentStatus(sale.id, installmentId, newStatus);
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

          {/* Installments */}
          {sale.paymentType === 'installments' && sale.installments && (
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-4">
                <h2 className="font-semibold text-card-foreground flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Cuotas ({sale.installments.filter(i => i.status === 'paid').length}/{sale.installments.length} pagadas)
                </h2>
              </div>
              <div className="divide-y divide-border">
                {sale.installments.map((installment) => (
                  <div
                    key={installment.id}
                    className="flex items-center justify-between px-5 py-4"
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleInstallmentToggle(installment.id, installment.status)}
                        className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                          installment.status === 'paid'
                            ? 'bg-success text-white'
                            : 'border-2 border-border hover:border-primary'
                        }`}
                      >
                        {installment.status === 'paid' && (
                          <CheckCircle className="h-5 w-5" />
                        )}
                      </button>
                      <div>
                        <p className="font-medium text-card-foreground">
                          Cuota {installment.number}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Vence: {formatShortDate(installment.dueDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-card-foreground">
                        {formatCurrency(installment.amount)}
                      </p>
                      {installment.status === 'paid' && installment.paidDate && (
                        <p className="text-xs text-success">
                          Pagado {formatShortDate(installment.paidDate)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                  {sale.paymentType === 'full' ? 'Contado' : `${sale.installmentsCount} cuotas`}
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
          {sale.paymentType === 'installments' && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold text-card-foreground mb-4">
                Progreso de Pago
              </h2>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <span className="text-xs font-semibold text-primary">
                    {Math.round((sale.paidAmount / sale.total) * 100)}%
                  </span>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-secondary">
                  <div
                    style={{ width: `${(sale.paidAmount / sale.total) * 100}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
