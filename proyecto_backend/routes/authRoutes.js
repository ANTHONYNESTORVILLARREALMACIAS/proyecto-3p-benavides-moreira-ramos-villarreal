const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');

const authController = new AuthController();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.get('/check', isAuthenticated, authController.check.bind(authController));
router.post('/logout', isAuthenticated, authController.logout.bind(authController));

module.exports = router;