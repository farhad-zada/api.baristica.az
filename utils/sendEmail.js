const nodemailer = require("nodemailer");
const config = require("../config");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: config.email_service,
    auth: {
      user: config.email_username,
      pass: config.email_password,
    },
  });

  const mailOptions = {
    from: config.email_username,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

sendEmail({});
