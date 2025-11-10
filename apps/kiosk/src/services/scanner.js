/**
 * Scanner Service
 * Gestisce lo scanner QR/Barcode usando Capacitor ML Kit
 */

import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

class ScannerService {
  constructor() {
    this.isScanning = false;
  }

  /**
   * Richiedi permessi camera
   */
  async requestPermissions() {
    try {
      const { camera } = await BarcodeScanner.requestPermissions();
      return camera === 'granted' || camera === 'limited';
    } catch (error) {
      console.error('❌ Error requesting camera permissions:', error);
      return false;
    }
  }

  /**
   * Verifica se i permessi sono stati concessi
   */
  async checkPermissions() {
    try {
      const { camera } = await BarcodeScanner.checkPermissions();
      return camera === 'granted' || camera === 'limited';
    } catch (error) {
      console.error('❌ Error checking permissions:', error);
      return false;
    }
  }

  /**
   * Scansiona un QR/Barcode
   * @param {Object} options - Opzioni scanner
   * @returns {Promise<string|null>} - Codice scansionato o null
   */
  async scan(options = {}) {
    try {
      // Assicura che il modulo Google Barcode Scanner sia installato su Android
      await this.ensureGoogleScanner();

      // Verifica permessi
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Camera permission denied');
        }
      }

      this.isScanning = true;

      // Configurazione scanner
      const scanOptions = {
        formats: options.formats || [], // [] = tutti i formati
        lensFacing: options.lensFacing || 'back',
        ...options
      };

      // Avvia scanner
      const result = await BarcodeScanner.scan(scanOptions);

      // Feedback tattile al successo
      if (result.barcodes && result.barcodes.length > 0) {
        await this.vibrate('success');
        return result.barcodes[0].rawValue;
      }

      return null;
    } catch (error) {
      console.error('❌ Scan error:', error);
      await this.vibrate('error');
      throw error;
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Scansiona continuamente fino a trovare un codice
   * @param {Function} onScan - Callback quando trova un codice
   * @param {Object} options - Opzioni scanner
   */
  async scanContinuous(onScan, options = {}) {
    try {
      await this.ensureGoogleScanner();

      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Camera permission denied');
        }
      }

      this.isScanning = true;

      // Listener per codici scansionati
      const listener = await BarcodeScanner.addListener(
        'barcodeScanned',
        async (result) => {
          if (result.barcode) {
            await this.vibrate('success');
            onScan(result.barcode.rawValue);
          }
        }
      );

      // Avvia scanner continuo
      await BarcodeScanner.startScan(options);

      // Ritorna funzione per fermare lo scan
      return async () => {
        await BarcodeScanner.stopScan();
        await listener.remove();
        this.isScanning = false;
      };
    } catch (error) {
      console.error('❌ Continuous scan error:', error);
      this.isScanning = false;
      throw error;
    }
  }

  /**
   * Assicura l'installazione del modulo Google Barcode Scanner su Android
   * Alcuni dispositivi richiedono l'installazione via Google Play Services.
   */
  async ensureGoogleScanner() {
    try {
      if (Capacitor.getPlatform() !== 'android') return;
      // Il plugin gestisce internamente il caching: le chiamate successive sono veloci
      if (typeof BarcodeScanner.installGoogleBarcodeScanner === 'function') {
        await BarcodeScanner.installGoogleBarcodeScannerModule();
      }
    } catch (error) {
      // Se l'installazione fallisce (p.es. Play Services disattivato in kiosk), continuiamo:
      // lo scan potrebbe comunque funzionare in base al device; altrimenti mostrerà errore specifico.
      console.warn('Google Barcode Scanner install failed or unavailable:', error);
    }
  }

  /**
   * Ferma lo scanner
   */
  async stopScan() {
    try {
      await BarcodeScanner.stopScan();
      this.isScanning = false;
    } catch (error) {
      console.error('❌ Error stopping scan:', error);
    }
  }

  /**
   * Verifica se lo scanner è supportato
   */
  async isSupported() {
    try {
      const result = await BarcodeScanner.isSupported();
      return result.supported;
    } catch (error) {
      console.error('❌ Error checking scanner support:', error);
      return false;
    }
  }

  /**
   * Abilita/Disabilita torcia
   */
  async toggleTorch(enable) {
    try {
      await BarcodeScanner.toggleTorch({ enabled: enable });
    } catch (error) {
      console.error('❌ Error toggling torch:', error);
    }
  }

  /**
   * Feedback tattile
   */
  async vibrate(type = 'success') {
    try {
      if (type === 'success') {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else if (type === 'error') {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else if (type === 'light') {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
    } catch (error) {
      // Haptics non disponibile, ignora
    }
  }
}

export default new ScannerService();
