/**
 * ============================================================================
 * QUICK REFERENCE - AUTHENTICATION SYSTEM
 * ============================================================================
 * 
 * A quick guide for developers to integrate authentication into new pages
 * or understand how the current system works.
 * 
 * ============================================================================
 * QUICK START (Add to New Page)
 * ============================================================================
 */

// 1. Add this to <head> section:
<script src="auth.js"></script>

// 2. Add this to your <script> section:
function checkAuthAndInit() {
    if (!authService.isAuthenticated()) {
        console.warn("⚠️ Redirecting to login");
        window.location.href = 'index.html';
        return false;
    }
    console.log("✅ User authenticated");
    return true;
}

document.addEventListener('DOMContentLoaded', () => {
    if (checkAuthAndInit()) {
        // Your initialization code here
        initializePage();
    }
});

// 3. Initialize your page when DOM is ready
function initializePage() {
    console.log("Page loaded successfully");
    // All your code here
}

/**
 * ============================================================================
 * API REFERENCE
 * ============================================================================
 */

// CHECK IF USER IS LOGGED IN
if (authService.isAuthenticated()) {
    // User is logged in
}

// GET CURRENT USER DATA
const user = authService.getCurrentUser();
console.log(user.email);       // User email
console.log(user.displayName); // User name
console.log(user.uid);         // User ID

// GET AUTH TOKEN
const token = authService.getAuthToken();

// LOGIN
authService.login(email, password)
    .then(user => console.log("Logged in:", user.email))
    .catch(error => console.error("Login failed:", error.message));

// SIGNUP
authService.signup(email, password, displayName)
    .then(user => console.log("Account created:", user.email))
    .catch(error => console.error("Signup failed:", error.message));

// LOGOUT
authService.logout()
    .then(() => console.log("Logged out"))
    .catch(error => console.error("Logout failed:", error));

// CLEAR SESSION
authService.clearSession();

// CHECK IF TOKEN IS VALID
if (authService.isTokenValid()) {
    // Token is still valid
}

// REFRESH TOKEN
authService.refreshToken()
    .then(newToken => console.log("Token refreshed"))
    .catch(error => console.error("Refresh failed:", error));

// LISTEN FOR AUTH STATE CHANGES
authService.onAuthStateChanged(user => {
    if (user) {
        console.log("User logged in:", user.email);
    } else {
        console.log("User logged out");
    }
});

/**
 * ============================================================================
 * COMMON PATTERNS
 * ============================================================================
 */

// Pattern 1: Protect a route
function protectRoute() {
    if (!authService.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }
    loadPage();
}

// Pattern 2: Conditional rendering based on auth
if (authService.isAuthenticated()) {
    document.getElementById('auth-area').style.display = 'block';
    document.getElementById('login-area').style.display = 'none';
} else {
    document.getElementById('auth-area').style.display = 'none';
    document.getElementById('login-area').style.display = 'block';
}

// Pattern 3: Display user info
const user = authService.getCurrentUser();
if (user) {
    document.getElementById('user-name').innerText = user.displayName;
    document.getElementById('user-email').innerText = user.email;
}

// Pattern 4: Safe logout
async function handleLogout() {
    try {
        await authService.logout();
        // Will redirect automatically, but you can add logic here
    } catch (error) {
        console.error("Logout failed:", error);
        // Force clear session
        authService.clearSession();
        window.location.href = 'index.html';
    }
}

/**
 * ============================================================================
 * DEBUGGING TIPS
 * ============================================================================
 */

// Log all available data
console.log("Auth Service Status:");
console.log("  - Authenticated:", authService.isAuthenticated());
console.log("  - Current User:", authService.getCurrentUser());
console.log("  - Token Valid:", authService.isTokenValid());
console.log("  - Stored Token:", localStorage.getItem('authToken'));
console.log("  - Stored User:", localStorage.getItem('currentUser'));

// Monitor auth state changes
authService.onAuthStateChanged(user => {
    console.log("Auth state changed:", user);
});

// Check localStorage state
console.log("LocalStorage Contents:");
console.log("  authToken:", localStorage.getItem('authToken'));
console.log("  currentUser:", localStorage.getItem('currentUser'));
console.log("  sessionStart:", localStorage.getItem('sessionStart'));

/**
 * ============================================================================
 * DATA PERSISTENCE
 * ============================================================================
 */

// These are automatically saved to localStorage:
localStorage.get Items:
{
    "authToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1In0...",
    "currentUser": {
        "uid": "user123",
        "email": "user@example.com",
        "displayName": "John Doe",
        "photoURL": "https://...",
        "emailVerified": true,
        "lastLogin": "2026-03-12T10:30:00.000Z"
    },
    "sessionStart": "1678610400000"
}

/**
 * ============================================================================
 * FILE LOCATIONS & STRUCTURE
 * ============================================================================
 */

