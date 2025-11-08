/**
 * Debug Notification Creation
 * This script helps debug why notifications aren't being created
 * 
 * Usage: node backend/scripts/debugNotifications.js
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
import Project from '../src/models/projectModel.js';
import Task from '../src/models/taskModel.js';

async function debugNotifications() {
  try {
    console.log('🔍 Debugging ConSync Notifications\n');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get current user
    console.log('👤 Fetching users...');
    const users = await User.find().select('_id name email role');
    console.log(`✅ Found ${users.length} users:`);
    users.forEach(u => console.log(`   - ${u.name} (${u.role}) [${u._id}]`));
    console.log('');

    // Check recent projects
    console.log('📋 Checking recent projects...');
    const recentProjects = await Project.find()
      .sort('-createdAt')
      .limit(5)
      .populate('client assignedUsers createdBy', 'name email');
    
    console.log(`✅ Found ${recentProjects.length} recent projects:`);
    recentProjects.forEach(p => {
      console.log(`\n   Project: ${p.title}`);
      console.log(`   Created by: ${p.createdBy?.name || 'Unknown'}`);
      console.log(`   Client: ${p.client?.name || 'None'}`);
      console.log(`   Assigned users: ${p.assignedUsers?.length || 0}`);
      if (p.assignedUsers && p.assignedUsers.length > 0) {
        p.assignedUsers.forEach(u => console.log(`      - ${u.name}`));
      }
    });
    console.log('');

    // Check recent tasks
    console.log('📝 Checking recent tasks...');
    const recentTasks = await Task.find()
      .sort('-createdAt')
      .limit(5)
      .populate('assignedTo createdBy project', 'name email title');
    
    console.log(`✅ Found ${recentTasks.length} recent tasks:`);
    recentTasks.forEach(t => {
      console.log(`\n   Task: ${t.title}`);
      console.log(`   Project: ${t.project?.title || 'Unknown'}`);
      console.log(`   Created by: ${t.createdBy?.name || 'Unknown'}`);
      console.log(`   Assigned to: ${t.assignedTo?.name || 'None'}`);
    });
    console.log('');

    // Check notifications
    console.log('🔔 Checking notifications...');
    const allNotifications = await Notification.find()
      .sort('-createdAt')
      .limit(10)
      .populate('user', 'name email');
    
    console.log(`✅ Found ${allNotifications.length} recent notifications:`);
    allNotifications.forEach(n => {
      console.log(`\n   [${n.type.toUpperCase()}] ${n.title}`);
      console.log(`   To: ${n.user?.name || 'Unknown'}`);
      console.log(`   Message: ${n.message}`);
      console.log(`   Created: ${n.createdAt.toLocaleString()}`);
      console.log(`   Read: ${n.isRead ? 'Yes' : 'No'}`);
    });
    console.log('');

    // Check notifications by user
    console.log('📊 Notifications per user:');
    for (const user of users) {
      const count = await Notification.countDocuments({ user: user._id });
      const unread = await Notification.countDocuments({ user: user._id, isRead: false });
      console.log(`   ${user.name}: ${count} total (${unread} unread)`);
    }
    console.log('');

    // Analysis
    console.log('═══════════════════════════════════════════════');
    console.log('📈 Analysis');
    console.log('═══════════════════════════════════════════════');
    
    if (recentProjects.length > 0) {
      const hasClient = recentProjects.some(p => p.client);
      const hasAssignedUsers = recentProjects.some(p => p.assignedUsers?.length > 0);
      
      if (!hasClient && !hasAssignedUsers) {
        console.log('⚠️  ISSUE: Recent projects have NO clients or assigned users');
        console.log('   → Notifications are only sent to clients and assigned users');
        console.log('   → When creating a project, assign a client or team members');
      }
    }
    
    if (recentTasks.length > 0) {
      const hasAssignee = recentTasks.some(t => t.assignedTo);
      
      if (!hasAssignee) {
        console.log('⚠️  ISSUE: Recent tasks have NO assignee');
        console.log('   → Notifications are only sent to the assigned user');
        console.log('   → When creating a task, assign it to someone');
      }
    }

    console.log('\n💡 Tips:');
    console.log('   • Project notifications go to: client + assignedUsers');
    console.log('   • Task notifications go to: assignedTo user');
    console.log('   • Create a second user account to test notifications');
    console.log('   • Or assign yourself as client/assignedUser when creating');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

// Run debug
debugNotifications();
