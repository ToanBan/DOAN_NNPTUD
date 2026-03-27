const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, 
  port: 587,
  secure: false, 
  auth: {
    user: process.env.APP_USER_EMAIL,
    pass: process.env.APP_PASSWORD, 
  },
  connectionTimeout: 10000, 
});

async function sendMail(to, subject, text) {
  try {
    const info = await transporter.sendMail({
      from: `SnapMart <${process.env.APP_USER_EMAIL}>`,
      to,
      subject,
      text,
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Send mail failed:", error);
    throw error;
  }
}

module.exports = sendMail;