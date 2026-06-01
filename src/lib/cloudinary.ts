export async function uploadToCloudinary(file: File, uploadPreset: string, cloudName: string) {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', uploadPreset)

  const res = await fetch(url, { method: 'POST', body: form })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Cloudinary upload failed: ${text}`)
  }
  return res.json()
}

export default uploadToCloudinary
