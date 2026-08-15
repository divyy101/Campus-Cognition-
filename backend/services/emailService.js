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
    },
    tls: {
      rejectUnauthorized: false
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
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #161618; color: #ffffff; border-radius: 8px;">
          <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Welcome to Campus Cognition 🎓</h1>
          
          <p style="font-size: 16px; margin-bottom: 16px; color: #e5e5e5;">Hello ${user.firstName || user.username},</p>
          
          <p style="font-size: 16px; margin-bottom: 24px; line-height: 1.5; color: #e5e5e5;">
            Your account has been successfully created.<br>
            We're excited to have you on board!
          </p>

          <p style="font-size: 16px; margin-bottom: 24px; color: #e5e5e5;">
            <strong>Registered email:</strong><br>
            <a href="mailto:${user.email}" style="color: #60A5FA; text-decoration: none;">${user.email}</a>
          </p>

          <p style="font-size: 16px; margin-bottom: 16px; color: #e5e5e5;">You can now use Campus Cognition to:</p>
          
          <ul style="font-size: 15px; margin-bottom: 32px; padding-left: 20px; line-height: 1.8; color: #e5e5e5;">
            <li>Analyze your syllabus and PYQs</li>
            <li>Build personalized study roadmaps</li>
            <li>Ask questions about your notes</li>
            <li>Review and optimize code</li>
            <li>Discover internships and scholarships</li>
            <li>Track career opportunities</li>
          </ul>

          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${env.frontendUrl || 'http://localhost:3000'}/login" style="display: inline-block; background-color: #2563EB; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Log In to Your Account</a>
          </div>

          <div style="background-color: #27272A; padding: 16px; border-radius: 8px; font-size: 14px; color: #D4D4D8; line-height: 1.5;">
            <strong>Security Notice:</strong> For your protection, your password is never stored in plain text and will never be sent to you by email.
          </div>
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
