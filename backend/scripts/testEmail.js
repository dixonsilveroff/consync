import dotenv from 'dotenv';
import { verifyEmailConfig, sendEmail } from '../src/services/emailService.js';
import { invitationEmail } from '../src/templates/emailTemplates.js';

// Load environment variables
dotenv.config();

/**
 * Test script to verify email configuration
 * Usage: node scripts/testEmail.js [recipient@email.com]
 */
async function testEmailService() {
  console.log('🧪 Testing Email Service Configuration...\n');

  // Step 1: Verify SMTP configuration
  console.log('Step 1: Verifying SMTP configuration...');
  const isConfigured = await verifyEmailConfig();
  
  if (!isConfigured) {
    console.error('\n❌ Email service is not configured correctly!');
    console.log('\nPlease check your .env file has these variables:');
    console.log('- SMTP_HOST (e.g., smtp.gmail.com)');
    console.log('- SMTP_PORT (e.g., 587)');
    console.log('- SMTP_USER (your Gmail address)');
    console.log('- SMTP_PASS (Gmail App Password)');
    console.log('\nSee EMAIL_SETUP_GUIDE.md for instructions.');
    process.exit(1);
  }

  console.log('✓ SMTP configuration is valid\n');

  // Step 2: Get recipient email from command line or use default
  const recipientEmail = process.argv[2] || process.env.SMTP_USER;
  
  if (!recipientEmail || recipientEmail === 'your-email@gmail.com') {
    console.error('❌ Please provide a recipient email address:');
    console.log('   node scripts/testEmail.js your-email@gmail.com\n');
    process.exit(1);
  }

  console.log(`Step 2: Sending test invitation email to ${recipientEmail}...`);

  // Step 3: Generate test email content
  const testInviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite/test-token-12345`;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);

  const emailContent = invitationEmail(
    'Test Contractor',
    'Test Construction Company',
    'engineer',
    testInviteLink,
    expiryDate,
    'This is a test invitation email from ConSync. If you receive this, your email service is working correctly!'
  );

  // Step 4: Send test email
  const result = await sendEmail(
    recipientEmail,
    emailContent.subject,
    emailContent.html,
    emailContent.text
  );

  // Step 5: Display results
  console.log('\n' + '='.repeat(60));
  if (result.success) {
    console.log('✅ TEST PASSED - Email sent successfully!');
    console.log('='.repeat(60));
    console.log(`\nRecipient: ${result.to}`);
    console.log(`Message ID: ${result.messageId}`);
    console.log(`\n📧 Check your inbox at ${recipientEmail}`);
    console.log('   (Don\'t forget to check spam folder!)');
    console.log('\nEmail should arrive within 30 seconds.');
  } else {
    console.log('❌ TEST FAILED - Email sending failed');
    console.log('='.repeat(60));
    console.log(`\nError: ${result.error}`);
    console.log('\nCommon issues:');
    console.log('1. Wrong SMTP credentials (check SMTP_USER and SMTP_PASS)');
    console.log('2. Not using Gmail App Password (generate one at https://myaccount.google.com/apppasswords)');
    console.log('3. 2FA not enabled on Gmail account');
    console.log('4. Firewall blocking port 587');
    console.log('\nSee EMAIL_SETUP_GUIDE.md for troubleshooting.');
  }
  console.log('='.repeat(60) + '\n');

  process.exit(result.success ? 0 : 1);
}

// Run test
testEmailService().catch(error => {
  console.error('\n❌ Unexpected error:', error.message);
  process.exit(1);
});
