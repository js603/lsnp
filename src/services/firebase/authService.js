import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebaseConfig';

/**
 * Authentication Service
 * Handles user authentication using Firebase Authentication
 */
class AuthService {
  constructor() {
    this.auth = auth;
    this.user = null;
    this.authStateListeners = [];
    
    // Set up auth state listener
    onAuthStateChanged(this.auth, (user) => {
      this.user = user;
      this.notifyAuthStateListeners(user);
    });
  }
  
  /**
   * Register a new user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {string} displayName - User's display name
   * @returns {Promise<object>} - User credential
   */
  async register(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Update user profile with display name
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return userCredential;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }
  
  /**
   * Sign in an existing user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<object>} - User credential
   */
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }
  
  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }
  
  /**
   * Send a password reset email to the user
   * @param {string} email - User's email
   * @returns {Promise<void>}
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
  
  /**
   * Get the current user
   * @returns {object|null} - Current user or null if not logged in
   */
  getCurrentUser() {
    return this.user;
  }
  
  /**
   * Check if a user is logged in
   * @returns {boolean} - True if a user is logged in
   */
  isLoggedIn() {
    return !!this.user;
  }
  
  /**
   * Add an auth state listener
   * @param {function} listener - Callback function that receives the user object
   * @returns {function} - Function to remove the listener
   */
  addAuthStateListener(listener) {
    this.authStateListeners.push(listener);
    
    // Call the listener immediately with the current user
    if (typeof listener === 'function') {
      listener(this.user);
    }
    
    // Return a function to remove the listener
    return () => {
      this.authStateListeners = this.authStateListeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Notify all auth state listeners of a change
   * @param {object|null} user - The current user or null
   */
  notifyAuthStateListeners(user) {
    this.authStateListeners.forEach(listener => {
      if (typeof listener === 'function') {
        listener(user);
      }
    });
  }
  
  /**
   * Get the user's ID token
   * @returns {Promise<string>} - The ID token
   */
  async getIdToken() {
    if (!this.user) {
      throw new Error('No user is logged in');
    }
    
    return await this.user.getIdToken();
  }
  
  /**
   * Get the user's unique ID
   * @returns {string|null} - The user's UID or null if not logged in
   */
  getUserId() {
    return this.user ? this.user.uid : null;
  }
  
  /**
   * Get the user's display name
   * @returns {string|null} - The user's display name or null if not set
   */
  getDisplayName() {
    return this.user ? this.user.displayName : null;
  }
  
  /**
   * Get the user's email
   * @returns {string|null} - The user's email or null if not logged in
   */
  getEmail() {
    return this.user ? this.user.email : null;
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;