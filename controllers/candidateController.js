const Candidate = require("../models/Candidate");
const Question = require("../models/Question");
const Interview = require("../models/Interview");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const moment = require("moment");
const crypto = require("crypto");
const sendMail = require("../utils/email");

exports.getAllCandidates = catchAsync(async (req, res, next) => {
  let createdBy = req.user.id
  if(req.user.role === "manager"){
    createdBy = req.user.parentID
  }
  const candidates = await Candidate.find({
    createdBy,
    interviewId: req.params.interviewId,
    active: true,
  });

  // SEND RESPONSE
  res.status(200).json({
    candidates,
    count: candidates.length,
  });
});

exports.createCandidate = catchAsync(async (req, res, next) => {
  const interview = await Interview.findById(req.body.interviewId);
  let additionalDetails = {};
  if (Array.isArray(req.files)) {
    if(req.files.length){
      additionalDetails = {
        resumeLink: req.files[0].location,
      };
    }
  }

  if (interview) {
    const newCandidate = await Candidate.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      deadline: moment(req.body.deadline, "YYYY-MM-DD").toDate(),
      additionalDetails: req.body.additionalDetails,
      interviewId: req.body.interviewId,
      createdBy: interview.createdBy,
      ...additionalDetails,
    });
    if (!newCandidate)
      return next(
        new AppError(`Can't create candidate due to invalid details, 400`)
      );
    let candidates = [...interview.candidates];
    candidates.push(newCandidate._id);
    interview.candidates = candidates;
    await interview.save();

    res.status(200).json({
      status: "success",
      candidate: newCandidate,
    });
  } else {
    return next(new AppError(`No interview found with this interviewId, 400`));
  }
});

exports.uploadResume= catchAsync(async (req, res, next) => {
  const resumeLink =  req.files[0].location
  const updatedCandidate = await Candidate.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        resumeLink
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    candidate: updatedCandidate,
  });
});

exports.updateCandidate = catchAsync(async (req, res, next) => {
  const updatedCandidate = await Candidate.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        deadline: req.body.deadline,
        additionalDetails: req.body.additionalDetails,
        status: req.body.status,
        shortlisted: req.body.shortlisted,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    candidate: updatedCandidate,
  });
});

exports.getCandidate = catchAsync(async (req, res, next) => {
  const candidate = await Candidate.findById(req.params.id).populate(
    "answers.questionId"
  );

  if (!candidate)
    return next(
      new AppError(`No candidate found against id ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: "success",
    candidate,
  });
});

exports.deleteCandidate = catchAsync(async (req, res, next) => {
  const deletedCandidate = await Candidate.findByIdAndDelete(req.params.id);

  if (!deletedCandidate)
    return next(
      new AppError(`No candidate found against id ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: "success",
  });
});

exports.sendInvitation = catchAsync(async (req, res, next) => {
  const candidate = await Candidate.findById(req.params.id).populate(
    "interviewId"
  );
  if (!candidate)
    return next(new AppError(`No candidate Found against this id`, 400));
  const interviewToken = candidate.createInterviewToken();
  candidate.status = "invited";
  await candidate.save({ validateBeforeSave: false });

  let interviewURL = `${process.env.APP_URL}candidate/invite/${interviewToken}`;
  let message = candidate.interviewId.description;
  let btnText = message.match(/\[([^)]+)\]/);
  if (btnText) {
    btnText = btnText[1];
  } else {
    btnText = "Start Interview";
  }
  let interviewBtn = `<table
  role="presentation"
  border="0"
  cellpadding="0"
  cellspacing="0"
  class="btn btn-primary"
>
  <tbody>
    <tr>
      <td align="left">
        <table
          role="presentation"
          border="0"
          cellpadding="0"
          cellspacing="0"
        >
          <tbody>
            <tr>
              <td>
                <a
                  href="${interviewURL}"
                  style="
                    background-color: #54d280;
                    padding: 10px;
                    text-decoration: none;
                    color: #fff;
                  "
                  target="_blank"
                  > ${btnText} </a>
              </td>
            </tr>
          </tbody>
        </table>`;

  message = message.replace("{{first_name}}", candidate.name);
  message = message.replace("{{interview_name}}", candidate.interviewId.title);
  message = message.replace(
    "{{deadline}}",
    moment(candidate.interviewId.completionDate).format("MM-DD-YYYY")
  );
  message = message.replace("{{location}}", candidate.interviewId.location);
  message = message.replace(/\n/g, "<br />");
  if (message.match(/\[([^)]+)\]/) !== null) {
    message = message.replace(/\[([^)]+)\]/, interviewBtn);
  } else {
    message += interviewBtn;
  }

  sendMail({
    email: candidate.email,
    message,
    subject: "Invitation For Interview",
    user: candidate,
    template: "candidateInvite.ejs",
    url: interviewURL,
  });
  res.status(200).json({
    status: "success",
  });
});

exports.getInterviewDetailsFromToken = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.interviewToken)
    .digest("hex");
  let details = await Candidate.findOne({
    interviewToken: hashedToken,
  }).populate("interviewId");
  if (details) {
    if (details.interviewId) {
      if (details.interviewId.status === "open") {
        details = await Question.populate(details, {
          path: "interviewId.questions",
        });
      } else {
        details = null;
      }
    } else {
      details = null;
    }
  } else {
    details = null;
  }
  res.status(200).json({
    status: "success",
    candidate: details,
  });
});
exports.submitAnswers = catchAsync(async (req, res, next) => {
  let details = await Candidate.findById(req.params.id).populate("interviewId");
  let questions = details.interviewId.questions;
  let answers = [];
  req.files.map((file, i) => {
    answers.push({
      questionId: questions[i],
      rating: 0,
      comments: "",
      videoLink: file.location,
    });
  });
  details.answers = answers;
  details.status = "completed";
  await details.save();
  sendMail({
    email: details.email,
    message: "",
    subject: "Video Interview Completed",
    user: { ...details._doc, interview_name: details.interviewId.title },
    template: "interviewSuccess.ejs",
    url: "",
  });

  res.status(200).json({
    status: "success",
    candidate: details,
  });
});
exports.submitReview = catchAsync(async (req, res, next) => {
  let candidate = await Candidate.findById(req.params.id);
  candidate.answers = [...req.body.answers];
  await candidate.save();
  res.status(200).json({
    status: "success",
    candidate,
  });
});
