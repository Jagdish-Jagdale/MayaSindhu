import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email, password, displayName) => {
    try {
      // 1. Create User in Firebase Authentication
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // 2. Update Auth Profile
      await updateProfile(user, { displayName });

      // 3. Create User Document in Firestore
      console.log("Creating Firestore profile for UID:", user.uid);
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: displayName,
        email: email,
        password: password, // Included per user request (Note: Plain text storage)
        role: "user",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("Signup and Firestore Profile Created Successfully!");
      return result;
    } catch (error) {
      console.error("Firebase Signup/Firestore Error Code:", error.code);
      console.error("Full Error:", error);
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
