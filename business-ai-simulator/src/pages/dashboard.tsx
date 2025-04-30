import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/utils/auth';
import { getBusinesses } from '@/utils/supabaseUtils';
import { Business } from '@/utils/supabaseClient';

export default function Dashboard() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);
  const { user, userId } = useAuth();

  // Function to fetch businesses with a specific user ID
  const fetchBusinesses = useCallback(async (userIdToUse: string) => {
    try {
      if (!userIdToUse) {
        console.error('Dashboard: Cannot fetch businesses - userId is empty or null');
        setBusinesses([]);
        setLoading(false);
        return true; // Return true to stop the cascade of fetch attempts
      }

      console.log('Dashboard: Fetching businesses for user ID:', userIdToUse);
      const businessesData = await getBusinesses(userIdToUse);
      console.log('Dashboard: Fetched businesses:', businessesData);

      // Even if the result is empty, consider this a successful fetch for a new user
      setBusinesses(businessesData || []);
      setLoading(false);
      return true;
    } catch (fetchError) {
      console.error('Dashboard: Error fetching businesses:', fetchError);
      // For new users, we should still show the empty state rather than continuing to try other methods
      setBusinesses([]);
      setLoading(false);
      return true; // Return true to stop the cascade of fetch attempts for new users
    }
  }, []);

  // This effect runs once when the component mounts
  useEffect(() => {
    const initializeDashboard = async () => {
      if (!user) {
        console.log('Dashboard: No user, waiting for authentication...');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Dashboard: User authenticated, initializing dashboard for:', user.email);

        // Step 1: Check for userId from auth context
        if (userId) {
          console.log('Dashboard: Found user ID from auth context:', userId);

          // Store in localStorage for future use
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('temp_user_id', userId);
          }

          // Fetch businesses with the context userId
          const success = await fetchBusinesses(userId);
          if (success) return;

          // If fetching fails, continue to next step
          console.log('Dashboard: Failed to fetch businesses with context userId, trying localStorage');
        }

        // Step 2: Check for user ID in localStorage
        const localUserId = typeof window !== 'undefined' ? window.localStorage.getItem('temp_user_id') : null;

        if (localUserId) {
          console.log('Dashboard: Found user ID in localStorage:', localUserId);

          // Fetch businesses with the localStorage user ID
          const success = await fetchBusinesses(localUserId);
          if (success) return;

          // If fetching fails, continue to next step
          console.log('Dashboard: Failed to fetch businesses with localStorage userId, trying API');
        }

        // Step 3: Try to get user from API
        console.log('Dashboard: Checking user via API');
        try {
          const userResponse = await fetch('/api/auth/user');
          const userData = await userResponse.json();

          console.log('Dashboard: API user response:', userData);

          if (userData.status === 'success' && userData.authenticated && userData.userId) {
            console.log('Dashboard: Got userId from API:', userData.userId);

            // Store in localStorage
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('temp_user_id', userData.userId);
            }

            // Fetch businesses with the API user ID
            const success = await fetchBusinesses(userData.userId);
            if (success) return;

            // If fetching fails, continue to next step
            console.log('Dashboard: Failed to fetch businesses with API userId, trying to create user');
          }
        } catch (apiError) {
          console.error('Dashboard: Error checking user via API:', apiError);
          // Continue to next step if this fails
        }

        // Step 4: Create a new user
        console.log('Dashboard: Creating new user via API');
        try {
          const createResponse = await fetch('/api/auth/create-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              name: user.user_metadata?.name || user.email.split('@')[0],
              auth0_id: user.id
            }),
          });

          const createData = await createResponse.json();
          console.log('Dashboard: API create user response:', createData);

          if (createData.status === 'success' && createData.userId) {
            console.log('Dashboard: User created via API with ID:', createData.userId);

            // Store in localStorage
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('temp_user_id', createData.userId);
            }

            // Fetch businesses with the new user ID
            const success = await fetchBusinesses(createData.userId);
            if (success) return;

            // If we get here, all attempts to fetch businesses have failed
            throw new Error('Failed to fetch businesses after creating user');
          } else {
            throw new Error('Failed to create user via API');
          }
        } catch (createError) {
          console.error('Dashboard: Error creating user via API:', createError);
          setError('Failed to initialize user. Please try logging out and back in.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Dashboard: Unhandled error in initialization:', error);
        setError('An unexpected error occurred. Please try refreshing the page.');
        setLoading(false);
      }
    };

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Dashboard: Loading timeout occurred, showing empty state');
        setTimeoutOccurred(true);
        setLoading(false);

        // If we have a userId but no businesses loaded yet, this is likely a new user
        // Show empty businesses list rather than an error state
        if (userId || (typeof window !== 'undefined' && window.localStorage.getItem('temp_user_id'))) {
          console.log('Dashboard: User exists but no businesses loaded, showing empty state');
          setBusinesses([]);
          setError(null); // Clear any errors
        } else {
          // If we don't have a userId at all, there might be an authentication issue
          console.log('Dashboard: No userId found after timeout, showing error');
          setError('Unable to retrieve user information. Please try refreshing the page.');
        }
      }
    }, 8000); // 8 seconds timeout

    initializeDashboard();

    return () => clearTimeout(timeoutId);
  }, [user, userId, fetchBusinesses]);

  return (
    <ProtectedRoute>
      <Head>
        <title>Dashboard - Business AI Simulator</title>
        <meta name="description" content="Manage your AI-powered businesses" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p className="font-bold">Error</p>
              <p>{error}</p>
              <div className="mt-2 flex space-x-4">
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-red-700 underline"
                >
                  Refresh Page
                </button>
                <button
                  onClick={async () => {
                    try {
                      // Check user state
                      console.log('Current user:', user);
                      console.log('Current userId:', userId);
                      console.log('localStorage userId:', typeof window !== 'undefined' ? window.localStorage.getItem('temp_user_id') : null);

                      // Try to get user from API
                      const userResponse = await fetch('/api/auth/user');
                      const userData = await userResponse.json();
                      console.log('API user response:', userData);

                      // Show debug info in alert
                      alert(`Debug Info:
User: ${user ? 'Exists' : 'Not found'}
User Email: ${user?.email || 'N/A'}
Auth Context UserId: ${userId || 'Not found'}
LocalStorage UserId: ${typeof window !== 'undefined' ? window.localStorage.getItem('temp_user_id') || 'Not found' : 'N/A'}
API User: ${userData.authenticated ? 'Authenticated' : 'Not authenticated'}
API UserId: ${userData.userId || 'Not found'}`);
                    } catch (error) {
                      console.error('Error in debug:', error);
                      alert('Error in debug. Check console for details.');
                    }
                  }}
                  className="text-sm text-red-700 underline"
                >
                  Debug Info
                </button>
                <Link href="/debug" className="text-sm text-red-700 underline">
                  Go to Debug Page
                </Link>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
              <p className="text-gray-600 mb-6">Loading your businesses...</p>

              {/* Add a shortcut for new users */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 mb-2">
                  New user? You can start creating your first business right away:
                </p>
                <Link href="/" className="btn-primary">
                  Create Your First Business
                </Link>
              </div>
            </div>
          ) : (
            <>
              {timeoutOccurred && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
                  <p className="font-bold">Loading Timeout</p>
                  <p>It's taking longer than expected to load your businesses. You can try creating a new business or refresh the page.</p>
                  <div className="mt-4 flex space-x-4">
                    <button
                      onClick={() => window.location.reload()}
                      className="text-sm text-yellow-700 underline"
                    >
                      Refresh Page
                    </button>
                    <Link href="/" className="text-sm text-yellow-700 underline">
                      Create New Business
                    </Link>
                    <button
                      onClick={async () => {
                        if (!user || !user.email) return;

                        try {
                          // Force user creation via API
                          const response = await fetch('/api/auth/force-auth', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              email: user.email,
                              auth0_id: user.id
                            }),
                          });

                          const data = await response.json();

                          if (data.status === 'success' && data.userId) {
                            // Store in localStorage
                            if (typeof window !== 'undefined') {
                              window.localStorage.setItem('temp_user_id', data.userId);
                            }

                            // Reload the page
                            window.location.reload();
                          }
                        } catch (error) {
                          console.error('Error forcing authentication:', error);
                        }
                      }}
                      className="text-sm text-yellow-700 underline"
                    >
                      Force Authentication
                    </button>
                  </div>
                </div>
              )}

              {businesses.length === 0 ? (
                <div className="card text-center py-12">
                  <h2 className="text-2xl font-bold mb-4">Welcome to Business AI Simulator</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    You haven't created any businesses yet. Get started by creating your first AI-powered business.
                  </p>
                  <Link href="/" className="btn-primary">
                    Create Your First Business
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="card">
                  <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                  <div className="space-y-4">
                    <Link href="/" className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <h3 className="font-semibold">Create New Business</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Start a new AI-powered business simulation
                      </p>
                    </Link>
                    <Link href="/market-research" className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <h3 className="font-semibold">Market Research</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Research market trends and opportunities
                      </p>
                    </Link>
                    <Link href="/templates" className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <h3 className="font-semibold">Business Templates</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Browse pre-configured business templates
                      </p>
                    </Link>
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-xl font-bold mb-4">Latest Updates</h2>
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h3 className="font-semibold">New Features Added</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        We've added new AI agent capabilities and improved the communication system.
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        2 days ago
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h3 className="font-semibold">Market Research Integration</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        AI agents can now perform real-time market research and trend analysis.
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        1 week ago
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h3 className="font-semibold">File System Access</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        AI agents can now securely access and manage files on your local system.
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        2 weeks ago
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
