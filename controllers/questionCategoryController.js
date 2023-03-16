const QuestionCategory = require('../models/QuestionCategory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAllCategories = catchAsync(async (req, res, next) => {
  let createdBy = req.user.id
  if(req.user.role === "manager"){
    createdBy = req.user.parentID
  }
  const categories = await QuestionCategory.find({
    createdBy,
    active: true
  }).sort({"createdOn": -1});

  // SEND RESPONSE
  res.status(200).json({
    categories,
    count: categories.length
  });
});

exports.createCategory = catchAsync(async (req, res, next) => {
  let createdBy = req.user.id
  if(req.user.role === "manager"){
    createdBy = req.user.parentID
  }
  const newQuestionCategory = await QuestionCategory.create({
    name: req.body.name,
    createdBy,
  });

  if (!newQuestionCategory)
    return next(
      new AppError(`
      Can't create question category due to invalid details, 400
      `)
    );

  res.status(200).json({
    status: 'success',
    category: newQuestionCategory,
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const updatedCategory = await QuestionCategory.findByIdAndUpdate(
    req.params.id,
    {
      $set:{
        name: req.body.name
      }
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
      category: updatedCategory,
  });
});

exports.getCategory = catchAsync(async (req, res, next) => {
  const category = await QuestionCategory.findById(req.params.id);

  if (!category)
    return next(
      new AppError(`No category found against id ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: 'success',
    category,
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const deletedCategory = await QuestionCategory.findByIdAndUpdate({
    _id: req.params.id, 
  }, {
    $set:{
      active: false
    }
  }, {
    new: true
  });

  if (!deletedCategory)
    return next(
      new AppError(`No category found against id ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: 'success',
  });
});
