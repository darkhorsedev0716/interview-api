const Question = require('../models/Question');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAllQuestions = catchAsync(async (req, res, next) => {
  let createdBy = req.user.id
  if(req.user.role === "manager"){
    createdBy = req.user.parentID
  }
  const questions = await Question.find({
    createdBy,
    active: true
  })
  .populate("categoryId", "_id name")
  .sort({"createdOn": -1});

  // SEND RESPONSE
  res.status(200).json({
    questions,
    count: questions.length
  });
});

exports.createQuestion = catchAsync(async (req, res, next) => {
  let createdBy = req.user.id
  if(req.user.role === "manager"){
    createdBy = req.user.parentID
  }
  const newQuestion = await Question.create({
    question: req.body.question,
    categoryId: req.body.categoryId,
    timeUnit: req.body.timeUnit,
    time: req.body.time,
    createdBy,
  });

  if (!newQuestion)
    return next(
      new AppError(`Can't create question due to invalid details, 400`)
    );

  res.status(200).json({
    status: 'success',
    question: newQuestion,
  });
});

exports.updateQuestion = catchAsync(async (req, res, next) => {
  const updatedQuestion = await Question.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        question: req.body.question,
        categoryId: req.body.categoryId,
        timeUnit: req.body.timeUnit,
        time: req.body.time,
        favourite: req.body.favourite
      }
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    question: updatedQuestion,
  });
});

exports.getQuestion = catchAsync(async (req, res, next) => {
  const question = await Question.findById(req.params.id).populate("categoryId", "_id name");

  if (!question)
    return next(
      new AppError(`No question found against id ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: 'success',
    question,
  });
});

exports.deleteQuestion = catchAsync(async (req, res, next) => {
  const deletedQuestion = await Question.findByIdAndUpdate({
    _id: req.params.id,
  }, {
    $set: {
      active: false
    }
  }, {
    new: true
  });

  if (!deletedQuestion)
    return next(
      new AppError(`No question found against id ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: 'success',
  });
});
