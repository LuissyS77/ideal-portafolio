'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSales, deleteSale } from '@/lib/store';
import { Sale } from '@/lib/types';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Receipt,
  AlertCircle,
} from 'lucide-react';

type FilterStatus = 'all' | 'pending' | 'partial' | 'completed';

export default function VentasPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = () => {
    const allSales = getSales();
    setSales(allSales.reverse());
  };

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' || sale.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (saleId: string) => {
    deleteSale(saleId);
    loadSales();
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ventas</h1>
          <p className="text-muted-foreground">
            {sales.length} venta(s) registrada(s)
          </p>
        </div>
        <Link
          href="/dashboard/nueva-venta"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Nueva Venta
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente o ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-3 py-2.5 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="partial">Parciales</option>
            <option value="completed">Completados</option>
          </select>
        </div>
      </div>

      {/* Sales List */}
      {filteredSales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-border bg-card">
          <div className="rounded-full bg-secondary p-3 mb-3">
            <Receipt className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            {sales.length === 0
              ? 'No hay ventas registradas'
              : 'No se encontraron resultados'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Pagado
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-medium text-sm">
                          {sale.clientName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">
                            {sale.clientName}
                          </p>
                          {sale.clientPhone && (
                            <p className="text-xs text-muted-foreground">
                              {sale.clientPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatShortDate(sale.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium text-card-foreground">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatCurrency(sale.paidAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {sale.paymentType === 'full' ? 'Contado' : `${sale.installmentsCount} cuotas`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/ventas/${sale.id}`}
                          className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {deleteConfirm === sale.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(sale.id)}
                              className="px-2 py-1 text-xs rounded bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 text-xs rounded border border-border hover:bg-secondary"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(sale.id)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
