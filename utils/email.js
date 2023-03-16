const nodeMailer = require('nodemailer');
const ejs = require('ejs');
const htmlToText = require('html-to-text');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async (options) => {
   if (process.env.EMAIL_CLIENT === "SMTP") {
      const transportor = nodeMailer.createTransport({
         host: process.env.SMTP_HOST,
         port: process.env.SMTP_PORT,
         secure: true,
         auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
         },
      });
      const html = await ejs.renderFile(
         `${__dirname}/../views/email/${options.template}`,
         {
            user: options.user,
            url: options.url,
            message: options.message
         }
      );
      const mailOptions = {
         from: process.env.SMTP_EMAIL,
         to: options.email,
         subject: options.subject,
         // text: htmlToText.fromString(html),
         html,
      };
      try {
         await transportor.sendMail(mailOptions);
      } catch (err) {
         console.log(err);
      }
   } else {
      const html = await ejs.renderFile(
         `${__dirname}/../views/email/${options.template}`,
         {
            user: options.user,
            url: options.url,
            message: options.message
         }
      );
      const msg = {
         from: process.env.Email_From,
         to: options.email,
         subject: options.subject,
         // text: htmlToText.fromString(html),
         html,
      };
      sgMail
         .send(msg)
         .then(() => {
            console.log('Email sent');
         })
         .catch((error) => {
            console.error(error);
         });
   }
};
module.exports = sendMail;
