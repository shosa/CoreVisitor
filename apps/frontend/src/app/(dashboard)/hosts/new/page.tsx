'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { hostsApi, departmentsApi } from '@/lib/api';
import { Department } from '@/types/visitor';
import { useToast } from '@/components/Toast';

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
  firstName: yup.string().required('Il nome è obbligatorio').max(100),
  lastName: yup.string().required('Il cognome è obbligatorio').max(100),
  email: yup.string().email('Email non valida').optional(),
  phone: yup.string().max(30).optional(),
  departmentId: yup.string().optional(),
  notes: yup.string().optional(),
  isActive: yup.boolean().optional(),
});

export default function NewHostPage() {
  const router = useRouter();
  const toast = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    departmentsApi.getAll().then((res) => {
      setDepartments((res.data as any[]).filter((d: any) => d.isActive));
    }).catch(() => {});
  }, []);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      departmentId: '',
      notes: '',
      isActive: true,
    },
  });

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    try {
      await hostsApi.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone || null,
        departmentId: data.departmentId || null,
        notes: data.notes || null,
        isActive: data.isActive ?? true,
      });
      toast.showSuccess('Referente creato con successo');
      router.push('/hosts');
    } catch {
      toast.showError('Errore durante la creazione del referente');
    }
  };

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
        <Link href="/hosts" className="text-gray-500 hover:text-gray-700 transition-colors">Referenti</Link>
        <ChevronRightIcon />
        <span className="text-gray-900 font-medium">Nuovo</span>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nuovo Referente</h1>
        <button onClick={() => router.back()} className="btn btn-secondary">
          <ArrowLeftIcon />
          Indietro
        </button>
      </div>

      <div className="card p-6 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Nome *</label>
              <Controller name="firstName" control={control} render={({ field }) => (
                <input {...field} type="text" className={`input ${errors.firstName ? 'border-red-500' : ''}`} placeholder="Mario" />
              )} />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="label">Cognome *</label>
              <Controller name="lastName" control={control} render={({ field }) => (
                <input {...field} type="text" className={`input ${errors.lastName ? 'border-red-500' : ''}`} placeholder="Rossi" />
              )} />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
            </div>

            <div>
              <label className="label">Email</label>
              <Controller name="email" control={control} render={({ field }) => (
                <input {...field} type="email" className={`input ${errors.email ? 'border-red-500' : ''}`} placeholder="mario.rossi@azienda.it" />
              )} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Telefono</label>
              <Controller name="phone" control={control} render={({ field }) => (
                <input {...field} type="tel" className="input" placeholder="+39 333 1234567" />
              )} />
            </div>

            <div className="md:col-span-2">
              <label className="label">Reparto / Ufficio</label>
              <Controller name="departmentId" control={control} render={({ field }) => (
                <select {...field} className="input">
                  <option value="">Seleziona reparto (opzionale)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              )} />
            </div>

            <div className="md:col-span-2">
              <label className="label">Note</label>
              <Controller name="notes" control={control} render={({ field }) => (
                <textarea {...field} rows={3} className="input resize-none" placeholder="Note aggiuntive..." />
              )} />
            </div>

            <div className="md:col-span-2">
              <Controller name="isActive" control={control} render={({ field }) => (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Referente attivo</span>
                </label>
              )} />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button type="button" onClick={() => router.back()} className="btn btn-secondary">Annulla</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? (
                <><div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>Creazione...</>
              ) : (
                <><SaveIcon />Crea Referente</>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
