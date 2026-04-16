import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';

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
      console.log("Auth State Changed: ", currentUser ? `Logged in as ${currentUser.email}` : "Logged out");
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    console.log("Attempting login for:", email);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful!");
      return result;
    } catch (error) {
      console.error("Firebase Login Error Code:", error.code);
      console.error("Firebase Login Error Message:", error.message);
      throw error;
    }
  };

  const signup = async (email, password, displayName) => {
    console.log("Attempting signup for:", email);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      console.log("Signup successful!");
      return result;
    } catch (error) {
      console.error("Firebase Signup Error Code:", error.code);
      throw error;
    }
  };

  const logout = () => {
    console.log("Logging out...");
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
