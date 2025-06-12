import { useState, useEffect } from 'react';

const VALID_EMAIL = 'pasham@yash.com';
const VALID_PASSWORD = 'pasham@6969';
const AUTH_KEY = 'trading-journal-auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const authData = localStorage.getItem(AUTH_KEY);
    if (authData) {
      try {
        const { email, timestamp } = JSON.parse(authData);
        // Check if session is still valid (24 hours)
        const isValid = email === VALID_EMAIL && 
                       Date.now() - timestamp < 24 * 60 * 60 * 1000;
        
        if (isValid) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(AUTH_KEY);
        }
      } catch (err) {
        localStorage.removeItem(AUTH_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (email === VALID_EMAIL && password === VALID_PASSWORD) {
        // Store authentication data
        const authData = {
          email,
          timestamp: Date.now()
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
        setIsAuthenticated(true);
        return true;
      } else {
        setError('Invalid email or password');
        return false;
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setError(null);
  };

  return {
    isAuthenticated,
    loading,
    error,
    login,
    logout
  };
}