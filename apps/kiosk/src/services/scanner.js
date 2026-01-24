/**
 * Barcode Scanner Service
 * Uses Quagga2 for barcode scanning (CODE128, EAN, etc.)
 * Works on iOS Safari PWA without HTTPS requirement
 */

import Quagga from '@ericblade/quagga2';

class BarcodeScanner {
  constructor() {
    this.stream = null;
    this.scanning = false;
    this.videoElement = null;
    this.onScanCallback = null;
    this.quaggaInitialized = false;
  }

  /**
   * Check if camera access is supported
   */
  isCameraSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Start continuous scanning
   */
  async scanContinuous(onScan, options = {}) {
    try {
      console.log('🎥 Starting barcode scanner with Quagga2...');

      // Check if camera is supported
      if (!this.isCameraSupported()) {
        throw new Error('Camera non supportata. Usa il pulsante "Carica Immagine" per scansionare da foto.');
      }

      this.onScanCallback = onScan;

      // Get video element
      const videoId = options.videoId || 'qr-video';
      this.videoElement = document.getElementById(videoId);

      if (!this.videoElement) {
        throw new Error('Video element non trovato');
      }

      this.scanning = true;

      // Initialize Quagga
      await new Promise((resolve, reject) => {
        Quagga.init({
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: this.videoElement,
            constraints: {
              facingMode: 'environment'
            }
          },
          decoder: {
            readers: ['code_128_reader'] // CODE128 è quello che usiamo
          },
          locate: true,
          locator: {
            patchSize: 'medium',
            halfSample: true
          }
        }, (err) => {
          if (err) {
            console.error('❌ Quagga init error:', err);
            reject(err);
            return;
          }
          console.log('✅ Quagga initialized');
          resolve();
        });
      });

      // Start scanning
      Quagga.start();
      this.quaggaInitialized = true;

      // Set up detection handler
      Quagga.onDetected((result) => {
        if (result && result.codeResult && result.codeResult.code) {
          const code = result.codeResult.code;
          console.log('✅ Barcode scanned:', code);
          this.vibrate('success');

          // Stop scanning and call callback
          this.stopScan();
          if (this.onScanCallback) {
            this.onScanCallback(code);
          }
        }
      });

      console.log('▶️ Barcode scanner started successfully');

      // Return stop function
      return () => this.stopScan();

    } catch (error) {
      console.error('❌ Scanner error:', error);
      this.scanning = false;
      this.quaggaInitialized = false;

      // Check if it's a permission error
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('Autorizzazione fotocamera negata');
      }

      throw new Error(error.message || 'Impossibile avviare lo scanner');
    }
  }

  /**
   * Scan from image file (iOS PWA fallback)
   */
  async scanFromFile(file) {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();

        img.onload = () => {
          // Use Quagga to decode from image
          Quagga.decodeSingle({
            src: URL.createObjectURL(file),
            numOfWorkers: 0,
            decoder: {
              readers: ['code_128_reader']
            },
            locate: true
          }, (result) => {
            if (result && result.codeResult && result.codeResult.code) {
              console.log('✅ Barcode found in image:', result.codeResult.code);
              this.vibrate('success');
              resolve(result.codeResult.code);
            } else {
              reject(new Error('Nessun codice a barre trovato nell\'immagine'));
            }
          });
        };

        img.onerror = () => {
          reject(new Error('Impossibile caricare l\'immagine'));
        };

        img.src = URL.createObjectURL(file);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop scanning
   */
  async stopScan() {
    if (!this.scanning && !this.quaggaInitialized) {
      return;
    }

    try {
      console.log('🛑 Stopping scanner...');

      this.scanning = false;

      // Stop Quagga
      if (this.quaggaInitialized) {
        Quagga.stop();
        Quagga.offDetected();
        this.quaggaInitialized = false;
      }

      console.log('✅ Scanner stopped');
    } catch (error) {
      console.warn('Error stopping scanner:', error);
    }
  }

  /**
   * Vibrate device for feedback
   */
  vibrate(type = 'success') {
    if (!navigator.vibrate) return;

    const patterns = {
      light: 50,
      success: [50, 100, 50],
      error: [100, 50, 100, 50, 100],
      heavy: 200
    };

    navigator.vibrate(patterns[type] || patterns.success);
  }
}

// Export singleton instance
const scanner = new BarcodeScanner();
export default scanner;
