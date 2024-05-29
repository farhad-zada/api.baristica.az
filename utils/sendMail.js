const nodemailer = require("nodemailer");
const config = require("../config");

module.exports = async (options) => {
  const transporter = nodemailer.createTransport({
    service: config.email_service,
    auth: {
      user: config.email_username,
      pass: config.email_password,
    },
  });

  const mailOptions = {
    from: config.email_username,
    to: options.to,
    subject: options.subject,
    text: options.text,
  };

  await transporter.sendMail(mailOptions);
};
