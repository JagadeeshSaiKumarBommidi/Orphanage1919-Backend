const path = require('path');
const sharp = require('sharp');
const uploadDir = require('../config/uploadDir');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a file' });
    }

    // Every upload is normalized to WebP before it touches disk, regardless
    // of the source format (jpeg/png/gif/webp).
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const outputPath = path.join(uploadDir, filename);

    await sharp(req.file.buffer)
      .webp({ quality: 82 })
      .toFile(outputPath);

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    return res.json({ imageUrl });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const fs = require('fs');
const models = require('../models');

exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a video file' });
    }

    const filename = req.file.filename;
    const videoUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

    await models.SiteSetting.upsert({
      key: 'homepage_video_url',
      value: videoUrl,
      updated_at: new Date()
    });

    try {
      const usersPublic = path.join(__dirname, '../../../Users/public');
      if (fs.existsSync(usersPublic)) {
        fs.copyFileSync(req.file.path, path.join(usersPublic, 'AVG_Video.mp4'));
      }
    } catch (e) {
      // Ignore if build environment
    }

    return res.json({ videoUrl, message: 'Video uploaded and saved successfully' });
  } catch (err) {
    console.error('Upload Video Error:', err);
    return res.status(500).json({ error: err.message });
  }
};
