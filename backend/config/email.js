const nodemailer = require('nodemailer');

const getSMTPConfig = () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER || '';
  const pass = (process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || '').replace(/\s+/g, '');
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || `"AQI Index AirSense" <${user || 'airindexaqi@gmail.com'}>`;

  const isConfigured =
    user &&
    pass &&
    !user.includes('your-email') &&
    !pass.includes('your-app-password') &&
    !pass.includes('example');

  return { host, port, secure, user, pass, from, isConfigured };
};

let cachedTransporter = null;

const getTransporter = () => {
  const config = getSMTPConfig();

  if (!config.isConfigured) {
    return null;
  }

  const isGmail =
    (config.host && config.host.includes('gmail')) ||
    (config.user && config.user.endsWith('@gmail.com'));

  if (!cachedTransporter) {
    if (isGmail) {
      cachedTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.user,
          pass: config.pass,
        },
        pool: true,
        maxConnections: 3,
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
      });
    } else {
      cachedTransporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.pass,
        },
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
      });
    }
  }

  return cachedTransporter;
};

const verifySMTPConnection = async () => {
  const config = getSMTPConfig();
  if (!config.isConfigured) {
    console.log('⚠️ [SMTP Status] SMTP credentials unconfigured or default placeholders.');
    console.log('   Add SMTP_USER and SMTP_PASS in backend/.env for production email delivery.');
    return { configured: false, message: 'SMTP credentials not configured' };
  }

  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log('✓ [SMTP Status] Connected successfully to mail server:', config.host);
    return { configured: true, ready: true };
  } catch (error) {
    console.warn('⚠️ [SMTP Status] Connection failed:', error.message);
    return { configured: true, ready: false, error: error.message };
  }
};

const sendEmail = async ({ to, subject, html, text }) => {
  const config = getSMTPConfig();
  const transporter = getTransporter();

  if (!transporter) {
    const warningMsg = `[SMTP Development Mode] Email not delivered: credentials not configured. Intended recipient: ${to}, Subject: "${subject}".`;
    console.warn(warningMsg);
    // If not in production, don't crash the flow so dev testing works, but log notice
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMTP service is not configured. Please set SMTP credentials.');
    }
    return { delivered: false, simulated: true, to };
  }

  try {
    const mailOptions = {
      from: config.from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✓ Email sent to ${to}: ${info.messageId}`);
    return { delivered: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    cachedTransporter = null;
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Email delivery failed: ${error.message}`);
    }
    return { delivered: false, error: error.message };
  }
};

module.exports = {
  getSMTPConfig,
  verifySMTPConnection,
  sendEmail,
};
