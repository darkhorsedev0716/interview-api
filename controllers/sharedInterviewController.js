const SharedInterview = require('../models/SharedInterview');
const Candidate = require('../models/Candidate');
const Question = require('../models/Question');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendMail = require('../utils/email');

exports.getAllSharedInterviews = catchAsync(async (req, res, next) => {
  let createdBy = req.user.id
  if(req.user.role === "manager"){
    createdBy = req.user.parentID
  }
  const sharedInterviews = await SharedInterview.find({
    createdBy
  })
    .populate("interviewId candidateId")
    .sort({ "createdOn": -1 });

  // SEND RESPONSE
  res.status(200).json({
    sharedInterviews,
    count: sharedInterviews.length
  });
});

exports.createSharedInterview = catchAsync(async (req, res, next) => {
  let createdBy = req.user.id
  if(req.user.role === "manager"){
    createdBy = req.user.parentID
  }
  const newSharedInterview = await SharedInterview.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    deadline: req.body.deadline,
    interviewId: req.body.interviewId,
    candidateId: req.body.candidateId,
    password: req.body.password,
    createdBy
  });

  if (!newSharedInterview)
    return next(
      new AppError(`
      Can't create shared interview due to invalid details, 400
      `)
    );
  sendMail({
    email: req.body.email,
    message: `Your password to open the interview is ${req.body.password}`,
    subject: "",
    user: {
      name: req.body.name
    },
    template: 'shareInterviewEmail.ejs',
    url: `${process.env.APP_URL}interview/share/${newSharedInterview._id}`,
  });
  res.status(200).json({
    status: 'success',
    sharedInterview: newSharedInterview,
  });
});

exports.updateSharedInterview = catchAsync(async (req, res, next) => {
  const updatedSharedInterview = await SharedInterview.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        rating: req.body.rating,
        comments: req.body.comments,
        password: req.body.password,
      }
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    sharedInterview: updatedSharedInterview,
  });
});

exports.getDetails = catchAsync(async (req, res, next) => {
  let sharedInterview = await SharedInterview.findById(req.params.id).populate("candidateId");

  if (!sharedInterview)
    return next(
      new AppError(`No interview found against id ${req.params.id}`, 404)
    );

  if(sharedInterview.password !== req.body.password){
    return next(
      new AppError(`Incorrect Password`, 400)
    );
  }
  if(sharedInterview.deadline < new Date()){
    return next(
      new AppError(`This link has been expired`, 400)
    );
  }
  sharedInterview = await Question.populate(sharedInterview, {
    path: "candidateId.answers.questionId",
  })
  res.status(200).json({
    status: 'success',
    sharedInterview,
  });
});

exports.deleteSharedInterview = catchAsync(async (req, res, next) => {
  const deletedSharedInterview = await SharedInterview.findByIdAndDelete(req.params.id);
  if (!deletedSharedInterview)
    return next(
      new AppError(`No shared interview found against id ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: 'success',
  });
});

exports.getDetailsPublic = catchAsync(async (req, res, next) => {
  const sharedInterview = await SharedInterview.findById(req.params.id).populate("candidateId interviewId");
  if (!sharedInterview)
    return next(
      new AppError(`No interview found against id ${req.params.id}`, 404)
    );
  res.status(200).json({
    status: "success",
    candidate: {
      name: sharedInterview.candidateId.name
    },
    interview:{
      title: sharedInterview.interviewId.title,
      location: sharedInterview.interviewId.location,
    },
    sharedInterview: {
      name: sharedInterview.name,
      deadline: sharedInterview.deadline,
    }
  });
});