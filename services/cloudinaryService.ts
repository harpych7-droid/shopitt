/**
 * Cloudinary Upload Service
 * cloud_name: ddyzz3hho
 * upload_preset: shopitt_preset
 */

const CLOUDINARY_CLOUD = 'ddyzz3hho';
const UPLOAD_PRESET = 'shopitt_preset';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}`;

export interface UploadResult {
  url: string;
  publicId: string;
  resourceType: 'image' | 'video';
}

export async function uploadMedia(
  uri: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<{ data: UploadResult | null; error: string | null }> {
  try {
    const formData = new FormData();

    // Get file extension
    const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const mimeType = resourceType === 'video'
      ? `video/${ext === 'mov' ? 'quicktime' : ext}`
      : `image/${ext === 'jpg' ? 'jpeg' : ext}`;

    formData.append('file', {
      uri,
      type: mimeType,
      name: `shopitt_upload.${ext}`,
    } as any);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('resource_type', resourceType);

    const response = await fetch(`${CLOUDINARY_URL}/${resourceType}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      return { data: null, error: `Upload failed: ${errText}` };
    }

    const result = await response.json();
    return {
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        resourceType,
      },
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: err.message ?? 'Upload failed' };
  }
}

// Convenience alias used by profile avatar upload
export async function uploadImage(uri: string, publicId?: string): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await uploadMedia(uri, 'image');
  return { url: data?.url ?? null, error };
}

export async function uploadMultipleImages(uris: string[]): Promise<string[]> {
  const results = await Promise.all(
    uris.map(uri => uploadMedia(uri, 'image'))
  );
  return results
    .filter(r => r.data !== null)
    .map(r => r.data!.url);
}
