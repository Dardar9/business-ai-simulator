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
        await refreshSession();
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

    console.log('Current auth state:', { user: user ? 'User exists' : 'No user', userId: userId || 'No userId' });

    if (!userId) {
      console.warn('User is not logged in or userId is null, trying to refresh session...');

      try {
        // Try to refresh the session before showing an error
        await refreshSession();

        // Check if we have a userId after refreshing
        if (!userId) {
          console.warn('Still not logged in after session refresh');
          setError('You must be logged in to create a business. Please sign in or use the Refresh Session button below.');
          return;
        } else {
          console.log('Session refreshed successfully, user is now logged in with ID:', userId);
        }
      } catch (refreshError) {
        console.error('Error refreshing session:', refreshError);
        setError('You must be logged in to create a business. Please sign in or use the Refresh Session button below.');
        return;
      }
    }

    // Double-check userId one more time
    if (!userId) {
      console.error('User ID is still null after all checks');
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
        user_id: userId,
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

                <div className="flex justify-between">
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
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
