import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabaseClient';
import { createUserIfNotExists } from './supabaseUtils';

interface AuthContextType {
  user: any | null;
  userId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any, user?: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userId: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for active session on component mount
    const checkSession = async () => {
      try {
        console.log('Checking for active session...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error checking session:', error);
          setUser(null);
          setUserId(null);
        } else if (session?.user) {
          console.log('Session found, user is logged in:', session.user);
          setUser(session.user);

          // Create or get user in our database
          if (session.user.email) {
            console.log('Creating or getting user in database with email:', session.user.email);
            const dbUserId = await createUserIfNotExists(
              session.user.id,
              session.user.email,
              session.user.user_metadata?.name,
              session.user.user_metadata?.avatar_url
            );
            console.log('User ID from database:', dbUserId);
            setUserId(dbUserId);
          } else {
            console.warn('User has no email in session:', session.user);
          }
        } else {
          console.log('No active session found, user is not logged in');
        }
      } catch (error) {
        console.error('Error in checkSession:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed, event:', event);

      if (session?.user) {
        console.log('User is now logged in:', session.user);
        setUser(session.user);

        // Create or get user in our database
        if (session.user.email) {
          console.log('Creating or getting user in database with email:', session.user.email);
          const dbUserId = await createUserIfNotExists(
            session.user.id,
            session.user.email,
            session.user.user_metadata?.name,
            session.user.user_metadata?.avatar_url
          );
          console.log('User ID from database:', dbUserId);
          setUserId(dbUserId);
        } else {
          console.warn('User has no email in session:', session.user);
        }
      } else {
        console.log('User is now logged out');
        setUser(null);
        setUserId(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      console.log('Signing up user with email:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      console.log('Sign up response:', { data, error });

      if (!error && data.user) {
        console.log('User signed up successfully, creating user in database');

        // Create user in our database
        const dbUserId = await createUserIfNotExists(
          data.user.id,
          email,
          name
        );

        console.log('Database user created with ID:', dbUserId);

        // Set the user and userId state immediately
        setUser(data.user);
        setUserId(dbUserId);

        // Force a session refresh to ensure the user is properly logged in
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('Current session after signup:', sessionData);
      } else if (error) {
        console.error('Error during sign up:', error);
      } else {
        console.warn('No error but user data is missing from sign up response');
      }

      return { error, user: data.user };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { error };
    }
  };

  const value = {
    user,
    userId,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
