const express = require('express');
const emailController = require('../controllers/emailController');
const router = express.Router();

router
  .route('/send')
  .post(emailController.sendEmail);

module.exports = router;
