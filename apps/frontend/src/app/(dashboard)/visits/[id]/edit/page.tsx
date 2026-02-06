'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { visitsApi } from '@/lib/api';
import { Visit } from '@/types/visitor';
import { useToast } from '@/components/Toast';

// Icons
const ChevronRightIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const schema = yup.object().shape({
  purpose: yup.string().required('Il motivo della visita è obbligatorio'),
  visitType: yup.string().required('Il tipo di visita è obbligatorio'),
  departmentId: yup.string().required('Il reparto è obbligatorio'),
  hostName: yup.string().optional(),
  scheduledDate: yup.string().required('La data è obbligatoria'),
  scheduledTimeStart: yup.string().required('L\'ora di inizio è obbligatoria'),
  scheduledTimeEnd: yup.string().optional(),
  notes: yup.string().optional(),
});

export default function EditVisitPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (id) {
      loadVisit();
      loadDepartments();
    }
  }, [id]);

  const loadDepartments = async () => {
    try {
      const { departmentsApi } = await import('@/lib/api');
      const res = await departmentsApi.getAll();
      setDepartments(res.data);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const loadVisit = async () => {
    setLoading(true);
    try {
      const res = await visitsApi.getOne(id);
      const visitData = res.data;
      setVisit(visitData);
      reset({
        purpose: visitData.purpose || '',
        visitType: visitData.visitType || 'business',
        departmentId: visitData.departmentId || '',
        hostName: visitData.hostName || '',
        scheduledDate: visitData.scheduledDate ? new Date(visitData.scheduledDate).toISOString().split('T')[0] : '',
        scheduledTimeStart: visitData.scheduledTimeStart ? new Date(visitData.scheduledTimeStart).toISOString().slice(0, 16) : '',
        scheduledTimeEnd: visitData.scheduledTimeEnd ? new Date(visitData.scheduledTimeEnd).toISOString().slice(0, 16) : '',
        notes: visitData.notes || ''
      });
    } catch (err) {
      setError('Impossibile caricare i dati della visita.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    try {
      await visitsApi.update(id, {
        purpose: data.purpose,
        visitType: data.visitType,
        departmentId: data.departmentId,
        hostName: data.hostName || undefined,
        scheduledDate: data.scheduledDate,
        scheduledTimeStart: data.scheduledTimeStart,
        scheduledTimeEnd: data.scheduledTimeEnd || undefined,
        notes: data.notes || undefined,
      });
      toast.showSuccess('Visita aggiornata con successo');
      router.push(`/visits/${id}`);
    } catch (error) {
      toast.showError('Errore durante l\'aggiornamento della visita');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{error}</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm mb-4">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors">Home</Link>
        <ChevronRightIcon />
        <Link href="/visits" className="text-gray-500 hover:text-gray-700 transition-colors">Visite</Link>
        <ChevronRightIcon />
        <Link href={`/visits/${id}`} className="text-gray-500 hover:text-gray-700 transition-colors">{visit?.purpose || id}</Link>
        <ChevronRightIcon />
        <span className="text-gray-900 font-medium">Modifica</span>
      </nav>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Modifica Visita</h1>
        <button onClick={() => router.back()} className="btn btn-secondary">
          <ArrowLeftIcon />
          Indietro
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Tipo Visita *</label>
                <Controller
                  name="visitType"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`input ${errors.visitType ? 'border-red-500 focus:ring-red-500' : ''}`}
                    >
                      <option value="business">Business</option>
                      <option value="personal">Personale</option>
                      <option value="delivery">Consegna</option>
                      <option value="maintenance">Manutenzione</option>
                      <option value="interview">Colloquio</option>
                      <option value="other">Altro</option>
                    </select>
                  )}
                />
                {errors.visitType && (
                  <p className="text-red-500 text-sm mt-1">{errors.visitType.message}</p>
                )}
              </div>

              <div>
                <label className="label">Reparto *</label>
                <Controller
                  name="departmentId"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`input ${errors.departmentId ? 'border-red-500 focus:ring-red-500' : ''}`}
                    >
                      <option value="">Seleziona reparto</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.departmentId && (
                  <p className="text-red-500 text-sm mt-1">{errors.departmentId.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="label">Motivo della Visita *</label>
                <Controller
                  name="purpose"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={2}
                      className={`input resize-none ${errors.purpose ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                  )}
                />
                {errors.purpose && (
                  <p className="text-red-500 text-sm mt-1">{errors.purpose.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="label">Host / Referente</label>
                <Controller
                  name="hostName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="input"
                      placeholder="Nome della persona da visitare"
                    />
                  )}
                />
              </div>

              <div>
                <label className="label">Data/Ora Inizio *</label>
                <Controller
                  name="scheduledTimeStart"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="datetime-local"
                      className={`input ${errors.scheduledTimeStart ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                  )}
                />
                {errors.scheduledTimeStart && (
                  <p className="text-red-500 text-sm mt-1">{errors.scheduledTimeStart.message}</p>
                )}
              </div>

              <div>
                <label className="label">Data/Ora Fine (opzionale)</label>
                <Controller
                  name="scheduledTimeEnd"
                  control={control}
                  render={({ field }) => (
                    <input {...field} type="datetime-local" className="input" />
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">Note</label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <textarea {...field} rows={3} className="input resize-none" />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dettagli Fissi</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Visitatore</p>
                <p className="font-medium text-gray-900">
                  {visit?.visitor?.firstName} {visit?.visitor?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ospite</p>
                <p className="font-medium text-gray-900">
                  {visit?.hostUser
                    ? `${visit.hostUser.firstName} ${visit.hostUser.lastName}`
                    : visit?.hostName || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="lg:col-span-3 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => router.back()} className="btn btn-secondary">
              Annulla
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Salvataggio...
                </>
              ) : (
                <>
                  <SaveIcon />
                  Salva Modifiche
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
