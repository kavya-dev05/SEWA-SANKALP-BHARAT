import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDoc, setDoc } from 'firebase/firestore';

export type UserRole = 'donor' | 'ngo' | 'beneficiary';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  city?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, role: UserRole, city: string) => Promise<void>;
  loginWithGoogle: (role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebase, setFirebase] = useState<{auth: Auth, db: Firestore} | null>(null);

  useEffect(() => {
    fetch('/api/firebase-config')
      .then(res => res.json())
      .then(config => {
        const app = initializeApp(config);
        const auth = getAuth(app);
        const db = getFirestore(app);
        setFirebase({ auth, db });

        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              setUser(userDoc.data() as UserProfile);
            } else {
              setUser({ uid: firebaseUser.uid, email: firebaseUser.email || '', name: firebaseUser.displayName || 'User', role: 'donor' });
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      })
      .catch(err => {
        console.error("Failed to load Firebase config", err);
        setLoading(false);
      });
  }, []);

  const login = async (email: string, pass: string) => {
    if (!firebase) throw new Error("Firebase not initialized");
    await signInWithEmailAndPassword(firebase.auth, email, pass);
  };

  const register = async (name: string, email: string, pass: string, role: UserRole, city: string) => {
    if (!firebase) throw new Error("Firebase not initialized");
    const cred = await createUserWithEmailAndPassword(firebase.auth, email, pass);
    const userProfile: UserProfile = {
      uid: cred.user.uid,
      name,
      email,
      role,
      city,
    };
    await setDoc(doc(firebase.db, 'users', cred.user.uid), {
      ...userProfile,
      createdAt: new Date()
    });
    setUser(userProfile);
  };

  const loginWithGoogle = async (role: UserRole = 'donor') => {
    if (!firebase) throw new Error("Firebase not initialized");
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(firebase.auth, provider);
    
    const userDocRef = doc(firebase.db, 'users', cred.user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      const userProfile: UserProfile = {
        uid: cred.user.uid,
        name: cred.user.displayName || 'User',
        email: cred.user.email || '',
        role: role,
      };
      await setDoc(userDocRef, {
        ...userProfile,
        createdAt: new Date()
      });
      setUser(userProfile);
    } else {
      setUser(userDoc.data() as UserProfile);
    }
  };

  const logout = async () => {
    if (!firebase) return;
    await signOut(firebase.auth);
    setUser(null);
  };

  const getToken = async () => {
    if (!firebase || !firebase.auth.currentUser) return null;
    return await firebase.auth.currentUser.getIdToken();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
