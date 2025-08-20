const express = require('express');
const router = express.Router();
const EvaluationController = require('../controllers/evaluationController');
const { isAuthenticated } = require('../middleware/authMiddleware');

const evaluationController = new EvaluationController();

router.post('/', isAuthenticated, evaluationController.create.bind(evaluationController));
router.get('/byResource', isAuthenticated, evaluationController.getByResource.bind(evaluationController));
router.put('/', isAuthenticated, evaluationController.update.bind(evaluationController));

module.exports = router;