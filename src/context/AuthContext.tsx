import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { apiUrl } from '../lib/api';
import localFirebaseConfig from '../../firebase-applet-config.json';

import { initializeApp, FirebaseApp, getApp, getApps } from 'firebase/app';

import {
  getAuth,
  Auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';

import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

export type UserRole = 'donor' | 'ngo';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  city?: string;
  orgName?: string;
  orgType?: string;
  orgRegNumber?: string;
  isVerified?: boolean;
  verificationStatus?: VerificationStatus;
  verificationRejectedReason?: string;
  isAdmin?: boolean;
  createdAt?: any;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    pass: string,
    role: UserRole,
    city: string,
    ngoExtra?: {
      orgName: string;
      orgType: string;
      orgRegNumber: string;
    }
  ) => Promise<void>;
  loginWithGoogle: (role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  refreshUser: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function initFirebaseClient(customConfig?: any) {
  const config = customConfig || localFirebaseConfig;
  const app: FirebaseApp = getApps().length
    ? getApp()
    : initializeApp(config);

  return {
    auth: getAuth(app),
    db: getFirestore(app),
  };
}

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize immediately with bundled config so Firebase is never null
  const [firebase, setFirebase] = useState<{
    auth: Auth;
    db: Firestore;
  }>(() => initFirebaseClient());

  useEffect(() => {
    let active = true;

    // Optional background check for dynamic config from backend
    fetch(apiUrl('/api/firebase-config'))
      .then((res) => (res.ok ? res.json() : null))
      .then((remoteConfig) => {
        if (
          remoteConfig &&
          remoteConfig.apiKey &&
          remoteConfig.apiKey !== localFirebaseConfig.apiKey
        ) {
          const dynamicClient = initFirebaseClient(remoteConfig);
          if (active) setFirebase(dynamicClient);
        }
      })
      .catch(() => {
        // Fallback to bundled localFirebaseConfig (already initialized)
      });

    const unsubscribe = onAuthStateChanged(
      firebase.auth,
      async (firebaseUser) => {
        try {
          if (!firebaseUser) {
            if (active) setUser(null);
            return;
          }

          // Try fetching full profile from Firestore
          try {
            const userDoc = await getDoc(
              doc(firebase.db, 'users', firebaseUser.uid)
            );

            if (!active) return;

            if (userDoc.exists()) {
              setUser(userDoc.data() as UserProfile);
              return;
            }
          } catch (firestoreErr) {
            console.warn(
              'Firestore profile fetch note (check Firestore rules):',
              firestoreErr
            );
          }

          // Graceful fallback profile from Firebase Auth user
          if (active) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'User',
              role: 'donor',
            });
          }
        } catch (error) {
          console.error('Firebase auth state processing error:', error);
          if (active) setUser(null);
        } finally {
          if (active) setLoading(false);
        }
      },
      (error) => {
        console.error('Firebase auth state error:', error);
        if (active) {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [firebase.auth, firebase.db]);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(firebase.auth, email, pass);
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    role: UserRole,
    city: string,
    ngoExtra?: {
      orgName: string;
      orgType: string;
      orgRegNumber: string;
    }
  ) => {
    const cred = await createUserWithEmailAndPassword(
      firebase.auth,
      email,
      pass
    );

    const userProfile: UserProfile = {
      uid: cred.user.uid,
      name,
      email,
      role,
      city,
      ...(role === 'ngo' && ngoExtra
        ? {
            orgName: ngoExtra.orgName,
            orgType: ngoExtra.orgType,
            orgRegNumber: ngoExtra.orgRegNumber,
            isVerified: false,
            verificationStatus: 'pending' as VerificationStatus,
          }
        : {}),
    };

    try {
      await setDoc(doc(firebase.db, 'users', cred.user.uid), {
        ...userProfile,
        createdAt: new Date(),
      });
    } catch (err) {
      console.warn('Failed to write profile to Firestore (check security rules):', err);
    }

    setUser(userProfile);
  };

  const loginWithGoogle = async (role: UserRole = 'donor') => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const cred = await signInWithPopup(firebase.auth, provider);

    const fallbackProfile: UserProfile = {
      uid: cred.user.uid,
      name: cred.user.displayName || 'User',
      email: cred.user.email || '',
      role,
    };

    const userDocRef = doc(firebase.db, 'users', cred.user.uid);

    try {
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUser(userDoc.data() as UserProfile);
        return;
      }

      await setDoc(userDocRef, {
        ...fallbackProfile,
        createdAt: new Date(),
      });

      setUser(fallbackProfile);
    } catch (error) {
      console.warn(
        'Google sign-in succeeded, but Firestore profile access failed (check Firestore rules):',
        error
      );
      // Fallback so user is not blocked
      setUser(fallbackProfile);
    }
  };

  const logout = async () => {
    await signOut(firebase.auth);
    setUser(null);
  };

  const getToken = async (): Promise<string | null> => {
    if (!firebase.auth.currentUser) return null;
    return firebase.auth.currentUser.getIdToken();
  };

  const refreshUser = async () => {
    if (!firebase.auth.currentUser) return;

    const currentUser = firebase.auth.currentUser;

    try {
      const userDoc = await getDoc(
        doc(firebase.db, 'users', currentUser.uid)
      );

      if (userDoc.exists()) {
        setUser(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(firebase.auth, email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        getToken,
        refreshUser,
        sendPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
