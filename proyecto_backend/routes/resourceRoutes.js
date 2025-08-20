const express = require('express');
const router = express.Router();
const ResourceController = require('../controllers/resourceController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const resourceController = new ResourceController();

router.post('/', isAuthenticated, upload.single('file'), resourceController.create.bind(resourceController));
router.get('/byUser', isAuthenticated, resourceController.getByUserId.bind(resourceController));
router.delete('/', isAuthenticated, resourceController.delete.bind(resourceController));
router.get('/download', isAuthenticated, resourceController.download.bind(resourceController));
router.get('/byVariant', isAuthenticated, resourceController.getByVariant.bind(resourceController));

module.exports = router;