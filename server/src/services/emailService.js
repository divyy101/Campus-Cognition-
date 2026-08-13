const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

if (env.mailUsername && env.mailPassword) {
  transporter = nodemailer.createTransport({
    host: env.mailHost,
    port: env.mailPort,
    secure: env.mailPort === 465,
    auth: {
      user: env.mailUsername,
      pass: env.mailPassword
    }
  });
}

async function sendWelcomeEmail(user) {
  if (!transporter) {
    console.log('[EmailService] SMTP credentials not set, skipping welcome email send.');
    return false;
  }

  try {
    const mailOptions = {
      from: `"${env.mailFrom || 'Campus Cognition'}" <${env.mailUsername}>`,
      to: user.email,
      subject: 'Welcome to Campus Cognition!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1E3E62;">Welcome to Campus Cognition, ${user.firstName || user.username}!</h2>
          <p>We are excited to help you supercharge your academic learning, code mastery, and career opportunities.</p>
          <p>Get started by setting up your study syllabus, reviewing code in Code Lab, or discovering top MNC internships!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">Campus Cognition Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('[EmailService] Error sending welcome email:', error.message);
    return false;
  }
}

async function sendPasswordResetEmail(user, resetUrl) {
  if (!transporter) {
    console.log(`[EmailService] SMTP not set. Password reset link for ${user.email}: ${resetUrl}`);
    return false;
  }

  try {
    const mailOptions = {
      from: `"${env.mailFrom || 'Campus Cognition'}" <${env.mailUsername}>`,
      to: user.email,
      subject: 'Reset Your Campus Cognition Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1E3E62;">Password Reset Request</h2>
          <p>Hi ${user.username},</p>
          <p>We received a request to reset your password. Click the link below to set a new password:</p>
          <p style="margin: 25px 0;">
            <a href="${resetUrl}" style="background-color: #1E3E62; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
          </p>
          <p>If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">Campus Cognition Security</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('[EmailService] Error sending password reset email:', error.message);
    return false;
  }
}

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail
};
