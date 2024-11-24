const nodemailer = require("nodemailer");
const config = require("../config");
const fs = require("fs");

module.exports = async (options, templatePath=null) => {
  const transporter = nodemailer.createTransport({
    service: config.email_service,
    auth: {
      user: config.email_username,
      pass: config.email_password,
    },
  });

  templatePath = __dirname + "/../public/mailTemplates/forgotPassword.html";
  let emailTemplate = fs.readFileSync(templatePath, "utf8");
  emailTemplate = emailTemplate.replace("{{message}}", options.text);
  emailTemplate = emailTemplate.replace("{{buttonLink}}", options.link);
  const mailOptions = {
    from: config.email_username,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: emailTemplate,
  };

  await transporter.sendMail(mailOptions);
};
