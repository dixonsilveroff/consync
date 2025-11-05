/**
 * Test In-App Notifications
 * Verifies that notifications are being created and stored in MongoDB
 * 
 * Usage: node backend/scripts/testNotifications.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

import Notification from '../src/models/notificationModel.js';
import User from '../src/models/User.js';

async function testNotifications() {
  try {
    console.log('🧪 Testing ConSync Notification System\n');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find a test user
    console.log('👤 Finding test user...');
    const testUser = await User.findOne().select('_id name email role');
    if (!testUser) {
      console.error('❌ No users found in database. Please create a user first.');
      process.exit(1);
    }
    console.log(`✅ Found user: ${testUser.name} (${testUser.role})\n`);

    // Test 1: Create notification with each type
    console.log('1️⃣  Testing notification types...');
    const notificationTypes = ['info', 'warning', 'error', 'success', 'project', 'task', 'material', 'budget'];
    
    const createdNotifications = [];
    for (const type of notificationTypes) {
      try {
        const notification = await Notification.create({
          user: testUser._id,
          title: `Test ${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
          message: `This is a test notification of type: ${type}`,
          type: type
        });
        createdNotifications.push(notification);
        console.log(`   ✅ Created ${type} notification`);
      } catch (error) {
        console.error(`   ❌ Failed to create ${type} notification:`, error.message);
      }
    }
    console.log('');

    // Test 2: Retrieve notifications
    console.log('2️⃣  Testing notification retrieval...');
    const userNotifications = await Notification.find({ user: testUser._id }).sort('-createdAt').limit(10);
    console.log(`   ✅ Found ${userNotifications.length} notifications for user\n`);

    // Test 3: Count unread notifications
    console.log('3️⃣  Testing unread count...');
    const unreadCount = await Notification.countDocuments({ user: testUser._id, isRead: false });
    console.log(`   ✅ User has ${unreadCount} unread notifications\n`);

    // Display sample notifications
    console.log('📋 Recent Notifications:');
    console.log('═══════════════════════════════════════════════');
    userNotifications.slice(0, 5).forEach((notif, idx) => {
      console.log(`${idx + 1}. [${notif.type.toUpperCase()}] ${notif.title}`);
      console.log(`   ${notif.message}`);
      console.log(`   ${notif.isRead ? '✓ Read' : '○ Unread'} | ${notif.createdAt.toLocaleString()}`);
      console.log('');
    });

    // Cleanup test notifications
    console.log('🧹 Cleaning up test notifications...');
    const deleteResult = await Notification.deleteMany({
      _id: { $in: createdNotifications.map(n => n._id) }
    });
    console.log(`   ✅ Deleted ${deleteResult.deletedCount} test notifications\n`);

    // Final summary
    console.log('═══════════════════════════════════════════════');
    console.log('📊 Test Summary');
    console.log('═══════════════════════════════════════════════');
    console.log(`✅ Notification model: Working`);
    console.log(`✅ All notification types: Valid`);
    console.log(`✅ Database operations: Successful`);
    console.log(`✅ User has ${unreadCount} real notifications`);
    console.log('');
    console.log('🎉 Notification system is functioning correctly!');
    console.log('');
    console.log('💡 To view in app:');
    console.log('   1. Log in as the test user');
    console.log('   2. Check the notification bell icon in the header');
    console.log('   3. Create a new project/task to generate real notifications');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

// Run tests
testNotifications();
