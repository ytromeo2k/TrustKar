/**
 * TRUSTKAR — Cloudinary unsigned upload (browser-safe preset)
 * Cloud Name: dsea6kjyr | Upload Preset: Escrow_Cloud
 */

export const cloudinaryConfig = {
  cloudName: "dsea6kjyr",
  uploadPreset: "Escrow_Cloud",
};

const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;

/**
 * Upload a single File to Cloudinary via unsigned preset.
 * @param {File} file
 * @param {object} [options]
 * @param {string} [options.folder] - optional folder inside Cloudinary
 * @returns {Promise<{ url: string, publicId: string, secureUrl: string }>}
 */
export async function uploadImageToCloudinary(file, options = {}) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryConfig.uploadPreset);
  if (options.folder) {
    formData.append("folder", options.folder);
  }

  const response = await fetch(UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Cloudinary upload failed: ${err}`);
  }

  const data = await response.json();
  return {
    url: data.url,
    secureUrl: data.secure_url,
    publicId: data.public_id,
  };
}

/**
 * Upload multiple images in parallel.
 * @param {File[]} files
 * @param {object} [options]
 * @returns {Promise<Array<{ url: string, publicId: string, secureUrl: string }>>}
 */
export async function uploadImagesToCloudinary(files, options = {}) {
  return Promise.all(files.map((file) => uploadImageToCloudinary(file, options)));
}

/** Build a transformed Cloudinary URL (e.g. thumbnails). */
export function cloudinaryImageUrl(publicId, transforms = "c_fill,w_400,h_300") {
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${transforms}/${publicId}`;
}
