const { sendEmail } = require('../config/email');

const getBaseStyles = () => `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #071526;
  color: #E2E8F0;
  margin: 0;
  padding: 30px 15px;
`;

/**
 * Send Verification Email with Link & 6-digit OTP
 */
const sendVerificationEmail = async (email, verificationToken, userName, otpCode) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your AQI Index Account</title>
    </head>
    <body style="${getBaseStyles()}">
      <div style="max-width: 560px; margin: 0 auto; background: linear-gradient(180deg, #0d2238 0%, #071526 100%); border: 1px solid rgba(87, 229, 210, 0.2); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0F766E 0%, #0d2238 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid rgba(87, 229, 210, 0.25);">
          <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; background: #57E5D2; color: #071526; font-weight: 900; font-size: 20px; border-radius: 12px; margin-bottom: 12px;">AQI</div>
          <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">AQI Index AirSense</h1>
          <p style="margin: 6px 0 0; color: #57E5D2; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">Breathe Smarter. Live Healthier.</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 28px;">
          <h2 style="margin: 0 0 12px; color: #FFFFFF; font-size: 20px;">Verify Your Email Address</h2>
          <p style="margin: 0 0 20px; color: #94A3B8; font-size: 15px; line-height: 1.6;">
            Hello <strong style="color: #F1F5F9;">${userName || 'there'}</strong>, thank you for joining AQI Index. Please verify your email to activate live air quality monitoring and predictive alerts.
          </p>

          <!-- Button -->
          <div style="text-align: center; margin: 28px 0;">
            <a href="${verificationLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0F766E 0%, #57E5D2 100%); color: #071526; text-decoration: none; font-weight: 700; font-size: 15px; border-radius: 10px; box-shadow: 0 8px 20px rgba(87, 229, 210, 0.35);">
              Verify Email Address
            </a>
          </div>

          ${
            otpCode
              ? `
          <div style="background: rgba(15, 118, 110, 0.15); border: 1px dashed #57E5D2; border-radius: 10px; padding: 18px; text-align: center; margin: 24px 0;">
            <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; font-weight: 600;">Or enter this 6-digit verification code:</span>
            <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #57E5D2; margin-top: 8px;">${otpCode}</div>
          </div>
          `
              : ''
          }

          <p style="margin: 24px 0 0; color: #64748B; font-size: 13px; line-height: 1.5;">
            This link will expire in <strong>24 hours</strong>. If you did not create an account on AQI Index, please ignore this email.
          </p>
          <p style="margin: 12px 0 0; color: #475569; font-size: 11px; word-break: break-all;">
            Direct link: <a href="${verificationLink}" style="color: #57E5D2;">${verificationLink}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="padding: 16px 28px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.06); text-align: center; font-size: 12px; color: #64748B;">
          © ${new Date().getFullYear()} AQI Index Platform • Environmental & Air Quality Intelligence
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Verify Your AQI Index Account
Hello ${userName || 'there'},

Please verify your email address by visiting the following link:
${verificationLink}

${otpCode ? `Or use this 6-digit verification code: ${otpCode}\n` : ''}
This link will expire in 24 hours. If you did not sign up, please ignore this message.
  `.trim();

  return await sendEmail({
    to: email,
    subject: 'Verify Your AQI Index Account',
    html: htmlContent,
    text: textContent,
  });
};

/**
 * Send Password Reset Email
 */
const sendPasswordResetEmail = async (email, resetToken, userName, otpCode) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your AQI Index Password</title>
    </head>
    <body style="${getBaseStyles()}">
      <div style="max-width: 560px; margin: 0 auto; background: linear-gradient(180deg, #0d2238 0%, #071526 100%); border: 1px solid rgba(87, 229, 210, 0.2); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0F766E 0%, #0d2238 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid rgba(87, 229, 210, 0.25);">
          <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; background: #57E5D2; color: #071526; font-weight: 900; font-size: 20px; border-radius: 12px; margin-bottom: 12px;">AQI</div>
          <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Password Recovery</h1>
          <p style="margin: 6px 0 0; color: #57E5D2; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">AQI Index Security</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 28px;">
          <h2 style="margin: 0 0 12px; color: #FFFFFF; font-size: 20px;">Reset Your Password</h2>
          <p style="margin: 0 0 20px; color: #94A3B8; font-size: 15px; line-height: 1.6;">
            Hello <strong style="color: #F1F5F9;">${userName || 'User'}</strong>, we received a request to reset the password associated with your account.
          </p>

          <!-- Button -->
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0F766E 0%, #57E5D2 100%); color: #071526; text-decoration: none; font-weight: 700; font-size: 15px; border-radius: 10px; box-shadow: 0 8px 20px rgba(87, 229, 210, 0.35);">
              Set New Password
            </a>
          </div>

          ${
            otpCode
              ? `
          <div style="background: rgba(15, 118, 110, 0.15); border: 1px dashed #57E5D2; border-radius: 10px; padding: 18px; text-align: center; margin: 24px 0;">
            <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; font-weight: 600;">Security code:</span>
            <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #57E5D2; margin-top: 8px;">${otpCode}</div>
          </div>
          `
              : ''
          }

          <p style="margin: 24px 0 0; color: #64748B; font-size: 13px; line-height: 1.5;">
            This password reset link is valid for <strong>1 hour</strong>. If you did not make this request, you can safely ignore this email; your existing password will remain unchanged.
          </p>
          <p style="margin: 12px 0 0; color: #475569; font-size: 11px; word-break: break-all;">
            Direct link: <a href="${resetLink}" style="color: #57E5D2;">${resetLink}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="padding: 16px 28px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.06); text-align: center; font-size: 12px; color: #64748B;">
          © ${new Date().getFullYear()} AQI Index Platform • Environmental & Air Quality Intelligence
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Reset Your AQI Index Password
Hello ${userName || 'User'},

Click the link below to set a new password:
${resetLink}

${otpCode ? `Or use this security code: ${otpCode}\n` : ''}
This link will expire in 1 hour. If you did not request this, please ignore this email.
  `.trim();

  return await sendEmail({
    to: email,
    subject: 'Reset Your AQI Index Password',
    html: htmlContent,
    text: textContent,
  });
};

/**
 * Send OTP Email
 */
const sendOTPEmail = async (email, otp, userName) => {
  return await sendVerificationEmail(email, otp, userName, otp);
};

module.exports = {
  sendVerificationEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
};
