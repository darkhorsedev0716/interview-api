const catchAsync = require("../utils/catchAsync");
const sendMail = require("../utils/email");

exports.sendEmail = catchAsync(async (req, res, next) => {
  const {name, email, phone, message} = req.body
  sendMail({
    email: "hello@hiiree.com",
    message: "",
    subject: "Invitation For Interview",
    user: {name, email, phone, message},
    template: "newLeads.ejs",
    url: "",
  });
  res.status(200).json({
    status: "success",
  });
});