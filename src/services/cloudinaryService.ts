const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'je6whpaq'
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ''

export interface CloudinaryUploadResult {
  url: string
  secure_url: string
  public_id: string
  format: string
  resource_type: string
  bytes: number
  created_at: string
}

export const cloudinaryService = {
  getCloudName() {
    return CLOUD_NAME
  },

  /**
   * Upload a file (Resume, KYC Document, Image, Project screenshot) to Cloudinary
   * using an unsigned upload preset. This app has no backend, so signed uploads
   * (which require a secret) can't be done safely from the browser - an unsigned
   * preset scoped to a folder is the correct pattern here. Configure a preset in
   * the Cloudinary console (Settings -> Upload -> Add upload preset -> Signing
   * mode: Unsigned) and set VITE_CLOUDINARY_UPLOAD_PRESET.
   */
  async upload(file: File, folder = 'ras_candidates'): Promise<CloudinaryUploadResult> {
    if (!UPLOAD_PRESET) {
      throw new Error(
        'Cloudinary upload preset is not configured. Set VITE_CLOUDINARY_UPLOAD_PRESET to an unsigned upload preset name.'
      )
    }

    const isImage = file.type.startsWith('image/')
    const resourceType = isImage ? 'image' : 'raw'
    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('folder', folder)

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Cloudinary upload failed: ${errText}`)
    }

    const data = await response.json()
    return {
      url: data.url,
      secure_url: data.secure_url || data.url,
      public_id: data.public_id,
      format: data.format || file.name.split('.').pop() || 'pdf',
      resource_type: data.resource_type || resourceType,
      bytes: data.bytes || file.size,
      created_at: data.created_at || new Date().toISOString()
    }
  }
}
