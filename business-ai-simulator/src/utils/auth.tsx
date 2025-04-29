import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabaseClient';
import { createUserIfNotExists } from './supabaseUtils';

interface AuthContextType {
  user: any | null;
  userId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any, user?: any, userId?: string | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any, user?: any, userId?: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userId: null,
  loading: true,
  signIn: async () => ({ error: null, user: null, userId: null }),
  signUp: async () => ({ error: null, user: null, dbUserId: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
  refreshSession: async () => {},
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
      console.log('Signing in user with email:', email);

      // Clear any existing localStorage data
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('temp_user_id');
        window.localStorage.removeItem('login_refresh_attempts');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Sign in response:', {
        user: data?.user ? 'User exists' : 'No user',
        session: data?.session ? 'Session exists' : 'No session',
        error: error ? error.message : 'No error'
      });

      if (!error && data.user) {
        console.log('User signed in successfully, updating state');

        // Set the user state immediately
        setUser(data.user);

        try {
          // Create or get user in database
          if (data.user.email) {
            console.log('Getting or creating user in database with email:', data.user.email);
            const dbUserId = await createUserIfNotExists(
              data.user.id,
              data.user.email,
              data.user.user_metadata?.name,
              data.user.user_metadata?.avatar_url
            );

            console.log('User ID from database after sign in:', dbUserId);

            // Store the user ID in localStorage as a backup
            if (typeof window !== 'undefined' && dbUserId) {
              window.localStorage.setItem('temp_user_id', dbUserId);
            }

            setUserId(dbUserId);
          }
        } catch (dbError) {
          console.error('Error creating/getting user in database:', dbError);
        }

        // Force a session refresh to ensure everything is up to date
        try {
          await refreshSession();
        } catch (refreshError) {
          console.error('Error refreshing session after sign in:', refreshError);
        }

        // Use the userId that was set in the try block
        return { error: null, user: data.user, userId };
      }

      return { error, user: data?.user, userId: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error, user: null, userId: null };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      console.log('Signing up user with email:', email);

      // First, sign out any existing user to prevent conflicts
      try {
        await supabase.auth.signOut();
        console.log('Successfully signed out existing user');
      } catch (signOutError) {
        console.error('Error signing out existing user:', signOutError);
        // Continue with signup even if signout fails
      }

      // Clear local state
      setUser(null);
      setUserId(null);

