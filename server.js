require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB successfully'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
} else {
  console.log('⚠️ No MONGODB_URI provided in .env file. Running without database.');
}

// Mongoose Schema for Contact
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// API Routes
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Save to database if connected
    if (mongoose.connection.readyState === 1) {
      const newContact = new Contact({ name, email, message });
      await newContact.save();
      return res.status(201).json({ success: true, message: 'Message sent and saved successfully!' });
    } else {
      // Mock success if no DB
      console.log('Mock Contact Submission:', { name, email, message });
      return res.status(200).json({ success: true, message: 'Message received (DB not connected).' });
    }
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// Fallback to serve index.html for single-page app behavior if needed
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
