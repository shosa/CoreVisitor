'use client';

import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/components/Toast';
import { settingsApi, CompanySettings } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { showToast } = useToast();
  const { hasRole } = useAuthStore();
  const router = useRouter();

  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [saving, setSaving] = useState(false);

  const [gdprFile, setGdprFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [gdprUrl, setGdprUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hasRole(['admin'])) {
      router.push('/dashboard');
      return;
    }
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await settingsApi.get();
      setSettings(res.data);
      setCompanyName(res.data.companyName);
      if (res.data.gdprPdfPath) {
        loadGdprUrl();
      }
    } catch {
      showToast('Errore nel caricamento delle impostazioni', 'error');
    }
  };

  const loadGdprUrl = async () => {
    setLoadingUrl(true);
    try {
      const res = await settingsApi.getGdprPdfUrl();
      setGdprUrl(res.data.url);
    } catch {
      // PDF non ancora caricato
    } finally {
      setLoadingUrl(false);
    }
  };

  const handleSave = async () => {
    if (!companyName.trim()) {
      showToast('Il nome azienda è obbligatorio', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await settingsApi.update({ companyName: companyName.trim() });
      setSettings(res.data);
      showToast('Impostazioni salvate con successo', 'success');
    } catch {
      showToast('Errore nel salvataggio delle impostazioni', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      showToast('Il file deve essere in formato PDF', 'error');
      return;
    }
    setGdprFile(file);
  };

  const handleUploadGdpr = async () => {
    if (!gdprFile) return;
    setUploading(true);
    try {
      const res = await settingsApi.uploadGdprPdf(gdprFile);
      setSettings(res.data);
      setGdprFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      showToast('Informativa GDPR caricata con successo', 'success');
      loadGdprUrl();
    } catch {
      showToast('Errore nel caricamento del PDF', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Impostazioni</h1>
        <p className="text-gray-500 mt-1">Configurazione dati aziendali e documenti</p>
      </div>

      {/* Dati aziendali */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Dati Aziendali</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Azienda
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Es. Calzaturificio Emmegiemme Shoes S.r.l."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            Questo nome viene visualizzato sul badge e nel kiosk self-service.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {saving ? 'Salvataggio...' : 'Salva'}
        </button>
      </div>

      {/* Informativa GDPR */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Informativa Privacy GDPR</h2>
        <p className="text-sm text-gray-500 mb-4">
          Carica il documento PDF dell&apos;informativa privacy ai sensi del Regolamento UE 2016/679.
          Il link sarà disponibile nel kiosk per i visitatori.
        </p>

        {/* PDF attuale */}
        {settings?.gdprPdfPath && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-green-700">Informativa caricata</span>
            </div>
            {loadingUrl ? (
              <span className="text-sm text-gray-400">Caricamento link...</span>
            ) : gdprUrl ? (
              <a
                href={gdprUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                Visualizza PDF →
              </a>
            ) : (
              <button
                onClick={loadGdprUrl}
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                Ottieni link
              </button>
            )}
          </div>
        )}

        {/* Upload nuovo PDF */}
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-5 text-center mb-4">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-gray-500 mb-2">
            {gdprFile ? (
              <span className="font-medium text-blue-600">{gdprFile.name}</span>
            ) : (
              'Seleziona un file PDF'
            )}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="gdpr-upload"
          />
          <label
            htmlFor="gdpr-upload"
            className="cursor-pointer text-sm text-blue-600 hover:underline font-medium"
          >
            Sfoglia file
          </label>
        </div>

        <button
          onClick={handleUploadGdpr}
          disabled={!gdprFile || uploading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {uploading ? 'Caricamento...' : 'Carica Informativa PDF'}
        </button>
      </div>
    </div>
  );
}
