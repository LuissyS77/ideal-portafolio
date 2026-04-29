'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getSellers, saveSeller, getSellerAssignments } from '@/lib/store';
import { Seller, SellerAssignment } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Search,
  Users,
  UserPlus,
  Phone,
  Mail,
  ChevronRight,
  Loader2,
  X,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function VendedorasPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [assignmentsMap, setAssignmentsMap] = useState<Record<string, SellerAssignment[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for new seller
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allSellers = await getSellers();
      setSellers(allSellers);

      // Load assignments for each seller to calculate totals
      const assignmentsPromises = allSellers.map(s => getSellerAssignments(s.id));
      const allAssignments = await Promise.all(assignmentsPromises);
      
      const newAssignmentsMap: Record<string, SellerAssignment[]> = {};
      allSellers.forEach((s, index) => {
        newAssignmentsMap[s.id] = allAssignments[index];
      });
      setAssignmentsMap(newAssignmentsMap);
    } catch (error) {
      console.error('Error al cargar vendedoras:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSellers = useMemo(() => {
    if (!searchTerm) return sellers;
    const term = searchTerm.toLowerCase();
    return sellers.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        (s.phone && s.phone.includes(term)) ||
        (s.email && s.email.toLowerCase().includes(term))
    );
  }, [sellers, searchTerm]);

  const stats = useMemo(() => {
    let totalDebt = 0;
    let totalPaid = 0;
    let activeSellers = 0;

    Object.values(assignmentsMap).flat().forEach(a => {
      totalDebt += a.totalDebt;
      totalPaid += a.paidAmount;
    });

    sellers.forEach(s => {
      const hasPending = assignmentsMap[s.id]?.some(a => a.status !== 'completed');
      if (hasPending) activeSellers++;
    });

    return {
      totalBalance: totalDebt - totalPaid,
      totalPaid,
      activeSellers,
      totalSellers: sellers.length
    };
  }, [sellers, assignmentsMap]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setIsSubmitting(true);
    try {
      const success = await saveSeller(formData);
      if (success) {
        await loadData();
        setShowModal(false);
        setFormData({ name: '', phone: '', email: '' });
      }
    } catch (error) {
      console.error('Error al guardar vendedora:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Cargando vendedoras...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Vendedoras</h1>
          <p className="text-muted-foreground">Control de colecciones y crédito por vendedora</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Nueva Vendedora
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo en la Calle</p>
              <p className="text-2xl font-bold text-card-foreground">{formatCurrency(stats.totalBalance)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Recaudado</p>
              <p className="text-2xl font-bold text-card-foreground">{formatCurrency(stats.totalPaid)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <AlertCircle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vendedoras Activas</p>
              <p className="text-2xl font-bold text-card-foreground">{stats.activeSellers}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Vendedoras</p>
              <p className="text-2xl font-bold text-card-foreground">{stats.totalSellers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        />
      </div>

      {/* Sellers List */}
      {filteredSellers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-border bg-card">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No se encontraron vendedoras</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-primary hover:underline text-sm font-medium"
          >
            Registrar la primera vendedora
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSellers.map((seller) => {
            const assignments = assignmentsMap[seller.id] || [];
            const pendingAmount = assignments.reduce((sum, a) => sum + a.remainingAmount, 0);
            const activeCount = assignments.filter(a => a.status !== 'completed').length;
            
            return (
              <Link
                key={seller.id}
                href={`/dashboard/vendedoras/${seller.id}`}
                className="group relative flex flex-col p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-bold text-lg">
                    {seller.name.charAt(0).toUpperCase()}
                  </div>
                  {activeCount > 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                      {activeCount} activo(s)
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                      Al día
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">
                  {seller.name}
                </h3>
                
                <div className="mt-2 space-y-1">
                  {seller.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {seller.phone}
                    </div>
                  )}
                  {seller.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {seller.email}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Saldo Pendiente</p>
                    <p className={`text-xl font-bold ${pendingAmount > 0 ? 'text-destructive' : 'text-success'}`}>
                      {formatCurrency(pendingAmount)}
                    </p>
                  </div>
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-secondary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* New Seller Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card rounded-xl border border-border shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="text-xl font-bold text-card-foreground">Nueva Vendedora</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                  placeholder="Ej. María García"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Teléfono</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                  placeholder="Ej. +58 412 1234567"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Correo Electrónico</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                  placeholder="Ej. maria@correo.com"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Guardar Vendedora'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
