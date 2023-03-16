const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide candidate name!"],
    trim: true,
    maxlength: [50, "must be less than or equal to 50"],
    minlength: [3, "must be greater than 3"],
  },
  email: {
    type: String,
    required: [true, "Please provide candidate email"],
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  phone: {
    type: String,
    default: "",
    trim: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  additionalDetails: {
    type: String,
    default: "",
    maxlength: [2000, "must be less than or equal to 2000"],
  },
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Please provide interview id"],
    ref: "Interview",
  },
  answers: {
    type: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
        rating: {
          type: Number,
          default: 0,
        },
        comments: {
          type: String,
          default: "",
        },
        videoLink: String,
      },
    ],
    default: [],
  },
  status: {
    type: String,
    enum: ["created", "invited", "completed", "cancelled"],
    default: "created",
  },
  shortlisted: {
    type: Boolean,
    default: false,
  },
  interviewToken: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
  },
  resumeLink: {
    type: String,
    default: "",
  },
});
candidateSchema.methods.createInterviewToken = function () {
  const interviewToken = crypto.randomBytes(32).toString("hex");
  this.interviewToken = crypto
    .createHash("sha256")
    .update(interviewToken)
    .digest("hex");
  return interviewToken;
};
const Candidate = mongoose.model("Candidate", candidateSchema);
module.exports = Candidate;
