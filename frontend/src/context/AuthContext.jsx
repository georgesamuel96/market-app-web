import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Simple session storage key
const SESSION_KEY = 'dashboard_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing session on mount
    checkSession();
  }, []);

  const checkSession = () => {
    try {
      const savedUser = sessionStorage.getItem(SESSION_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error('Error checking session:', err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      // Query the users table to find user by email
      const { data: users, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .limit(1);

      if (queryError) throw queryError;

      // Check if user exists
      if (!users || users.length === 0) {
        throw new Error('This email is not registered. Please check your email.');
      }

      const foundUser = users[0];

      // Check password (assuming you store plain text or hashed)
      // Note: For production, you should use proper password hashing
      if (foundUser.password !== password) {
        throw new Error('Invalid password. Please try again.');
      }

      // Check if user is admin
      if (foundUser.role !== 'admin') {
        throw new Error('This email is not registered as an admin. Access denied.');
      }

      // Create session user object (without password)
      const sessionUser = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name || foundUser.full_name || foundUser.username || email,
        role: foundUser.role,
      };

      // Save to session storage
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      setUser(sessionUser);

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
    setError(null);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    userProfile: user, // Alias for compatibility
    loading,
    error,
    signIn,
    signOut,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
