// utils/sendEmail.js

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter object using SMTP transport
  //    (We are using Mailtrap for development)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: process.env.EMAIL_FROM, // Sender address
    to: options.email,            // List of receivers
    subject: options.subject,     // Subject line
    text: options.message,        // Plain text body
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;