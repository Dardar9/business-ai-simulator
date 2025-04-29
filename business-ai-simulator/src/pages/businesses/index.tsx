import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/utils/auth';
import { getBusinesses } from '@/utils/supabaseUtils';
import { Business, supabase } from '@/utils/supabaseClient';

export default function Businesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userId } = useAuth();

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to get userId from auth context
        let effectiveUserId = userId;

        // If no userId from auth context, try localStorage
        if (!effectiveUserId && typeof window !== 'undefined') {
          const localUserId = window.localStorage.getItem('temp_user_id');
          if (localUserId) {
            console.log('Using userId from localStorage:', localUserId);
            effectiveUserId = localUserId;
          }
        }

        // If still no userId, try to get it from API
        if (!effectiveUserId) {
          console.log('No userId available, trying API endpoint');
          try {
            const response = await fetch('/api/auth/user');
            const data = await response.json();

            if (data.status === 'success' && data.userId) {
              console.log('Got userId from API:', data.userId);
              effectiveUserId = data.userId;

              // Store in localStorage for future use
              if (typeof window !== 'undefined') {
                window.localStorage.setItem('temp_user_id', data.userId);
              }
            } else {
              console.log('API did not return a valid userId:', data);
            }
          } catch (apiError) {
            console.error('Error fetching user from API:', apiError);
          }
        }

        // If still no userId, create a test user
        if (!effectiveUserId) {
          console.log('No userId available, creating a test user');
          try {
            const createUserResponse = await fetch('/api/debug/create-test-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              }
            });

            const createUserData = await createUserResponse.json();

            if (createUserData.status === 'success' && createUserData.user && createUserData.user.id) {
              console.log('Created test user with ID:', createUserData.user.id);
              effectiveUserId = createUserData.user.id;

              // Store in localStorage for future use
              if (typeof window !== 'undefined') {
                window.localStorage.setItem('temp_user_id', effectiveUserId);
              }
            } else {
              console.error('Failed to create test user:', createUserData);
              setError('Failed to create a user. Please try refreshing the page.');
            }
          } catch (createError) {
            console.error('Error creating test user:', createError);
            setError('Error creating a user. Please try refreshing the page.');
          }
        }

        // Now fetch businesses with the userId we have
        if (effectiveUserId) {
          console.log('Fetching businesses for userId:', effectiveUserId);

          // First try using the utility function
          try {
            const businessesData = await getBusinesses(effectiveUserId);
            if (businessesData && businessesData.length > 0) {
              console.log('Found businesses using utility function:', businessesData);
              setBusinesses(businessesData);
              setLoading(false);
              return;
            }
          } catch (utilError) {
            console.error('Error using getBusinesses utility:', utilError);
          }

          // If that fails, try direct Supabase query
          try {
            console.log('Trying direct Supabase query');
            const { data: directData, error: directError } = await supabase
              .from('businesses')
              .select('*, agents(*)')
              .eq('user_id', effectiveUserId);

            if (directError) {
              console.error('Error with direct Supabase query:', directError);
            } else if (directData) {
              console.log('Found businesses with direct query:', directData);
              setBusinesses(directData);
              setLoading(false);
              return;
            }
          } catch (directQueryError) {
            console.error('Exception with direct Supabase query:', directQueryError);
          }

          // If still no businesses, set empty array
          console.log('No businesses found for user');
          setBusinesses([]);
        } else {
          console.error('Could not determine a valid userId');
          setError('Could not determine your user ID. Please try logging in again.');
        }
      } catch (error) {
        console.error('Error in fetchBusinesses:', error);
        setError('An error occurred while fetching your businesses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [userId]);

  return (
    <>
      <Head>
        <title>My Businesses - Business AI Simulator</title>
        <meta name="description" content="Manage your AI-powered businesses" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Businesses</h1>
            <Link href="/create-business" className="btn-primary">
              Create New Business
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : error ? (
            <div className="card text-center py-12">
              <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
              <Link href="/create-business" className="btn-primary">
                Try Creating a Business
              </Link>
            </div>
          ) : (
            <>
              {businesses.length === 0 ? (
                <div className="card text-center py-12">
                  <h2 className="text-2xl font-bold mb-4">No Businesses Found</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    You haven't created any businesses yet. Get started by creating your first AI-powered business.
                  </p>
                  <Link href="/create-business" className="btn-primary">
                    Create Your First Business
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {businesses.map((business) => (
                    <Link
                      href={`/businesses/${business.id}`}
                      key={business.id}
                      className="card hover:shadow-lg transition-shadow"
                    >
                      <h2 className="text-xl font-bold mb-2">{business.name}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {business.type} • Created {new Date(business.created_at).toLocaleDateString()}
                      </p>
                      <p className="mb-4 line-clamp-2">{business.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {business.agents?.length || 0} Agents
                        </span>
                        <span className="text-primary-600 dark:text-primary-400 font-medium">
                          View Details →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
                <p className="mb-2">User ID: {userId || 'Not available from auth context'}</p>
                <p className="mb-2">Local Storage User ID: {typeof window !== 'undefined' ? window.localStorage.getItem('temp_user_id') || 'Not available' : 'Not available (SSR)'}</p>
                <p className="mb-2">Businesses Count: {businesses.length}</p>
                <div className="flex space-x-4 mt-4">
                  <Link href="/create-business" className="btn-secondary">
                    Create Business
                  </Link>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/debug/supabase-test');
                        const data = await response.json();
                        console.log('Supabase test response:', data);
                        alert('Supabase test completed. Check console for details.');
                      } catch (error) {
                        console.error('Error in Supabase test:', error);
                        alert('Error in Supabase test. Check console for details.');
                      }
                    }}
                    className="btn-secondary"
                  >
                    Test Supabase
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
