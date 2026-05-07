/**
 * ============================================================================
 * AUTHENTICATION MODULE - auth.js
 * ============================================================================
 * 
 * PURPOSE:
 * Centralized authentication management for the Career Quest application.
 * Handles Firebase auth integration, session persistence, and state management.
 * 
 * KEY FEATURES:
 * 1. Firebase authentication integration
 * 2. LocalStorage-based session persistence
 * 3. Auth state change listener (detects login/logout across all pages)
 * 4. Route protection (prevents unauthorized access)
 * 5. Token management and refresh
 * 
 * FLOW:
 * 1. User logs in → Firebase authenticates → Save token to localStorage
 * 2. Page reloads → Check localStorage → Restore user session
 * 3. User logs out → Clear localStorage → Redirect to login
 * ============================================================================
 */

/**
 * AUTHENTICATION SERVICE
 * Manages all auth operations and state
 */
class AuthService {
    constructor() {
        this.currentUser = null;
        this.authToken = null;
        this.isInitialized = false;

        // Auto-restore session from localStorage on every page load
        const savedUser = this.restoreSessionFromStorage();
        if (savedUser) {
            this.currentUser = savedUser;
            this.authToken = localStorage.getItem('authToken');
        }
    }

    /**
     * Initialize Firebase and restore session from localStorage
     * Call this once when app starts
     */
    async initializeAuth(firebaseAuth) {
        if (this.isInitialized) return this.isAuthenticated();

        this.auth = firebaseAuth;
        this.isInitialized = true;

        console.log("🔐 Initializing Authentication Service...");

        // localStorage is the ONLY source of truth for login state
        // If localStorage has a session → user is logged in
        // If localStorage has NO session → user is NOT logged in (show login page)
        // We do NOT use Firebase onAuthStateChanged for auto-login
        if (this.isAuthenticated()) {
            console.log("✅ Session restored from localStorage:", this.currentUser.email);
            return true;
        }

        console.log("❌ No session in localStorage - user needs to login");
        return false;
    }

    /**
     * Save user session to localStorage
     * Persists across page reloads and browser sessions
     */
    async saveUserSession(firebaseUser) {
        const token = await firebaseUser.getIdToken();

        const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'User',
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            lastLogin: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('sessionStart', new Date().getTime().toString());

        this.currentUser = userData;
        this.authToken = token;

        console.log("💾 User session saved to localStorage");
    }

    /**
     * Restore session from localStorage
     * Runs before Firebase listener for instant page load
     */
    restoreSessionFromStorage() {
        try {
            const savedUser = localStorage.getItem('currentUser');
            const savedToken = localStorage.getItem('authToken');

            if (savedUser && savedToken) {
                const user = JSON.parse(savedUser);
                console.log("📦 Restoring session for:", user.email);
                return user;
            }
        } catch (error) {
            console.error("❌ Error restoring session:", error);
            this.clearSession();
        }
        return null;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!this.currentUser && !!this.authToken;
    }

    /**
     * Get current user data
     * @returns {Object|null}
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Get authentication token
     * @returns {string|null}
     */
    getAuthToken() {
        return this.authToken;
    }

    /**
     * Login user with email and password
     * @param {string} email
     * @param {string} password
     * @returns {Promise}
     */
    async login(email, password) {
        try {
            const { signInWithEmailAndPassword } = await import(
                "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"
            );
            const credential = await signInWithEmailAndPassword(this.auth, email, password);
            await this.saveUserSession(credential.user);
            console.log("✅ Login successful");
            return credential.user;
        } catch (error) {
            console.error("❌ Login failed:", error);
            throw error;
        }
    }

    /**
     * Signup user with email and password
     * @param {string} email
     * @param {string} password
     * @param {string} displayName
     * @returns {Promise}
     */
    async signup(email, password, displayName) {
        try {
            const { createUserWithEmailAndPassword, updateProfile } = await import(
                "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"
            );
            const credential = await createUserWithEmailAndPassword(this.auth, email, password);

            if (displayName) {
                await updateProfile(credential.user, { displayName });
            }

            await this.saveUserSession(credential.user);
            console.log("✅ Signup successful");
            return credential.user;
        } catch (error) {
            console.error("❌ Signup failed:", error);
            throw error;
        }
    }

