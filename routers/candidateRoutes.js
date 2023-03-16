const express = require('express');
const candidateController = require('../controllers/candidateController');
const protect = require('../middlewares/protect');
const upload = require('../middlewares/upload');
const router = express.Router();

router
  .route('/')
  .post(upload.array('files'), candidateController.createCandidate);

router
  .route('/submit_answers/:id')
  .post(upload.array('files'), candidateController.submitAnswers);

router
  .route('/interview/:interviewId')
  .get(protect, candidateController.getAllCandidates);

router
  .route('/send_invitation/:id')
  .get(protect, candidateController.sendInvitation);

router
  .route('/invite/:interviewToken')
  .get(candidateController.getInterviewDetailsFromToken);

router
  .route('/submit_review/:id')
  .post(protect, candidateController.submitReview);

  router
  .route('/:id')
  .get(protect, candidateController.getCandidate)
  .delete(protect, candidateController.deleteCandidate)
  .put(protect, candidateController.updateCandidate);

  router
  .route('/resumeupload/:id')
  .post(upload.array('files'), candidateController.uploadResume)
  
module.exports = router;
