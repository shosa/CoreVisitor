'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { printerApi, PrinterConfig, PrinterStatus, QueueStatus } from '@/lib/api';
import { useToast } from '@/components/Toast';

// SVG Icons
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PrintIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ErrorCircleIcon = () => (
  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="w-8 h-8 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export default function PrintersPage() {
  const toast = useToast();
  const [configs, setConfigs] = useState<PrinterConfig[]>([]);
  const [printerStatus, setPrinterStatus] = useState<PrinterStatus | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PrinterConfig | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'escpos',
    connection: 'usb',
    address: '',
    port: 9100,
    isDefault: false,
    isActive: true,
  });
  const [testingPrinter, setTestingPrinter] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadQueueStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configsRes, statusRes, queueRes] = await Promise.all([
        printerApi.getConfigs(),
        printerApi.getStatus().catch(() => ({ data: { connected: false } })),
        printerApi.getQueueStatus().catch(() => ({ data: { pending: 0, printing: 0, completed: 0, failed: 0 } })),
      ]);

      setConfigs(configsRes.data);
      setPrinterStatus(statusRes.data);
      setQueueStatus(queueRes.data);
    } catch (err: any) {
      toast.showError(err.response?.data?.message || 'Errore nel caricamento dati');
    } finally {
      setLoading(false);
    }
  };

  const loadQueueStatus = async () => {
    try {
      const res = await printerApi.getQueueStatus();
      setQueueStatus(res.data);
    } catch (err) {
      // Silent fail for background updates
    }
  };

  const handleOpenDialog = (config?: PrinterConfig) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        name: config.name,
        type: config.type,
        connection: config.connection,
        address: config.address || '',
        port: config.port || 9100,
        isDefault: config.isDefault,
        isActive: config.isActive,
      });
    } else {
      setEditingConfig(null);
      setFormData({
        name: '',
        type: 'escpos',
        connection: 'usb',
        address: '',
        port: 9100,
        isDefault: false,
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingConfig(null);
  };

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        settings: null,
      };

      if (editingConfig) {
        await printerApi.updateConfig(editingConfig.id, data);
        toast.showSuccess('Configurazione aggiornata con successo');
      } else {
        await printerApi.createConfig(data as any);
        toast.showSuccess('Configurazione creata con successo');
      }

      handleCloseDialog();
      await loadData();
    } catch (err: any) {
      toast.showError(err.response?.data?.message || 'Errore nel salvataggio');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa configurazione?')) return;

    try {
      await printerApi.deleteConfig(id);
      toast.showSuccess('Configurazione eliminata con successo');
      await loadData();
    } catch (err: any) {
      toast.showError(err.response?.data?.message || "Errore nell'eliminazione");
    }
  };

  const handleTestPrint = async () => {
    try {
      setTestingPrinter(true);
      await printerApi.test();
      toast.showSuccess('Stampa di test inviata con successo!');
    } catch (err: any) {
      toast.showError(err.response?.data?.message || 'Errore nella stampa di test');
    } finally {
      setTestingPrinter(false);
    }
  };

  const handleInitPrinter = async (config: PrinterConfig) => {
    try {
      await printerApi.init({
        type: config.connection as any,
        address: config.address || undefined,
        port: config.port || undefined,
      });
      toast.showSuccess('Stampante inizializzata con successo');
      await loadData();
    } catch (err: any) {
      toast.showError(err.response?.data?.message || "Errore nell'inizializzazione");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <SpinnerIcon />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestione Stampanti</h1>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenDialog()}
        >
          <PlusIcon />
          Nuova Stampante
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Stato Stampante</h2>
          <div className="flex items-center gap-2 mb-2">
            {printerStatus?.connected ? (
              <>
                <CheckCircleIcon />
                <span className="text-gray-700">Connessa</span>
              </>
            ) : (
              <>
                <ErrorCircleIcon />
                <span className="text-gray-700">Non connessa</span>
              </>
            )}
          </div>
          {printerStatus?.type && (
            <p className="text-sm text-gray-500 mt-1">
              Tipo: {printerStatus.type}
            </p>
          )}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <button
              className="btn btn-secondary text-sm"
              onClick={handleTestPrint}
              disabled={!printerStatus?.connected || testingPrinter}
            >
              <PrintIcon />
              {testingPrinter ? 'Stampa in corso...' : 'Test Stampa'}
            </button>
            <button className="btn btn-secondary text-sm" onClick={loadData}>
              <RefreshIcon />
              Aggiorna
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Coda di Stampa</h2>
          {queueStatus && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In attesa:</span>
                <span className="badge badge-yellow">{queueStatus.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In stampa:</span>
                <span className="badge badge-blue">{queueStatus.printing}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completati:</span>
                <span className="badge badge-green">{queueStatus.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Falliti:</span>
                <span className="badge badge-red">{queueStatus.failed}</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Printer Configs */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Configurazioni Stampanti</h2>

      {configs.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">Nessuna stampante configurata</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {configs.map((config, index) => (
            <motion.div
              key={config.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card p-5"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{config.name}</h3>
                  <p className="text-sm text-gray-500">
                    {config.type.toUpperCase()} - {config.connection.toUpperCase()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {config.isDefault && (
                    <span className="badge badge-blue">Predefinita</span>
                  )}
                  {config.isActive ? (
                    <span className="badge badge-green">Attiva</span>
                  ) : (
                    <span className="badge">Disattiva</span>
                  )}
                </div>
              </div>

              {config.address && (
                <p className="text-sm text-gray-500 mb-4">
                  Indirizzo: {config.address}
                  {config.port && `:${config.port}`}
                </p>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  className="btn btn-secondary text-sm"
                  onClick={() => handleInitPrinter(config)}
                  disabled={!config.isActive}
                >
                  Inizializza
                </button>
                <button
                  className="btn btn-secondary text-sm"
                  onClick={() => handleOpenDialog(config)}
                >
                  <EditIcon />
                  Modifica
                </button>
                <button
                  className="btn btn-danger text-sm"
                  onClick={() => handleDelete(config.id)}
                >
                  <DeleteIcon />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <AnimatePresence>
        {openDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={handleCloseDialog}
            />

            {/* Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card relative w-full max-w-lg p-6 z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingConfig ? 'Modifica Stampante' : 'Nuova Stampante'}
                </h2>
                <button
                  onClick={handleCloseDialog}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Nome</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">Tipo Connessione</label>
                  <select
                    className="input"
                    value={formData.connection}
                    onChange={(e) => setFormData({ ...formData, connection: e.target.value })}
                  >
                    <option value="usb">USB</option>
                    <option value="network">Network</option>
                    <option value="file">File (Test)</option>
                  </select>
                </div>

                {formData.connection === 'network' && (
                  <>
                    <div>
                      <label className="label">Indirizzo IP</label>
                      <input
                        type="text"
                        className="input"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="192.168.1.100"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Porta</label>
                      <input
                        type="number"
                        className="input"
                        value={formData.port}
                        onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </>
                )}

                {formData.connection === 'usb' && (
                  <div>
                    <label className="label">Device Path (opzionale)</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="/dev/usb/lp0 o lascia vuoto per auto-detect"
                    />
                  </div>
                )}

                {formData.connection === 'file' && (
                  <div>
                    <label className="label">File Path</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="./print-output.txt"
                      required
                    />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                  <span className="text-sm text-gray-700">Imposta come stampante predefinita</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                  <span className="text-sm text-gray-700">Attiva</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button className="btn btn-secondary" onClick={handleCloseDialog}>
                  Annulla
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={!formData.name}
                >
                  Salva
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
