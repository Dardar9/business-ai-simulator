import React, { createContext, useContext, useEffect, useState } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { supabase } from './supabaseClient';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  login: () => void;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: () => {},
  logout: () => {},
  getAccessToken: async () => null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();
  
  // Sync Auth0 user with Supabase
  useEffect(() => {
    const syncUserWithSupabase = async () => {
      if (isAuthenticated && user && supabase) {
        try {
          // Get the Auth0 token
          const token = await getAccessTokenSilently();
          
          // Set the Supabase auth token
          const { error } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: '',
          });
          
          if (error) {
            console.error('Error setting Supabase session:', error);
          }
          
          // Check if user exists in Supabase
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('auth0_id', user.sub)
            .single();
          
          if (!existingUser) {
            // Create user in Supabase
            await supabase.from('users').insert([
              {
                auth0_id: user.sub,
                email: user.email,
                name: user.name,
                avatar_url: user.picture,
              },
            ]);
          }
        } catch (error) {
          console.error('Error syncing user with Supabase:', error);
        }
      }
    };
    
    syncUserWithSupabase();
  }, [isAuthenticated, user, getAccessTokenSilently]);
  
  const login = () => {
    loginWithRedirect();
  };
  
  const logout = () => {
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };
  
  const getAccessToken = async () => {
    if (!isAuthenticated) return null;
    
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const Auth0ProviderWithHistory: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || '';
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || '';
  const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || '';
  
  if (!domain || !clientId) {
    return <>{children}</>;
  }
  
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
        audience: audience,
      }}
    >
      <AuthProvider>{children}</AuthProvider>
    </Auth0Provider>
  );
};
