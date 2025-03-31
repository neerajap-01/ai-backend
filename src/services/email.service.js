import nodemailer from 'nodemailer';
import { env } from '../config/keys.js';

// Create a Nodemailer transporter
const config = {
  service: env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
}

if(env.EMAIL_SERVICE !== 'gmail') {
  config.host = env.EMAIL_HOST;
  config.port = env.EMAIL_PORT;
  config.secure = true;
  config.auth = {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  };

  delete config.service;
}

const transporter = nodemailer.createTransport(config);
const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: env.EMAIL_USER,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendEmailWithAttachment = async (to, subject, text, attachments) => {
  try {
    const mailOptions = {
      from: env.EMAIL_USER,
      to,
      subject,
      text,
      attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email with attachment sent successfully');
  } catch (error) {
    console.error('Error sending email with attachment:', error);
  }
};

const sendEmailWithHtml = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: env.EMAIL_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log('HTML email sent successfully');
  } catch (error) {
    console.error('Error sending HTML email:', error);
  }
};

export {
  sendEmail,
  sendEmailWithAttachment,
  sendEmailWithHtml,
}