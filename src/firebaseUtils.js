import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  where,
  serverTimestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';

// Collections
const STORIES_COLLECTION = 'stories';
const CHATS_COLLECTION = 'chats';
const IMAGES_COLLECTION = 'images';
const USERS_COLLECTION = 'users';

// Story operations
export const saveStoryToFirebase = async (storyData) => {
  try {
    const docRef = await addDoc(collection(db, STORIES_COLLECTION), {
      ...storyData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('Story saved to Firebase with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving story to Firebase:', error);
    throw error;
  }
};

export const getStoriesFromFirebase = async (limitCount = 50) => {
  try {
    const q = query(
      collection(db, STORIES_COLLECTION), 
      orderBy('createdAt', 'desc'), 
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const stories = [];
    querySnapshot.forEach((doc) => {
      stories.push({ id: doc.id, ...doc.data() });
    });
    return stories;
  } catch (error) {
    console.error('Error getting stories from Firebase:', error);
    throw error;
  }
};

// Chat operations
export const saveChatToFirebase = async (chatData) => {
  try {
    const docRef = await addDoc(collection(db, CHATS_COLLECTION), {
      ...chatData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('Chat saved to Firebase with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving chat to Firebase:', error);
    throw error;
  }
};

export const getChatsFromFirebase = async (limitCount = 50) => {
  try {
    const q = query(
      collection(db, CHATS_COLLECTION), 
      orderBy('createdAt', 'desc'), 
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const chats = [];
    querySnapshot.forEach((doc) => {
      chats.push({ id: doc.id, ...doc.data() });
    });
    return chats;
  } catch (error) {
    console.error('Error getting chats from Firebase:', error);
    throw error;
  }
};

// Image operations
export const saveImageToFirebase = async (imageData) => {
  try {
    const docRef = await addDoc(collection(db, IMAGES_COLLECTION), {
      ...imageData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('Image saved to Firebase with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving image to Firebase:', error);
    throw error;
  }
};

export const getImagesFromFirebase = async (limitCount = 50) => {
  try {
    const q = query(
      collection(db, IMAGES_COLLECTION), 
      orderBy('createdAt', 'desc'), 
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const images = [];
    querySnapshot.forEach((doc) => {
      images.push({ id: doc.id, ...doc.data() });
    });
    return images;
  } catch (error) {
    console.error('Error getting images from Firebase:', error);
    throw error;
  }
};

// User operations
export const createOrUpdateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      // User exists, update last seen
      await updateDoc(userRef, {
        ...userData,
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp(),
        visitCount: (userSnap.data().visitCount || 0) + 1
      });
      console.log('User updated in Firebase:', userId);
    } else {
      // User doesn't exist, create new user
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        visitCount: 1,
        totalStories: 0,
        totalChats: 0,
        totalImages: 0,
        isActive: true
      });
      console.log('New user created in Firebase:', userId);
    }
    return userId;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};

export const getUserData = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userId, ...userSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

export const updateUserStats = async (userId, stats) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...stats,
      updatedAt: serverTimestamp()
    });
    console.log('User stats updated:', userId);
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

export const getAllUsers = async (limitCount = 100) => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION), 
      orderBy('createdAt', 'desc'), 
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error('Error getting users from Firebase:', error);
    throw error;
  }
};

// Generic operations
export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    console.log('Document deleted successfully');
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

export const updateDocument = async (collectionName, docId, updateData) => {
  try {
    await updateDoc(doc(db, collectionName, docId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    console.log('Document updated successfully');
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};
