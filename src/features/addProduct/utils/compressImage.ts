/**
 * Compress and resize an image file before upload to reduce size and upload time.
 * Uses canvas to resize (max 1200px on longest side) and JPEG quality 0.82.
 */

const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.82;
const MIN_SIZE_TO_COMPRESS = 80 * 1024; // Skip compression for files already under ~80KB

export function compressImage(file: File): Promise<File> {
  return new Promise<File>((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    if (file.size < MIN_SIZE_TO_COMPRESS) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = img;
      let targetWidth = width;
      let targetHeight = height;

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width >= height) {
          targetWidth = MAX_DIMENSION;
          targetHeight = Math.round((height * MAX_DIMENSION) / width);
        } else {
          targetHeight = MAX_DIMENSION;
          targetWidth = Math.round((width * MAX_DIMENSION) / height);
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const name = file.name.replace(/\.[^.]+$/, '.jpg');
          const compressed = new File([blob], name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        'image/jpeg',
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}
