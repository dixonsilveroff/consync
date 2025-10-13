/**
 * Utility script to fix users without a role in the database
 * Run this once to update existing users
 */
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function fixUserRoles() {
  try {
    // Connect to MongoDB
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/consync';
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB');

    // Find all users without a role or with null/undefined role
    const usersWithoutRole = await User.find({
      $or: [
        { role: { $exists: false } },
        { role: null },
        { role: '' }
      ]
    });

    console.log(`Found ${usersWithoutRole.length} users without a role`);

    if (usersWithoutRole.length === 0) {
      console.log('All users have roles assigned. Nothing to fix.');
      await mongoose.connection.close();
      return;
    }

    // Update each user to have a default role
    let updated = 0;
    for (const user of usersWithoutRole) {
      // Set to 'admin' by default - you can change this logic
      user.role = 'admin';
      await user.save();
      updated++;
      console.log(`Updated user ${user.email} with role: admin`);
    }

    console.log(`\nSuccessfully updated ${updated} users`);
    
    // Verify the fix
    const remainingUsersWithoutRole = await User.find({
      $or: [
        { role: { $exists: false } },
        { role: null },
        { role: '' }
      ]
    });

    console.log(`Remaining users without role: ${remainingUsersWithoutRole.length}`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error fixing user roles:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the fix
fixUserRoles();
