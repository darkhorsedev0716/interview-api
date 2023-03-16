const mongoose = require('mongoose');

const questionCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide category name!'],
    trim: true,
    maxlength: [50, 'must be less than or equal to 50'],
    minlength: [2, 'must be greater than 2'],
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
const QuestionCategory = mongoose.model('QuestionCategory', questionCategorySchema);
module.exports = QuestionCategory;