Project Root/
├── auth.js
│   ├── AuthService (Main class)
│   │   ├── initializeAuth()
│   │   ├── login()
│   │   ├── signup()
│   │   ├── logout()
│   │   ├── getCurrentUser()
│   │   ├── getAuthToken()
│   │   ├── isAuthenticated()
│   │   ├── isTokenValid()
│   │   └── refreshToken()
│   │
│   └── RouteProtector (Utility class)
│       ├── protectRoute()
│       ├── requireAuth()
│       └── setupAuthGuard()
│
├── index.html (Login & Main App)
│   └── Uses: authService.initializeAuth()
│
├── course_content.html (Protected Route)
│   └── Uses: checkAuthAndInit()
│
├── chatbot.html (Protected Route)
│   └── Uses: checkAuthAndInit()
│
└── profile.html (Protected Route)
    └── Uses: checkAuthAndInit()

/**
 * ============================================================================
 * ERROR HANDLING
 * ============================================================================
 */

try {
    await authService.login(email, password);
} catch (error) {
    // Firebase error codes:
    if (error.code === 'auth/user-not-found') {
        console.log("Email not registered");
    } else if (error.code === 'auth/wrong-password') {
        console.log("Incorrect password");
    } else if (error.code === 'auth/email-already-in-use') {
        console.log("Email already registered");
    } else if (error.code === 'auth/weak-password') {
        console.log("Password too weak");
    } else if (error.code === 'auth/network-request-failed') {
        console.log("Network error - check your connection");
    } else {
        console.log("Auth error:", error.message);
    }
}

/**
 * ============================================================================
 * INTEGRATION CHECKLIST
 * ============================================================================
 */

When adding a new protected page:

☐ Add <script src="auth.js"></script> to <head>
☐ Create checkAuthAndInit() function
☐ Add DOMContentLoaded event listener
☐ Call checkAuthAndInit() before initializing page
☐ Test with logged-in user
☐ Test with logged-out user (should redirect)
☐ Test page reload (should maintain session)
☐ Test browser back button
☐ Test logout functionality
☐ Check console for auth logs

/**
 * ============================================================================
 * COMMON MISTAKES TO AVOID
 * ============================================================================
 */

❌ WRONG: Checking state.user instead of authService.isAuthenticated()
✅ RIGHT: if (authService.isAuthenticated()) { }

❌ WRONG: Storing tokens in sessionStorage only
✅ RIGHT: Use authService which handles localStorage

❌ WRONG: Calling init() without checking auth first
✅ RIGHT: Wrap with checkAuthAndInit()

❌ WRONG: Not waiting for DOMContentLoaded
✅ RIGHT: Use document.addEventListener('DOMContentLoaded', ...)

❌ WRONG: Redirecting without clearing localStorage
✅ RIGHT: Use authService.logout() which clears everything

❌ WRONG: Checking auth synchronously
✅ RIGHT: Use .then() or async/await for Firebase operations

/**
 * ============================================================================
 * TESTING YOUR AUTH SYSTEM
 * ============================================================================
 */

Test Case 1: First-time Login
1. Open index.html - See login form
2. Enter test credentials
3. Click Login
4. Wait for redirect to app
5. Check localStorage for authToken

Test Case 2: Session Persistence
1. Login to app
2. Refresh page (Ctrl+R)
3. Should stay logged in without showing login form
4. Check console for "Session restored" message

Test Case 3: Route Protection
1. Login to app
2. Try accessing course_content.html directly via URL bar
3. Should load normally (you're authenticated)
4. Open new tab and go to course_content.html without login
5. Should redirect to index.html

Test Case 4: Browser Back Button
1. Login to app
2. Navigate to multiple pages
3. Click browser back button
4. Should navigate normally without logout
5. Session should be maintained

Test Case 5: Logout
1. Login to app
2. Find and click logout button
3. Should redirect to login page
4. Should see login form
5. localStorage should be cleared

/**
 * ============================================================================
 * PERFORMANCE NOTES
 * ============================================================================
 */

- Session restoration from localStorage: ~1ms (very fast, no network call)
- Firebase login: ~1-3 seconds (network-dependent)
- Firebase token refresh: ~500-2000ms (network-dependent)
- Route protection check: <1ms (localStorage lookup only)

For better perceived performance:
- Show loading spinner while authenticating
- Restore session before showing UI elements
- Pre-fetch Firebase SDK on page load

/**
 * ============================================================================
 * SUPPORT RESOURCES
 * ============================================================================
 */

- Firebase Documentation: https://firebase.google.com/docs/auth
- Browser DevTools: F12 → Application → LocalStorage
- Console Logs: F12 → Console tab
- Network Activity: F12 → Network tab

/**
 * ============================================================================
 */
