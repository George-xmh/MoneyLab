import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, firebaseAuth } from '../services/firebase';
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
        // Set a timeout to ensure loading doesn't stay true forever
        const timeoutId = setTimeout(() => {
          console.warn('Token verification taking longer than expected');
          setLoading(false);
        }, 10000); // 10 second timeout

        try {
          // Verify token with backend and get user data
          const result = await authAPI.verifyToken(
            firebaseUser.uid,
            firebaseUser.email || '',
            firebaseUser.displayName || undefined
          );
          
          clearTimeout(timeoutId);
          
          // Store token securely
          if (result.access_token) {
            localStorage.setItem('access_token', result.access_token.trim());
            setUser(result.user);
          } else {
            console.error('No access token received from server');
            localStorage.removeItem('access_token');
            setUser(null);
          }
        } catch (error: any) {
          clearTimeout(timeoutId);
          console.error('Error verifying token:', error);
          console.error('Error details:', error.response?.data || error.message);
          // Don't clear the token if it's a network error - might be temporary
          if (error.response?.status === 401 || error.response?.status === 422) {
            localStorage.removeItem('access_token');
            setUser(null);
          } else {
            // For other errors, still try to set user from Firebase
            // The token might still be valid
            console.warn('Non-auth error during token verification, keeping Firebase user');
          }
        } finally {
          setLoading(false);
        }
      } else {
        localStorage.removeItem('access_token');
        setUser(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await firebaseAuth.signIn(email, password);
    // Auth state change will handle the rest
  };

  const signup = async (email: string, password: string) => {
    await firebaseAuth.signUp(email, password);
    // Auth state change will handle the rest
  };

  const logout = async () => {
    await firebaseAuth.signOut();
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
