const express = require('express');
const router = express.Router();
const multer = require('multer');
const authenticateToken = require('../middleware/auth');
const scanController = require('../controllers/scan.controller');

// Configure Multer in-memory upload storage (allow up to 10GB project archives)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 * 1024 } // 10GB max upload limit
});

const safeUploadMiddleware = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Uploaded file exceeds the maximum 10GB size limit.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(500).json({ error: 'File upload processing failed. Please try a smaller zip archive.' });
    }
    next();
  });
};

router.use(authenticateToken);

router.post('/github', scanController.scanGithubRepo);
router.post('/upload', safeUploadMiddleware, scanController.scanUploadedZip);
router.get('/', scanController.getUserScans);
router.get('/:id', scanController.getScanById);

module.exports = router;
