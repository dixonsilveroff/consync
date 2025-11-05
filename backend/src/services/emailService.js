import nodemailer from 'nodemailer';

/**
 * Email Service for ConSync
 * Uses Nodemailer with Gmail SMTP
 */

// Create transporter with Gmail SMTP configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      // Do not fail on invalid certs (for development)
      rejectUnauthorized: false,
      // Minimum TLS version
      minVersion: 'TLSv1.2',
    },
    // Additional options for better compatibility
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });
};

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Plain text content (fallback)
 * @returns {Promise<Object>} - Email send result
 */
export async function sendEmail(to, subject, html, text) {
  try {
    // Validate SMTP configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.');
    }

    const transporter = createTransporter();
    
    // Verify SMTP connection (optional but helpful for debugging)
    await transporter.verify();
    console.log('✓ SMTP server is ready to send emails');

    // Email options
    const mailOptions = {
      from: process.env.SMTP_FROM || `ConSync <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✓ Email sent successfully:', {
      messageId: info.messageId,
      to,
      subject,
    });

    return {
      success: true,
      messageId: info.messageId,
      to,
    };

  } catch (error) {
    console.error('✗ Email sending failed:', {
      error: error.message,
      to,
      subject,
    });

    // Return error but don't throw (allows caller to handle gracefully)
    return {
      success: false,
      error: error.message,
      to,
    };
  }
}

/**
 * Verify SMTP configuration
 * @returns {Promise<boolean>} - Whether SMTP is configured correctly
 */
export async function verifyEmailConfig() {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠ Email service not configured. Set SMTP_USER and SMTP_PASS environment variables.');
      return false;
    }

    const transporter = createTransporter();
    await transporter.verify();
    console.log('✓ Email service is configured and ready');
    return true;
  } catch (error) {
    console.error('✗ Email service configuration error:', error.message);
    return false;
  }
}

export default { sendEmail, verifyEmailConfig };
