// backend/src/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const { uploadToCloudinary } = require('../utils/cloudinaryUploader');

/**
 * @route POST /api/v1/upload/image
 * @desc Upload image (Base64 string or file URL) to Cloudinary
 * @access Public / Authenticated
 */
router.post('/image', async (req, res) => {
  try {
    const { imageStr, folder = 'shop_photos' } = req.body;
    
    if (!imageStr) {
      return res.status(400).json({ success: false, message: 'imageStr is required (base64 string or file URL).' });
    }

    const result = await uploadToCloudinary(imageStr, `servicehub/${folder}`);
    return res.status(200).json({
      success: true,
      message: result.isDemo ? 'Image uploaded in demo mode (Add Cloudinary credentials in .env for live CDN URLs)' : 'Image uploaded to Cloudinary CDN successfully!',
      url: result.url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Upload route error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload image', error: error.message });
  }
});

/**
 * @route POST /api/v1/upload/document
 * @desc Upload KYC document (Aadhaar, Trade License, Certificate) to Cloudinary
 * @access Public / Authenticated
 */
router.post('/document', async (req, res) => {
  try {
    const { docStr, docType = 'aadhaar' } = req.body;

    if (!docStr) {
      return res.status(400).json({ success: false, message: 'docStr is required.' });
    }

    const result = await uploadToCloudinary(docStr, `servicehub/kyc_documents/${docType}`);
    return res.status(200).json({
      success: true,
      message: 'KYC Document uploaded successfully!',
      url: result.url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('KYC Upload error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload KYC document', error: error.message });
  }
});

module.exports = router;
