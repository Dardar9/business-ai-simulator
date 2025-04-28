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
    if (loginAttempted && !loading && !authLoading && !user) {
      console.log('Login attempted but user is still not logged in, refreshing session');
      const checkSession = async () => {
        await refreshSession();
      };
      checkSession();
    }
  }, [loginAttempted, loading, authLoading, user, refreshSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setLoginAttempted(true);

    try {
      console.log('Attempting to sign in with email:', email);
      const { error, user: signedInUser } = await signIn(email, password);

      if (error) {
        console.error('Sign in error:', error);
        setError(error.message || 'Failed to sign in. Please check your credentials.');
      } else if (signedInUser) {
        console.log('Sign in successful, user:', signedInUser);

        // Add a small delay to allow state to update
        setTimeout(() => {
          // Redirect to dashboard on successful login
          router.push('/dashboard');
        }, 500);
      } else {
        console.warn('No error but no user returned from sign in');
        setError('Failed to sign in. Please try again.');

        // Try refreshing the session
        await refreshSession();
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
                        if (user) {
                          console.log('User is now logged in, redirecting to dashboard');
                          router.push('/dashboard');
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
