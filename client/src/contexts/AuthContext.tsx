import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { authAPI, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Verify token with backend and get user data
          const result = await authAPI.verifyToken(
            firebaseUser.uid,
            firebaseUser.email || '',
            firebaseUser.displayName || undefined
          );
          
          localStorage.setItem('access_token', result.access_token);
          setUser(result.user);
        } catch (error) {
          console.error('Error verifying token:', error);
          localStorage.removeItem('access_token');
          setUser(null);
        }
      } else {
        localStorage.removeItem('access_token');
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const { signIn } = await import('../services/firebase');
    await signIn(email, password);
    // Auth state change will handle the rest
  };

  const signup = async (email: string, password: string) => {
    const { signUp } = await import('../services/firebase');
    await signUp(email, password);
    // Auth state change will handle the rest
  };

  const logout = async () => {
    const { signOut } = await import('../services/firebase');
    await signOut();
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
