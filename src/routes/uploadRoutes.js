const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, uploadMiddleware.single('image'), uploadController.uploadImage);
router.post('/video', authMiddleware, uploadMiddleware.uploadVideo.single('video'), uploadController.uploadVideo);

module.exports = router;
