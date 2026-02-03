import { supabase } from "@/lib/supabase";

/**
 * Upload an image file to Supabase Storage
 * @param file - The image file to upload
 * @param folder - Optional folder path within the bucket
 * @returns Promise<string> - Public URL of the uploaded image
 */
export async function uploadImageToStorage(
  file: File,
  folder: string = "uploads"
): Promise<string> {
  // Generate unique filename
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split(".").pop() || "jpg";
  const filename = `${folder}/${timestamp}-${randomId}.${extension}`;

  // Upload to storage
  const { data, error } = await supabase.storage
    .from("property-images")
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Storage upload error:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("property-images")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Upload multiple images to storage in parallel
 * @param files - Array of image files
 * @param folder - Optional folder path
 * @param onProgress - Optional callback for progress updates
 * @returns Promise<string[]> - Array of public URLs
 */
export async function uploadImagesToStorage(
  files: File[],
  folder: string = "uploads",
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const urls: string[] = [];
  let completed = 0;

  // Upload in parallel batches of 3 to avoid overwhelming the server
  const batchSize = 3;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchUrls = await Promise.all(
      batch.map((file) => uploadImageToStorage(file, folder))
    );
    urls.push(...batchUrls);
    completed += batch.length;
    onProgress?.(completed, files.length);
  }

  return urls;
}
