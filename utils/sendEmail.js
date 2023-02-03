const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const sendEmail = async (options) => {
    
  const transporter = nodemailer.createTransport({
   service:'gmail',
    

    auth: {
      user: process.env.EMAIL_USER , // ADMIN GMAIL ID
      pass: process.env.EMAIL_PASS, // ADMIN GAMIL PASSWORD
    },
  });
  console.log(transporter.options.auth);
  const mailOptions = {
    from: process.env.EMAIL_USER ,
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
