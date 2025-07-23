import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { firestore } from './firebaseConfig';
import authService from './authService';

/**
 * Data Service
 * Handles data storage and retrieval using Firebase Firestore
 */
class DataService {
  constructor() {
    this.firestore = firestore;
    this.authService = authService;
    
    // Collection references
    this.collections = {
      savedGames: collection(this.firestore, 'savedGames'),
      gameProgress: collection(this.firestore, 'gameProgress'),
      userSettings: collection(this.firestore, 'userSettings'),
      completedBranches: collection(this.firestore, 'completedBranches'),
      unlockedChoices: collection(this.firestore, 'unlockedChoices')
    };
  }
  
  /**
   * Get the current user ID
   * @returns {string} - User ID
   * @throws {Error} - If no user is logged in
   */
  getUserId() {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('No user is logged in');
    }
    return userId;
  }
  
  /**
   * Save game state
   * @param {string} saveSlot - Save slot identifier
   * @param {object} gameState - Game state to save
   * @returns {Promise<void>}
   */
  async saveGame(saveSlot, gameState) {
    try {
      const userId = this.getUserId();
      
      // Create a document reference with user ID and save slot
      const saveRef = doc(this.collections.savedGames, `${userId}_${saveSlot}`);
      
      // Prepare save data
      const saveData = {
        userId,
        saveSlot,
        gameState,
        timestamp: serverTimestamp(),
        displayName: gameState.currentScene ? gameState.currentScene.substring(0, 50) + '...' : 'Saved Game'
      };
      
      // Save to Firestore
      await setDoc(saveRef, saveData);
      
      console.log(`Game saved to slot ${saveSlot}`);
    } catch (error) {
      console.error('Error saving game:', error);
      throw error;
    }
  }
  
  /**
   * Load game state
   * @param {string} saveSlot - Save slot identifier
   * @returns {Promise<object|null>} - Loaded game state or null if not found
   */
  async loadGame(saveSlot) {
    try {
      const userId = this.getUserId();
      
      // Create a document reference with user ID and save slot
      const saveRef = doc(this.collections.savedGames, `${userId}_${saveSlot}`);
      
      // Get the document
      const saveDoc = await getDoc(saveRef);
      
      if (saveDoc.exists()) {
        const saveData = saveDoc.data();
        console.log(`Game loaded from slot ${saveSlot}`);
        return saveData.gameState;
      } else {
        console.log(`No save found in slot ${saveSlot}`);
        return null;
      }
    } catch (error) {
      console.error('Error loading game:', error);
      throw error;
    }
  }
  
  /**
   * Get all saved games for the current user
   * @returns {Promise<Array>} - Array of saved game metadata
   */
  async getSavedGames() {
    try {
      const userId = this.getUserId();
      
      // Query saved games for the current user
      const q = query(
        this.collections.savedGames,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      // Get the documents
      const querySnapshot = await getDocs(q);
      
      // Map to array of save data
      const savedGames = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        savedGames.push({
          id: doc.id,
          saveSlot: data.saveSlot,
          displayName: data.displayName,
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
        });
      });
      
      return savedGames;
    } catch (error) {
      console.error('Error getting saved games:', error);
      throw error;
    }
  }
  
  /**
   * Delete a saved game
   * @param {string} saveSlot - Save slot identifier
   * @returns {Promise<void>}
   */
  async deleteSavedGame(saveSlot) {
    try {
      const userId = this.getUserId();
      
      // Create a document reference with user ID and save slot
      const saveRef = doc(this.collections.savedGames, `${userId}_${saveSlot}`);
      
      // Delete the document
      await deleteDoc(saveRef);
      
      console.log(`Saved game in slot ${saveSlot} deleted`);
    } catch (error) {
      console.error('Error deleting saved game:', error);
      throw error;
    }
  }
  
  /**
   * Update game progress
   * @param {object} progress - Progress data to update
   * @returns {Promise<void>}
   */
  async updateGameProgress(progress) {
    try {
      const userId = this.getUserId();
      
      // Create a document reference for the user's progress
      const progressRef = doc(this.collections.gameProgress, userId);
      
      // Get current progress
      const progressDoc = await getDoc(progressRef);
      
      if (progressDoc.exists()) {
        // Update existing progress
        await updateDoc(progressRef, {
          ...progress,
          lastUpdated: serverTimestamp()
        });
      } else {
        // Create new progress document
        await setDoc(progressRef, {
          userId,
          ...progress,
          created: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
      }
      
      console.log('Game progress updated');
    } catch (error) {
      console.error('Error updating game progress:', error);
      throw error;
    }
  }
  
  /**
   * Get game progress
   * @returns {Promise<object|null>} - Game progress or null if not found
   */
  async getGameProgress() {
    try {
      const userId = this.getUserId();
      
      // Create a document reference for the user's progress
      const progressRef = doc(this.collections.gameProgress, userId);
      
      // Get the document
      const progressDoc = await getDoc(progressRef);
      
      if (progressDoc.exists()) {
        return progressDoc.data();
      } else {
        console.log('No game progress found');
        return null;
      }
    } catch (error) {
      console.error('Error getting game progress:', error);
      throw error;
    }
  }
  
  /**
   * Save user settings
   * @param {object} settings - User settings to save
   * @returns {Promise<void>}
   */
  async saveUserSettings(settings) {
    try {
      const userId = this.getUserId();
      
      // Create a document reference for the user's settings
      const settingsRef = doc(this.collections.userSettings, userId);
      
      // Save settings
      await setDoc(settingsRef, {
        userId,
        ...settings,
        lastUpdated: serverTimestamp()
      });
      
      console.log('User settings saved');
    } catch (error) {
      console.error('Error saving user settings:', error);
      throw error;
    }
  }
  
  /**
   * Get user settings
   * @returns {Promise<object|null>} - User settings or null if not found
   */
  async getUserSettings() {
    try {
      const userId = this.getUserId();
      
      // Create a document reference for the user's settings
      const settingsRef = doc(this.collections.userSettings, userId);
      
      // Get the document
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        return settingsDoc.data();
      } else {
        console.log('No user settings found');
        return null;
      }
    } catch (error) {
      console.error('Error getting user settings:', error);
      throw error;
    }
  }
  
  /**
   * Mark a story branch as completed
   * @param {string} branchId - Branch identifier
   * @returns {Promise<void>}
   */
  async markBranchCompleted(branchId) {
    try {
      const userId = this.getUserId();
      
      // Create a document reference for the completed branch
      const branchRef = doc(this.collections.completedBranches, `${userId}_${branchId}`);
      
      // Save branch completion
      await setDoc(branchRef, {
        userId,
        branchId,
        completedAt: serverTimestamp()
      });
      
      console.log(`Branch ${branchId} marked as completed`);
    } catch (error) {
      console.error('Error marking branch as completed:', error);
      throw error;
    }
  }
  
  /**
   * Check if a branch is completed
   * @param {string} branchId - Branch identifier
   * @returns {Promise<boolean>} - True if the branch is completed
   */
  async isBranchCompleted(branchId) {
    try {
      const userId = this.getUserId();
      
      // Create a document reference for the completed branch
      const branchRef = doc(this.collections.completedBranches, `${userId}_${branchId}`);
      
      // Get the document
      const branchDoc = await getDoc(branchRef);
      
      return branchDoc.exists();
    } catch (error) {
      console.error('Error checking if branch is completed:', error);
      throw error;
    }
  }
  
  /**
   * Get all completed branches
   * @returns {Promise<Array>} - Array of completed branch IDs
   */
  async getCompletedBranches() {
    try {
      const userId = this.getUserId();
      
      // Query completed branches for the current user
      const q = query(
        this.collections.completedBranches,
        where('userId', '==', userId)
      );
      
      // Get the documents
      const querySnapshot = await getDocs(q);
      
      // Map to array of branch IDs
      const branches = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        branches.push(data.branchId);
      });
      
      return branches;
    } catch (error) {
      console.error('Error getting completed branches:', error);
      throw error;
    }
  }
  
  /**
   * Unlock a choice
   * @param {string} choiceId - Choice identifier
   * @param {string} choiceText - Choice text
   * @returns {Promise<void>}
   */
  async unlockChoice(choiceId, choiceText) {
    try {
      const userId = this.getUserId();
      
      // Create a document reference for the unlocked choice
      const choiceRef = doc(this.collections.unlockedChoices, `${userId}_${choiceId}`);
      
      // Save unlocked choice
      await setDoc(choiceRef, {
        userId,
        choiceId,
        choiceText,
        unlockedAt: serverTimestamp()
      });
      
      console.log(`Choice ${choiceId} unlocked`);
    } catch (error) {
      console.error('Error unlocking choice:', error);
      throw error;
    }
  }
  
  /**
   * Check if a choice is unlocked
   * @param {string} choiceId - Choice identifier
   * @returns {Promise<boolean>} - True if the choice is unlocked
   */
  async isChoiceUnlocked(choiceId) {
    try {
      const userId = this.getUserId();
      
      // Create a document reference for the unlocked choice
      const choiceRef = doc(this.collections.unlockedChoices, `${userId}_${choiceId}`);
      
      // Get the document
      const choiceDoc = await getDoc(choiceRef);
      
      return choiceDoc.exists();
    } catch (error) {
      console.error('Error checking if choice is unlocked:', error);
      throw error;
    }
  }
  
  /**
   * Get all unlocked choices
   * @returns {Promise<Array>} - Array of unlocked choice objects
   */
  async getUnlockedChoices() {
    try {
      const userId = this.getUserId();
      
      // Query unlocked choices for the current user
      const q = query(
        this.collections.unlockedChoices,
        where('userId', '==', userId)
      );
      
      // Get the documents
      const querySnapshot = await getDocs(q);
      
      // Map to array of choice objects
      const choices = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        choices.push({
          id: data.choiceId,
          text: data.choiceText,
          unlockedAt: data.unlockedAt ? data.unlockedAt.toDate() : new Date()
        });
      });
      
      return choices;
    } catch (error) {
      console.error('Error getting unlocked choices:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const dataService = new DataService();
export default dataService;