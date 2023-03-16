const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please provide the question!'],
    trim: true,
    maxlength: [50, 'must be less than or equal to 50'],
    minlength: [2, 'must be greater than 2'],
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Please provide category id"],
    ref: "QuestionCategory"
  },
  timeUnit:{
    type: String,
    enum : ['hour','minute','second'],
    required: [true, 'Please provide the time unit!'],
  },
  time:{
    type: Number,
    required: [true, 'Please provide the time value!'],
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
  favourite: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
});
const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
