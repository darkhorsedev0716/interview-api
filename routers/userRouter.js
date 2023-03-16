const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo');

const router = express.Router();

// router.use(protect); //  protect all router which are comming after this middleware

router
  .route('/me')
  .get(protect, userController.getMe)
  .patch(userController.getMe, userController.updateUser);

router.patch('/updatePassword', protect, authController.updatePassword);

router
  .route('/')
  .get(protect, restrictTo('admin'), userController.getAllUsers)
  .post(restrictTo('admin'), userController.createUser);

router
  .route('/system_users')
  .get(protect, userController.getAllManagers)
  .post(protect, userController.createManager);

router
  .route('/system_users/:id')
  .put(protect, userController.getMe)
  .delete(protect, userController.deleteManager);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(protect, restrictTo('admin'), userController.updateUser)
  .delete(restrictTo('admin'), userController.deleteUser);

module.exports = router;
