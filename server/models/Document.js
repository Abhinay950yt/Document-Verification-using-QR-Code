const mongoose = require('mongoose');

// Schema for uploaded documents and QR code links
const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },         // Original file name
  fileUrl: { type: String, required: true },       // Download link
  qrCodeUrl: { type: String, required: true },     // QR Code image (Data URL)
  createdAt: { type: Date, default: Date.now }     // Timestamp
});

// Export model
module.exports = mongoose.model('Document', documentSchema);
