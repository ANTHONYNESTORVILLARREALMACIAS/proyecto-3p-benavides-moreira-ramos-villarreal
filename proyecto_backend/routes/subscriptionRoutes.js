const express = require('express');
const router = express.Router();
const SubscriptionController = require('../controllers/subscriptionController');
const { isAuthenticated } = require('../middleware/authMiddleware');

const subscriptionController = new SubscriptionController();

router.post('/', isAuthenticated, subscriptionController.create.bind(subscriptionController));
router.put('/state', isAuthenticated, subscriptionController.updateState.bind(subscriptionController));
router.get('/user', isAuthenticated, subscriptionController.getUserSubs.bind(subscriptionController));
router.get('/', isAuthenticated, subscriptionController.getAll.bind(subscriptionController));

module.exports = router;