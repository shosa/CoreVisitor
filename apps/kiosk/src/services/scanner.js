/**
 * Browser-based QR Code Scanner Service (PWA)
 * Uses getUserMedia API + jsQR library for cross-platform scanning
 */

import jsQR from 'jsqr';

class BrowserQRScanner {
  constructor() {
    this.stream = null;
    this.videoElement = null;
    this.canvasElement = null;
    this.canvasContext = null;
    this.scanning = false;
    this.animationFrameId = null;
    this.onScanCallback = null;
    this.torchEnabled = false;
  }

  /**
   * Request camera permissions
   */
  async requestPermissions() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('❌ Camera permission denied:', error);
      return false;
    }
  }

  /**
   * Check current camera permissions
   */
  async checkPermissions() {
    try {
      if (!navigator.permissions) {
        return await this.requestPermissions();
      }
      const permission = await navigator.permissions.query({ name: 'camera' });
      return permission.state === 'granted';
    } catch (error) {
      console.warn('Permissions API not available, requesting access');
      return await this.requestPermissions();
    }
  }

  /**
   * Single scan - opens camera, scans once, returns result
   */
  async scan(options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const hasPermission = await this.checkPermissions();
        if (!hasPermission) {
          const granted = await this.requestPermissions();
          if (!granted) {
            reject(new Error('Camera permission denied'));
            return;
          }
        }

        const video = document.createElement('video');
        video.setAttribute('playsinline', 'true');
        video.style.display = 'none';
        document.body.appendChild(video);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        video.srcObject = stream;
        await video.play();

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const scanFrame = () => {
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (code) {
              this.vibrate('success');
              stream.getTracks().forEach(track => track.stop());
              document.body.removeChild(video);
              resolve(code.data);
              return;
            }
          }

          requestAnimationFrame(scanFrame);
        };

        scanFrame();

      } catch (error) {
        console.error('Browser scan error:', error);
        this.vibrate('error');
        reject(error);
      }
    });
  }

  /**
   * Continuous scanning - for live video preview
   */
  async scanContinuous(onScan, options = {}) {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Camera permission denied');
        }
      }

      this.videoElement = options.videoElement;
      this.onScanCallback = onScan;
      this.scanning = true;

      if (!this.canvasElement) {
        this.canvasElement = document.createElement('canvas');
        this.canvasContext = this.canvasElement.getContext('2d');
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        await this.videoElement.play();
      }

      this._scanLoop();

      return () => this.stopScan();

    } catch (error) {
      console.error('Browser continuous scan error:', error);
      this.scanning = false;
      throw error;
    }
  }

  /**
   * Internal scan loop for continuous scanning
   */
  _scanLoop() {
    if (!this.scanning) return;

    if (this.videoElement && this.videoElement.readyState === this.videoElement.HAVE_ENOUGH_DATA) {
      this.canvasElement.width = this.videoElement.videoWidth;
      this.canvasElement.height = this.videoElement.videoHeight;

      this.canvasContext.drawImage(
        this.videoElement,
        0, 0,
        this.canvasElement.width,
        this.canvasElement.height
      );

      const imageData = this.canvasContext.getImageData(
        0, 0,
        this.canvasElement.width,
        this.canvasElement.height
      );

      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && this.onScanCallback) {
        this.vibrate('success');
        this.onScanCallback(code.data);
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this._scanLoop());
  }

  /**
   * Stop scanning
   */
  stopScan() {
    this.scanning = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    this.onScanCallback = null;
  }

  /**
   * Check if browser supports camera and QR scanning
   */
  async isSupported() {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      typeof jsQR === 'function'
    );
  }

  /**
   * Toggle camera torch/flashlight (if supported)
   */
  async toggleTorch(enable) {
    try {
      if (!this.stream) {
        console.warn('No active stream to toggle torch');
        return false;
      }

      const track = this.stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();

      if (!capabilities.torch) {
        console.warn('Torch not supported on this device');
        return false;
      }

      await track.applyConstraints({
        advanced: [{ torch: enable }]
      });

      this.torchEnabled = enable;
      return true;

    } catch (error) {
      console.error('Torch toggle error:', error);
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
const scanner = new BrowserQRScanner();
export default scanner;
