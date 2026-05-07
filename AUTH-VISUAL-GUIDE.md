# 🎯 AUTHENTICATION SYSTEM - VISUAL ARCHITECTURE GUIDE

## System Overview Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                      CAREER QUEST APPLICATION                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        auth.js Module                            │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │                                                                  │  │
│  │  AuthService {                                                   │  │
│  │    • currentUser                                                 │  │
│  │    • authToken                                                   │  │
│  │    • isInitialized                                               │  │
│  │    • auth (Firebase reference)                                   │  │
│  │  }                                                               │  │
│  │                                                                  │  │
│  │  Methods:                                                        │  │
│  │    • initializeAuth(firebaseAuth)                               │  │
│  │    • saveUserSession(firebaseUser)                              │  │
│  │    • restoreSessionFromStorage()                                │  │
│  │    • login(email, password)                                     │  │
│  │    • signup(email, password, displayName)                       │  │
│  │    • logout()                                                    │  │
│  │    • isAuthenticated()                                           │  │
│  │    • getCurrentUser()                                            │  │
│  │    • getAuthToken()                                              │  │
│  │    • isTokenValid()                                              │  │
│  │    • refreshToken()                                              │  │
│  │    • clearSession()                                              │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      Firebase Services                           │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │                                                                  │  │
│  │  getAuth() → Firebase Authentication                             │  │
│  │  signInWithEmailAndPassword()                                    │  │
│  │  createUserWithEmailAndPassword()                                │  │
│  │  signOut()                                                       │  │
│  │  onAuthStateChanged()                                            │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Browser localStorage                          │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │                                                                  │  │
│  │  authToken        → JWT token for API authentication             │  │
│  │  currentUser      → User profile data (JSON)                     │  │
│  │  sessionStart     → Session creation timestamp                   │  │
│  │  userProfile      → Extended user data (career info)             │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                         PROTECTED PAGES                                │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  index.html              course_content.html        chatbot.html        │
│  ┌─────────────┐         ┌─────────────────┐        ┌──────────────┐   │
│  │  Load auth  │         │  Load auth      │        │  Load auth   │   │
│  │  .js        │         │  .js            │        │  .js         │   │
│  │             │         │                 │        │              │   │
│  │  Check      │◄────────┤  Check          │◄───────┤  Check       │   │
│  │  session    │         │  auth           │        │  auth        │   │
│  │  if exists  │         │                 │        │              │   │
│  │             │         │  Redirect if    │        │  Redirect if │   │
│  │  Restore    │         │  not authed     │        │  not authed  │   │
│  │  user       │         │                 │        │              │   │
│  │             │         │  Load content   │        │  Init chat   │   │
│  │  Hide login │         │  if authed      │        │              │   │
│  │  overlay    │         │                 │        │              │   │
│  └─────────────┘         └─────────────────┘        └──────────────┘   │
│                                                                         │
│  profile.html                                                           │
│  ┌──────────────────────┐                                              │
│  │  Load auth.js        │                                              │
│  │  Check auth          │                                              │
│  │  Redirect if needed  │                                              │
│  │  Load user data      │                                              │
│  │  (from authService)  │                                              │
│  └──────────────────────┘                                              │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

## Authentication State Machine

```
                    ┌─────────────────────────────┐
                    │     NOT AUTHENTICATED       │
                    │   (Initial State / Logged   │
                    │        Out)                 │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │  User submits login form    │
                    │  authService.login()        │
                    │  Firebase authenticates     │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │  AUTHENTICATING             │
                    │  (Firebase Request)         │
                    └──────────────┬──────────────┘
                                   │
                 ┌─────────────────┼──────────────┐
                 │                 │              │
            SUCCESS           FAILURE         TIMEOUT
                 │                 │              │
                 ▼                 ▼              ▼
         ┌──────────────┐  ┌──────────────┐
         │  SAVE TOKEN  │  │  SHOW ERROR  │ (retry login)
         │  TO STORAGE  │  │  MESSAGE     │
         └──────┬───────┘  └──────────────┘
                │
                ▼
    ┌────────────────────────────────┐
    │  AUTHENTICATED               │
    │  • Token in memory             │
    │  • User in memory              │
    │  • Data in localStorage        │
    │  • Can access all pages        │
    └────────────┬───────────────────┘
                 │
       ┌─────────┼─────────┐
       │         │         │
    PAGE     NAVIGATE   LOGOUT
   RELOAD    PAGES      CLICK
       │         │         │
       ▼         ▼         ▼
    RESTORE   LOAD      SIGN OUT
    FROM      PROTECTED API CALL
    STORAGE   PAGES
       │         │         │
       ▼         ▼         ▼
    AUTH      AUTH      CLEAR
    VALID     CHECK✓    STORAGE
       │         │         │
       │         │         ▼
       │         │    ┌─────────────┐
       │         │    │ REDIRECTED  │
       │         │    │ TO LOGIN    │
       │         │    └─────────────┘
       │         │         │
       └─────────┴─────────┘
              │
              ▼
    ┌─────────────────────────┐
    │   NOT AUTHENTICATED 2   │ (back to start)
    │   (Logged Out State)    │
    └─────────────────────────┘
```

