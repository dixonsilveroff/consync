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
 * Generate project assignment email
 */
export function projectAssignmentEmail(recipientName, projectTitle, projectDescription, startDate, endDate, budget, managerName, actionUrl) {
  const subject = `New Project Assigned: ${projectTitle}`;
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Assignment</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; color: #1f2937;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-collapse: collapse;">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🏗️ New Project Assigned</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Hi <strong style="color: #1f2937;">${recipientName}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                You have been assigned to a new project by ${managerName}.
              </p>
              <h2 style="margin: 0 0 10px; color: #1f2937; font-size: 22px; font-weight: 700;">${projectTitle}</h2>
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 15px; line-height: 1.6;">${projectDescription || 'No description provided.'}</p>
              <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>📅 Start Date:</strong> ${new Date(startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>📅 End Date:</strong> ${new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>💰 Budget:</strong> $${budget?.toLocaleString() || 'Not set'}</p>
                <p style="margin: 0; color: #374151; font-size: 14px;"><strong>👤 Project Manager:</strong> ${managerName}</p>
              </div>
              <table role="presentation" style="width: 100%; margin: 32px 0; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${actionUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">View Project Details</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">Log in to ConSync to view full project details, tasks, and collaborate with your team.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} ConSync. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `New Project Assigned: ${projectTitle}

Hi ${recipientName},

You have been assigned to a new project by ${managerName}.

Project: ${projectTitle}
${projectDescription || 'No description provided.'}

Start Date: ${new Date(startDate).toLocaleDateString()}
End Date: ${new Date(endDate).toLocaleDateString()}
Budget: $${budget?.toLocaleString() || 'Not set'}
Project Manager: ${managerName}

View project details: ${actionUrl}

© ${new Date().getFullYear()} ConSync`;

  return { subject, html, text };
}

/**
 * Generate task assignment email
 */
export function taskAssignmentEmail(recipientName, taskTitle, taskDescription, dueDate, priority, projectName, assignerName, actionUrl) {
  const priorityEmoji = priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢';
  const priorityColor = priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#10b981';
  
  const subject = `New Task Assigned: ${taskTitle}`;
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Assignment</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; color: #1f2937;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-collapse: collapse;">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">✅ New Task Assigned</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Hi <strong style="color: #1f2937;">${recipientName}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ${assignerName} has assigned you a new task in <strong>${projectName}</strong>.
              </p>
              <h2 style="margin: 0 0 10px; color: #1f2937; font-size: 22px; font-weight: 700;">${taskTitle}</h2>
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 15px; line-height: 1.6;">${taskDescription || 'No description provided.'}</p>
              <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>📅 Due Date:</strong> ${new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>🎯 Priority:</strong> <span style="color: ${priorityColor}; font-weight: 600;">${priorityEmoji} ${priority.toUpperCase()}</span></p>
                <p style="margin: 0; color: #374151; font-size: 14px;"><strong>📂 Project:</strong> ${projectName}</p>
              </div>
              <table role="presentation" style="width: 100%; margin: 32px 0; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${actionUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">View Task Details</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">Update task status and add comments directly in ConSync.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} ConSync. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `New Task Assigned: ${taskTitle}

Hi ${recipientName},

${assignerName} has assigned you a new task in ${projectName}.

Task: ${taskTitle}
${taskDescription || 'No description provided.'}

Due Date: ${new Date(dueDate).toLocaleDateString()}
Priority: ${priorityEmoji} ${priority.toUpperCase()}
Project: ${projectName}

View task details: ${actionUrl}

© ${new Date().getFullYear()} ConSync`;

  return { subject, html, text };
}

/**
 * Generate budget alert email
 */
export function budgetAlertEmail(recipientName, projectTitle, budget, totalCost, overage, percentOver, costLineName, actionUrl) {
  const subject = `⚠️ Budget Alert: ${projectTitle}`;
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0;">
  <title>Budget Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; color: #1f2937;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-collapse: collapse;">
          <tr>
            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">⚠️ Budget Alert</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Hi <strong style="color: #1f2937;">${recipientName}</strong>,
              </p>
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #dc2626;">
                  ⚠️ <strong>${projectTitle}</strong> has exceeded its budget!
                </p>
              </div>
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 15px; line-height: 1.6;">A new cost line "${costLineName}" has pushed the project over budget.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 15px; font-weight: 600; color: #374151;">Original Budget:</td>
                  <td style="padding: 12px 15px; text-align: right; color: #1f2937;">$${budget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 15px; font-weight: 600; color: #374151;">Current Total Cost:</td>
                  <td style="padding: 12px 15px; text-align: right; color: #ef4444; font-weight: 600;">$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr style="background: #fee2e2;">
                  <td style="padding: 12px 15px; font-weight: 600; color: #374151;">Budget Overage:</td>
                  <td style="padding: 12px 15px; text-align: right; color: #dc2626; font-weight: 700; font-size: 18px;">+$${overage.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${percentOver}%)</td>
                </tr>
              </table>
              <table role="presentation" style="width: 100%; margin: 32px 0; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${actionUrl}" style="display: inline-block; padding: 16px 40px; background: #dc2626; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">Review Project Costs</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">💡 <strong>Action Required:</strong> Review the cost breakdown and adjust project budget or scope accordingly.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} ConSync. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `⚠️ Budget Alert: ${projectTitle}

Hi ${recipientName},

${projectTitle} has exceeded its budget!

A new cost line "${costLineName}" has pushed the project over budget.

Original Budget: $${budget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Current Total Cost: $${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Budget Overage: +$${overage.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${percentOver}%)

Review project costs: ${actionUrl}

Action Required: Review the cost breakdown and adjust project budget or scope accordingly.

© ${new Date().getFullYear()} ConSync`;

  return { subject, html, text };
}

/**
 * Generate material request submitted email (to contractor)
 */
export function materialRequestSubmittedEmail(recipientName, materialName, quantity, unit, estimatedCost, requesterName, projectName, urgency, actionUrl) {
  const urgencyColor = urgency === 'urgent' ? '#ef4444' : urgency === 'high' ? '#f59e0b' : '#3b82f6';
  const urgencyEmoji = urgency === 'urgent' ? '🚨' : urgency === 'high' ? '⚡' : '📋';
  
  const subject = `📦 New Material Request: ${materialName}`;
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Material Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; color: #1f2937;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-collapse: collapse;">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">📦 New Material Request</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Hi <strong style="color: #1f2937;">${recipientName}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ${requesterName} has submitted a new material request for <strong>${projectName}</strong>.
              </p>
              <h2 style="margin: 0 0 10px; color: #1f2937; font-size: 22px; font-weight: 700;">${quantity} ${unit} of ${materialName}</h2>
              <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>📦 Material:</strong> ${materialName}</p>
                <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>📊 Quantity:</strong> ${quantity} ${unit}</p>
                <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>💰 Estimated Cost:</strong> $${estimatedCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'Not specified'}</p>
                <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>🎯 Urgency:</strong> <span style="color: ${urgencyColor}; font-weight: 600;">${urgencyEmoji} ${urgency?.toUpperCase() || 'NORMAL'}</span></p>
                <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>👤 Requested By:</strong> ${requesterName}</p>
                <p style="margin: 0; color: #374151; font-size: 14px;"><strong>📂 Project:</strong> ${projectName}</p>
              </div>
              <table role="presentation" style="width: 100%; margin: 32px 0; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${actionUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">Review & Approve Request</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">⏱️ Please review and respond to this request promptly to avoid project delays.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} ConSync. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `New Material Request: ${materialName}

Hi ${recipientName},

${requesterName} has submitted a new material request for ${projectName}.

Material: ${materialName}
Quantity: ${quantity} ${unit}
Estimated Cost: $${estimatedCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'Not specified'}
Urgency: ${urgencyEmoji} ${urgency?.toUpperCase() || 'NORMAL'}
Requested By: ${requesterName}
Project: ${projectName}

Review and approve request: ${actionUrl}

Please review and respond promptly to avoid project delays.

© ${new Date().getFullYear()} ConSync`;

  return { subject, html, text };
}

/**
 * Generate material request approved email
 */
export function materialRequestApprovedEmail(recipientName, materialName, quantity, unit, approverName, approverNotes, actionUrl) {
  const subject = `✅ Material Request Approved: ${materialName}`;
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Material Request Approved</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; color: #1f2937;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-collapse: collapse;">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">✅ Material Request Approved</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Hi <strong style="color: #1f2937;">${recipientName}</strong>,
              </p>
              <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #059669;">
                  ✅ Your material request has been approved by ${approverName}!
                </p>
              </div>
              <h2 style="margin: 0 0 10px; color: #1f2937; font-size: 22px; font-weight: 700;">${quantity} ${unit} of ${materialName}</h2>
              <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>📦 Material:</strong> ${materialName}</p>
                <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>📊 Quantity:</strong> ${quantity} ${unit}</p>
                <p style="margin: 0 ${approverNotes ? '10px' : '0'}; color: #374151; font-size: 14px;"><strong>✅ Approved By:</strong> ${approverName}</p>
                ${approverNotes ? `<p style="margin: 0; color: #374151; font-size: 14px;"><strong>📝 Notes:</strong> ${approverNotes}</p>` : ''}
              </div>
              <table role="presentation" style="width: 100%; margin: 32px 0; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${actionUrl}" style="display: inline-block; padding: 16px 40px; background: #10b981; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">View Material Request</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">📍 The materials will be ordered and delivered according to the project schedule.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} ConSync. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `✅ Material Request Approved: ${materialName}

Hi ${recipientName},

Your material request has been approved by ${approverName}!

Material: ${materialName}
Quantity: ${quantity} ${unit}
Approved By: ${approverName}
${approverNotes ? `Notes: ${approverNotes}` : ''}

View material request: ${actionUrl}

The materials will be ordered and delivered according to the project schedule.

© ${new Date().getFullYear()} ConSync`;

  return { subject, html, text };
}

/**
 * Generate material request rejected email
 */
export function materialRequestRejectedEmail(recipientName, materialName, quantity, unit, rejectorName, rejectionReason, actionUrl) {
  const subject = `❌ Material Request Rejected: ${materialName}`;
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Material Request Rejected</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; color: #1f2937;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-collapse: collapse;">
          <tr>
            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">❌ Material Request Rejected</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Hi <strong style="color: #1f2937;">${recipientName}</strong>,
              </p>
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #dc2626;">
                  ❌ Your material request has been rejected by ${rejectorName}.
                </p>
              </div>
              <h2 style="margin: 0 0 10px; color: #1f2937; font-size: 22px; font-weight: 700;">${quantity} ${unit} of ${materialName}</h2>
              <div style="background-color: #f9fafb; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>📦 Material:</strong> ${materialName}</p>
                <p style="margin: 0 0 10px; color: #374151; font-size: 14px;"><strong>📊 Quantity:</strong> ${quantity} ${unit}</p>
                <p style="margin: 0 ${rejectionReason ? '10px' : '0'}; color: #374151; font-size: 14px;"><strong>❌ Rejected By:</strong> ${rejectorName}</p>
                ${rejectionReason ? `<p style="margin: 0; color: #374151; font-size: 14px;"><strong>📝 Reason:</strong> ${rejectionReason}</p>` : ''}
              </div>
              <table role="presentation" style="width: 100%; margin: 32px 0; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${actionUrl}" style="display: inline-block; padding: 16px 40px; background: #dc2626; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">View Request Details</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">💡 Please review the rejection reason and submit a revised request if needed.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} ConSync. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `❌ Material Request Rejected: ${materialName}

Hi ${recipientName},

Your material request has been rejected by ${rejectorName}.

Material: ${materialName}
Quantity: ${quantity} ${unit}
Rejected By: ${rejectorName}
${rejectionReason ? `Reason: ${rejectionReason}` : ''}

View request details: ${actionUrl}

Please review the rejection reason and submit a revised request if needed.

© ${new Date().getFullYear()} ConSync`;

  return { subject, html, text };
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
  projectAssignmentEmail,
  taskAssignmentEmail,
  budgetAlertEmail,
  materialRequestSubmittedEmail,
  materialRequestApprovedEmail,
  materialRequestRejectedEmail,
  passwordResetEmail,
  welcomeEmail,
};
