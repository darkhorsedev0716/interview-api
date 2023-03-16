const express = require('express');
const interviewController = require('../controllers/interviewController');
const protect = require('../middlewares/protect');
const router = express.Router();

router
  .route('/')
  .get(protect, interviewController.getAllInterviews)
  .post(protect, interviewController.createInterview);

router
  .route('/generate_link/:id')
  .get(protect, interviewController.generateInterviewLink)

router
  .route('/get/:interviewToken')
  .get(interviewController.getInterviewDetailsFromToken);
router
  .route('/:id')
  .get(protect, interviewController.getInterview)
  .delete(protect, interviewController.deleteInterview)
  .put(protect, interviewController.updateInterview);

module.exports = router;
