const express = require('express');
const questionCategoryController = require('../controllers/questionCategoryController');
const protect = require('../middlewares/protect');
const router = express.Router();

router
  .route('/')
  .get(protect, questionCategoryController.getAllCategories)
  .post(protect, questionCategoryController.createCategory);

router
  .route('/:id')
  .get(protect, questionCategoryController.getCategory)
  .delete(protect, questionCategoryController.deleteCategory)
  .put(protect, questionCategoryController.updateCategory);

module.exports = router;
