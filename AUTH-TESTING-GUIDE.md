# 🧪 AUTHENTICATION SYSTEM - TESTING GUIDE

## Complete Test Suite

### Test Environment Setup

```javascript
// Open DevTools Console (F12 → Console tab)
// Paste these commands to check auth state:

// Check if user is authenticated
console.log("Authenticated:", authService.isAuthenticated());

// Get current user
console.log("Current User:", authService.getCurrentUser());

// Get token
console.log("Token:", authService.getAuthToken());

// Check localStorage
console.log("LocalStorage authToken:", localStorage.getItem('authToken'));
console.log("LocalStorage user:", localStorage.getItem('currentUser'));
console.log("LocalStorage sessionStart:", localStorage.getItem('sessionStart'));

// Clear all auth data (for testing)
localStorage.removeItem('authToken');
localStorage.removeItem('currentUser');
localStorage.removeItem('sessionStart');
```

---

## Test Cases

### TEST 1: First-Time User Login Flow
**Objective**: Verify new user can log in and session is saved

**Steps**:
1. Open `index.html` in browser
2. Observe login overlay displayed
3. Enter test credentials:
   - Email: `test@example.com`
   - Password: `Test123!`
4. Click "Log In" button
5. Wait for processing

**Expected Results**:
- ✅ Firebase authenticates credentials
- ✅ Login overlay fades out
- ✅ App dashboard displays
- ✅ localStorage contains:
  - `authToken` (long JWT string)
  - `currentUser` (user object)
  - `sessionStart` (timestamp)
- ✅ Console shows: "✅ Login successful"

**Verification Commands**:
```javascript
// Should return true
authService.isAuthenticated()

// Should show user email
authService.getCurrentUser().email

// Should return token
authService.getAuthToken().length > 0
```

**Pass/Fail**: ⬜ PASS / ⬜ FAIL

---

### TEST 2: Session Persistence on Page Reload
**Objective**: Verify user stays logged in after page refresh

**Prerequisites**: 
- User must be logged in (from TEST 1)

**Steps**:
1. User is logged in and viewing app dashboard
2. Note user is logged in
3. Refresh page with Ctrl+R (Windows) or Cmd+R (Mac)
4. Wait for page to fully load
5. Observe auth overlay state

**Expected Results**:
- ✅ Page reloads completely
- ✅ Auth overlay NOT shown
- ✅ Session restored from localStorage
- ✅ User remains logged in
- ✅ Dashboard displays immediately
- ✅ Console shows: "📦 Restoring session for: [user email]"
- ✅ No login required

**Verification Commands**:
```javascript
// Immediately after reload, before interaction:
console.log(authService.isAuthenticated()); // Should be true

// Check if session was restored from storage
console.log(localStorage.getItem('authToken') !== null); // true

// Get restored user data
console.log(authService.getCurrentUser());
```

**Pass/Fail**: ⬜ PASS / ⬜ FAIL

---

### TEST 3: Browser Back Button
**Objective**: Verify browser back button works correctly without logout

**Prerequisites**:
- User must be logged in

**Steps**:
1. User logged in on dashboard
2. Click navigation link to go to "Courses" → `course_content.html`
3. Wait for page to load
4. Click browser back button (← button or Alt+Left Arrow)
5. Verify navigation

**Expected Results**:
- ✅ Page navigates back to `index.html`
- ✅ User still logged in
- ✅ No login overlay shown
- ✅ Session maintained
- ✅ User can view dashboard normally

**Verification Commands**:
```javascript
// After clicking back:
console.log(authService.isAuthenticated()); // Should be true
console.log(window.location.pathname); // Should be "/index.html" or similar
```

**Pass/Fail**: ⬜ PASS / ⬜ FAIL

---

### TEST 4: Navigation Between Protected Pages
**Objective**: Verify user can navigate between all protected pages

**Prerequisites**:
- User must be logged in

**Steps**:
1. On dashboard (index.html)
2. Click "Courses" navigation link
3. Wait for course_content.html to load (5 seconds)
4. Click "AI Mentor" navigation link
5. Wait for chatbot.html to load (5 seconds)
6. Click "Profile" navigation link
7. Wait for profile.html to load (5 seconds)

**Expected Results**:
- ✅ Each page loads without login required
- ✅ User remains authenticated throughout
- ✅ Session data preserved
- ✅ No redirect to login page
- ✅ Navigation is smooth and quick

**Verification After Each Navigation**:
```javascript
// On each page:
console.log("Page:", window.location.href);
console.log("Auth:", authService.isAuthenticated());
```

**Pass/Fail**: ⬜ PASS / ⬜ FAIL

---

