const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const sendEmail = async (options) => {
    
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port:587,
    

    auth: {
      user: process.env.EMAIL_USER || 'bansallakshay081@gmail.com', // ADMIN GMAIL ID
      pass: process.env.EMAIL_PASS || 'BANIYAboy123', // ADMIN GAMIL PASSWORD
    },
  });
  console.log(transporter.options.auth);
  const mailOptions = {
    from: process.env.EMAIL_USER || 'bansallakshay081@gmail.com',
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
