'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSales, getSalesStats } from '@/lib/store';
import { Sale, SalesStats } from '@/lib/types';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  ShoppingCart,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);

  useEffect(() => {
    const salesStats = getSalesStats();
    setStats(salesStats);
    
    const allSales = getSales();
    setRecentSales(allSales.slice(-5).reverse());
  }, []);

  const statCards = [
    {
      title: 'Ventas Totales',
      value: stats?.totalSales || 0,
      icon: ShoppingCart,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Ingresos Totales',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'bg-success/10 text-success',
    },
    {
      title: 'Por Cobrar',
      value: formatCurrency(stats?.pendingAmount || 0),
      icon: Clock,
      color: 'bg-warning/10 text-warning',
    },
    {
      title: 'Completadas',
      value: stats?.completedSales || 0,
      icon: CheckCircle,
      color: 'bg-success/10 text-success',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Resumen de tus ventas</p>
        </div>
        <Link
          href="/dashboard/nueva-venta"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <ShoppingCart className="h-4 w-4" />
          Nueva Venta
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-xl font-semibold text-card-foreground">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Sales */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold text-card-foreground">Ventas Recientes</h2>
          <Link
            href="/dashboard/ventas"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Ver todas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentSales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-secondary p-3 mb-3">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No hay ventas registradas</p>
            <Link
              href="/dashboard/nueva-venta"
              className="mt-3 text-sm text-primary hover:underline"
            >
              Registrar primera venta
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentSales.map((sale) => (
              <Link
                key={sale.id}
                href={`/dashboard/ventas/${sale.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-medium">
                    {sale.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">
                      {sale.clientName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatShortDate(sale.createdAt)} - {sale.items.length} producto(s)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-card-foreground">
                    {formatCurrency(sale.total)}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
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
                      ? 'Parcial'
                      : 'Pendiente'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
