const mongoose = require('mongoose');
const validator = require('validator');

const sharedInterviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name!'],
    trim: true,
    maxlength: [50, 'must be less than or equal to 50'],
    minlength: [3, 'must be greater than 3'],
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    default: "",
    trim: true,
  },
  deadline: {
    type: Date,
    required: true
  },
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Please provide interview id"],
    ref: "Interview"
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Please provide candidate id"],
    ref: "Candidate"
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
  },
  rating: {
    type: Number,
    default: 0,
  },
  comments: {
    type: String,
    default: "",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  createdOn: {
    type: Date,
    default: Date.now
  },
});
const SharedInterview = mongoose.model('SharedInterview', sharedInterviewSchema);
module.exports = SharedInterview;
