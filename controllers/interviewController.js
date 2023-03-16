const Interview = require('../models/Interview');
const QuestionCategory = require('../models/QuestionCategory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const moment = require("moment")
const crypto = require('crypto');

exports.getAllInterviews = catchAsync(async (req, res, next) => {
  let cond = {
    $or: [{createdBy: req.user.id}, {member: req.user.id}],
    active: true
  };
  if(req.query.status){
    cond = {
      ...cond,
      status: req.query.status
    }
  }
  const interviews = await Interview.find(cond).sort({"createdOn": -1}).populate("candidates");

  // SEND RESPONSE
  res.status(200).json({
    interviews,
    count: interviews.length
  });
});

exports.createInterview = catchAsync(async (req, res, next) => {
  let createdBy = req.user.id
  if(req.user.role === "manager"){
    createdBy = req.user.parentID
  }
  const newInterview = await Interview.create({
    title: req.body.title,
    jobId: req.body.jobId,
    location: req.body.location,
    member: req.body.member || null,
    completionDate: moment(req.body.completionDate, "YYYY-MM-DD").toDate(),
    description: req.body.description,
    createdBy,
  });

  if (!newInterview)
    return next(
      new AppError(`Can't create interview due to invalid details, 400`)
    );

  res.status(200).json({
    status: 'success',
    interview: newInterview,
  });
});

exports.updateInterview = catchAsync(async (req, res, next) => {
  const updatedInterview = await Interview.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        title: req.body.title,
        jobId: req.body.jobId,
        location: req.body.location,
        member: req.body.member,
        completionDate: req.body.completionDate,
        description: req.body.description,
        status: req.body.status,
        questions: Array.isArray(req.body.questions) ? req.body.questions : [],
        candidates: Array.isArray(req.body.candidates) ? req.body.candidates : [],
      }
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    interview: updatedInterview,
  });
});

exports.getInterview = catchAsync(async (req, res, next) => {
  let interview = await Interview.findById(req.params.id).populate("questions candidates member");
  interview = await QuestionCategory.populate(interview, {
    path: "questions.categoryId",
  });
  if (!interview)
    return next(
      new AppError(`No interview found against id ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: 'success',
    interview,
  });
});

exports.deleteInterview = catchAsync(async (req, res, next) => {
  const deletedInterview = await Interview.findByIdAndDelete(req.params.id);

  if (!deletedInterview)
    return next(
      new AppError(`No interview found against id ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: 'success',
  });
});

exports.generateInterviewLink = catchAsync(async (req, res, next) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview)
    return next(
      new AppError(`No interview Found against this id`, 400)
    );
  const interviewToken = interview.createInterviewToken();
  await interview.save({ validateBeforeSave: false });

  let interviewURL = `${process.env.APP_URL}interview/invite/${interviewToken}`;
  res.status(200).json({
    status: 'success',
    interviewURL
  });
});
exports.getInterviewDetailsFromToken = catchAsync(async (req, res, next) => {
  // const hashedToken = crypto
  //   .createHash('sha256')
  //   .update(req.params.interviewToken)
  //   .digest('hex');
    let details = await Interview.findOne({
      interviewToken: req.params.interviewToken,
      status: "open"
    }).populate("questions");

    res.status(200).json({
      status: 'success',
      interview: details
    });
});