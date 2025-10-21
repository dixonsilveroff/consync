# 🚀 Phase 2 Quick Start Guide

## What Was Built

A complete **Resource Management System** with:
- Material request creation and approval workflow
- Vendor directory and management
- Role-based access control
- Responsive UI with stats and filters

---

## 🎯 Testing the New Features

### Step 1: Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Step 2: Access Resources Page

1. **Login** with an admin or engineer account
2. **Navigate** to `/resources` or click "Resources" in the navigation menu
3. You should see two tabs: **Material Requests** and **Vendors**

---

## 📝 Test Scenarios

### Scenario 1: Create a Material Request (Engineer/Admin)

1. Go to **Material Requests** tab
2. Click **"+ New Request"** button
3. Fill in the form:
   - Select a project
   - Add items (e.g., "Cement", 100, "bags", $500)
   - Add notes if needed
4. Click **"Create Request"**
5. ✅ Request should appear with "PENDING" status

### Scenario 2: Approve/Reject Request (Admin Only)

**Prerequisites:** Have a pending request created

**To Approve:**
1. Find a pending request card
2. Click **"Approve"** button
3. Confirm in the modal
4. ✅ Status should change to "APPROVED"

**To Reject:**
1. Find a pending request card
2. Click **"Reject"** button
3. Enter a rejection reason
4. Click **"Reject"**
5. ✅ Status should change to "REJECTED"

### Scenario 3: Assign Vendor (Admin Only)

**Prerequisites:** Have an approved request and at least one vendor

1. Find an approved request card
2. Click **"Assign Vendor"** button
3. Select a vendor from the dropdown
4. Choose a delivery date (must be future date)
5. Click **"Assign"**
6. ✅ Status should change to "ASSIGNED"
7. ✅ Vendor name and delivery date should appear on card

### Scenario 4: Mark as Delivered (Admin/Engineer)

**Prerequisites:** Have an assigned request

1. Find an assigned request card
2. Click **"Mark Delivered"** button
3. Confirm the action
4. ✅ Status should change to "DELIVERED"

### Scenario 5: Manage Vendors (Admin Only)

**Create Vendor:**
1. Go to **Vendors** tab
2. Click **"+ Add Vendor"** button
3. Fill in vendor details:
   - Name: "ABC Construction Supplies"
   - Contact Person: "John Smith"
   - Phone: "(555) 123-4567"
   - Email: "contact@abc.com"
   - Materials: "Cement, Steel, Paint"
   - Rating: 4.5
4. Click **"Create Vendor"**
5. ✅ Vendor should appear in the list

**Edit Vendor:**
1. Find a vendor card
2. Click **"Edit"** button
3. Modify any fields
4. Click **"Update Vendor"**
5. ✅ Changes should be saved

**Delete Vendor:**
1. Find an inactive vendor (not assigned to any active requests)
2. Click **"Delete"** button
3. Confirm deletion
4. ✅ Vendor should be removed
5. ⚠️ If vendor is assigned to active requests, deletion will fail with error

### Scenario 6: Search and Filter

**Material Requests:**
1. Use **"Filter by Status"** dropdown to show only pending requests
2. Use **"Filter by Project"** to see requests for specific project
3. ✅ List should update based on filters

**Vendors:**
1. Use the search box to find vendors by name
2. Use **"Active/Inactive"** filter
3. Toggle between **Card** and **Table** views
4. ✅ Search and filters should work correctly

---

## 🎨 UI Elements to Notice

### Material Requests Tab
- **Stats Cards** at top showing counts by status
- **Color-coded status badges** (yellow=pending, green=approved, etc.)
- **Action buttons** appear based on role and status
- **Total estimated cost** calculation for each request

### Vendors Tab
- **Vendor stats** showing total, active, and average rating
- **Star ratings** displayed visually
- **Material badges** showing what each vendor supplies
- **Card/Table view toggle** for different preferences

---

## 🔐 Permission Testing

### As Admin:
- ✅ Can create material requests
- ✅ Can approve/reject requests
- ✅ Can assign vendors
- ✅ Can mark as delivered
- ✅ Can create/edit/delete vendors

### As Engineer:
- ✅ Can create material requests
- ✅ Can mark as delivered
- ✅ Can view vendors
- ❌ Cannot approve/reject requests
- ❌ Cannot assign vendors
- ❌ Cannot create/edit/delete vendors

### As Client:
- ❌ Cannot access Resources page at all
- Should be redirected to Unauthorized page

---

## 🐛 Common Issues & Solutions

### Issue: "Resources" link not visible
**Solution:** Make sure you're logged in as admin or engineer

### Issue: Can't create request
**Solution:** Ensure there's at least one project in the system

### Issue: Can't assign vendor  
**Solution:** 
1. Request must be in "approved" status
2. At least one vendor must exist
3. Must be logged in as admin

### Issue: Can't delete vendor
**Solution:** Vendor might be assigned to active requests. Only delete vendors with no active assignments.

### Issue: Forms not submitting
**Solution:** Check browser console for errors. Ensure all required fields are filled.

---

## 📊 Expected Data Flow

```
Material Request Lifecycle:
┌─────────┐
│ PENDING │ ← Created by engineer/admin
└────┬────┘
     │
     ├── Approved by admin → ┌──────────┐
     │                       │ APPROVED │
     │                       └────┬─────┘
     │                            │
     │                            ├── Vendor assigned by admin → ┌──────────┐
     │                            │                               │ ASSIGNED │
     │                            │                               └────┬─────┘
     │                            │                                    │
     │                            │                                    └── Marked delivered → ┌───────────┐
     │                            │                                                            │ DELIVERED │
     │                            │                                                            └───────────┘
     │
     └── Rejected by admin → ┌──────────┐
                             │ REJECTED │
                             └──────────┘
```

---

## ✅ Success Checklist

After testing, you should have:
- [ ] Created at least one material request
- [ ] Approved a request as admin
- [ ] Rejected a request with reason
- [ ] Created at least one vendor
- [ ] Assigned a vendor to a request
- [ ] Marked a request as delivered
- [ ] Tested search and filters
- [ ] Toggled between card and table views
- [ ] Verified permissions work correctly
- [ ] Checked responsive design on mobile

---

## 🚀 Next Phase

Once Phase 2 testing is complete, you're ready for:
**Phase 3: User Profile Management**
- User profile page
- Update personal information
- Change password
- Activity timeline
- Notification preferences

---

## 📞 Need Help?

1. Check the detailed **PHASE_2_SUMMARY.md** for full documentation
2. Review API endpoints in the summary
3. Check backend console for API errors
4. Check browser console for frontend errors
5. Verify you're logged in with the correct role

---

**Happy Testing! 🎉**

The Resource Management System is fully functional and ready to use!
