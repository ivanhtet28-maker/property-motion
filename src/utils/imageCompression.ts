/**
 * Compress an image file to reduce payload size
 * @param file - The image file to compress
 * @param maxWidth - Maximum width of the compressed image
 * @param quality - JPEG quality (0-1)
 * @returns Promise<string> - Base64 data URL of compressed image
 */
export async function compressImage(
  file: File,
  maxWidth: number = 800,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 JPEG with quality
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(dataUrl);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image for compression"));
    };

    // Read the file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error("Failed to read image file"));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Compress multiple images in parallel
 * @param files - Array of image files
 * @param maxWidth - Maximum width
 * @param quality - JPEG quality
 * @returns Promise<string[]> - Array of base64 data URLs
 */
export async function compressImages(
  files: File[],
  maxWidth: number = 800,
  quality: number = 0.7
): Promise<string[]> {
  return Promise.all(
    files.map((file) => compressImage(file, maxWidth, quality))
  );
}
