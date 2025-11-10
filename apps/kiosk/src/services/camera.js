/**
 * Camera Service
 * Gestisce l'accesso alla fotocamera tramite Capacitor Camera API
 */

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

class CameraService {
  /**
   * Scatta una foto o seleziona da galleria
   */
  async takePicture(source = CameraSource.Camera) {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: source,
        width: 800,
        height: 800,
        correctOrientation: true
      });

      // Ritorna l'immagine in formato base64
      return {
        base64: photo.base64String,
        format: photo.format,
        dataUrl: `data:image/${photo.format};base64,${photo.base64String}`
      };
    } catch (error) {
      console.error('Camera error:', error);
      throw new Error('Impossibile accedere alla fotocamera');
    }
  }

  /**
   * Scatta foto dal dispositivo
   */
  async takePhoto() {
    return this.takePicture(CameraSource.Camera);
  }

  /**
   * Seleziona foto dalla galleria
   */
  async pickFromGallery() {
    return this.takePicture(CameraSource.Photos);
  }

  /**
   * Controlla i permessi della fotocamera
   */
  async checkPermissions() {
    try {
      const permissions = await Camera.checkPermissions();
      return permissions.camera === 'granted' && permissions.photos === 'granted';
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  /**
   * Richiede i permessi della fotocamera
   */
  async requestPermissions() {
    try {
      const permissions = await Camera.requestPermissions({
        permissions: ['camera', 'photos']
      });
      return permissions.camera === 'granted' && permissions.photos === 'granted';
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  /**
   * Converte base64 in Blob per l'upload
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
