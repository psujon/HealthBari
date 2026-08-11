import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

// File Filter (Max 5 images, images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('শুধুমাত্র ছবি ফাইল (PNG, JPG, JPEG, WEBP) আপলোড করা যাবে!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

const router = express.Router();

// Upload up to 5 images
router.post('/multiple', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'কোনো ছবি নির্বাচন করা হয়নি।' });
    }

    const fileUrls = req.files.map(f => `/uploads/${f.filename}`);

    return res.status(201).json({
      success: true,
      message: `${fileUrls.length}টি ছবি সফলভাবে সার্ভারে আপলোড হয়েছে!`,
      urls: fileUrls
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Single image upload
router.post('/single', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'কোনো ছবি নির্বাচন করা হয়নি।' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    return res.status(201).json({
      success: true,
      message: 'ছবি সফলভাবে সার্ভারে আপলোড হয়েছে!',
      url: fileUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
