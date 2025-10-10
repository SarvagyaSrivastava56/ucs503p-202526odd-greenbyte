import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/firebase';

export interface UploadOptions {
  maxSizeMB?: number;
  compress?: boolean;
}

/**
 * Uploads an image to Firebase Storage
 */
export async function uploadImage(
  file: File,
  path: string,
  options: UploadOptions = {}
): Promise<string> {
  const { maxSizeMB = 5, compress = true } = options;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Validate file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    throw new Error(`File size must be less than ${maxSizeMB}MB`);
  }

  let processedFile = file;

  // Compress image if needed (client-side compression)
  if (compress && fileSizeMB > 1) {
    processedFile = await compressImage(file);
  }

  // Upload to Storage
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, processedFile, {
    contentType: file.type,
    cacheControl: 'public,max-age=31536000', // 1 year cache
  });

  // Get download URL
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

/**
 * Compresses an image file
 */
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Calculate new dimensions (max 1920px)
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920;

        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.85 // Quality
        );
      };
    };
  });
}

/**
 * Deletes an image from Firebase Storage
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Failed to delete image:', error);
    // Don't throw - deletion failures shouldn't block user actions
  }
}

/**
 * Gets a safe placeholder image URL
 */
export function getPlaceholderImage(type: string = 'event'): string {
  const placeholders: Record<string, string> = {
    event: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
    avatar: 'https://ui-avatars.com/api/?size=200&background=random',
    society: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=400&fit=crop',
  };

  return placeholders[type] || placeholders.event;
}