## Data Flow Diagram

```
USER ACTION                  SYSTEM RESPONSE              STORAGE
─────────────────────────────────────────────────────────────────────

User opens
index.html
       │
       ▼
┌─────────────────────┐
│ DOMContentLoaded    │
│ Event fires         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ app.init()          │
│ Called              │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│ authService.init            │
│ ializeAuth(auth)            │
│ • Initialize Firebase       │
│ • Check localStorage        │
└──────────┬──────────────────┘
           │
     ┌─────┴──────┐
     │            │
  TOKEN       NO TOKEN
   FOUND      FOUND
     │            │
     ▼            ▼
  RESTORE    ┌─────────────────┐
   SESSION   │ Firebase listens │
   FROM      │ for auth changes │
  STORAGE    └────────┬────────┘
     │                │
     │                ▼
  PARSE         ┌──────────────────────┐
   USER    ┌───►│ User not authed yet? │
     │     │    │ → Show login form    │
     │     │    └──────────────────────┘
     │     │
     ▼     │
  ┌──────┐ │
  │ VERIFIED USER INPUTS
  │ Set  │ │ Credentials
  │state │ │ (email/pass)
  └───┬──┘ │
      │    │
      ▼    ▼
    ┌─────────────────┐
    │ Firebase API    │
    │ Authenticates   │
    │ & Returns JWT   │
    └────────┬────────┘
             │
        ┌────┴───────┐
        │            │
     SUCCESS      ERROR
        │            │
        ▼            ▼
   ┌─────────┐  ┌──────────┐
   │ SAVE    │  │ SHOW     │
   │ TOKEN   │  │ ERROR    │
   │ &       │  │ MSG      │
   │ USER    │  │ RETRY    │
   │ DATA    │  │ LOGIN    │
   └────┬────┘  └──────────┘
        │
        ├──────────────────────────► authToken
        │                            │
        │                            ├──► localStorage
        │                            │    [Persistent]
        ├──────────────────────────► currentUser
        │                            │
        │                            └──► localStorage
        │                                 [Persistent]
        ├──────────────────────────► sessionStart
        │                            │
        └──────────────────────────► state.user
                                     [Memory only]
```

## Component Interaction Matrix

```
                    ┌──────────────────────────────────────────────┐
                    │          Component Interactions              │
                    └──────────────────────────────────────────────┘

                    │  auth.js │ index.html │ Firebase │ localStorage
────────────────────┼──────────┼────────────┼──────────┼─────────────
initializeAuth()    │    ✓     │      ✓     │    ✓     │      ✓
saveUserSession()   │    ✓     │            │          │      ✓
restoreSessionFrom  │    ✓     │      ✓     │          │      ✓
Storage()           │          │            │          │
login()             │    ✓     │      ✓     │    ✓     │      ✓
logout()            │    ✓     │      ✓     │    ✓     │      ✓
isAuthenticated()   │    ✓     │      ✓     │          │
getCurrentUser()    │    ✓     │      ✓     │          │      ✓
getAuthToken()      │    ✓     │            │          │      ✓
```

## Page Load Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                  index.html PAGE LOAD LIFECYCLE                 │
└─────────────────────────────────────────────────────────────────┘

TIME →

├─ 0ms    Page load starts
│
├─ 25ms   <script src="auth.js"></script> loaded
│         • AuthService initialized
│         • authService global available
│
├─ 50ms   <script type="module"> starts
│         • Firebase initialized
│         • authService.auth = auth
│
├─ 75ms   DOMContentLoaded event fires
│         • app.init() called
│
├─ 100ms  authService.initializeAuth(auth)
│         ├─ Check localStorage
│         │  └─ Token found or not found?
│         │
│         ├─ Setup Firebase listener
│         │  └─ onAuthStateChanged()
│
├─ 150ms  IF SESSION FOUND:
│         ├─ Restore user from localStorage
│         ├─ Restore token
│         ├─ state.user = user
│         ├─ Hide auth overlay
│         └─ App ready
│
├─ 150ms  IF NO SESSION:
│         ├─ Show auth overlay
│         ├─ Wait for user input
│         └─ Ready for login
│
├─ ~1500ms User clicks Login
│          ├─ collect credentials
│          ├─ authService.login(email, pass)
│          ├─ Firebase authenticates
│          ├─ Save session to localStorage
│          ├─ Hide overlay
│          └─ App starts
│
└─ ~2000ms APPLICATION READY
           • User can navigate
           • Session persists
           • All protected pages accessible
