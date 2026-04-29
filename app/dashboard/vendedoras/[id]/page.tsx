'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  getSellers, 
  getSellerAssignments, 
  saveAssignment, 
  addSellerPayment 
} from '@/lib/store';
import { Seller, SellerAssignment, AssignmentFraction } from '@/lib/types';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import {
  ArrowLeft,
  Plus,
  Package,
  History,
  Banknote,
  X,
  Loader2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';

export default function DetalleVendedoraPage() {
  const { id } = useParams();
  const router = useRouter();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [assignments, setAssignments] = useState<SellerAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forms state
  const [assignForm, setAssignForm] = useState({
    collectionName: '',
    basePrice: '',
    fraction: '1' as '1' | '0.5' | '0.25',
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'Efectivo',
    reference: '',
    notes: '',
  });

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const allSellers = await getSellers();
      const currentSeller = allSellers.find(s => s.id === id);
      if (currentSeller) {
        setSeller(currentSeller);
        const sellerAssignments = await getSellerAssignments(id as string);
        setAssignments(sellerAssignments);
      } else {
        router.push('/dashboard/vendedoras');
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totals = useMemo(() => {
    const totalDebt = assignments.reduce((sum, a) => sum + a.totalDebt, 0);
    const totalPaid = assignments.reduce((sum, a) => sum + a.paidAmount, 0);
    return {
      debt: totalDebt,
      paid: totalPaid,
      balance: totalDebt - totalPaid
    };
  }, [assignments]);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.collectionName || !assignForm.basePrice) return;

    setIsSubmitting(true);
    try {
      const success = await saveAssignment({
        sellerId: id as string,
        collectionName: assignForm.collectionName,
        basePrice: Number(assignForm.basePrice),
        fraction: Number(assignForm.fraction) as AssignmentFraction,
      });
      if (success) {
        await loadData();
        setShowAssignModal(false);
        setAssignForm({ collectionName: '', basePrice: '', fraction: '1' });
      }
    } catch (error) {
      console.error('Error al asignar caja:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.amount || !selectedAssignmentId || !paymentForm.reference) return;

    setIsSubmitting(true);
    try {
      const success = await addSellerPayment({
        assignmentId: selectedAssignmentId,
        amount: Number(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        reference: paymentForm.reference,
        notes: paymentForm.notes,
      });
      if (success) {
        await loadData();
        setShowPaymentModal(false);
        setPaymentForm({ amount: '', paymentMethod: 'Efectivo', reference: '', notes: '' });
      }
    } catch (error) {
      console.error('Error al registrar abono:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Cargando perfil de vendedora...</p>
      </div>
    );
  }

  if (!seller) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/vendedoras')}
          className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{seller.name}</h1>
          <p className="text-muted-foreground">Estado de cuenta y colecciones</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground mb-1">Saldo Pendiente Total</p>
          <p className={`text-2xl font-bold ${totals.balance > 0 ? 'text-destructive' : 'text-success'}`}>
            {formatCurrency(totals.balance)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground mb-1">Monto Pagado</p>
          <p className="text-2xl font-bold text-success">{formatCurrency(totals.paid)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground mb-1">Ventas Totales</p>
          <p className="text-2xl font-bold text-card-foreground">{formatCurrency(totals.debt)}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Assignments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-secondary/10">
              <h2 className="font-semibold text-card-foreground flex items-center gap-2">
                <Package className="h-5 w-5" />
                Colecciones Asignadas
              </h2>
              <button
                onClick={() => setShowAssignModal(true)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <Plus className="h-4 w-4" />
                Asignar Caja
              </button>
            </div>

            {assignments.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay cajas asignadas a esta vendedora</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="p-6 hover:bg-secondary/5 transition-colors">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-card-foreground">{assignment.collectionName}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatShortDate(assignment.assignedDate)}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-secondary text-secondary-foreground">
                            Fracción: {assignment.fraction === 1 ? '1' : assignment.fraction === 0.5 ? '1/2' : '1/4'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1 justify-end">
                          {assignment.status === 'completed' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Completado
                            </span>
                          ) : assignment.status === 'partial' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                              <AlertCircle className="h-3 w-3 mr-1" /> Abono parcial
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                              Pendiente
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Deuda inicial: {formatCurrency(assignment.totalDebt)}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progreso de pago</span>
                        <span className="font-semibold text-card-foreground">
                          {Math.round((assignment.paidAmount / assignment.totalDebt) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-success transition-all duration-500"
                          style={{ width: `${(assignment.paidAmount / assignment.totalDebt) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <p className="text-muted-foreground font-medium">
                          Faltan: <span className="text-destructive font-bold">{formatCurrency(assignment.remainingAmount)}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Pagado: <span className="text-success font-bold">{formatCurrency(assignment.paidAmount)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        disabled={assignment.status === 'completed'}
                        onClick={() => {
                          setSelectedAssignmentId(assignment.id);
                          setShowPaymentModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-success text-success-foreground text-sm font-medium hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Banknote className="h-4 w-4" />
                        Registrar Abono
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Payments History */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-6 py-4 bg-secondary/10">
              <h2 className="font-semibold text-card-foreground flex items-center gap-2">
                <History className="h-5 w-5" />
                Historial de Abonos
              </h2>
            </div>
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              {assignments.flatMap(a => (a.payments || []).map(p => ({ ...p, collectionName: a.collectionName })))
                .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                .map((payment, idx) => (
                  <div key={payment.id || idx} className="p-3 rounded-lg bg-secondary/20 border border-border text-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-success text-base">{formatCurrency(payment.amount)}</span>
                      <span className="text-xs text-muted-foreground">{formatShortDate(payment.paymentDate)}</span>
                    </div>
                    <p className="text-card-foreground font-medium mb-1 truncate">{payment.collectionName}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded bg-card border border-border text-[10px] font-bold text-muted-foreground uppercase">
                        {payment.paymentMethod}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">
                        Ref: {payment.reference}
                      </span>
                    </div>
                    {payment.notes && (
                      <p className="mt-2 text-xs text-muted-foreground italic flex items-start gap-1">
                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {payment.notes}
                      </p>
                    )}
                  </div>
                ))}
              {assignments.every(a => !a.payments?.length) && (
                <p className="text-center text-muted-foreground py-8 text-sm italic">No hay pagos registrados aún</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Asignar Caja */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card rounded-xl border border-border shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="text-xl font-bold text-card-foreground">Asignar Nueva Caja</h2>
              <button onClick={() => setShowAssignModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAssignSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre de la Colección/Caja</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Colección Verano 2026"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                  value={assignForm.collectionName}
                  onChange={(e) => setAssignForm({ ...assignForm, collectionName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Precio Caja Entera</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                    value={assignForm.basePrice}
                    onChange={(e) => setAssignForm({ ...assignForm, basePrice: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fracción</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                    value={assignForm.fraction}
                    onChange={(e) => setAssignForm({ ...assignForm, fraction: e.target.value as any })}
                  >
                    <option value="1">Caja Completa (1)</option>
                    <option value="0.5">Media Caja (1/2)</option>
                    <option value="0.25">Un Cuarto (1/4)</option>
                  </select>
                </div>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Deuda resultante:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(Number(assignForm.basePrice || 0) * Number(assignForm.fraction))}
                  </span>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 px-4 py-2 rounded-lg bg-secondary font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Confirmar Entrega'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Abono */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card rounded-xl border border-border shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="text-xl font-bold text-card-foreground">Registrar Abono</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Monto a Abonar</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background font-bold text-lg text-success"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Método de Pago</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Zelle">Zelle</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Pago Móvil">Pago Móvil</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Referencia *</label>
                  <input
                    type="text"
                    required
                    placeholder="Num. Transacción"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                    value={paymentForm.reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notas (Opcional)</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                  rows={2}
                  placeholder="Información adicional del pago..."
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 px-4 py-2 rounded-lg bg-secondary font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-lg bg-success text-success-foreground font-medium disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Guardar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
