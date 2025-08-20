const express = require('express');
const router = express.Router();
const VariantController = require('../controllers/variantController');
const { isAuthenticated } = require('../middleware/authMiddleware');

const variantController = new VariantController();

router.get('/', isAuthenticated, variantController.getAll.bind(variantController));
router.get('/bySubject', isAuthenticated, variantController.getBySubject.bind(variantController));

module.exports = router;