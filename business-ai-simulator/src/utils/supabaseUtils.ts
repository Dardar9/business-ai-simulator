import { supabase, Business, Agent } from './supabaseClient';

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
      console.log('Processing agents for business ID:', newBusiness.id);

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

        // Create a new object with all required fields
        return {
          // Let Supabase generate the ID
          name: agent.name,
          role: agent.role,
          description: agent.description || '',
          skills: formattedSkills,
          avatar: agent.avatar || '',
          business_id: newBusiness.id // Set the business_id to the newly created business
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

    if (!auth0Id) {
      console.error('Cannot create user: auth0Id is required but was not provided');
      return null;
    }

    if (!email) {
      console.error('Cannot create user: email is required but was not provided');
      return null;
    }

    // Check if user exists by auth0Id
    console.log('Checking if user exists in Supabase by auth0Id...');
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('auth0_id', auth0Id)
        .single();

      if (checkError) {
        if (checkError.code === 'PGRST116') { // PGRST116 is "no rows returned"
          console.log('User not found by auth0Id, will check by email');
        } else {
          console.error('Error checking user existence by auth0Id:', checkError);
          // Continue to next check instead of returning null
        }
      } else if (existingUser) {
        console.log('User already exists in database by auth0Id, returning existing ID:', existingUser.id);
        return existingUser.id;
      }
    } catch (checkError) {
      console.error('Exception checking user by auth0Id:', checkError);
      // Continue to next check instead of returning null
    }

    // Check if user exists by email as a fallback
    console.log('Checking if user exists in Supabase by email...');
    try {
      const { data: existingUserByEmail, error: emailCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (emailCheckError) {
        if (emailCheckError.code !== 'PGRST116') { // Not "no rows returned"
          console.error('Error checking user existence by email:', emailCheckError);
        }
      } else if (existingUserByEmail) {
        console.log('User already exists in database by email, returning existing ID:', existingUserByEmail.id);
        return existingUserByEmail.id;
      }
    } catch (emailCheckError) {
      console.error('Exception checking user by email:', emailCheckError);
    }

    // Create new user
    console.log('Creating new user in Supabase...');
    const timestamp = new Date().toISOString();
    const newUserData = {
      auth0_id: auth0Id,
      email,
      name: name || email.split('@')[0], // Use part of email as name if not provided
      avatar_url: avatarUrl,
      created_at: timestamp,
      updated_at: timestamp
    };
    console.log('New user data:', newUserData);

    try {
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

          // Try to get the user again with a more robust query
          try {
            const { data: retryUser, error: retryError } = await supabase
              .from('users')
              .select('id')
              .or(`auth0_id.eq.${auth0Id},email.eq.${email}`)
              .single();

            if (retryError) {
              console.error('Error retrying user lookup:', retryError);
            } else if (retryUser) {
              console.log('Found user on retry:', retryUser);
              return retryUser.id;
            }
          } catch (retryError) {
            console.error('Exception in retry user lookup:', retryError);
          }
        }

        // Try with minimal fields as a last resort
        try {
          console.log('Trying with minimal fields...');
          const minimalUserData = {
            auth0_id: auth0Id,
            email
          };

          const { data: minimalUser, error: minimalError } = await supabase
            .from('users')
            .insert([minimalUserData])
            .select('id')
            .single();

          if (minimalError) {
            console.error('Error creating user with minimal fields:', minimalError);
          } else if (minimalUser) {
            console.log('User created with minimal fields:', minimalUser);
            return minimalUser.id;
          }
        } catch (minimalError) {
          console.error('Exception creating user with minimal fields:', minimalError);
        }

        return null;
      }

      console.log('User created successfully:', newUser);
      return newUser?.id || null;
    } catch (createError) {
      console.error('Exception creating user:', createError);
      return null;
    }
  } catch (error) {
    console.error('Error in createUserIfNotExists:', error);
    return null;
  }
};
