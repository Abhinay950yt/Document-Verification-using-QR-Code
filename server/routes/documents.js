const express = require('express');
const multer = require('multer');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');

module.exports = function(localIP) {
  const router = express.Router();

  // Multer storage config
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
  });

  // File type and size validation
  const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
      const allowedTypes = /pdf|jpeg|jpg|png/;
      const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      if (isValid) cb(null, true);
      else cb(new Error('Only PDF, JPEG, JPG, PNG files are allowed'));
    }
  });

  // Upload route with QR generation
  router.post('/upload', (req, res) => {
    upload.single('document')(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      try {
        const port = process.env.PORT || 5000;
        const fileUrl = `http://${localIP}:${port}/api/documents/download/${req.file.filename}`;

        // Generate QR Code as Data URL
        const qrCodeDataUrl = await QRCode.toDataURL(fileUrl);

        // Save to MongoDB
        const newDoc = new Document({
          name: req.file.originalname,
          fileUrl: fileUrl,
          qrCodeUrl: qrCodeDataUrl
        });

        await newDoc.save();

        res.status(200).json({
          message: '✅ File uploaded and QR code generated!',
          file: req.file,
          qrCodeUrl: qrCodeDataUrl
        });
      } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: '❌ Upload or QR generation failed' });
      }
    });
  });

  // Download route
  router.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, '../uploads', filename);

    fs.access(filepath, fs.constants.F_OK, (err) => {
      if (err) return res.status(404).send('❌ File not found');
      res.download(filepath, filename); // Force download
    });
  });

  return router;
};
