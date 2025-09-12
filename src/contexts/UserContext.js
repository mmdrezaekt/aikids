import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { createOrUpdateUser, getUserData, updateUserStats } from '../firebaseUtils';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Get or create user data in Firestore
        try {
          const userData = await getUserData(firebaseUser.uid);
          if (userData) {
            setUserData(userData);
            // Update last seen and visit count
            await createOrUpdateUser(firebaseUser.uid, {
              displayName: firebaseUser.displayName || 'Anonymous User',
              email: firebaseUser.email || null,
              photoURL: firebaseUser.photoURL || null,
              isAnonymous: firebaseUser.isAnonymous,
              deviceInfo: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                screenResolution: `${screen.width}x${screen.height}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
              }
            });
          } else {
            // Create new user
            const newUserData = {
              displayName: firebaseUser.displayName || 'Anonymous User',
              email: firebaseUser.email || null,
              photoURL: firebaseUser.photoURL || null,
              isAnonymous: firebaseUser.isAnonymous,
              deviceInfo: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                screenResolution: `${screen.width}x${screen.height}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
              }
            };
            await createOrUpdateUser(firebaseUser.uid, newUserData);
            setUserData({ id: firebaseUser.uid, ...newUserData });
          }
        } catch (error) {
          console.error('Error managing user data:', error);
        }
      } else {
        setUser(null);
        setUserData(null);
        // Sign in anonymously for new visitors
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error('Error signing in anonymously:', error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update user stats when content is created
  const updateStats = async (type) => {
    if (!user) return;
    
    try {
      const currentStats = userData || {};
      const newStats = {
        totalStories: type === 'story' ? (currentStats.totalStories || 0) + 1 : currentStats.totalStories || 0,
        totalChats: type === 'chat' ? (currentStats.totalChats || 0) + 1 : currentStats.totalChats || 0,
        totalImages: type === 'image' ? (currentStats.totalImages || 0) + 1 : currentStats.totalImages || 0,
      };
      
      await updateUserStats(user.uid, newStats);
      setUserData(prev => ({ ...prev, ...newStats }));
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  };

  const value = {
    user,
    userData,
    loading,
    updateStats
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
