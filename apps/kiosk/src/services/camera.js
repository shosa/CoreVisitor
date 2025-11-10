/**
 * Camera Service
 * Gestisce l'accesso alla fotocamera tramite Capacitor Camera API
 */

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

class CameraService {
  /**
   * Scatta una foto o seleziona da galleria
   */
  async takePicture(source = CameraSource.Camera) {
    try {
      // Assicura i permessi necessari prima di procedere
      await this.ensurePermissionsFor(source);

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
   * Controlla i permessi di Storage (Filesystem)
   */
  async checkStoragePermissions() {
    try {
      // Su iOS non è richiesto, ritorna granted
      const status = await Filesystem.checkPermissions();
      // Android usa la chiave publicStorage
      return (status.publicStorage ?? status.state) === 'granted';
    } catch (error) {
      console.error('Storage permission check error:', error);
      return false;
    }
  }

  /**
   * Richiede i permessi di Storage (Filesystem)
   */
  async requestStoragePermissions() {
    try {
      const status = await Filesystem.requestPermissions();
      return (status.publicStorage ?? status.state) === 'granted';
    } catch (error) {
      console.error('Storage permission request error:', error);
      return false;
    }
  }

  /**
   * Assicura i permessi necessari in base alla sorgente
   */
  async ensurePermissionsFor(source) {
    // Web: nessun prompt OS, il browser gestisce
    const platform = Capacitor.getPlatform();
    if (platform === 'web') return;

    const camPerms = await Camera.checkPermissions();
    const toRequest = [];

    // Camera
    if (source === CameraSource.Camera && camPerms.camera !== 'granted') {
      toRequest.push('camera');
    }

    // Photos: considera iOS "limited" come sufficiente per la galleria
    const photosGrantedOrLimited = camPerms.photos === 'granted' || camPerms.photos === 'limited';
    if (source === CameraSource.Photos && !photosGrantedOrLimited) {
      toRequest.push('photos');
    }

    if (toRequest.length > 0) {
      await Camera.requestPermissions({ permissions: toRequest });
    }

    // Ricontrolla: se ancora negato, suggerisci apertura impostazioni
    const after = await Camera.checkPermissions();
    const cameraOk = after.camera === 'granted' || source !== CameraSource.Camera;
    const photosOk = (after.photos === 'granted' || after.photos === 'limited' || source !== CameraSource.Photos);
    if (!cameraOk || !photosOk) {
      throw new Error('Permessi non concessi. Abilita dalle impostazioni dell\'app.');
    }

    // Storage (solo Android, per accesso/salvataggio pubblico)
    if (platform === 'android') {
      const ok = await this.checkStoragePermissions();
      if (!ok) {
        const reqOk = await this.requestStoragePermissions();
        if (!reqOk) {
          throw new Error('Permessi di archiviazione negati. Abilita dalle impostazioni.');
        }
      }
    }
  }

  /**
   * Apre le impostazioni dell'app (utile quando l'utente ha selezionato "Non chiedere più")
   */
  async openAppSettings() {
    try {
      await App.openSettings();
    } catch (_) {
      // Ignora
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
