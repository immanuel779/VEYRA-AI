const CLOUD_NAME = 'xlyyu0bc';
const UPLOAD_PRESET = 'veyra_uploads';

export interface UploadResult {
  url: string;
  publicId: string;
  name: string;
  size: number;
  type: 'image' | 'file';
  mime: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function uploadToCloudinary(file: File): Promise<UploadResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large (max 10 MB). "${file.name}"`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    let msg = 'Upload failed';
    try {
      const data = await res.json();
      if (data?.error?.message) msg = data.error.message;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  const data = await res.json();

  const isImage = file.type.startsWith('image/');

  return {
    url: data.secure_url,
    publicId: data.public_id,
    name: file.name,
    size: file.size,
    type: isImage ? 'image' : 'file',
    mime: file.type || 'application/octet-stream',
  };
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
