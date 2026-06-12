'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, IS_MOCK } from '../../lib/firebase';

export interface UserSession {
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: any;
}

interface AuthContextType {
  user: UserSession | null;
  firebaseUser: FirebaseUser | null;
  role: 'user' | 'admin' | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserSession>;
  loginAdmin: (email: string, password: string) => Promise<UserSession>;
  signup: (name: string, email: string, password: string) => Promise<UserSession>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_SIMULATED_USERS = [
  {
    uid: 'admin-uid-123',
    email: 'admin@auraai.com',
    password: 'password',
    name: 'Aura Admin',
    role: 'admin' as const,
    createdAt: new Date().toISOString()
  },
  {
    uid: 'user-uid-456',
    email: 'user@auraai.com',
    password: 'password',
    name: 'Rhea Sharma',
    role: 'user' as const,
    createdAt: new Date().toISOString()
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Simulated Mode DB
  useEffect(() => {
    if (IS_MOCK) {
      const existing = localStorage.getItem('aura_mock_users');
      if (!existing) {
        localStorage.setItem('aura_mock_users', JSON.stringify(DEFAULT_SIMULATED_USERS));
      }

      // Check for active session
      const activeSession = localStorage.getItem('aura_active_session');
      if (activeSession) {
        const parsed = JSON.parse(activeSession) as UserSession;
        setUser(parsed);
        setRole(parsed.role);
      }
      setLoading(false);
    } else {
      // Real Firebase setup
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
          try {
            const userDocRef = doc(db, 'users', fbUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const data = userDoc.data();
              const session: UserSession = {
                uid: fbUser.uid,
                name: data.name || fbUser.displayName || 'Aura User',
                email: fbUser.email || '',
                role: data.role === 'admin' ? 'admin' : 'user',
                createdAt: data.createdAt
              };
              setUser(session);
              setRole(session.role);
            } else {
              // Graceful fallback if user exists in Auth but not Firestore
              const defaultRole = fbUser.email === 'admin@auraai.com' ? 'admin' : 'user';
              const session: UserSession = {
                uid: fbUser.uid,
                name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Aura User',
                email: fbUser.email || '',
                role: defaultRole
              };
              setUser(session);
              setRole(session.role);

              // Auto-create document to be safe
              await setDoc(userDocRef, {
                uid: session.uid,
                name: session.name,
                email: session.email,
                role: session.role,
                createdAt: serverTimestamp()
              });
            }
          } catch (err) {
            console.error('Error fetching user document:', err);
            // Default on error
            setUser({
              uid: fbUser.uid,
              name: fbUser.email?.split('@')[0] || 'User',
              email: fbUser.email || '',
              role: fbUser.email === 'admin@auraai.com' ? 'admin' : 'user'
            });
            setRole(fbUser.email === 'admin@auraai.com' ? 'admin' : 'user');
          }
        } else {
          setUser(null);
          setRole(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, []);

  // Login for user portal
  const login = async (emailInput: string, passwordInput: string): Promise<UserSession> => {
    setError(null);
    if (IS_MOCK) {
      const mockUsers = JSON.parse(localStorage.getItem('aura_mock_users') || '[]');
      const found = mockUsers.find(
        (u: any) => u.email.toLowerCase() === emailInput.toLowerCase() && u.password === passwordInput
      );

      if (found) {
        const session: UserSession = {
          uid: found.uid,
          name: found.name,
          email: found.email,
          role: found.role
        };
        localStorage.setItem('aura_active_session', JSON.stringify(session));
        setUser(session);
        setRole(session.role);
        return session;
      } else {
        throw new Error('Invalid email or password.');
      }
    } else {
      const result = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      const data = userDoc.data();
      return {
        uid: result.user.uid,
        name: data?.name || result.user.displayName || 'Aura User',
        email: result.user.email || '',
        role: data?.role === 'admin' ? 'admin' : 'user'
      };
    }
  };

  // Login for admin portal
  const loginAdmin = async (emailInput: string, passwordInput: string): Promise<UserSession> => {
    setError(null);
    if (IS_MOCK) {
      const mockUsers = JSON.parse(localStorage.getItem('aura_mock_users') || '[]');
      const found = mockUsers.find(
        (u: any) => u.email.toLowerCase() === emailInput.toLowerCase() && u.password === passwordInput
      );

      if (found) {
        if (found.role !== 'admin') {
          throw new Error('Unauthorized Access');
        }
        const session: UserSession = {
          uid: found.uid,
          name: found.name,
          email: found.email,
          role: 'admin'
        };
        localStorage.setItem('aura_active_session', JSON.stringify(session));
        setUser(session);
        setRole('admin');
        return session;
      } else {
        throw new Error('Invalid email or password.');
      }
    } else {
      // Login with credentials
      const result = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
      // Immediately check role in Firestore before granting entry
      const docSnap = await getDoc(doc(db, 'users', result.user.uid));
      const roleField = docSnap.data()?.role;

      if (roleField !== 'admin' && result.user.email !== 'admin@auraai.com') {
        await firebaseSignOut(auth);
        throw new Error('Unauthorized Access');
      }

      return {
        uid: result.user.uid,
        name: docSnap.data()?.name || 'Admin',
        email: result.user.email || '',
        role: 'admin'
      };
    }
  };

  // Sign up for user portal
  const signup = async (nameInput: string, emailInput: string, passwordInput: string): Promise<UserSession> => {
    setError(null);
    if (IS_MOCK) {
      const mockUsers = JSON.parse(localStorage.getItem('aura_mock_users') || '[]');
      const taken = mockUsers.some((u: any) => u.email.toLowerCase() === emailInput.toLowerCase());
      if (taken) {
        throw new Error('Email already registered.');
      }

      const newUser = {
        uid: 'user-' + Date.now(),
        email: emailInput,
        password: passwordInput,
        name: nameInput,
        role: 'user' as const,
        createdAt: new Date().toISOString()
      };

      mockUsers.push(newUser);
      localStorage.setItem('aura_mock_users', JSON.stringify(mockUsers));

      const session: UserSession = {
        uid: newUser.uid,
        name: newUser.name,
        email: newUser.email,
        role: 'user'
      };
      localStorage.setItem('aura_active_session', JSON.stringify(session));
      setUser(session);
      setRole('user');
      return session;
    } else {
      const result = await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        name: nameInput,
        email: emailInput,
        role: 'user',
        createdAt: serverTimestamp()
      });

      return {
        uid: result.user.uid,
        name: nameInput,
        email: emailInput,
        role: 'user'
      };
    }
  };

  // Logout
  const logout = async () => {
    if (IS_MOCK) {
      localStorage.removeItem('aura_active_session');
      setUser(null);
      setRole(null);
    } else {
      await firebaseSignOut(auth);
      setUser(null);
      setRole(null);
    }
  };

  // Password Reset
  const resetPassword = async (emailInput: string) => {
    setError(null);
    if (IS_MOCK) {
      const mockUsers = JSON.parse(localStorage.getItem('aura_mock_users') || '[]');
      const exists = mockUsers.some((u: any) => u.email.toLowerCase() === emailInput.toLowerCase());
      if (!exists) {
        throw new Error('Email address not registered.');
      }
      return; // Mock success
    } else {
      await sendPasswordResetEmail(auth, emailInput);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        role,
        loading,
        login,
        loginAdmin,
        signup,
        logout,
        resetPassword,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
