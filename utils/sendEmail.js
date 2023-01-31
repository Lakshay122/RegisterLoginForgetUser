const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config({ path: "../Config/config.env" });

const sendEmail = async (options) => {
    console.log("user em n",process.env.EMAIL_USER)
  const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",

    auth: {
      user: "bansallakshay081@gmail.com", // ADMIN GMAIL ID
      pass: "BANIYAboy123", // ADMIN GAMIL PASSWORD
    },
  });
  console.log(transporter.options.auth);
  const mailOptions = {
    from: "bansallakshay081@gmail.com",
    to: options.email,
    subject: options.subject,
    html: options.html,
  };
 
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Error in sending email  " + error);
      return true;
    } else {
      console.log("Email sent: " + info.response);
      return false;
    }
  });
};

module.exports = sendEmail;
