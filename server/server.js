require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (uploads)
app.use('/uploads', express.static('uploads'));

// Function to get local IPv4 address (LAN IP)
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const ifaceName of Object.keys(interfaces)) {
    for (const iface of interfaces[ifaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost'; // fallback if no IP found
}

const localIP = getLocalIP();
console.log('Local IP Address detected:', localIP);

// Import and initialize routes, passing localIP
const documentRoutes = require('./routes/documents')(localIP);
app.use('/api/documents', documentRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  // Listen on all interfaces so local devices can connect
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://${localIP}:${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});
