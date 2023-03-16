const User = require('../models/User');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendMail = require('../utils/email');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({role: {$ne: "admin"}});

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
      users,
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  if (!newUser)
    return next(
      new AppError(`
      Can't create user due to invalid details, 400
      `)
    );

  res.status(200).json({
    status: 'success',
    user: newUser,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        verified: req.body.verified
      }
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if(req.body.verified){ //send mail when account is verified
    sendMail({
      email: updatedUser.email,
      message: "",
      subject: "",
      user: {
        name: updatedUser.name
      },
      url: process.env.APP_URL,
      template: 'accountActivateEmail.ejs',
    });
  }
  res.status(200).json({
    status: 'success',
      user: updatedUser,
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  if (req.user.activated === false)
    return next(
      new AppError(`Your account is not activated`, 401)
    );
  if (req.user.verified === false)
    return next(
      new AppError(
        `Your account is not verified! Please contact admin@hiiree.com to know the status.`, 401)
    );
  res.json(req.user)
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user)
    return next(
      new AppError(`No User found against id ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);

  if (!deletedUser)
    return next(
      new AppError(`No User found against id ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: 'success',
    user: deletedUser,
  });
});

exports.getAllManagers = catchAsync(async (req, res, next) => {
  const users = await User.find({
    parentID: req.user.id
  });
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    users
  });
});

exports.createManager = catchAsync(async (req, res, next) => {
  const newManager = await User.create({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    role: "manager",
    companyName: "N/A",
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    parentID: req.user.id,
    activated: true,
    verified: true
  });
  if (!newManager)
    return next(
      new AppError(`
      Can't create manager due to invalid details, 400
      `)
    );
    const resetToken = newManager.createPasswordResetToken();
    await newManager.save({ validateBeforeSave: false });
    let resetURL = `${process.env.APP_URL}auth/resetPassword/${resetToken}`;
  
    const message = `Welcome to Hiiree. Update your Password from the following link to join our community.`;
  
    sendMail({
      email: req.body.email,
      message,
      subject: 'Your Password reset link for Hiiree.com (will expire in 20 minutes)',
      user: newManager,
      template: 'forgotPassword.ejs',
      url: resetURL,
    });
  res.status(200).json({
    status: 'success',
    user: newManager,
  });
});

exports.deleteManager = catchAsync(async (req, res, next) => {
  const deletedManager = await User.findByIdAndDelete(req.params.id);
  if (!deletedManager)
    return next(
      new AppError(`No User found against id ${req.params.id}`, 404)
    );
  res.status(200).json({
    status: 'success',
    user: deletedManager,
  });
});