### TEST 5: Direct URL Access (Protected Route)
**Objective**: Verify unauthenticated user cannot access protected pages directly

**Prerequisites**:
- Must NOT be logged in (logout first)
- Clear authentication data

**Steps**:
1. Clear localStorage: `localStorage.clear()`
2. Manually enter URL: `course_content.html` in address bar
3. Press Enter
4. Observe redirect behavior

**Expected Results**:
- ✅ Page starts loading briefly
- ✅ checkAuthAndInit() detects no auth
- ✅ User redirected to `index.html`
- ✅ Login overlay displayed
- ✅ Console shows: "⚠️ User not authenticated - redirecting to login"

**Verification Commands**:
```javascript
// After redirect:
console.log(window.location.href); // Should contain "index.html"
console.log(authService.isAuthenticated()); // Should be false
```

**Pass/Fail**: ⬜ PASS / ⬜ FAIL

---

### TEST 6: Logout Functionality
**Objective**: Verify logout clears session and redirects properly

**Prerequisites**:
- User must be logged in

**Steps**:
1. User logged in on any page
2. Locate and click "Logout" button
3. Wait for processing (2-3 seconds)
4. Observe redirect

**Expected Results**:
- ✅ Firebase signs out user
- ✅ localStorage cleared completely
- ✅ User redirected to login page
- ✅ Login overlay displayed
- ✅ All auth tokens removed from storage
- ✅ Console shows: "✅ Logout successful"

**Verification Commands**:
```javascript
// After logout:
console.log(authService.isAuthenticated()); // Should be false
console.log(localStorage.getItem('authToken')); // Should be null
console.log(localStorage.getItem('currentUser')); // Should be null
console.log(window.location.href); // Should contain "index.html"
```

**Pass/Fail**: ⬜ PASS / ⬜ FAIL

---

### TEST 7: Cross-Tab Session Synchronization
**Objective**: Verify login/logout syncs across multiple browser tabs

**Prerequisites**:
- None

**Steps**:
1. Open Career Quest in Tab 1
2. Open same URL in Tab 2 and Tab 3
3. In Tab 1: Log in with test credentials
4. Switch to Tab 2 - observe automatically updated
5. Switch to Tab 3 - observe automatically updated
6. In Tab 2: Click Logout
7. Switch to Tab 1 - observe redirected

**Expected Results**:
- ✅ Login in one tab applies to all tabs
- ✅ Logout in one tab affects all tabs
- ✅ Sessions sync automatically
- ✅ All tabs show consistent auth state
- ✅ No manual refresh needed

**Note**: This requires `onAuthStateChanged()` listener active in all tabs

**Pass/Fail**: ⬜ PASS / ⬜ FAIL

---

### TEST 8: Session Timeout Handling (Advanced)
**Objective**: Verify system handles expired tokens

**Prerequisites**:
- User must be logged in
- Wait time: ~1 hour (or force token refresh)

**Steps**:
1. User logged in
2. Wait for token to expire (1 hour) OR
3. Manually expire token:
   ```javascript
   // In console:
   localStorage.removeItem('authToken');
   ```
4. Try to access protected page
5. Observe behavior

**Expected Results**:
- ✅ System detects token is invalid/missing
- ✅ User redirected to login
- ✅ Original page not accessible
- ✅ Error message shown (if applicable)

**Pass/Fail**: ⬜ PASS / ⬜ FAIL

---

### TEST 9: Error Handling - Invalid Credentials
**Objective**: Verify proper error messages for failed login

**Prerequisites**:
- User NOT logged in

**Steps**:
1. Open index.html login form
2. Enter invalid credentials:
   - Email: `nonexistent@example.com`
   - Password: `wrongpassword`
3. Click "Log In"
4. Wait for Firebase response

**Expected Results**:
- ✅ Firebase rejects credentials
- ✅ Error message displayed to user
- ✅ Message: "user-not-found" or "wrong-password"
- ✅ User NOT redirected
- ✅ Login form remains visible for retry
- ✅ Can enter new credentials and retry

**Verification Commands**:
```javascript
// While error shows:
console.log(authService.isAuthenticated()); // Should still be false
```

**Pass/Fail**: ⬜ PASS / ⬜ FAIL

---

### TEST 10: Error Handling - Weak Password
**Objective**: Verify validation for weak passwords during signup

**Prerequisites**:
- User NOT logged in

**Steps**:
1. Open index.html
2. Switch to signup form
3. Enter credentials:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "123" (too weak)
4. Click "Sign Up"
5. Observe response

**Expected Results**:
- ✅ Firebase validates password strength
- ✅ Error shown: "Password too weak"
- ✅ Account NOT created
- ✅ User remains on signup form
- ✅ Can retry with stronger password

