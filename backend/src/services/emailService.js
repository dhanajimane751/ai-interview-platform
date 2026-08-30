const { Resend } = require("resend");
const { RESEND_API_KEY, CLIENT_URL } = require("../config/env");

const resend = new Resend(RESEND_API_KEY);

const sendVerificationEmail = async (to, token) => {
  const verifyUrl = `${CLIENT_URL}/verify-email/${token}`;

  await resend.emails.send({
    from: "MockAI <onboarding@resend.dev>",
    to,
    subject: "Verify your email — MockAI",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Verify your email</h2>
        <p>Thanks for signing up for MockAI. Click the button below to verify your email address.</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #666; font-size: 13px;">If the button doesn't work, copy this link into your browser:<br/>${verifyUrl}</p>
        <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
      </div>
    `,
  });
};

const sendResetPasswordEmail = async (to, token) => {
  const resetUrl = `${CLIENT_URL}/reset-password/${token}`;

  await resend.emails.send({
    from: "MockAI <onboarding@resend.dev>",
    to,
    subject: "Reset your password — MockAI",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Reset your password</h2>
        <p>We received a request to reset your password. Click below to choose a new one.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #999; font-size: 12px;">This link expires in 1 hour.</p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail };