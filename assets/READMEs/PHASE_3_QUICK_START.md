# Phase 3: User Profile Management - Quick Start Guide

**Testing Guide for Profile Features**

---

## 🚀 Quick Start

### Start the Application

1. **Start Backend Server:**
```bash
cd backend
npm run dev
```
Backend should start on `http://localhost:5000`

2. **Start Frontend Server:**
```bash
cd frontend
npm run dev
```
Frontend should start on `http://localhost:5173`

---

## 🧪 Testing Scenarios

### Scenario 1: Access Profile Page

**Steps:**
1. Login to the application with any user account
2. Look at the top navigation bar
3. Click the "Profile" link (between your name and Logout)
4. Verify you land on `/profile`

**Expected Results:**
- ✅ Profile page loads with your information
- ✅ Avatar shows your first initial
- ✅ Name, email, role badge displayed correctly
- ✅ Three tabs visible: Personal Information, Security, Activity
- ✅ Personal Information tab is active by default

---

### Scenario 2: Update Profile Information

**Steps:**
1. Navigate to Profile page
2. Ensure "Personal Information" tab is selected
3. Change your name to something different
4. Add or modify your phone number (e.g., +234 123 456 7890)
5. Add a bio (e.g., "I'm a construction engineer with 5 years experience")
6. Click "Save Changes"

**Expected Results:**
- ✅ "Profile updated successfully!" green banner appears
- ✅ Changes reflected immediately in the profile header
- ✅ Form resets to new values
- ✅ "Save Changes" button becomes disabled (no changes to save)

**Error Cases to Test:**
- Try clearing name → Should show "Name is required" error
- Try entering name with 1 character → Should show "Name must be at least 2 characters"
- Try entering invalid phone (e.g., "abc123") → Should show format error
- Try bio with 501 characters → Should show "Bio must be 500 characters or less"

---

### Scenario 3: Cancel Profile Changes

**Steps:**
1. Navigate to Profile page → Personal Information tab
2. Change your name
3. Change your bio
4. Click "Cancel" button

**Expected Results:**
- ✅ All fields reset to original values
- ✅ "Save Changes" button becomes disabled
- ✅ No API request made

---

### Scenario 4: Change Password - Success Flow

**Steps:**
1. Navigate to Profile page
2. Click "Security" tab
3. Enter your current password
4. Enter a new password that meets requirements:
   - At least 8 characters
   - One uppercase letter
   - One lowercase letter
   - One number
   - Example: `NewPass123`
5. Enter the same password in "Confirm Password"
6. Click "Change Password"

**Expected Results:**
- ✅ As you type new password, strength indicator updates
- ✅ Requirements checklist shows green checkmarks
- ✅ Password strength shows "Strong"
- ✅ "Passwords match" indicator appears
- ✅ Alert: "Password changed successfully! You will be logged out..."
- ✅ Redirect to login page after 1.5 seconds
- ✅ Can login with new password
- ✅ Old password no longer works

---

### Scenario 5: Change Password - Error Cases

**Test Case A: Wrong Current Password**
1. Click Security tab
2. Enter wrong current password
3. Enter valid new password
4. Confirm new password
5. Click "Change Password"

**Expected:** ❌ Error: "Current password is incorrect"

---

**Test Case B: Weak Password**
1. Enter correct current password
2. Enter weak new password (e.g., "abc")
3. Check strength indicator

**Expected:** 
- ❌ Strength shows "Weak" in red
- ❌ Requirements checklist shows X marks
- ❌ Submit button works but backend validation fails

---

**Test Case C: Password Mismatch**
1. Enter correct current password
2. Enter new password: "NewPass123"
3. Enter confirm password: "NewPass456"
4. Click "Change Password"

**Expected:** ❌ Error: "Passwords do not match"

---

**Test Case D: Same as Current Password**
1. Enter current password
2. Enter same password as new password
3. Confirm password
4. Click "Change Password"

**Expected:** ❌ Error: "New password must be different from current password"

---

### Scenario 6: Password Strength Indicator

**Steps:**
1. Click Security tab
2. Type in new password field progressively:
   - Type "a" → Check indicator
   - Type "aB" → Check indicator
   - Type "aB1" → Check indicator
   - Type "aB123456" → Check indicator

**Expected Results:**
- ✅ Indicator updates in real-time
- ✅ Progress bar fills as requirements met
- ✅ Color changes: Red → Orange → Yellow → Green
- ✅ Label changes: Weak → Fair → Good → Strong
- ✅ Checkmarks appear for met requirements

---

### Scenario 7: Show/Hide Password

**Steps:**
1. Click Security tab
2. Type password in each field
3. Click eye icon on each field

**Expected Results:**
- ✅ Password initially hidden (dots/asterisks)
- ✅ Clicking eye icon reveals password text
- ✅ Clicking again hides password
- ✅ Each field toggles independently

---

### Scenario 8: Mobile Navigation

**Steps:**
1. Resize browser to mobile width (< 640px)
2. Login to application
3. Click hamburger menu icon
4. Look for Profile link

**Expected Results:**
- ✅ Mobile menu opens
- ✅ Profile link visible in menu
- ✅ Profile appears before Logout
- ✅ Clicking Profile navigates to `/profile`
- ✅ Menu closes after clicking

---

### Scenario 9: Role Badge Display

**Test with different user roles:**

1. **Admin User:**
   - ✅ Badge shows "Admin" in purple

2. **Engineer User:**
   - ✅ Badge shows "Engineer" in blue

3. **Client User:**
   - ✅ Badge shows "Client" in green

4. **Contractor User:**
   - ✅ Badge shows "Contractor" in orange

---

### Scenario 10: Bio Character Counter

**Steps:**
1. Click Personal Information tab
2. Type in bio field
3. Watch character counter

**Expected Results:**
- ✅ Counter shows "0/500" when empty
- ✅ Counter updates as you type
- ✅ Counter shows exact character count
- ✅ At 500 characters, counter shows "500/500"
- ✅ Cannot type beyond 500 characters (maxLength enforced)

---

### Scenario 11: Read-Only Fields

**Steps:**
1. Click Personal Information tab
2. Try to click on Email field
3. Try to click on Role field

**Expected Results:**
- ✅ Email field is grayed out
- ✅ Role field is grayed out
- ✅ Cursor shows "not-allowed" icon
- ✅ Cannot edit these fields
- ✅ Help text explains why: "Email address cannot be changed" / "Role is assigned by administrators"

---

### Scenario 12: Activity Tab (Placeholder)

**Steps:**
1. Navigate to Profile page
2. Click "Activity" tab

**Expected Results:**
- ✅ Placeholder message displayed
- ✅ Activity icon shown
- ✅ Text: "Activity tracking is coming soon! This will show your recent projects, tasks, and contributions."

---

## 🐛 Common Issues & Solutions

### Issue: Profile page blank or loading forever
**Solution:** 
- Check browser console for errors
- Verify you're logged in
- Clear localStorage and re-login
- Check backend is running

### Issue: "Failed to update profile" error
**Solution:**
- Check network tab for 401/403 errors
- Verify JWT token is valid
- Check backend logs for validation errors
- Ensure all required fields filled

### Issue: Password change not logging out
**Solution:**
- Check browser console for JavaScript errors
- Verify redirect is working
- Manually navigate to `/login`

### Issue: Navigation Profile link not appearing
**Solution:**
- Refresh page
- Check if user is authenticated
- Verify user object exists in AuthContext

---

## ✅ Acceptance Criteria

Before marking Phase 3 as complete, verify:

- [ ] Profile page accessible from navigation
- [ ] User can update name, phone, bio
- [ ] Validation errors display correctly
- [ ] Success messages appear on save
- [ ] User can change password
- [ ] Password strength indicator works
- [ ] User auto-logged out after password change
- [ ] Old password no longer works
- [ ] New password works for login
- [ ] Mobile navigation includes Profile link
- [ ] All tabs render correctly
- [ ] No console errors
- [ ] No visual bugs on mobile
- [ ] Read-only fields cannot be edited

---

## 📊 Test Results Template

Use this template to document your testing:

```
Date: ___________
Tester: ___________

Scenario 1: Access Profile Page          [PASS / FAIL]
Scenario 2: Update Profile               [PASS / FAIL]
Scenario 3: Cancel Changes               [PASS / FAIL]
Scenario 4: Change Password Success      [PASS / FAIL]
Scenario 5: Password Error Cases         [PASS / FAIL]
Scenario 6: Password Strength            [PASS / FAIL]
Scenario 7: Show/Hide Password           [PASS / FAIL]
Scenario 8: Mobile Navigation            [PASS / FAIL]
Scenario 9: Role Badge Display           [PASS / FAIL]
Scenario 10: Bio Character Counter       [PASS / FAIL]
Scenario 11: Read-Only Fields            [PASS / FAIL]
Scenario 12: Activity Placeholder        [PASS / FAIL]

Overall: [PASS / FAIL]

Issues Found:
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

Notes:
_______________________________________________
_______________________________________________
```

---

## 🎯 Next Steps After Testing

1. ✅ Document all issues found
2. ✅ Fix critical bugs
3. ✅ Update CHANGELOG.md with completion status
4. ✅ Commit changes to git
5. ✅ Ready for Phase 4!

---

*Happy Testing! 🚀*