**Pass/Fail**: ⬜ PASS / ⬜ FAIL

---

### TEST 11: Mobile Browser Compatibility
**Objective**: Verify auth works on mobile devices

**Prerequisites**:
- Access to mobile device or mobile emulator

**Steps**:
1. Open Career Quest on mobile browser (iOS Safari or Chrome Mobile)
2. Complete login flow
3. Navigate between pages using mobile touch navigation
4. Test mobile back button (swipe back or back button)
5. Test logout

**Expected Results**:
- ✅ Login form displays properly
- ✅ Touch interactions work
- ✅ Navigation smooth on mobile
- ✅ Session persists on mobile
- ✅ Back button works correctly
- ✅ All text readable

**Pass/Fail**: ⬜ PASS / ⬜ FAIL

---

### TEST 12: Network Disconnection Handling
**Objective**: Verify graceful handling of network issues

**Prerequisites**:
- User NOT logged in

**Steps**:
1. Turn off internet connection
2. Try to open index.html
3. Try to log in
4. Observe error handling

**Expected Results**:
- ✅ Page loads (if cached)
- ✅ Login attempt fails gracefully
- ✅ Error message: "Network error" or similar
- ✅ No app crashes
- ✅ User can retry when online

**Pass/Fail**: ⬜ PASS / ⬜ FAIL

---

## Performance Tests

### TEST P1: Initial Page Load Time
**Objective**: Measure time to load and restore session

**Steps**:
1. User logged in previously
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Measure time until page is fully interactive

**Expected Results**:
- ✅ Initial page load: < 3 seconds
- ✅ Session restore: < 100ms
- ✅ Overlay hidden: < 500ms after restore
- ✅ App interactive: < 2-3 seconds

**Verification**:
```javascript
// In console, check console timestamps
// Look for "Session restored" message timing
```

**Pass/Fail**: ⬜ PASS / ⬜ FAIL

---

## Console Log Verification

After running tests, check console for these messages:

```
✅ SHOULD SEE:
• 🔐 Initializing Authentication Service...
• 📦 Restoring session for: [email]
• ✅ User authenticated
• 🔄 Token refreshed
• 🗑️ Session cleared

❌ SHOULD NOT SEE:
• Uncaught errors
• Undefined variables
• CORS errors
• Failed to fetch messages (unless intentional)
```

---

## Test Summary Template

```
╔══════════════════════════════════════════════════════════╗
║     AUTHENTICATION SYSTEM TEST SUMMARY                  ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║ TEST 1: First-Time Login                   ⬜ PASS / FAIL
║ TEST 2: Session Persistence                ⬜ PASS / FAIL
║ TEST 3: Browser Back Button                ⬜ PASS / FAIL
║ TEST 4: Protected Page Navigation          ⬜ PASS / FAIL
║ TEST 5: Direct URL Access (Unauth)         ⬜ PASS / FAIL
║ TEST 6: Logout Functionality               ⬜ PASS / FAIL
║ TEST 7: Cross-Tab Synchronization          ⬜ PASS / FAIL
║ TEST 8: Session Timeout Handling           ⬜ PASS / FAIL
║ TEST 9: Invalid Credentials Error          ⬜ PASS / FAIL
║ TEST 10: Weak Password Error               ⬜ PASS / FAIL
║ TEST 11: Mobile Browser Support            ⬜ PASS / FAIL
║ TEST 12: Network Disconnection             ⬜ PASS / FAIL
║                                                          ║
║ PERFORMANCE:                                             ║
║ P1: Initial Page Load                      ⬜ PASS / FAIL
║                                                          ║
╠══════════════════════════════════════════════════════════╣
║ Total Tests Passed: ___  / 13                            ║
║ Success Rate: ____%                                      ║
║                                                          ║
║ Overall Status:                                          ║
║ ⬜ READY FOR PRODUCTION                                   ║
║ ⬜ NEEDS FIXES                                            ║
║ ⬜ BLOCKED                                                ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

---

## Troubleshooting During Tests

| Issue | Check | Solution |
|-------|-------|----------|
| Auth overlay always shows | localStorage for authToken | Clear localStorage, login again |
| Can't login | Firebase credentials | Verify email/password are correct |
| Page won't load | Console errors | F12 → Console, read error message |
| Session not persisting | localStorage keys | Verify all 3 keys present (authToken, currentUser, sessionStart) |
| Logout not working | Browser cache | Clear cache, hard refresh |
| Mobile issues | Viewport size | Check responsive design in DevTools mobile mode |

---

**Run through all tests systematically to ensure the authentication system is working correctly! ✅**

