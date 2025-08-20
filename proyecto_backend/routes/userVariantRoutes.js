const express = require('express');
const router = express.Router();
const UserVariantController = require('../controllers/userVariantController');
const { isAuthenticated } = require('../middleware/authMiddleware');

const userVariantController = new UserVariantController();

router.post('/', isAuthenticated, userVariantController.create.bind(userVariantController));
router.put('/', isAuthenticated, userVariantController.updateRole.bind(userVariantController));

module.exports = router;