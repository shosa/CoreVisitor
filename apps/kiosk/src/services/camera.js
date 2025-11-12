/**
 * Camera Service (PWA - Browser only)
 * Uses getUserMedia API for photo capture
 */

class CameraService {
  /**
   * Take picture with browser
   */
  async takePicture(source = 'camera') {
    if (source === 'gallery') {
      return await this._pickFromGallery();
    }

    return await this._takePhoto();
  }

  /**
   * Take photo with camera
   */
  async _takePhoto() {
    try {
      // Create modal elements
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const captureButton = document.createElement('button');
      const modal = document.createElement('div');

      // Modal styles
      Object.assign(modal.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '10000'
      });

      // Video styles
      Object.assign(video.style, {
        maxWidth: '90%',
        maxHeight: '70%',
        borderRadius: '12px'
      });

      // Button styles
      Object.assign(captureButton.style, {
        marginTop: '20px',
        padding: '15px 30px',
        fontSize: '18px',
        background: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
      });
      captureButton.textContent = 'Scatta Foto';

      modal.appendChild(video);
      modal.appendChild(captureButton);
      document.body.appendChild(modal);

      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 800 },
          height: { ideal: 800 }
        }
      });

      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      await video.play();

      return new Promise((resolve, reject) => {
        captureButton.onclick = () => {
          // Capture frame
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);

          // Convert to base64
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          const base64 = dataUrl.split(',')[1];

          // Cleanup
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(modal);

          resolve({
            base64: base64,
            format: 'jpeg',
            dataUrl: dataUrl
          });
        };

        // Add close button
        const closeButton = document.createElement('button');
        Object.assign(closeButton.style, {
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '10px 20px',
          background: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        });
        closeButton.textContent = 'Annulla';
        closeButton.onclick = () => {
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(modal);
          reject(new Error('Cattura annullata'));
        };
        modal.appendChild(closeButton);
      });

    } catch (error) {
      console.error('Browser camera error:', error);
      throw new Error('Impossibile accedere alla fotocamera');
    }
  }

  /**
   * Pick from gallery
   */
  async _pickFromGallery() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) {
          reject(new Error('Nessun file selezionato'));
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          const base64 = dataUrl.split(',')[1];
          const format = file.type.split('/')[1] || 'jpeg';

          resolve({
            base64: base64,
            format: format,
            dataUrl: dataUrl
          });
        };
        reader.onerror = () => reject(new Error('Errore lettura file'));
        reader.readAsDataURL(file);
      };

      input.click();
    });
  }

  /**
   * Take photo (wrapper)
   */
  async takePhoto() {
    return this.takePicture('camera');
  }

  /**
   * Pick from gallery (wrapper)
   */
  async pickFromGallery() {
    return this.takePicture('gallery');
  }

  /**
   * Check permissions (browser)
   */
  async checkPermissions() {
    try {
      if (!navigator.permissions) return true;
      const permission = await navigator.permissions.query({ name: 'camera' });
      return permission.state === 'granted';
    } catch (error) {
      return true; // Assume granted
    }
  }

  /**
   * Request permissions (browser handles automatically)
   */
  async requestPermissions() {
    return true;
  }

  /**
   * Storage permissions (not needed for browser)
   */
  async checkStoragePermissions() {
    return true;
  }

  async requestStoragePermissions() {
    return true;
  }

  async ensurePermissionsFor() {
    return true;
  }

  /**
   * Convert base64 to Blob for upload
   */
  base64ToBlob(base64, mimeType = 'image/jpeg') {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
}

export default new CameraService();