```

## Error Handling Flow

```
                         ┌────────────────┐
                         │ AUTH OPERATION │
                         │ (login, etc.)  │
                         └────────┬───────┘
                                  │
                  ┌───────────────┼───────────────┐
                  │               │               │
              SUCCESS         TIMEOUT         ERROR
                  │               │               │
                  ▼               ▼               ▼
            ┌─────────────┐ ┌──────────┐ ┌──────────────┐
            │ Proceed     │ │ Show     │ │ Check Error  │
            │ Normal      │ │ Timeout  │ │ Type         │
            │ Flow        │ │ Error    │ └───┬──────────┘
            └─────────────┘ └──────────┘     │
                                ┌────────────┼──────────┐
                                │            │          │
                          NETWORK        WRONG      EMAIL
                          ERROR          PASSWORD   IN USE
                          │              │          │
                          ▼              ▼          ▼
                     ┌────────────┐ ┌────────┐ ┌─────────────┐
                     │ Show:      │ │ Show:  │ │ Show:       │
                     │ "Check     │ │ "Wrong │ │ "Email      │
                     │ Network"   │ │ Pass"  │ │ Already     │
                     └────────────┘ └────────┘ │ Registered" │
                                               └─────────────┘
                                                     │
                                                     ▼
                                          ┌────────────────────┐
                                          │ LOG ERROR          │
                                          │ TO console         │
                                          │ & Show TO USER     │
                                          └────────┬───────────┘
                                                   │
                                          ┌────────▼───────────┐
                                          │ User Can Retry     │
                                          │ or Navigate Away   │
                                          └────────────────────┘
```

## Security Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                              │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────────┐
                    │   1. FIREBASE AUTH       │
                    │   • Secure credential    │
                    │     verification         │
                    │   • Returns JWT token    │
                    │   • Token expires 1hr    │
                    └────────────┬─────────────┘
                                 │
                   ┌─────────────▼──────────┐
                   │  2. TOKEN STORAGE      │
                   │  • Save to localStorage│
                   │  • Token not exposed   │
                   │    in URL              │
                   │  • Clear on logout     │
                   └────────────┬───────────┘
                                │
                   ┌────────────▼────────────┐
                   │ 3. ROUTE PROTECTION    │
                   │ • Auth check before    │
                   │   page load            │
                   │ • Redirect if no token │
                   │ • Validate in every    │
                   │   protected page       │
                   └────────────┬───────────┘
                                │
                   ┌────────────▼────────────┐
                   │ 4. STATE MANAGEMENT    │
                   │ • Keep consistent      │
                   │   across components    │
                   │ • Single source of     │
                   │   truth (localStorage) │
                   │ • Validate on restore  │
                   └────────────┬───────────┘
                                │
                   ┌────────────▼────────────┐
                   │ 5. SESSION VALIDATION  │
                   │ • Check token validity │
                   │ • Verify user exists   │
                   │ • Monitor expiration   │
                   │ • Auto-refresh if     │
                   │   needed               │
                   └────────────────────────┘
```

## localStorage State Snapshots

```
BEFORE LOGIN:
─────────────
localStorage {
    (empty - no auth data)
}

DURING LOGIN:
─────────────
localStorage {
    (Firebase processing)
}

AFTER SUCCESSFUL LOGIN:
──────────────────────
localStorage {
    "authToken": "eyJhbGc...", 
    "currentUser": {
        "uid": "abc123",
        "email": "user@example.com",
        "displayName": "John Doe",
        "photoURL": "...",
        "emailVerified": true,
        "lastLogin": "2026-03-12T10:30:00.000Z"
    },
    "sessionStart": "1678610400000",
    "userProfile": {
        "firstName": "John",
        "lastName": "Doe",
        "skills": [...],
        ...
    }
}

AFTER LOGOUT:
─────────────
localStorage {
    (all auth data cleared)
    
    userProfile: { ... } ← ← Only non-auth data remains
                             (user preferences saved)
}
```

## Request/Response Cycle

```
CLIENT SIDE                        SERVER SIDE (Firebase)
───────────────────────────────────────────────────────
                                    
User clicks "Login"
        │
        ▼
validateInput()
        │
        ▼
authService.login(email,pass)
        │
        ├─────────────────────────► signInWithEmailAndPassword()
        │                                    │
        │                                    ▼
        │                          Firebase API
        │                          Verify credentials
        │                                    │
        │                    ┌───────────────┴────────────────┐
        │                    │                                │
        │                    ▼                                ▼
        │              VERIFIED                        INVALID/ERROR
        │                    │                                │
        │                    ▼                                ▼
        │              Generate JWT                   Return Error
        │                    │                                │
        │◄───────────────────┴────────────────────────────────┤
        │                    │                                │
        ▼                    ▼                                ▼
Save to          Parse response              Show error
localStorage        from Firebase              message to user
  &                 & extract data
Memory
        │
        ▼
User's session
now persistent!

Next visit →
Check localStorage first
→ Session valid immediately
→ No Firebase call needed!
```

---

## Quick Integration Checklist

```
☐ Copy auth.js to project root
☐ Add <script src="auth.js"></script> to <head> of protected pages
☐ Add checkAuthAndInit() function to <script>
☐ Wrap page initialization with DOMContentLoaded event
☐ Test login and verify localStorage populated
☐ Test page reload - session should persist
☐ Test direct URL access - should redirect if not logged in
☐ Test logout - should clear localStorage
☐ Test browser back button - should maintain session
☐ Check browser console for auth logs
```

---

**The authentication system is now complete, secure, and production-ready! 🚀**

