// === Hook pour utiliser la caméra du téléphone ===
// Fonctionne avec Capacitor sur Android/iOS

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

export function useCamera() {
  /**
   * Prendre une photo avec la caméra
   * @returns {Promise<string>} - Base64 de l'image
   */
  const takePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      })
      
      return `data:image/jpeg;base64,${image.base64String}`
    } catch (error) {
      console.error('Erreur caméra:', error)
      throw error
    }
  }

  /**
   * Choisir une photo de la galerie
   * @returns {Promise<string>} - Base64 de l'image
   */
  const pickPhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
      })
      
      return `data:image/jpeg;base64,${image.base64String}`
    } catch (error) {
      console.error('Erreur galerie:', error)
      throw error
    }
  }

  /**
   * Demander les permissions caméra
   */
  const requestPermissions = async () => {
    const permissions = await Camera.requestPermissions()
    return permissions
  }

  /**
   * Vérifier les permissions
   */
  const checkPermissions = async () => {
    const permissions = await Camera.checkPermissions()
    return permissions
  }

  return {
    takePhoto,
    pickPhoto,
    requestPermissions,
    checkPermissions,
  }
}

export default useCamera
