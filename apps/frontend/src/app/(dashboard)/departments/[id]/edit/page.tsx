'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { departmentsApi, UpdateDepartmentDto } from '@/lib/api';
import { Department } from '@/types/visitor';
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

// Department Icons
const BusinessIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const HomeWorkIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const MeetingRoomIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const WarehouseIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
  </svg>
);

const LocalShippingIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
);

const EngineeringIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BiotechIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const ComputerIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const StoreIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const HelpCenterIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const iconOptions = [
  { name: 'Business', Icon: BusinessIcon, label: 'Ufficio' },
  { name: 'HomeWork', Icon: HomeWorkIcon, label: 'Home Office' },
  { name: 'MeetingRoom', Icon: MeetingRoomIcon, label: 'Sala Riunioni' },
  { name: 'Warehouse', Icon: WarehouseIcon, label: 'Magazzino' },
  { name: 'LocalShipping', Icon: LocalShippingIcon, label: 'Spedizioni' },
  { name: 'Engineering', Icon: EngineeringIcon, label: 'Ingegneria' },
  { name: 'Biotech', Icon: BiotechIcon, label: 'Laboratorio' },
  { name: 'Computer', Icon: ComputerIcon, label: 'IT' },
  { name: 'Store', Icon: StoreIcon, label: 'Negozio' },
  { name: 'HelpCenter', Icon: HelpCenterIcon, label: 'Supporto' },
];

const schema = yup.object().shape({
  name: yup.string().required('Il nome è obbligatorio'),
  description: yup.string().optional(),
  floor: yup.number().optional(),
  area: yup.string().optional(),
  color: yup.string().matches(/^#[0-9a-fA-F]{6}$/, 'Formato colore non valido (es. #RRGGBB)').optional(),
  icon: yup.string().optional(),
});

export default function EditDepartmentPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [iconDropdownOpen, setIconDropdownOpen] = useState(false);

  const { control, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<UpdateDepartmentDto>({
    resolver: yupResolver(schema),
  });

  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  useEffect(() => {
    if (id) {
      loadDepartment();
    }
  }, [id]);

  const loadDepartment = async () => {
    setLoading(true);
    try {
      const res = await departmentsApi.getOne(id);
      const deptData = res.data;
      setDepartment(deptData);
      reset({
        name: deptData.name,
        description: deptData.description,
        floor: deptData.floor,
        area: deptData.area,
        color: deptData.color,
        icon: deptData.icon,
      });
    } catch (err) {
      setError('Impossibile caricare i dati del reparto.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateDepartmentDto) => {
    try {
      await departmentsApi.update(id, data);
      toast.showSuccess('Reparto aggiornato con successo');
      router.push('/departments');
    } catch (error) {
      console.error(error);
      toast.showError("Errore durante l'aggiornamento del reparto");
    }
  };

  const getSelectedIconComponent = () => {
    const found = iconOptions.find(opt => opt.name === selectedIcon);
    return found ? <found.Icon className="w-5 h-5" /> : <BusinessIcon className="w-5 h-5" />;
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
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
        <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
          Home
        </Link>
        <ChevronRightIcon />
        <Link href="/departments" className="text-gray-500 hover:text-gray-700 transition-colors">
          Reparti
        </Link>
        <ChevronRightIcon />
        <Link href={`/departments/${id}`} className="text-gray-500 hover:text-gray-700 transition-colors">
          {department?.name || id}
        </Link>
        <ChevronRightIcon />
        <span className="text-gray-900 font-medium">Modifica</span>
      </nav>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Modifica Reparto</h1>
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
            {/* Nome Reparto */}
            <div className="md:col-span-2">
              <label className="label">Nome Reparto *</label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`input ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="es. Ufficio Tecnico"
                  />
                )}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Descrizione */}
            <div className="md:col-span-2">
              <label className="label">Descrizione</label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={2}
                    className={`input resize-none ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Descrizione del reparto..."
                  />
                )}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Piano */}
            <div>
              <label className="label">Piano</label>
              <Controller
                name="floor"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    className={`input ${errors.floor ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="0"
                  />
                )}
              />
              {errors.floor && (
                <p className="text-red-500 text-sm mt-1">{errors.floor.message}</p>
              )}
            </div>

            {/* Area */}
            <div>
              <label className="label">Area</label>
              <Controller
                name="area"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`input ${errors.area ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="es. Ala Nord"
                  />
                )}
              />
              {errors.area && (
                <p className="text-red-500 text-sm mt-1">{errors.area.message}</p>
              )}
            </div>

            {/* Colore */}
            <div>
              <label className="label">Colore</label>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
                    <input
                      type="color"
                      value={field.value || '#607d8b'}
                      onChange={field.onChange}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <span className="text-sm text-gray-700 font-mono">{field.value}</span>
                  </div>
                )}
              />
              {errors.color && (
                <p className="text-red-500 text-sm mt-1">{errors.color.message}</p>
              )}
            </div>

            {/* Icona */}
            <div>
              <label className="label">Icona</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIconDropdownOpen(!iconDropdownOpen)}
                  className="input w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {getSelectedIconComponent()}
                    <span>{iconOptions.find(opt => opt.name === selectedIcon)?.label || 'Seleziona icona'}</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {iconDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    {iconOptions.map((option) => (
                      <button
                        key={option.name}
                        type="button"
                        onClick={() => {
                          setValue('icon', option.name);
                          setIconDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                          selectedIcon === option.name ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                      >
                        <option.Icon className="w-5 h-5" />
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="md:col-span-2">
              <label className="label">Anteprima</label>
              <div
                className="p-4 rounded-xl text-white flex items-center gap-3"
                style={{ backgroundColor: selectedColor || '#607d8b' }}
              >
                {getSelectedIconComponent()}
                <span className="font-medium">{watch('name') || 'Nome Reparto'}</span>
              </div>
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
        </form>
      </div>
    </motion.div>
  );
}
