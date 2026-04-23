'use client';

import { useState, useMemo } from 'react';
import { getProductSalesStats, getSalesStats, ProductSalesStats } from '@/lib/store';
import { StatsPeriod } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Package,
  TrendingUp,
  Calendar,
  BarChart3,
  ShoppingBag,
} from 'lucide-react';

const PERIOD_OPTIONS: { value: StatsPeriod; label: string }[] = [
  { value: 'daily', label: 'Hoy' },
  { value: 'weekly', label: 'Esta Semana' },
  { value: 'monthly', label: 'Este Mes' },
  { value: 'all', label: 'Todo' },
];

export default function EstadisticasPage() {
  const [period, setPeriod] = useState<StatsPeriod>('monthly');

  const productStats = useMemo(() => getProductSalesStats(period), [period]);
  const salesStats = useMemo(() => getSalesStats(period), [period]);

  const totalProducts = productStats.reduce((sum, p) => sum + p.quantitySold, 0);

  const getPeriodLabel = () => {
    switch (period) {
      case 'daily':
        return 'hoy';
      case 'weekly':
        return 'esta semana';
      case 'monthly':
        return 'este mes';
      default:
        return 'en total';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estadisticas de Productos</h1>
          <p className="text-muted-foreground">
            Productos vendidos {getPeriodLabel()}
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriod(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Productos</p>
              <p className="text-2xl font-bold text-card-foreground">{totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ingresos</p>
              <p className="text-2xl font-bold text-card-foreground">
                {formatCurrency(salesStats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <ShoppingBag className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ventas</p>
              <p className="text-2xl font-bold text-card-foreground">{salesStats.totalSales}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Productos Unicos</p>
              <p className="text-2xl font-bold text-card-foreground">{productStats.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold text-card-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Productos Vendidos - {PERIOD_OPTIONS.find(o => o.value === period)?.label}
          </h2>
        </div>

        {productStats.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No hay ventas registradas {getPeriodLabel()}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Cantidad Vendida
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Generado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {productStats.map((product, index) => {
                  const maxQuantity = productStats[0]?.quantitySold || 1;
                  const percentage = (product.quantitySold / maxQuantity) * 100;
                  
                  return (
                    <tr key={product.productId} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-card-foreground">
                          {product.productName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-[120px]">
                            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                          <span className="font-semibold text-card-foreground min-w-[40px] text-center">
                            {product.quantitySold}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-card-foreground">
                        {formatCurrency(product.totalRevenue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-secondary/30 border-t border-border">
                  <td colSpan={3} className="px-6 py-4 text-sm font-semibold text-card-foreground">
                    Total
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-card-foreground">
                    {totalProducts}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-card-foreground">
                    {formatCurrency(salesStats.totalRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Top 5 Visual */}
      {productStats.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold text-card-foreground mb-4">Top 5 Productos Mas Vendidos</h2>
          <div className="space-y-4">
            {productStats.slice(0, 5).map((product, index) => {
              const maxQuantity = productStats[0]?.quantitySold || 1;
              const percentage = (product.quantitySold / maxQuantity) * 100;
              const colors = [
                'bg-primary',
                'bg-success',
                'bg-warning',
                'bg-destructive',
                'bg-muted-foreground',
              ];
              
              return (
                <div key={product.productId} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-card-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-card-foreground truncate">
                        {product.productName}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {product.quantitySold} uds
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors[index]} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <span className="font-semibold text-card-foreground">
                      {formatCurrency(product.totalRevenue)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
