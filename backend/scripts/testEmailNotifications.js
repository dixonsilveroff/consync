/**
 * Test Email Notification System
 * Tests all email templates and notification triggers
 * 
 * Usage: node backend/scripts/testEmailNotifications.js <your-email@example.com>
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

import { sendEmail } from '../src/services/emailService.js';
import {
  projectAssignmentEmail,
  taskAssignmentEmail,
  budgetAlertEmail,
  materialRequestSubmittedEmail,
  materialRequestApprovedEmail,
  materialRequestRejectedEmail
} from '../src/templates/emailTemplates.js';

const testEmail = process.argv[2];

if (!testEmail) {
  console.error('❌ Please provide a test email address');
  console.log('Usage: node backend/scripts/testEmailNotifications.js your-email@example.com');
  process.exit(1);
}

console.log('🧪 Testing ConSync Email Notification System');
console.log('📧 Test email:', testEmail);
console.log('');

async function testAllEmails() {
  const results = [];
  
  // 1. Test Project Assignment Email
  console.log('1️⃣  Testing Project Assignment Email...');
  try {
    const projectEmail = projectAssignmentEmail(
      'John Doe',
      'Downtown Office Complex',
      'Construction of a 10-story office building with modern amenities',
      new Date('2025-01-15'),
      new Date('2026-06-30'),
      2500000,
      'Sarah Johnson',
      'http://localhost:5173/projects/123'
    );
    
    const result = await sendEmail(testEmail, projectEmail.subject, projectEmail.html, projectEmail.text);
    results.push({ name: 'Project Assignment', success: result.success });
    console.log(result.success ? '   ✅ Sent successfully' : '   ❌ Failed to send');
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    results.push({ name: 'Project Assignment', success: false });
  }
  console.log('');

  // 2. Test Task Assignment Email
  console.log('2️⃣  Testing Task Assignment Email...');
  try {
    const taskEmail = taskAssignmentEmail(
      'John Doe',
      'Install HVAC System',
      'Install heating, ventilation, and air conditioning system on floors 3-5',
      new Date('2025-03-15'),
      'high',
      'Downtown Office Complex',
      'Mike Wilson',
      'http://localhost:5173/projects/123'
    );
    
    const result = await sendEmail(testEmail, taskEmail.subject, taskEmail.html, taskEmail.text);
    results.push({ name: 'Task Assignment', success: result.success });
    console.log(result.success ? '   ✅ Sent successfully' : '   ❌ Failed to send');
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    results.push({ name: 'Task Assignment', success: false });
  }
  console.log('');

  // 3. Test Budget Alert Email
  console.log('3️⃣  Testing Budget Alert Email...');
  try {
    const budgetEmail = budgetAlertEmail(
      'Sarah Johnson',
      'Downtown Office Complex',
      2500000,
      2687500,
      187500,
      '7.5',
      'Structural Steel Purchase',
      'http://localhost:5173/projects/123'
    );
    
    const result = await sendEmail(testEmail, budgetEmail.subject, budgetEmail.html, budgetEmail.text);
    results.push({ name: 'Budget Alert', success: result.success });
    console.log(result.success ? '   ✅ Sent successfully' : '   ❌ Failed to send');
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    results.push({ name: 'Budget Alert', success: false });
  }
  console.log('');

  // 4. Test Material Request Submitted Email
  console.log('4️⃣  Testing Material Request Submitted Email...');
  try {
    const materialSubmittedEmail = materialRequestSubmittedEmail(
      'Sarah Johnson',
      'Structural Steel Beams',
      150,
      'tons',
      125000,
      'John Doe',
      'Downtown Office Complex',
      'high',
      'http://localhost:5173/resources'
    );
    
    const result = await sendEmail(testEmail, materialSubmittedEmail.subject, materialSubmittedEmail.html, materialSubmittedEmail.text);
    results.push({ name: 'Material Request Submitted', success: result.success });
    console.log(result.success ? '   ✅ Sent successfully' : '   ❌ Failed to send');
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    results.push({ name: 'Material Request Submitted', success: false });
  }
  console.log('');

  // 5. Test Material Request Approved Email
  console.log('5️⃣  Testing Material Request Approved Email...');
  try {
    const materialApprovedEmail = materialRequestApprovedEmail(
      'John Doe',
      'Structural Steel Beams',
      150,
      'tons',
      'Sarah Johnson',
      'Approved. Delivery scheduled for next week.',
      'http://localhost:5173/resources'
    );
    
    const result = await sendEmail(testEmail, materialApprovedEmail.subject, materialApprovedEmail.html, materialApprovedEmail.text);
    results.push({ name: 'Material Request Approved', success: result.success });
    console.log(result.success ? '   ✅ Sent successfully' : '   ❌ Failed to send');
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    results.push({ name: 'Material Request Approved', success: false });
  }
  console.log('');

  // 6. Test Material Request Rejected Email
  console.log('6️⃣  Testing Material Request Rejected Email...');
  try {
    const materialRejectedEmail = materialRequestRejectedEmail(
      'John Doe',
      'Premium Marble Tiles',
      500,
      'sq ft',
      'Sarah Johnson',
      'Budget constraints - please submit request with alternative material or reduced quantity',
      'http://localhost:5173/resources'
    );
    
    const result = await sendEmail(testEmail, materialRejectedEmail.subject, materialRejectedEmail.html, materialRejectedEmail.text);
    results.push({ name: 'Material Request Rejected', success: result.success });
    console.log(result.success ? '   ✅ Sent successfully' : '   ❌ Failed to send');
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    results.push({ name: 'Material Request Rejected', success: false });
  }
  console.log('');

  // Summary
  console.log('═══════════════════════════════════════════════');
  console.log('📊 Test Summary');
  console.log('═══════════════════════════════════════════════');
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
  });
  
  console.log('');
  console.log(`Success Rate: ${successCount}/${totalCount} (${((successCount/totalCount) * 100).toFixed(1)}%)`);
  console.log('');
  
  if (successCount === totalCount) {
    console.log('🎉 All email notifications sent successfully!');
    console.log('📬 Check your inbox at:', testEmail);
  } else {
    console.log('⚠️  Some email notifications failed to send.');
    console.log('💡 Check your SMTP configuration in backend/.env');
  }
  
  process.exit(successCount === totalCount ? 0 : 1);
}

// Run tests
testAllEmails().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});
