import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '@/utils/auth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, user, loading: authLoading, refreshSession } = useAuth();
  const router = useRouter();
  const [loginAttempted, setLoginAttempted] = useState(false);

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (user) {
      console.log('User is logged in, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [user, router]);

  // Add a second useEffect to handle login attempts
  useEffect(() => {
    // Track refresh attempts to prevent infinite loops
    const refreshAttempts = parseInt(localStorage.getItem('login_refresh_attempts') || '0');

    if (loginAttempted && !loading && !authLoading && !user && refreshAttempts < 2) {
      console.log(`Login attempted but user is still not logged in, refreshing session (attempt ${refreshAttempts + 1})`);

      // Increment the refresh attempts counter
      localStorage.setItem('login_refresh_attempts', (refreshAttempts + 1).toString());

      const checkSession = async () => {
        await refreshSession();

        // If we still don't have a user after refreshing, show an error
        if (!user && refreshAttempts >= 1) {
          console.log('Max refresh attempts reached, showing error');
          setError('Unable to log in. Please try again with correct credentials.');
        }
      };

      checkSession();
    }

    // Reset the refresh attempts counter when the component unmounts
    return () => {
      if (user || refreshAttempts >= 2) {
        localStorage.removeItem('login_refresh_attempts');
      }
    };
  }, [loginAttempted, loading, authLoading, user, refreshSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setLoginAttempted(true);

    // Reset refresh attempts counter
    localStorage.setItem('login_refresh_attempts', '0');

    // Clear any existing localStorage data
    localStorage.removeItem('temp_user_id');

    try {
      console.log('Attempting to sign in with email:', email);
      const { error, user: signedInUser, userId: signedInUserId } = await signIn(email, password);

      console.log('Sign in response:', {
        error: error ? 'Error present' : 'No error',
        user: signedInUser ? 'User present' : 'No user',
        userId: signedInUserId || 'No user ID'
      });

      if (error) {
        console.error('Sign in error:', error);
        setError(error.message || 'Failed to sign in. Please check your credentials.');
      } else if (signedInUser) {
        console.log('Sign in successful, user:', signedInUser.id);

        // Store user ID in localStorage as a backup
        if (signedInUserId) {
          localStorage.setItem('temp_user_id', signedInUserId);
          console.log('Stored user ID in localStorage:', signedInUserId);
        }

        // Add a small delay to allow state to update
        setTimeout(() => {
          // Use window.location for a hard redirect instead of router.push
          console.log('Redirecting to dashboard...');
          window.location.href = '/dashboard';
        }, 1000);

        // Don't set loading to false since we're redirecting
        return;
      } else {
        console.warn('No error but no user returned from sign in');

        // Try refreshing the session
        try {
          console.log('Trying to refresh session...');
          await refreshSession();

          // Check if we have a user after refreshing
          if (user) {
            console.log('User is now logged in after refresh, redirecting to dashboard');
            // Use window.location for a hard redirect
            window.location.href = '/dashboard';
            return; // Exit early to prevent setLoading(false)
          } else {
            // Try one more direct API call as a last resort
            try {
              console.log('Trying direct API call to check authentication...');
              const response = await fetch('/api/auth/user');
              const data = await response.json();

              console.log('API auth check response:', data);

              if (data.status === 'success' && data.authenticated && data.userId) {
                console.log('User is authenticated according to API, storing ID and redirecting');
                localStorage.setItem('temp_user_id', data.userId);
                window.location.href = '/dashboard';
                return;
              }
            } catch (apiError) {
              console.error('Error checking auth via API:', apiError);
            }

            setError('Failed to sign in. Please try again with correct credentials.');
          }
        } catch (refreshError) {
          console.error('Error refreshing session:', refreshError);
          setError('Error refreshing session. Please try again.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Business AI Simulator</title>
        <meta name="description" content="Log in to your Business AI Simulator account" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="card">
              <h1 className="text-2xl font-bold mb-6 text-center">Log In</h1>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <p className="mb-2">{error}</p>
                  <button
                    onClick={async () => {
                      try {
                        console.log('Manually refreshing session...');
                        await refreshSession();
                        console.log('Session refreshed, checking if user is logged in now...');

                        // Try to get user info from API
                        const response = await fetch('/api/auth/user');
                        const data = await response.json();

                        console.log('API auth check response:', data);

                        if (user) {
                          console.log('User is now logged in, redirecting to dashboard');
                          window.location.href = '/dashboard';
                        } else if (data.status === 'success' && data.authenticated) {
                          console.log('User is authenticated according to API, redirecting to dashboard');
                          window.location.href = '/dashboard';
                        } else {
                          console.log('User is still not logged in after refresh');
                          setError('Still not logged in after refresh. Please try again with correct credentials.');
                        }
                      } catch (e) {
                        console.error('Error refreshing session:', e);
                        setError('Error refreshing session. Please try again.');
                      }
                    }}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                  >
                    Refresh Session
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Link href="/forgot-password" className="text-sm text-primary-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-primary-600 hover:underline">
                    Sign up
                  </Link>
                </p>
                <div className="mt-4">
                  <Link href="/debug" className="text-xs text-gray-500 hover:underline">
                    Debug Tools
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
