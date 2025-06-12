const express = require('express');
const router = express.Router();
const multer = require('multer');
const QRCode = require('qrcode');

// Multer setup: store in uploads/ folder with timestamped filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Upload route
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create file URL (adjust host and port as needed)
    const filePath = req.file.path.replace(/\\/g, '/'); 
    const fileUrl = `http://localhost:5000/${filePath}`;

    // Generate QR code as data URL for the file URL
    const qrCodeDataUrl = await QRCode.toDataURL(fileUrl);

    // Respond with QR code and file info
    res.status(200).json({
      message: 'File uploaded and QR code generated!',
      fileUrl,
      qrCodeDataUrl
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Upload or QR code generation failed' });
  }
});

module.exports = router;
