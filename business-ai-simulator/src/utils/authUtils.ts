import { supabase } from './supabaseClient';

/**
 * Check if a user exists in the database
 * @param auth0Id The Auth0 ID of the user
 * @returns True if the user exists, false otherwise
 */
export const checkUserExists = async (auth0Id: string): Promise<boolean> => {
  try {
    console.log('Checking if user exists with auth0Id:', auth0Id);
    
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        console.log('User does not exist in database');
        return false;
      }
      
      console.error('Error checking if user exists:', error);
      throw error;
    }
    
    console.log('User exists in database:', data);
    return !!data;
  } catch (error) {
    console.error('Exception in checkUserExists:', error);
    return false;
  }
};

/**
 * Create a user in the database
 * @param auth0Id The Auth0 ID of the user
 * @param email The email of the user
 * @param name The name of the user
 * @param avatarUrl The avatar URL of the user
 * @returns The ID of the created user, or null if creation failed
 */
export const createUser = async (
  auth0Id: string,
  email: string,
  name?: string,
  avatarUrl?: string
): Promise<string | null> => {
  try {
    console.log('Creating user with data:', { auth0Id, email, name, avatarUrl });
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        auth0_id: auth0Id,
        email,
        name,
        avatar_url: avatarUrl
      }])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    
    console.log('User created successfully:', data);
    return data?.id || null;
  } catch (error) {
    console.error('Exception in createUser:', error);
    return null;
  }
};

/**
 * Get a user from the database by Auth0 ID
 * @param auth0Id The Auth0 ID of the user
 * @returns The user data, or null if not found
 */
export const getUserByAuth0Id = async (auth0Id: string): Promise<any | null> => {
  try {
    console.log('Getting user by auth0Id:', auth0Id);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth0_id', auth0Id)
      .single();
    
    if (error) {
      console.error('Error getting user by auth0Id:', error);
      return null;
    }
    
    console.log('User found:', data);
    return data;
  } catch (error) {
    console.error('Exception in getUserByAuth0Id:', error);
    return null;
  }
};

/**
 * Create a user if they don't exist in the database
 * @param auth0Id The Auth0 ID of the user
 * @param email The email of the user
 * @param name The name of the user
 * @param avatarUrl The avatar URL of the user
 * @returns The ID of the user, or null if creation failed
 */
export const createUserIfNotExists = async (
  auth0Id: string,
  email: string,
  name?: string,
  avatarUrl?: string
): Promise<string | null> => {
  try {
    console.log('Creating user if not exists:', { auth0Id, email });
    
    // First check if user exists
    const userExists = await checkUserExists(auth0Id);
    
    if (userExists) {
      console.log('User already exists, getting user data');
      const user = await getUserByAuth0Id(auth0Id);
      return user?.id || null;
    }
    
    console.log('User does not exist, creating new user');
    return await createUser(auth0Id, email, name, avatarUrl);
  } catch (error) {
    console.error('Exception in createUserIfNotExists:', error);
    return null;
  }
};

/**
 * Get the current user session
 * @returns The current session, or null if not logged in
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting current session:', error);
      return null;
    }
    
    return data.session;
  } catch (error) {
    console.error('Exception in getCurrentSession:', error);
    return null;
  }
};

/**
 * Get the current user
 * @returns The current user, or null if not logged in
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error('Exception in getCurrentUser:', error);
    return null;
  }
};
