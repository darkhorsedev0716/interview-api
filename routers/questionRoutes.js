const express = require('express');
const questionController = require('../controllers/questionController');
const protect = require('../middlewares/protect');
const router = express.Router();

router
  .route('/')
  .get(protect, questionController.getAllQuestions)
  .post(protect, questionController.createQuestion);

router
  .route('/:id')
  .get(protect, questionController.getQuestion)
  .delete(protect, questionController.deleteQuestion)
  .put(protect, questionController.updateQuestion);

module.exports = router;
