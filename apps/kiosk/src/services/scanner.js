/**
 * QR Code Scanner Service
 * Uses jsQR with video stream for reliable cross-platform scanning
 * Works on iOS Safari PWA without HTTPS requirement
 */

import jsQR from 'jsqr';

class QRScanner {
  constructor() {
    this.stream = null;
    this.scanning = false;
    this.videoElement = null;
    this.canvasElement = null;
    this.canvasContext = null;
    this.onScanCallback = null;
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
      console.log('🎥 Starting QR scanner with jsQR...');

      // Check if camera is supported
      if (!this.isCameraSupported()) {
        throw new Error('Camera non supportata. Usa il pulsante "Carica Immagine" per scansionare da foto.');
      }

      this.onScanCallback = onScan;

      // Get video and canvas elements
      const videoId = options.videoId || 'qr-video';
      const canvasId = options.canvasId || 'qr-canvas';

      this.videoElement = document.getElementById(videoId);
      this.canvasElement = document.getElementById(canvasId);

      if (!this.videoElement || !this.canvasElement) {
        throw new Error('Video o Canvas element non trovato');
      }

      this.canvasContext = this.canvasElement.getContext('2d');

      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      console.log('✅ Camera access granted');

      // Set up video stream
      this.videoElement.srcObject = this.stream;
      this.videoElement.setAttribute('playsinline', 'true'); // Required for iOS
      await this.videoElement.play();

      this.scanning = true;

      // Start scanning loop
      requestAnimationFrame(() => this.scan());

      console.log('▶️ Scanner started successfully');

      // Return stop function
      return () => this.stopScan();

    } catch (error) {
      console.error('❌ Scanner error:', error);
      this.scanning = false;

      // Check if it's a permission error
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('Autorizzazione fotocamera negata');
      }

      throw new Error(error.message || 'Impossibile avviare lo scanner');
    }
  }

  /**
   * Scan loop - reads video frame and looks for QR code
   */
  scan() {
    if (!this.scanning || !this.videoElement || !this.canvasElement) {
      return;
    }

    if (this.videoElement.readyState === this.videoElement.HAVE_ENOUGH_DATA) {
      // Set canvas size to match video
      this.canvasElement.height = this.videoElement.videoHeight;
      this.canvasElement.width = this.videoElement.videoWidth;

      // Draw current video frame to canvas
      this.canvasContext.drawImage(
        this.videoElement,
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );

      // Get image data from canvas
      const imageData = this.canvasContext.getImageData(
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );

      // Try to decode QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code) {
        console.log('✅ QR Code scanned:', code.data);
        this.vibrate('success');

        // Call callback with decoded text
        if (this.onScanCallback) {
          this.onScanCallback(code.data);
        }

        // Don't continue scanning after successful scan
        return;
      }
    }

    // Continue scanning if active
    if (this.scanning) {
      requestAnimationFrame(() => this.scan());
    }
  }

  /**
   * Scan from image file (iOS PWA fallback)
   */
  async scanFromFile(file) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.canvasElement) {
          this.canvasElement = document.getElementById('qr-canvas');
          this.canvasContext = this.canvasElement.getContext('2d');
        }

        const img = new Image();

        img.onload = () => {
          // Set canvas size to image size
          this.canvasElement.width = img.width;
          this.canvasElement.height = img.height;

          // Draw image to canvas
          this.canvasContext.drawImage(img, 0, 0);

          // Get image data
          const imageData = this.canvasContext.getImageData(
            0,
            0,
            this.canvasElement.width,
            this.canvasElement.height
          );

          // Try to decode QR code
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });

          if (code) {
            console.log('✅ QR Code found in image:', code.data);
            this.vibrate('success');
            resolve(code.data);
          } else {
            reject(new Error('Nessun QR code trovato nell\'immagine'));
          }
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
    if (!this.scanning) {
      return;
    }

    try {
      console.log('🛑 Stopping scanner...');

      this.scanning = false;

      // Stop video stream
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }

      // Clear video element
      if (this.videoElement) {
        this.videoElement.srcObject = null;
        this.videoElement.setAttribute('playsinline', 'false');
      }

      console.log('✅ Scanner stopped');
    } catch (error) {
      console.warn('Error stopping scanner:', error);
    }
  }

  /**
   * Check if browser supports scanner
   */
  async isSupported() {
    try {
      const cameras = await Html5Qrcode.getCameras();
      return cameras.length > 0;
    } catch (error) {
      return false;
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
const scanner = new QRScanner();
export default scanner;
