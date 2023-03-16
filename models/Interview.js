const mongoose = require('mongoose');
const crypto = require('crypto');

const interviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide the title!'],
    trim: true,
    maxlength: [200, 'must be less than or equal to 200'],
    minlength: [1, 'must be greater than 1'],
  },
  jobId: {
    type: String,
    required: [true, "Please provide job id"],
  },
  location: {
    type: String,
    default: "",
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  completionDate: {
    type: Date,
    required: [true, "Please provide completion date"]
  },
  description: {
    type: String,
    required: [true, "Please provide description"],
    maxlength: [2000, 'must be less than or equal to 2000'],
    minlength: [10, 'must be greater than 10'],
  },
  questions: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    default: [],
  },
  candidates: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Candidate" }],
    default: [],
  },
  status:{
    type: String,
    enum : ['open','closed', 'on_hold'],
    default: 'open',
  },
  interviewToken: {
    type: String,
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
  active: {
    type: Boolean,
    default: true,
  },
});
interviewSchema.methods.createInterviewToken = function () {
  const interviewToken = crypto.randomBytes(32).toString('hex');
  this.interviewToken = crypto.createHash('sha256').update(interviewToken).digest('hex');
  return interviewToken;
};
const Interview = mongoose.model('Interview', interviewSchema);
module.exports = Interview;
