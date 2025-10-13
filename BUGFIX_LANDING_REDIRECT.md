# Bug Fix: Landing Page Redirect Issue

## 🐛 Problem

The landing page (`/`) was redirecting users to `/login` almost immediately after loading, without any user interaction.

## 🔍 Root Cause

The issue was in `frontend/src/api/apiClient.js`. When the app loaded:

1. **Auth initialization** in `AuthContext` tried to refresh the token by calling `/api/auth/refresh`
2. This request **failed** (no token for new visitors)
3. The apiClient's response interceptor caught the 401 error
4. It then **forcefully redirected** to `/login` using `window.location.href = '/login'`
5. This happened even on **public pages** like the landing page

The redirect logic only checked if the current page wasn't `/login`, but didn't exclude other public pages like `/` or `/register`.

## ✅ Solution

Updated `apiClient.js` to check for **all public pages** before redirecting:

### Changes Made

**File:** `frontend/src/api/apiClient.js`

**Before:**
```javascript
if (!window.location.pathname.includes('/login')) {
  window.location.href = '/login';
}
```

**After:**
```javascript
const publicPaths = ['/', '/login', '/register'];
const isPublicPage = publicPaths.some(path => window.location.pathname === path);
if (!isPublicPage) {
  window.location.href = '/login';
}
```

This fix was applied in **two locations**:
1. Line ~92: When `/api/auth/refresh` request fails
2. Line ~127: When token refresh fails after retrying

### Additional Improvements

- Removed excessive console.log statements that were cluttering the console
- Cleaned up unnecessary warnings for public pages

## 🎯 Expected Behavior

**Before Fix:**
- ❌ Landing page loads
- ❌ Auth tries to refresh token
- ❌ Refresh fails (no token)
- ❌ Immediately redirects to `/login`
- ❌ Bad user experience

**After Fix:**
- ✅ Landing page loads normally
- ✅ Auth tries to refresh token
- ✅ Refresh fails (no token) - *this is expected for new visitors*
- ✅ No redirect occurs (landing page is public)
- ✅ User can browse the landing page freely
- ✅ Only redirects to `/login` when accessing protected routes

## 📝 Testing

To test the fix:

1. **Clear browser storage** (to simulate new visitor):
   ```javascript
   localStorage.clear()
   sessionStorage.clear()
   ```

2. **Visit landing page**: `https://consync.app/`
   - Should load normally without redirecting
   - Should display all landing page content

3. **Try to access protected route**: `https://consync.app/dashboard`
   - Should redirect to `/login` (expected behavior)

4. **Login and verify**:
   - Login should work normally
   - Dashboard should load after login
   - No unexpected redirects

## 🚀 Deployment

To deploy this fix:

```bash
# Commit the changes
git add frontend/src/api/apiClient.js
git commit -m "Fix: Prevent auto-redirect to login on public pages"
git push origin main
```

Vercel will automatically detect the push and deploy the updated frontend.

## 🔒 Security Note

This fix **does not** compromise security:
- Protected routes still require authentication
- The `ProtectedRoute` component still guards dashboard and other private pages
- Auth refresh still works for logged-in users
- Only the **automatic redirect on public pages** was removed

## 📚 Related Files

- `frontend/src/api/apiClient.js` - Fixed redirect logic
- `frontend/src/context/AuthContext.jsx` - Auth initialization (unchanged)
- `frontend/src/components/ProtectedRoute.jsx` - Route protection (unchanged)
- `frontend/src/App.jsx` - Route definitions (unchanged)

---

**Status:** ✅ Fixed
**Date:** October 13, 2025
**Impact:** High (affects all new visitors)
**Priority:** Critical
