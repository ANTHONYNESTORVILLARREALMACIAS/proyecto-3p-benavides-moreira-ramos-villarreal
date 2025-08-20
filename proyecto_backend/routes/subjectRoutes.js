const express = require('express');
const router = express.Router();
const SubjectController = require('../controllers/subjectController');
const { isAuthenticated } = require('../middleware/authMiddleware');

const subjectController = new SubjectController();

router.get('/', isAuthenticated, subjectController.getAll.bind(subjectController));

module.exports = router;