import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState(null);
  const [isEcommerceAdmin, setIsEcommerceAdmin] = useState(false);
  const [isOfflineStoreAdmin, setIsOfflineStoreAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const q = query(collection(db, 'admins'), where('email', '==', currentUser.email.toLowerCase()));
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            const adminData = snapshot.docs[0].data();
            if (adminData.status === 'Active') {
              setIsAdmin(true);
              setAdminRole(adminData.role);
              setIsEcommerceAdmin(!!adminData.isEcommerceAdmin);
              setIsOfflineStoreAdmin(!!adminData.isOfflineStoreAdmin);
            } else {
              setIsAdmin(false);
              setAdminRole(null);
              setIsEcommerceAdmin(false);
              setIsOfflineStoreAdmin(false);
            }
          } else {
            setIsAdmin(false);
            setAdminRole(null);
            setIsEcommerceAdmin(false);
            setIsOfflineStoreAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching admin status in Context:", error);
        }
      } else {
        setIsAdmin(false);
        setAdminRole(null);
        setIsEcommerceAdmin(false);
        setIsOfflineStoreAdmin(false);
      }
      
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

      // 4. Create Admin Notification
      await addDoc(collection(db, "notifications"), {
        type: 'user',
        uid: user.uid,
        message: `New user joined: ${displayName}`,
        createdAt: serverTimestamp(),
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
    isAdmin,
    adminRole,
    isEcommerceAdmin,
    isOfflineStoreAdmin,
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