      // Now sign up the new user with minimal options to ensure compatibility
      console.log('Attempting to sign up user with Supabase');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          // Set emailRedirectTo to ensure proper redirect after email verification
          emailRedirectTo: typeof window !== 'undefined'
            ? `${window.location.origin}/login`
            : 'https://business-ai-simulator.vercel.app/login',
        },
      });

      console.log('Sign up response:', {
        user: data?.user ? 'User exists' : 'No user',
        session: data?.session ? 'Session exists' : 'No session',
        error: error ? error.message : 'No error'
      });

      // Handle error case first
      if (error) {
        console.error('Error during sign up:', error);
        return { error, user: null, userId: null };
      }

      // Handle missing user data
      if (!data || !data.user) {
        console.warn('No user data returned from sign up');
        return {
          error: new Error('No user data returned from sign up'),
          user: null,
          userId: null
        };
      }

      // User signed up successfully
      console.log('User signed up successfully with ID:', data.user.id);

      // Check if email confirmation is required
      if (data.user.identities && data.user.identities.length === 0) {
        console.log('Email confirmation required. User should check their email.');
        return {
          error: {
            message: 'Please check your email to confirm your account before logging in.'
          },
          user: data.user,
          userId: null
        };
      }

      // Only try to create the database user if we have a session
      // This means the user is already confirmed or confirmation is not required
      let dbUserId = null;

      if (data.session) {
        console.log('User has active session, creating user in database');

        // Try to create user in database
        try {
          dbUserId = await createUserIfNotExists(
            data.user.id,
            email,
            name
          );

          if (dbUserId) {
            console.log('Database user created with ID:', dbUserId);

            // Store the user ID in localStorage as a backup
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('temp_user_id', dbUserId);
            }

            // Set the user and userId state
            setUser(data.user);
            setUserId(dbUserId);
          } else {
            console.error('Failed to create user in database: No ID returned');

            // Try API fallback
            dbUserId = await tryApiUserCreation(email, name, data.user.id);
          }
        } catch (dbError) {
          console.error('Error creating user in database:', dbError);

          // Try API fallback
          dbUserId = await tryApiUserCreation(email, name, data.user.id);
        }
      } else {
        console.log('No active session after signup, user may need to confirm email');
      }

      // Return success even if database creation fails
      return {
        error: null,
        user: data.user,
        userId: dbUserId // Include the database user ID in the response with the correct property name
      };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error, user: null, userId: null };
    }
  };

  // Helper function to try creating a user via the API
  const tryApiUserCreation = async (email: string, name?: string, auth0Id?: string): Promise<string | null> => {
    try {
      console.log('Trying direct API call to create user');
      const response = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          auth0_id: auth0Id
        }),
      });

      const apiData = await response.json();
      console.log('API response for user creation:', apiData);

      if (apiData.status === 'success' && apiData.userId) {
        console.log('User created via API with ID:', apiData.userId);

        // Store the user ID in localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('temp_user_id', apiData.userId);
        }

        setUserId(apiData.userId);
        return apiData.userId;
      }

      return null;
    } catch (apiError) {
      console.error('Error creating user via API:', apiError);
      return null;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');

      // Clear local state first
      setUser(null);
      setUserId(null);

      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error signing out from Supabase:', error);
      } else {
        console.log('Successfully signed out from Supabase');

        // Force a page reload to clear any cached state
        if (typeof window !== 'undefined') {
          console.log('Redirecting to home page...');
          window.location.href = '/';
        }
      }
    } catch (error) {
      console.error('Exception in signOut:', error);
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

  // Function to manually refresh the session
  const refreshSession = async () => {
    try {
      console.log('Manually refreshing session...');

      // Try to get user ID from localStorage if it exists
      let localUserId = null;
      if (typeof window !== 'undefined') {
        localUserId = window.localStorage.getItem('temp_user_id');
        if (localUserId) {
          console.log('Found user ID in localStorage:', localUserId);
          setUserId(localUserId);
        }
      }

      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }

      console.log('Session refresh result:', {
        user: session?.user ? 'User exists' : 'No user',
        userId: localUserId || 'No local user ID'
      });

      if (session?.user) {
        // Set the user state
        setUser(session.user);

        try {
          // Get or create user in database
          if (session.user.email) {
            console.log('Getting or creating user in database with email:', session.user.email);
            const dbUserId = await createUserIfNotExists(
              session.user.id,
              session.user.email,
              session.user.user_metadata?.name,
              session.user.user_metadata?.avatar_url
            );

            console.log('User ID from database after refresh:', dbUserId);

            // Store the user ID in localStorage as a backup
            if (typeof window !== 'undefined' && dbUserId) {
              window.localStorage.setItem('temp_user_id', dbUserId);
            }

            setUserId(dbUserId);
          } else {
            console.warn('User has no email in session:', session.user);
          }
        } catch (dbError) {
          console.error('Error creating/getting user in database during refresh:', dbError);

          // If we have a local user ID, use that as a fallback
          if (localUserId) {
            console.log('Using localStorage user ID as fallback:', localUserId);
            setUserId(localUserId);
          }
        }
      } else {
        console.log('No active session found during refresh');

        // If we have a local user ID, keep it as a fallback
        if (!localUserId) {
          setUser(null);
          setUserId(null);
        } else {
          console.log('No session but keeping localStorage user ID:', localUserId);
        }
      }
    } catch (error) {
      console.error('Error in refreshSession:', error);
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
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
