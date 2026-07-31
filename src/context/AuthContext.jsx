/**
 * File: AuthContext.jsx
 * Description: Context provider for customer and administrator sessions, including Firebase Auth status tracking and device session concurrency limits.
 * Work Done: Secured user password handling by eliminating plain-text writes to the database. Added a fallback search logic using emails to successfully authenticate admins having random auto-generated document IDs. Fixed a race condition where logouts triggered a session-terminated alert by converting the listener to a persistent React Ref.
 */

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, addDoc, setDoc, collection, query, where, getDocs, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem('superadmin_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('superadmin_device_id', deviceId);
  }
  return deviceId;
};

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
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(null);

  const authStateRef = useRef({ user: null, adminRole: null });
  const sessionUnsubscribeRef = useRef(null);
  useEffect(() => {
    authStateRef.current = { user, adminRole };
  }, [user, adminRole]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (sessionUnsubscribeRef.current) {
        sessionUnsubscribeRef.current();
        sessionUnsubscribeRef.current = null;
      }

      if (currentUser) {
        const cached = authStateRef.current;
        if (cached.user && cached.user.uid === currentUser.uid && cached.adminRole !== null) {
          setUser(currentUser);
          setLoading(false);
          return;
        }

        try {
          const docRef = doc(db, 'admins', currentUser.uid);
          const docSnap = await getDoc(docRef);
          let adminData = null;
          
          if (docSnap.exists()) {
            adminData = docSnap.data();
          } else {
            // Fallback for existing admins whose document ID is not their auth UID
            const q = query(collection(db, 'admins'), where('email', '==', currentUser.email.toLowerCase()));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              adminData = snapshot.docs[0].data();
            }
          }
          
          if (adminData) {
            if (adminData.status === 'Active') {
              if (adminData.role === 'Super Admin') {
                const deviceId = getOrCreateDeviceId();
                const sessionDocId = `${currentUser.email.toLowerCase()}_${deviceId}`;
                const sessionRef = doc(db, 'superadmin_sessions', sessionDocId);

                // Fetch current device session state
                const sessionSnap = await getDoc(sessionRef);
                const sessionData = sessionSnap.exists() ? sessionSnap.data() : null;

                if (sessionData && sessionData.is_active) {
                  // Already active session. Just update last_activity
                  await updateDoc(sessionRef, { last_activity: serverTimestamp() });
                } else {
                  // Perform session cleanup first and count active ones
                  const now = Date.now();
                  const thirtyMinsAgo = new Date(now - 30 * 60 * 1000);

                  const sessionsQ = query(
                    collection(db, 'superadmin_sessions'),
                    where('superadmin_id', '==', currentUser.email.toLowerCase()),
                    where('is_active', '==', true)
                  );
                  const sessionsSnapshot = await getDocs(sessionsQ);
                  
                  let activeCount = 0;
                  for (const docSnap of sessionsSnapshot.docs) {
                    if (docSnap.id === sessionDocId) continue;
                    const data = docSnap.data();
                    
                    if (data.last_activity) {
                      const lastActivity = data.last_activity.toDate ? data.last_activity.toDate() : new Date(data.last_activity);
                      if (lastActivity < thirtyMinsAgo) {
                        await updateDoc(doc(db, 'superadmin_sessions', docSnap.id), { is_active: false });
                      } else {
                        activeCount++;
                      }
                    } else {
                      activeCount++;
                    }
                  }

                  if (activeCount >= 3) {
                    setSessionError("Maximum 3 devices can be logged in simultaneously.");
                    await signOut(auth);
                    setIsAdmin(false);
                    setAdminRole(null);
                    setUser(null);
                    setLoading(false);
                    return;
                  }

                  // Establish/register active session
                  let ipAddress = 'Unknown';
                  try {
                    const ipRes = await fetch('https://api.ipify.org?format=json');
                    const ipData = await ipRes.json();
                    ipAddress = ipData.ip || 'Unknown';
                  } catch (e) {
                  }

                  await setDoc(sessionRef, {
                    id: sessionDocId,
                    superadmin_id: currentUser.email.toLowerCase(),
                    device_id: deviceId,
                    login_time: serverTimestamp(),
                    last_activity: serverTimestamp(),
                    is_active: true,
                    ip_address: ipAddress,
                    browser_info: navigator.userAgent
                  });
                }

                // Subscribe to real-time session changes for force-logout capability
                sessionUnsubscribeRef.current = onSnapshot(sessionRef, async (docSnap) => {
                  if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (!data.is_active) {
                      toast.error("Session terminated or expired.");
                      await signOut(auth);
                    }
                  }
                });
              }

              setIsAdmin(true);
              setAdminRole(adminData.role);
              setIsEcommerceAdmin(!!adminData.isEcommerceAdmin);
              setIsOfflineStoreAdmin(!!adminData.isOfflineStoreAdmin);
              setSessionError(null);
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
    return () => {
      unsubscribe();
      if (sessionUnsubscribeRef.current) {
        sessionUnsubscribeRef.current();
        sessionUnsubscribeRef.current = null;
      }
    };
  }, []);

  // Inactivity / Activity Heartbeat: update last_activity every 2 minutes
  useEffect(() => {
    if (!user || adminRole !== 'Super Admin') return;

    const deviceId = getOrCreateDeviceId();
    const sessionDocId = `${user.email.toLowerCase()}_${deviceId}`;
    const sessionRef = doc(db, 'superadmin_sessions', sessionDocId);

    const interval = setInterval(async () => {
      try {
        await updateDoc(sessionRef, { last_activity: serverTimestamp() });
      } catch (error) {
      }
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, adminRole]);

  const login = async (email, password, isAdminLogin = false) => {
    try {
      setSessionError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = result.user;

      // Check if user is an admin
      const q = query(collection(db, 'admins'), where('email', '==', currentUser.email.toLowerCase()));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const adminData = snapshot.docs[0].data();
        
        // If logging in through user login page but user is an admin
        if (!isAdminLogin) {
          await signOut(auth);
          const err = new Error("Please use user login for login as user.");
          err.code = "auth/admin-use-admin-login";
          throw err;
        }

        // Admin logging in through admin login page
        if (adminData.status !== 'Active') {
          await signOut(auth);
          const err = new Error("Your admin account is not active. Please contact support.");
          err.code = "auth/admin-inactive";
          throw err;
        }

        if (adminData.role === 'Super Admin') {
          const deviceId = getOrCreateDeviceId();
          const sessionDocId = `${currentUser.email.toLowerCase()}_${deviceId}`;

          const now = Date.now();
          const thirtyMinsAgo = new Date(now - 30 * 60 * 1000);

          const sessionsQ = query(
            collection(db, 'superadmin_sessions'),
            where('superadmin_id', '==', currentUser.email.toLowerCase()),
            where('is_active', '==', true)
          );
          const sessionsSnapshot = await getDocs(sessionsQ);
          
          let activeCount = 0;
          let hasCurrentDeviceSession = false;

          for (const docSnap of sessionsSnapshot.docs) {
            const data = docSnap.data();
            
            if (data.last_activity) {
              const lastActivity = data.last_activity.toDate ? data.last_activity.toDate() : new Date(data.last_activity);
              if (lastActivity < thirtyMinsAgo) {
                await updateDoc(doc(db, 'superadmin_sessions', docSnap.id), { is_active: false });
              } else {
                activeCount++;
                if (data.device_id === deviceId) {
                  hasCurrentDeviceSession = true;
                }
              }
            } else {
              activeCount++;
              if (data.device_id === deviceId) {
                hasCurrentDeviceSession = true;
              }
            }
          }

          if (!hasCurrentDeviceSession && activeCount >= 3) {
            await signOut(auth);
            const err = new Error("Maximum 3 devices can be logged in simultaneously.");
            err.code = "auth/max-devices-exceeded";
            throw err;
          }
        }
      } else {
        // Not an admin, so check if they're a regular user
        if (isAdminLogin) {
          await signOut(auth);
          const err = new Error("This is not an admin account. Please use the user login page.");
          err.code = "auth/user-use-user-login";
          throw err;
        }

        // Check if user is active in Firestore users collection
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.status === 'Inactive') {
            await signOut(auth);
            const err = new Error("Your account has been deactivated. Please contact support.");
            err.code = "auth/user-inactive";
            throw err;
          }
        }
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email, password, displayName, mobile) => {
    try {
      // 1. Create User in Firebase Authentication
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // 2. Update Auth Profile
      await updateProfile(user, { displayName });

      // 3. Create User Document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: displayName,
        email: email.includes('@mayasindhu.user') ? '' : email,
        mobile: mobile || '',
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

      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    if (sessionUnsubscribeRef.current) {
      sessionUnsubscribeRef.current();
      sessionUnsubscribeRef.current = null;
    }
    if (user && adminRole === 'Super Admin') {
      try {
        const deviceId = getOrCreateDeviceId();
        const sessionDocId = `${user.email.toLowerCase()}_${deviceId}`;
        await updateDoc(doc(db, 'superadmin_sessions', sessionDocId), { is_active: false });
      } catch (error) {
      }
    }
    await signOut(auth);
    toast.success("Logged out successfully.");
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
    logout,
    isLoginModalOpen,
    setLoginModalOpen,
    sessionError,
    setSessionError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
