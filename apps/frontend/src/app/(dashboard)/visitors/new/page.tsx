'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { visitorsApi } from '@/lib/api';
import { DocumentType } from '@/types/visitor';
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

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
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
  phone: yup.string().max(20).optional(),
  company: yup.string().max(200).optional(),
  documentType: yup.mixed<DocumentType>().oneOf(Object.values(DocumentType), 'Seleziona un tipo di documento').required('Il tipo di documento è obbligatorio'),
  documentNumber: yup.string().max(50).required('Il numero di documento è obbligatorio'),
  documentExpiry: yup.string().optional(),
  licensePlate: yup.string().max(20).optional(),
  privacyConsent: yup.boolean().optional(),
  notes: yup.string().optional(),
  photo: yup.mixed().optional(),
  document: yup.mixed().optional(),
});

export default function NewVisitorPage() {
  const router = useRouter();
  const toast = useToast();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      documentType: undefined,
      documentNumber: '',
      documentExpiry: '',
      licensePlate: '',
      privacyConsent: false,
      notes: ''
    }
  });

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    const formData = new FormData();

    // Append text data
    Object.entries(data).forEach(([key, value]) => {
      if (value != null && typeof value !== 'object') {
        formData.append(key, String(value));
      }
    });

    // Append files
    if (photoFile) {
      formData.append('photo', photoFile);
    }
    if (documentFile) {
      formData.append('document', documentFile);
    }

    try {
      await visitorsApi.create(formData);
      toast.showSuccess('Visitatore creato con successo');
      router.push('/visitors');
    } catch (error) {
      console.error(error);
      toast.showError('Errore durante la creazione del visitatore');
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
        <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
          Home
        </Link>
        <ChevronRightIcon />
        <Link href="/visitors" className="text-gray-500 hover:text-gray-700 transition-colors">
          Visitatori
        </Link>
        <ChevronRightIcon />
        <span className="text-gray-900 font-medium">Nuovo</span>
      </nav>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nuovo Visitatore</h1>
        <button
          onClick={() => router.back()}
          className="btn btn-secondary"
        >
          <ArrowLeftIcon />
          Indietro
        </button>
      </div>

      {/* Form Card */}
      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div>
              <label className="label">Nome *</label>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`input ${errors.firstName ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Mario"
                  />
                )}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>

            {/* Cognome */}
            <div>
              <label className="label">Cognome *</label>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`input ${errors.lastName ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Rossi"
                  />
                )}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="label">Email</label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="email"
                    className={`input ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="mario.rossi@email.com"
                  />
                )}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Telefono */}
            <div>
              <label className="label">Telefono</label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="tel"
                    className={`input ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="+39 333 1234567"
                  />
                )}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Azienda */}
            <div className="md:col-span-2">
              <label className="label">Azienda</label>
              <Controller
                name="company"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`input ${errors.company ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Nome Azienda S.r.l."
                  />
                )}
              />
              {errors.company && (
                <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>
              )}
            </div>

            {/* Tipo Documento */}
            <div>
              <label className="label">Tipo Documento *</label>
              <Controller
                name="documentType"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`input ${errors.documentType ? 'border-red-500 focus:ring-red-500' : ''}`}
                  >
                    <option value="">Seleziona tipo documento</option>
                    <option value={DocumentType.CARTA_IDENTITA}>Carta d'Identità</option>
                    <option value={DocumentType.PASSAPORTO}>Passaporto</option>
                    <option value={DocumentType.PATENTE}>Patente di Guida</option>
                    <option value={DocumentType.ALTRO}>Altro</option>
                  </select>
                )}
              />
              {errors.documentType && (
                <p className="text-red-500 text-sm mt-1">{errors.documentType.message}</p>
              )}
            </div>

            {/* Numero Documento */}
            <div>
              <label className="label">Numero Documento *</label>
              <Controller
                name="documentNumber"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`input ${errors.documentNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="AB1234567"
                  />
                )}
              />
              {errors.documentNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.documentNumber.message}</p>
              )}
            </div>

            {/* Scadenza Documento */}
            <div>
              <label className="label">Scadenza Documento</label>
              <Controller
                name="documentExpiry"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    className={`input ${errors.documentExpiry ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                )}
              />
              {errors.documentExpiry && (
                <p className="text-red-500 text-sm mt-1">{errors.documentExpiry.message}</p>
              )}
            </div>

            {/* Targa Veicolo */}
            <div>
              <label className="label">Targa Veicolo</label>
              <Controller
                name="licensePlate"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`input ${errors.licensePlate ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="AA123BB"
                  />
                )}
              />
              {errors.licensePlate && (
                <p className="text-red-500 text-sm mt-1">{errors.licensePlate.message}</p>
              )}
            </div>

            {/* Upload Foto */}
            <div>
              <label className="label">Foto Visitatore</label>
              <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                <UploadIcon />
                <span className="text-sm text-gray-600">
                  {photoFile ? photoFile.name : 'Carica Foto'}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)}
                />
              </label>
            </div>

            {/* Upload Documento */}
            <div>
              <label className="label">Scansione Documento</label>
              <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                <UploadIcon />
                <span className="text-sm text-gray-600">
                  {documentFile ? documentFile.name : 'Carica Documento'}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,image/*"
                  onChange={(e) => setDocumentFile(e.target.files ? e.target.files[0] : null)}
                />
              </label>
            </div>

            {/* Note */}
            <div className="md:col-span-2">
              <label className="label">Note</label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    className={`input resize-none ${errors.notes ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Note aggiuntive sul visitatore..."
                  />
                )}
              />
              {errors.notes && (
                <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
              )}
            </div>

            {/* Privacy Consent */}
            <div className="md:col-span-2">
              <Controller
                name="privacyConsent"
                control={control}
                render={({ field }) => (
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Dichiaro di aver letto l'informativa sulla privacy e di prestare il consenso al trattamento dei dati personali.
                    </span>
                  </label>
                )}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Creazione...
                </>
              ) : (
                <>
                  <SaveIcon />
                  Crea Visitatore
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
