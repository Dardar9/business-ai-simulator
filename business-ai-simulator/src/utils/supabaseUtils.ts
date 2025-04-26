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

    // Create agents for the business
    if (agents.length > 0) {
      const agentsWithBusinessId = agents.map(agent => ({
        ...agent,
        business_id: newBusiness.id,
        skills: agent.skills ? JSON.stringify(agent.skills) : null
      }));

      const { data: newAgents, error: agentsError } = await supabase
        .from('agents')
        .insert(agentsWithBusinessId)
        .select();

      if (agentsError) {
        console.error('Error creating agents:', agentsError);
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
    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking user existence:', checkError);
      return null;
    }

    if (existingUser) {
      return existingUser.id;
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        auth0_id: auth0Id,
        email,
        name,
        avatar_url: avatarUrl
      }])
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return null;
    }

    return newUser?.id || null;
  } catch (error) {
    console.error('Error in createUserIfNotExists:', error);
    return null;
  }
};
