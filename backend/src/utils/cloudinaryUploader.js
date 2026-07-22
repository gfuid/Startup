// backend/src/utils/cloudinaryUploader.js
const cloudinary = require('../config/cloudinary');

/**
 * Uploads base64 string or file URL to Cloudinary bucket.
 * If Cloudinary credentials are not configured, gracefully returns data URI or simulated CDN URL.
 */
const uploadToCloudinary = async (fileStr, folderName = 'servicehub_uploads') => {
  try {
    // If real credentials set in .env
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const uploadResponse = await cloudinary.uploader.upload(fileStr, {
        folder: folderName,
        resource_type: 'auto',
      });
      return {
        success: true,
        url: uploadResponse.secure_url,
        public_id: uploadResponse.public_id,
        bytes: uploadResponse.bytes,
        format: uploadResponse.format,
      };
    }

    // Demo / Placeholder Mode (when credentials not added yet)
    console.log('☁️ [Cloudinary Setup Active]: In Demo Mode. Credentials pending in .env.');
    return {
      success: true,
      url: fileStr.startsWith('data:') ? fileStr : `https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=crop`,
      public_id: `demo_${Date.now()}`,
      bytes: 1024,
      format: 'png',
      isDemo: true,
    };
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};

module.exports = {
  uploadToCloudinary,
};
