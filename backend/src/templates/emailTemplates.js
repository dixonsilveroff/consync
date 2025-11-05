/**
 * Email Templates for ConSync
 * Professional HTML email designs with inline CSS for compatibility
 */

/**
 * Generate invitation email content
 * @param {string} inviterName - Name of person sending invitation
 * @param {string} orgName - Organization name
 * @param {string} role - Role being assigned (engineer/client)
 * @param {string} acceptLink - URL to accept invitation
 * @param {Date} expiryDate - When invitation expires
 * @param {string} message - Optional personal message from inviter
 * @returns {Object} - { subject, html, text }
 */
export function invitationEmail(inviterName, orgName, role, acceptLink, expiryDate, message = null) {
  // Format role for display
  const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);
  
  // Format expiry date
  const expiryFormatted = new Date(expiryDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = `Invitation to join ${orgName} on ConSync`;

  // HTML email with inline CSS for maximum compatibility
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ConSync Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; color: #1f2937;">
  
  <!-- Email Container -->
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        
        <!-- Main Content Card -->
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-collapse: collapse;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                ConSync
              </h1>
              <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px; font-weight: 500;">
                Construction Lifecycle Management
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 700;">
                You've been invited!
              </h2>
              
              <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                <strong style="color: #1f2937;">${inviterName}</strong> has invited you to join 
                <strong style="color: #667eea;">${orgName}</strong> on ConSync as a 
                <strong style="color: #1f2937;">${roleDisplay}</strong>.
              </p>

              ${message ? `
              <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6; font-style: italic;">
                  "${message}"
                </p>
              </div>
              ` : ''}
              
              <p style="margin: 20px 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ConSync helps construction teams collaborate on projects, manage resources, track progress, and streamline workflows—all in one place.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 32px 0; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${acceptLink}" 
                       style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative Link -->
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 8px 0 0; color: #667eea; font-size: 13px; word-break: break-all; text-align: center;">
                ${acceptLink}
              </p>
              
              <!-- Expiry Notice -->
              <div style="margin-top: 32px; padding: 16px; background-color: #fef3c7; border-radius: 6px; border: 1px solid #fcd34d;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6; text-align: center;">
                  ⏰ This invitation expires on <strong>${expiryFormatted}</strong>
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; line-height: 1.6; text-align: center;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} ConSync. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `.trim();

  // Plain text version for email clients that don't support HTML
  const text = `
You've been invited to join ${orgName} on ConSync!

${inviterName} has invited you to join their organization as a ${roleDisplay}.

${message ? `Personal message: "${message}"\n\n` : ''}

ConSync is a Construction Lifecycle Management System that helps teams collaborate on projects, manage resources, track progress, and streamline workflows.

Accept your invitation by visiting this link:
${acceptLink}

This invitation expires on ${expiryFormatted}.

If you didn't expect this invitation, you can safely ignore this email.

---
ConSync - Construction Lifecycle Management
© ${new Date().getFullYear()} ConSync. All rights reserved.
  `.trim();

  return {
    subject,
    html,
    text,
  };
}

/**
 * Generate password reset email (placeholder for future implementation)
 */
export function passwordResetEmail(userName, resetLink, expiryDate) {
  // TODO: Implement when password reset feature is added
  return {
    subject: 'Reset your ConSync password',
    html: '<p>Password reset email template</p>',
    text: 'Password reset email template',
  };
}

/**
 * Generate welcome email (placeholder for future implementation)
 */
export function welcomeEmail(userName, role, orgName) {
  // TODO: Implement welcome email after successful registration
  return {
    subject: 'Welcome to ConSync!',
    html: '<p>Welcome email template</p>',
    text: 'Welcome email template',
  };
}

export default {
  invitationEmail,
  passwordResetEmail,
  welcomeEmail,
};