    /**
     * Logout user and clear session
     * @returns {Promise}
     */
    async logout() {
        // ALWAYS clear localStorage first, regardless of Firebase
        this.clearSession();
        console.log("✅ Session cleared from localStorage");
        try {
            if (this.auth) {
                await this.auth.signOut();
            }
            console.log("✅ Firebase logout successful");
        } catch (error) {
            console.warn("⚠️ Firebase signOut failed (session still cleared):", error);
        }
        return true;
    }

    /**
     * Clear session data from localStorage and memory
     */
    clearSession() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionStart');
        this.currentUser = null;
        this.authToken = null;
        console.log("🗑️ Session cleared");
    }

    /**
     * Check if token is still valid (optional)
     * @returns {boolean}
     */
    isTokenValid() {
        if (!this.authToken) return false;

        // Check session age (e.g., expire after 24 hours)
        const sessionStart = localStorage.getItem('sessionStart');
        if (sessionStart) {
            const age = (new Date().getTime() - parseInt(sessionStart)) / 1000 / 60 / 60; // hours
            if (age > 24) {
                console.warn("⚠️ Session expired (24 hours old)");
                this.clearSession();
                return false;
            }
        }
        return true;
    }

    /**
     * Refresh token from Firebase
     */
    async refreshToken() {
        try {
            if (this.currentUser) {
                const user = this.auth.currentUser;
                if (user) {
                    const newToken = await user.getIdToken(true);
                    localStorage.setItem('authToken', newToken);
                    this.authToken = newToken;
                    console.log("🔄 Token refreshed");
                    return newToken;
                }
            }
        } catch (error) {
            console.error("❌ Token refresh failed:", error);
        }
        return null;
    }

    /**
     * Setup auth state change listener
     * Triggers callback whenever auth state changes
     * @param {Function} callback - Called with (user or null)
     */
    onAuthStateChanged(callback) {
        return this.auth.onAuthStateChanged(async (user) => {
            if (user) {
                await this.saveUserSession(user);
                callback(this.currentUser);
            } else {
                this.clearSession();
                callback(null);
            }
        });
    }
}

/**
 * ============================================================================
 * ROUTE PROTECTION UTILITY
 * ============================================================================
 * 
 * Protects routes and ensures only authenticated users can access content
 */
class RouteProtector {
    /**
     * Check if user can access a route
     * If not authenticated, redirects to login
     * @param {AuthService} authService
     * @param {string} redirectUrl - Where to redirect if not authenticated
     * @returns {boolean}
     */
    static protectRoute(authService, redirectUrl = 'index.html') {
        if (!authService.isAuthenticated()) {
            console.warn("⚠️ Unauthorized access attempt - redirecting to login");
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    /**
     * Check if route requires auth
     * @param {AuthService} authService
     * @returns {boolean}
     */
    static requireAuth(authService) {
        return authService.isAuthenticated();
    }

    /**
     * Add auth requirement to page
     * Shows loading screen until auth is verified
     * @param {AuthService} authService
     */
    static async setupAuthGuard(authService) {
        // Create loading overlay
        const overlay = document.createElement('div');
        overlay.id = 'auth-guard-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(11, 14, 20, 0.95);
            z-index: 9998;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        overlay.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 20px;">🔐</div>
                <div style="color: #94a3b8; font-size: 1.2rem;">Verifying authentication...</div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Wait for auth to initialize
        await authService.initializeAuth(authService.auth);

        // Hide overlay
        overlay.style.display = 'none';

        // If not authenticated, redirect
        if (!authService.isAuthenticated()) {
            console.warn("⚠️ User not authenticated - redirecting to login");
            window.location.href = 'index.html';
        }
    }
}

/**
 * ============================================================================
 * EXPORT
 * ============================================================================
 * Create global auth service instance
 */
const authService = new AuthService();
const routeProtector = new RouteProtector();

console.log("✅ Authentication module loaded");
