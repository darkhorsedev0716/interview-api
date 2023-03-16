const mongoose = require('mongoose');
const validator = require('validator');

const answerSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Please provide interview id"],
    ref: "Interview"
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Please provide question id"],
    ref: "Question"
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Please provide candidate id"],
    ref: "Candidate"
  },
  rating: {
    type: Number,
    default: 0
  },
  comments: {
    type: String,
    default: ""
  },
  videoLink: String,
  createdOn: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true,
  },
});
const Answer = mongoose.model('Answer', answerSchema);
module.exports = Answer;
