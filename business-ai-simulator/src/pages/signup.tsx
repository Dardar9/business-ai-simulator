import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '@/utils/auth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting to sign up with email:', email);
      const { error, user, userId } = await signUp(email, password, name);

      // Log detailed response for debugging
      console.log('Sign up response details:', {
        error: error ? 'Error present' : 'No error',
        user: user ? 'User present' : 'No user',
        userId: userId || 'No database user ID'
      });

      if (error) {
        console.error('Sign up error:', error);

        // Check if it's an email confirmation message
        if (error.message && error.message.includes('check your email')) {
          // This is actually a success case where email confirmation is required
          setSuccess('Account created successfully! Please check your email to confirm your account.');

          // Clear form
          setName('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');

          // Use a hard redirect to the login page after a delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 3000);

          setLoading(false);
          return;
        } else {
          // This is a real error
          setError(error.message || 'Failed to create account. Please try again.');
        }
      } else if (user) {
        console.log('Sign up successful, user:', user);

        // Check if database user was created
        if (userId) {
          console.log('Database user created with ID:', userId);
        } else {
          console.warn('No database user ID returned, but signup was successful');
        }

        // Check if email confirmation is required
        if (user.confirmation_sent_at && !user.confirmed_at) {
          setSuccess('Account created successfully! Please check your email to confirm your account.');
        } else {
          setSuccess('Account created successfully! You will be redirected to the login page.');
        }

        // Clear form
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        // Use a hard redirect to the login page
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);

        setLoading(false);
        return;
      } else {
        // No error but also no user - this is unexpected
        console.warn('No error and no user returned from signup');
        setSuccess('Account creation process started. Please check your email and follow any instructions.');

        // Clear form
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        // Redirect after a delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);

        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up - Business AI Simulator</title>
        <meta name="description" content="Create a new Business AI Simulator account" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="card">
              <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>

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
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters long
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary mb-2"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Sign Up'}
                </button>

                {error && (
                  <div className="mt-4">
                    <p className="text-sm text-red-600 mb-2">
                      {error.includes("row-level security policy") ?
                        "Database permission error. Please contact support or try the alternative method below." :
                        error}
                    </p>
                    <button
                      type="button"
                      className="w-full btn-secondary"
                      disabled={loading}
                      onClick={async () => {
                        try {
                          setLoading(true);
                          setError(null);

                          // Try direct API signup as a fallback
                          console.log('Trying direct API signup');

                          // First create a user in the database
                          const createUserResponse = await fetch('/api/auth/create-user', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              email,
                              name,
                            }),
                          });

                          const userData = await createUserResponse.json();
                          console.log('Create user API response:', userData);

                          if (userData.status === 'success') {
                            setSuccess('Account created via alternative method. You will be redirected to login.');

                            // Clear form
                            setName('');
                            setEmail('');
                            setPassword('');
                            setConfirmPassword('');

                            // Redirect after a delay
                            setTimeout(() => {
                              window.location.href = '/login';
                            }, 3000);
                          } else {
                            setError('Alternative signup method failed: ' + (userData.message || 'Unknown error'));
                          }
                        } catch (err) {
                          console.error('Alternative signup error:', err);
                          setError('Alternative signup method failed. Please try again later.');
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      Try Alternative Signup
                    </button>
                  </div>
                )}
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary-600 hover:underline">
                    Log in
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
