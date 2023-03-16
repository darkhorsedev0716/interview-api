const express = require('express');
const sharedInterviewController = require('../controllers/sharedInterviewController');
const protect = require('../middlewares/protect');
const router = express.Router();

router
  .route('/')
  .get(protect, sharedInterviewController.getAllSharedInterviews)
  .post(protect, sharedInterviewController.createSharedInterview);

router
  .route('/:id')
  .post(protect, sharedInterviewController.getDetails)
  .delete(protect, sharedInterviewController.deleteSharedInterview)
  .put(protect, sharedInterviewController.updateSharedInterview);

router
  .route('/public/:id')
  .get(sharedInterviewController.getDetailsPublic)
module.exports = router;
