import { supabase, Business, Agent } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Business CRUD operations
export const getBusinesses = async (userId: string): Promise<Business[]> => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching businesses:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getBusinesses:', error);
    return [];
  }
};

export const getBusinessById = async (id: string): Promise<Business | null> => {
  try {
    // First get the business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single();

    if (businessError) {
      console.error('Error fetching business:', businessError);
      return null;
    }

    if (!business) {
      return null;
    }

    // Then get the agents for this business
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('*')
      .eq('business_id', id);

    if (agentsError) {
      console.error('Error fetching agents:', agentsError);
      return business;
    }

    // Add agents to the business object
    return {
      ...business,
      agents: agents || []
    };
  } catch (error) {
    console.error('Error in getBusinessById:', error);
    return null;
  }
};

export const createBusiness = async (
  business: Omit<Business, 'id' | 'created_at' | 'updated_at'>,
  agents: Omit<Agent, 'id' | 'business_id' | 'created_at' | 'updated_at'>[]
): Promise<Business | null> => {
  try {
    console.log('Creating business:', business);
    console.log('With agents:', agents);

    // Create the business
    const { data: newBusiness, error: businessError } = await supabase
      .from('businesses')
      .insert([business])
      .select()
      .single();

    if (businessError) {
      console.error('Error creating business:', businessError);
      return null;
    }

    if (!newBusiness) {
      console.error('No business returned after creation');
      return null;
    }

    console.log('Business created successfully:', newBusiness);

    // Create agents for the business
    if (agents && agents.length > 0) {
      // Make sure all required fields are present and properly formatted
      const agentsWithBusinessId = agents.map(agent => {
        // Ensure skills is properly formatted for Supabase
        let formattedSkills = null;
        if (agent.skills) {
          // If skills is already a string, use it as is
          if (typeof agent.skills === 'string') {
            formattedSkills = agent.skills;
          }
          // If skills is an array, stringify it
          else if (Array.isArray(agent.skills)) {
            formattedSkills = JSON.stringify(agent.skills);
          }
        }

        return {
          name: agent.name,
          role: agent.role,
          description: agent.description || '',
          skills: formattedSkills,
          avatar: agent.avatar || '',
          business_id: newBusiness.id
        };
      });

      console.log('Formatted agents for insertion:', agentsWithBusinessId);

      const { data: newAgents, error: agentsError } = await supabase
        .from('agents')
        .insert(agentsWithBusinessId)
        .select();

      if (agentsError) {
        console.error('Error creating agents:', agentsError);
      } else {
        console.log('Agents created successfully:', newAgents);
      }

      // Add agents to the business object
      return {
        ...newBusiness,
        agents: newAgents || []
      };
    }

    return newBusiness;
  } catch (error) {
    console.error('Error in createBusiness:', error);
    return null;
  }
};

export const updateBusiness = async (
  id: string,
  updates: Partial<Business>
): Promise<Business | null> => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating business:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateBusiness:', error);
    return null;
  }
};

export const deleteBusiness = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting business:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteBusiness:', error);
    return false;
  }
};

// Agent CRUD operations
export const getAgents = async (businessId: string): Promise<Agent[]> => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('business_id', businessId);

    if (error) {
      console.error('Error fetching agents:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAgents:', error);
    return [];
  }
};

export const createAgent = async (
  agent: Omit<Agent, 'id' | 'created_at' | 'updated_at'>
): Promise<Agent | null> => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .insert([{
        ...agent,
        skills: agent.skills ? JSON.stringify(agent.skills) : null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating agent:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createAgent:', error);
    return null;
  }
};

// User operations
export const createUserIfNotExists = async (
  auth0Id: string,
  email: string,
  name?: string,
  avatarUrl?: string
): Promise<string | null> => {
  try {
    console.log('createUserIfNotExists called with:', { auth0Id, email, name, avatarUrl });

    // Check if user exists
    console.log('Checking if user exists in Supabase...');
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') { // PGRST116 is "no rows returned"
        console.log('User not found in database, will create new user');
      } else {
        console.error('Error checking user existence:', checkError);
        return null;
      }
    }

    if (existingUser) {
      console.log('User already exists in database, returning existing ID:', existingUser.id);
      return existingUser.id;
    }

    // Create new user
    console.log('Creating new user in Supabase...');
    const newUserData = {
      auth0_id: auth0Id,
      email,
      name,
      avatar_url: avatarUrl
    };
    console.log('New user data:', newUserData);

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([newUserData])
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating user:', createError);

      // Check if it's a foreign key constraint error
      if (createError.code === '23503') {
        console.error('Foreign key constraint error. Make sure the auth0_id is valid.');
      }

      // Check if it's a unique constraint error
      if (createError.code === '23505') {
        console.error('Unique constraint error. User with this auth0_id or email might already exist.');

        // Try to get the user again
        const { data: retryUser } = await supabase
          .from('users')
          .select('id')
          .or(`auth0_id.eq.${auth0Id},email.eq.${email}`)
          .single();

        if (retryUser) {
          console.log('Found user on retry:', retryUser);
          return retryUser.id;
        }
      }

      return null;
    }

    console.log('User created successfully:', newUser);
    return newUser?.id || null;
  } catch (error) {
    console.error('Error in createUserIfNotExists:', error);
    return null;
  }
};
