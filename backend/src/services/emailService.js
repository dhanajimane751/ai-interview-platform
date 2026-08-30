const { BrevoClient } = require("@getbrevo/brevo");

const {
  BREVO_API_KEY,
  BREVO_SENDER_EMAIL,
  CLIENT_URL,
} = require("../config/env");

// Create Brevo client
const brevo = new BrevoClient({
  apiKey: BREVO_API_KEY,
});

// Generic email sender
const sendEmail = async ({ to, subject, html }) => {
  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent: html,

      sender: {
        name: "MockAI",
        email: BREVO_SENDER_EMAIL,
      },

      to: [
        {
          email: to,
        },
      ],
    });

    console.log(`Email sent successfully to ${to}`);

    return result;
  } catch (error) {
    console.error("Brevo email error:");

    console.error("Message:", error.message);

    if (error.body) {
      console.error("Body:", error.body);
    }

    throw error;
  }
};

// --------------------------------------------------
// Verification Email
// --------------------------------------------------

const sendVerificationEmail = async (to, token) => {
  const verifyUrl = `${CLIENT_URL}/verify-email/${token}`;

  await sendEmail({
    to,

    subject: "Verify your email — MockAI",

    html: `
      <!DOCTYPE html>
      <html>
        <body
          style="
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            font-family: Arial, sans-serif;
          "
        >
          <div
            style="
              max-width: 480px;
              margin: 40px auto;
              background: white;
              padding: 32px;
              border-radius: 12px;
            "
          >
            <h2 style="color: #4F46E5; margin-top: 0;">
              Verify your email
            </h2>

            <p style="color: #333; line-height: 1.6;">
              Thanks for signing up for MockAI.
              Click the button below to verify your email address.
            </p>

            <a
              href="${verifyUrl}"
              style="
                display: inline-block;
                background: #4F46E5;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                text-decoration: none;
                margin: 16px 0;
              "
            >
              Verify Email
            </a>

            <p
              style="
                color: #666;
                font-size: 13px;
                line-height: 1.5;
              "
            >
              If the button doesn't work, copy this link into your browser:
            </p>

            <p
              style="
                color: #4F46E5;
                font-size: 13px;
                word-break: break-all;
              "
            >
              ${verifyUrl}
            </p>

            <p
              style="
                color: #999;
                font-size: 12px;
                margin-top: 24px;
              "
            >
              This link expires in 24 hours.
            </p>
          </div>
        </body>
      </html>
    `,
  });
};

// --------------------------------------------------
// Reset Password Email
// --------------------------------------------------

const sendResetPasswordEmail = async (to, token) => {
  const resetUrl = `${CLIENT_URL}/reset-password/${token}`;

  await sendEmail({
    to,

    subject: "Reset your password — MockAI",

    html: `
      <!DOCTYPE html>
      <html>
        <body
          style="
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            font-family: Arial, sans-serif;
          "
        >
          <div
            style="
              max-width: 480px;
              margin: 40px auto;
              background: white;
              padding: 32px;
              border-radius: 12px;
            "
          >
            <h2 style="color: #4F46E5; margin-top: 0;">
              Reset your password
            </h2>

            <p style="color: #333; line-height: 1.6;">
              We received a request to reset your password.
              Click the button below to choose a new password.
            </p>

            <a
              href="${resetUrl}"
              style="
                display: inline-block;
                background: #4F46E5;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                text-decoration: none;
                margin: 16px 0;
              "
            >
              Reset Password
            </a>

            <p
              style="
                color: #666;
                font-size: 13px;
                line-height: 1.5;
              "
            >
              If you didn't request this, you can safely ignore this email.
            </p>

            <p
              style="
                color: #999;
                font-size: 12px;
                margin-top: 24px;
              "
            >
              This link expires in 1 hour.
            </p>
          </div>
        </body>
      </html>
    `,
  });
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
};