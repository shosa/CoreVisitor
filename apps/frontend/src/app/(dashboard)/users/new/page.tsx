'use client';

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usersApi, CreateUserDto } from '@/lib/api';
import { UserRole } from '@/types/visitor';
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
  firstName: yup.string().required('Il nome è obbligatorio'),
  lastName: yup.string().required('Il cognome è obbligatorio'),
  email: yup.string().email('Email non valida').required('L\'email è obbligatoria'),
  password: yup.string().min(6, 'La password deve essere di almeno 6 caratteri').required('La password è obbligatoria'),
  role: yup.mixed<UserRole>().oneOf(Object.values(UserRole)).required('Il ruolo è obbligatorio'),
  phone: yup.string().optional(),
  department: yup.string().optional(),
  isActive: yup.boolean().default(true),
});

export default function NewUserPage() {
  const router = useRouter();
  const toast = useToast();

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateUserDto>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: UserRole.RECEPTIONIST,
      phone: '',
      department: '',
      isActive: true,
    }
  });

  const onSubmit = async (data: CreateUserDto) => {
    try {
      await usersApi.create(data);
      toast.showSuccess('Utente creato con successo');
      router.push('/users');
    } catch (error) {
      console.error(error);
      toast.showError('Errore durante la creazione dell\'utente');
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
        <Link href="/users" className="text-gray-500 hover:text-gray-700 transition-colors">
          Utenti
        </Link>
        <ChevronRightIcon />
        <span className="text-gray-900 font-medium">Nuovo</span>
      </nav>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nuovo Utente</h1>
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
              <label className="label">Email *</label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="email"
                    className={`input ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="mario.rossi@azienda.it"
                  />
                )}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password *</label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    className={`input ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Minimo 6 caratteri"
                  />
                )}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Ruolo */}
            <div>
              <label className="label">Ruolo *</label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`input ${errors.role ? 'border-red-500 focus:ring-red-500' : ''}`}
                  >
                    {Object.values(UserRole).map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                )}
              />
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
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

            {/* Dipartimento */}
            <div>
              <label className="label">Dipartimento</label>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`input ${errors.department ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="es. Ufficio Tecnico"
                  />
                )}
              />
              {errors.department && (
                <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>
              )}
            </div>

            {/* Utente Attivo */}
            <div className="md:col-span-2">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Utente Attivo</span>
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
                  Crea Utente
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
