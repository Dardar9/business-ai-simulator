import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/utils/auth';
import { createBusiness } from '@/utils/supabaseUtils';
import { Business } from '@/utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { generateAgentsForBusiness } from '@/services/aiAgentService';

interface BusinessTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
}

// Mock templates - in a real app, these would come from an API
const businessTemplates: Record<string, BusinessTemplate> = {
  'tech-startup': {
    id: 'tech-startup',
    name: 'Tech Startup',
    type: 'Technology',
    description: 'A technology startup focused on software development and innovation.',
  },
  'ecommerce': {
    id: 'ecommerce',
    name: 'E-commerce Store',
    type: 'Retail',
    description: 'An online retail business selling products directly to consumers.',
  },
  'marketing-agency': {
    id: 'marketing-agency',
    name: 'Marketing Agency',
    type: 'Services',
    description: 'A full-service marketing agency offering digital and traditional marketing services.',
  },
  // Add more templates as needed
};

export default function CreateBusiness() {
  const router = useRouter();
  const { template: templateId } = router.query;
  const { user, userId, refreshSession, loading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
  });

  // Check session when component mounts
  useEffect(() => {
    const checkSession = async () => {
      if (!userId && !authLoading && !sessionChecked) {
        console.log('No userId available, trying to refresh session on mount');

        try {
          // First try refreshing the session through the context
          await refreshSession();

          // If that doesn't work, try the API endpoint
          if (!userId) {
            console.log('Still no userId after refresh, trying API endpoint');
            const response = await fetch('/api/auth/user');
            const data = await response.json();

            console.log('API auth check response:', data);

            if (data.status === 'success' && data.userId) {
              console.log('Got userId from API:', data.userId);
              // We can't update the context's userId directly, but we can store it locally
              window.localStorage.setItem('temp_user_id', data.userId);
            }
          }
        } catch (error) {
          console.error('Error checking session:', error);
        }

        setSessionChecked(true);
      }
    };

    checkSession();
  }, [userId, authLoading, sessionChecked, refreshSession]);

  // Load template data if a template ID is provided
  useEffect(() => {
    if (templateId && typeof templateId === 'string' && businessTemplates[templateId]) {
      const template = businessTemplates[templateId];
      setFormData({
        name: template.name,
        type: template.type,
        description: template.description,
      });
    }
  }, [templateId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');

    if (!formData.name || !formData.type) {
      setError('Please fill in all required fields');
      return;
    }

    // Try to get userId from localStorage if it's not in the context
    let effectiveUserId = userId;
    if (!effectiveUserId && typeof window !== 'undefined') {
      const tempUserId = window.localStorage.getItem('temp_user_id');
      if (tempUserId) {
        console.log('Using userId from localStorage:', tempUserId);
        effectiveUserId = tempUserId;
      }
    }

    console.log('Current auth state:', {
      user: user ? 'User exists' : 'No user',
      contextUserId: userId || 'No userId in context',
      effectiveUserId: effectiveUserId || 'No effective userId'
    });

    if (!effectiveUserId) {
      console.warn('No effective userId available, trying to refresh session and check API...');

      try {
        // Try to refresh the session
        await refreshSession();

        // If that doesn't work, try the API endpoint
        if (!userId) {
          console.log('Still no userId after refresh, trying API endpoint');
          const response = await fetch('/api/auth/user');
          const data = await response.json();

          console.log('API auth check response:', data);

          if (data.status === 'success' && data.userId) {
            console.log('Got userId from API:', data.userId);
            effectiveUserId = data.userId;
            window.localStorage.setItem('temp_user_id', data.userId);
          }
        } else {
          effectiveUserId = userId;
        }

        // Check if we have a userId after all attempts
        if (!effectiveUserId) {
          console.warn('Still no effective userId after all attempts');
          setError('You must be logged in to create a business. Please sign in or use the Refresh Session button below.');
          return;
        } else {
          console.log('Successfully obtained userId:', effectiveUserId);
        }
      } catch (refreshError) {
        console.error('Error refreshing session:', refreshError);
        setError('You must be logged in to create a business. Please sign in or use the Refresh Session button below.');
        return;
      }
    }

    // Double-check effectiveUserId one more time
    if (!effectiveUserId) {
      console.error('Effective User ID is still null after all checks');
      setError('Unable to create business: User ID is not available. Please try logging out and logging in again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting business creation process...');
      console.log('User ID:', userId);
      console.log('Form data:', formData);

      // Generate AI agents for the business
      console.log('Generating agents for business...');
      const agents = await generateAgentsForBusiness(formData.type, formData.description);
      console.log('Generated agents:', agents);

      // Create the business in Supabase
      console.log('Creating business in Supabase...');
      const businessData = {
        user_id: effectiveUserId, // Use the effective user ID
        name: formData.name,
        type: formData.type,
        description: formData.description
      };
      console.log('Business data to create:', businessData);

      const newBusiness = await createBusiness(businessData, agents);
      console.log('Business creation result:', newBusiness);

      if (newBusiness && newBusiness.id) {
        console.log('Business created successfully with ID:', newBusiness.id);

        // Add a small delay before redirecting
        setTimeout(() => {
          console.log('Redirecting to business detail page...');
          // Use window.location for a hard redirect instead of router.push
          window.location.href = `/businesses/${newBusiness.id}`;
        }, 500);
      } else {
        console.error('Failed to create business, no business returned or no ID');
        setError('Failed to create business. Please try again.');
      }
    } catch (error: any) {
      console.error('Error creating business:', error);
      // Provide more detailed error information
      let errorMessage = 'An error occurred while creating your business. Please try again.';

      if (error.message) {
        errorMessage += ` Error details: ${error.message}`;
      }

      if (error.code) {
        errorMessage += ` (Code: ${error.code})`;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Business - Business AI Simulator</title>
        <meta name="description" content="Create a new AI-powered business" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Create a New Business</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p className="mb-2">{error}</p>
              <div className="flex space-x-2">
                {error.includes('logged in') && (
                  <button
                    onClick={async () => {
                      try {
                        console.log('Manually refreshing session...');
                        await refreshSession();
                        console.log('Session refreshed, checking if user is logged in now...');
                        if (userId) {
                          console.log('User is now logged in with ID:', userId);
                          setError(null);
                        } else {
                          console.log('User is still not logged in after refresh');
                          setError('Still not logged in. Please try signing in again.');
                        }
                      } catch (e) {
                        console.error('Error refreshing session:', e);
                        setError('Error refreshing session. Please try signing in again.');
                      }
                    }}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                  >
                    Refresh Session
                  </button>
                )}
                <button
                  onClick={async () => {
                    try {
                      console.log('Getting user ID from API...');
                      const response = await fetch('/api/auth/user');
                      const data = await response.json();

                      console.log('API response:', data);

                      if (data.status === 'success' && data.userId) {
                        console.log('Got user ID from API:', data.userId);
                        window.localStorage.setItem('temp_user_id', data.userId);
                        setError(`User ID found: ${data.userId}. Try submitting the form again.`);
                      } else {
                        console.log('No user ID found in API response');
                        setError('No user ID found. Please try logging in again.');
                      }
                    } catch (e) {
                      console.error('Error getting user ID:', e);
                      setError('Error getting user ID. Please try logging in again.');
                    }
                  }}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm"
                >
                  Get User ID
                </button>
              </div>
            </div>
          )}

          <div className="max-w-2xl mx-auto">
            <div className="card">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="Enter business name"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="type" className="block text-gray-700 dark:text-gray-300 mb-2">
                    Business Type *
                  </label>
                  <input
                    type="text"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="e.g., E-commerce, SaaS, Consulting"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 mb-2">
                    Business Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input w-full h-32"
                    placeholder="Describe your business idea, goals, and target market"
                  />
                </div>

                <div className="flex justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Business...
                      </span>
                    ) : (
                      'Create Business'
                    )}
                  </button>
                </div>

                {/* Debug buttons */}
                <div className="flex flex-col space-y-2">
                  <button
                    type="button"
                    onClick={async () => {
                      setIsLoading(true);
                      setError(null);

                      try {
                        // Try to get userId from localStorage if it's not in the context
                        let effectiveUserId = userId;
                        if (!effectiveUserId && typeof window !== 'undefined') {
                          const tempUserId = window.localStorage.getItem('temp_user_id');
                          if (tempUserId) {
                            console.log('Using userId from localStorage:', tempUserId);
                            effectiveUserId = tempUserId;
                          }
                        }

                        if (!effectiveUserId) {
                          // Try to get userId from API
                          console.log('No userId available, trying API endpoint');
                          const userResponse = await fetch('/api/auth/user');
                          const userData = await userResponse.json();

                          if (userData.status === 'success' && userData.userId) {
                            console.log('Got userId from API:', userData.userId);
                            effectiveUserId = userData.userId;
                          }
                        }

                        if (!effectiveUserId) {
                          // Try to create a user directly
                          console.log('No userId available, creating a user directly');
                          const createUserResponse = await fetch('/api/auth/create-user', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              email: 'test@example.com',
                              name: 'Test User'
                            }),
                          });

                          const createUserData = await createUserResponse.json();
                          console.log('Create user response:', createUserData);

                          if (createUserData.status === 'success' && createUserData.userId) {
                            console.log('Created user with ID:', createUserData.userId);
                            effectiveUserId = createUserData.userId;

                            // Store the user ID in localStorage
                            if (typeof window !== 'undefined' && effectiveUserId) {
                              window.localStorage.setItem('temp_user_id', effectiveUserId);
                            }
                          } else {
                            setError('Failed to create user. Please try again.');
                            return;
                          }
                        }

                        console.log('Using user ID for debug create:', effectiveUserId);

                        // Call the debug API endpoint
                        const response = await fetch('/api/debug/create-business', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            userId: effectiveUserId,
                            businessData: {
                              name: formData.name || 'Debug Business',
                              type: formData.type || 'Debug Type',
                              description: formData.description || 'Debug Description'
                            }
                          }),
                        });

                        const data = await response.json();
                        console.log('Debug create business response:', data);

                        if (data.status === 'success' && data.business) {
                          console.log('Debug business created successfully:', data.business);
                          setError(`Debug business created successfully with ID: ${data.business.id}`);

                          // Redirect to the business detail page after a delay
                          setTimeout(() => {
                            window.location.href = `/businesses/${data.business.id}`;
                          }, 2000);
                        } else {
                          console.error('Error creating debug business:', data);
                          setError(`Error creating debug business: ${data.message || 'Unknown error'}`);
                        }
                      } catch (error) {
                        console.error('Error in debug create business:', error);
                        setError(`Error in debug create business: ${error instanceof Error ? error.message : String(error)}`);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={isLoading}
                  >
                    Debug Create Business
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        // Create a user directly
                        const createUserResponse = await fetch('/api/auth/create-user', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            email: 'test@example.com',
                            name: 'Test User'
                          }),
                        });

                        const createUserData = await createUserResponse.json();
                        console.log('Create user response:', createUserData);

                        if (createUserData.status === 'success' && createUserData.userId) {
                          console.log('Created user with ID:', createUserData.userId);

                          // Store the user ID in localStorage
                          if (typeof window !== 'undefined' && createUserData.userId) {
                            window.localStorage.setItem('temp_user_id', createUserData.userId);
                          }

                          setError(`Created test user with ID: ${createUserData.userId}. Try creating a business now.`);
                        } else {
                          setError(`Failed to create test user: ${createUserData.message || 'Unknown error'}`);
                        }
                      } catch (error) {
                        console.error('Error creating test user:', error);
                        setError(`Error creating test user: ${error instanceof Error ? error.message : String(error)}`);
                      }
                    }}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2"
                    disabled={isLoading}
                  >
                    Create Test User
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsLoading(true);
                      setError(null);

                      try {
                        // Call the direct business creation endpoint
                        const response = await fetch('/api/debug/direct-create-business', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            name: formData.name || 'Debug Business',
                            type: formData.type || 'Debug Type',
                            description: formData.description || 'Debug Description'
                          }),
                        });

                        const data = await response.json();
                        console.log('Direct business creation response:', data);

                        if (data.status === 'success' && data.business) {
                          console.log('Business created successfully:', data.business);
                          setError(`Business created successfully with ID: ${data.business.id}`);

                          // Store the user ID in localStorage
                          if (typeof window !== 'undefined' && data.user && data.user.id) {
                            window.localStorage.setItem('temp_user_id', data.user.id);
                          }

                          // Redirect to the business detail page after a delay
                          setTimeout(() => {
                            window.location.href = `/businesses/${data.business.id}`;
                          }, 2000);
                        } else {
                          console.error('Error creating business:', data);
                          setError(`Error creating business: ${data.message || 'Unknown error'}`);
                        }
                      } catch (error) {
                        console.error('Error in direct business creation:', error);
                        setError(`Error creating business: ${error instanceof Error ? error.message : String(error)}`);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2"
                    disabled={isLoading}
                  >
                    Direct Create Business
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsLoading(true);
                      setError(null);

                      try {
                        // Test Supabase connection
                        const response = await fetch('/api/debug/supabase-test');
                        const data = await response.json();
                        console.log('Supabase test response:', data);

                        if (data.status === 'success') {
                          setError(`Supabase test completed. Check console for details.`);
                        } else {
                          setError(`Supabase test failed: ${data.message || 'Unknown error'}`);
                        }
                      } catch (error) {
                        console.error('Error in Supabase test:', error);
                        setError(`Error in Supabase test: ${error instanceof Error ? error.message : String(error)}`);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2"
                    disabled={isLoading}
                  >
                    Test Supabase Connection
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsLoading(true);
                      setError(null);

                      try {
                        // Create a test user
                        const response = await fetch('/api/debug/create-test-user', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          }
                        });

                        const data = await response.json();
                        console.log('Create test user response:', data);

                        if (data.status === 'success' && data.user) {
                          console.log('Test user created successfully:', data.user);
                          setError(`Test user created successfully with ID: ${data.user.id} using ${data.approach} approach`);

                          // Store the user ID in localStorage
                          if (typeof window !== 'undefined' && data.user.id) {
                            window.localStorage.setItem('temp_user_id', data.user.id);
                          }
                        } else {
                          console.error('Error creating test user:', data);
                          setError(`Error creating test user: ${data.message || 'Unknown error'}`);
                        }
                      } catch (error) {
                        console.error('Error creating test user:', error);
                        setError(`Error creating test user: ${error instanceof Error ? error.message : String(error)}`);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={isLoading}
                  >
                    Create Test User Only
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
