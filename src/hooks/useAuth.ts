import { useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  AuthError
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      setLoading(false);
      return { data: { user: result.user }, error: null };
    } catch (error) {
      setLoading(false);
      const authError = error as AuthError;
      return { 
        data: null, 
        error: { 
          message: getFirebaseErrorMessage(authError.code),
          code: authError.code 
        } 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      return { data: { user: result.user }, error: null };
    } catch (error) {
      setLoading(false);
      const authError = error as AuthError;
      return { 
        data: null, 
        error: { 
          message: getFirebaseErrorMessage(authError.code),
          code: authError.code 
        } 
      };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setLoading(false);
      return { error: null };
    } catch (error) {
      setLoading(false);
      const authError = error as AuthError;
      return { 
        error: { 
          message: getFirebaseErrorMessage(authError.code),
          code: authError.code 
        } 
      };
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };
}

function getFirebaseErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'An error occurred. Please try again.';
  }
}