import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/utils/auth';
import { supabase } from '@/utils/supabaseClient';

export default function DebugPage() {
  const { user, userId, loading, refreshSession, signOut } = useAuth();
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [supabaseEnv, setSupabaseEnv] = useState<any>(null);

  const testDatabase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      console.error('Error testing database:', error);
      setTestResult({ error: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const checkDbConnection = async () => {
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);

      setDbStatus({
        connected: !error,
        error: error ? error.message : null,
        data
      });
    } catch (error) {
      setDbStatus({
        connected: false,
        error: String(error)
      });
    }
  };

  const checkSupabaseEnv = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    setSupabaseEnv({
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Set' : 'Not set',
      url_length: supabaseUrl?.length || 0,
      key_length: supabaseAnonKey?.length || 0
    });
  };

  const forceSignOut = async () => {
    try {
      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Sign out from Supabase
      await signOut();

      // Force reload
      window.location.href = '/';
    } catch (error) {
      console.error('Error in force sign out:', error);
    }
  };

  const testCreateUser = async () => {
    try {
      setIsLoading(true);

      // Generate a test user
      const testId = 'test-' + Date.now();
      const testEmail = `test-${Date.now()}@example.com`;

      // Try to create a user directly
      const { data, error } = await supabase
        .from('users')
        .insert([{
          auth0_id: testId,
          email: testEmail,
          name: 'Test User'
        }])
        .select();

      setTestResult({
        operation: 'Create Test User',
        success: !error,
        data,
        error: error ? error.message : null
      });

      // Clean up test user
      if (!error && data) {
        await supabase
          .from('users')
          .delete()
          .eq('auth0_id', testId);
      }
    } catch (error) {
      setTestResult({
        operation: 'Create Test User',
        success: false,
        error: String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testSignupFlow = async () => {
    try {
      setIsLoading(true);

      // Generate test credentials
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'Test123456';
      const testName = 'Test User';

      // Test the signup function directly
      const { signUp } = useAuth();
      const result = await signUp(testEmail, testPassword, testName);

      setTestResult({
        operation: 'Test Signup Flow',
        success: !result.error,
        user: result.user ? {
          id: result.user.id,
          email: result.user.email,
          confirmed: !!result.user.confirmed_at
        } : null,
        userId: result.userId,
        error: result.error ? result.error.message : null
      });

    } catch (error) {
      setTestResult({
        operation: 'Test Signup Flow',
        success: false,
        error: String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testApiCreateUser = async () => {
    try {
      setIsLoading(true);

      // Generate test data
      const testEmail = `test-${Date.now()}@example.com`;
      const testName = 'Test User';

      // Call the API directly
      const response = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          name: testName
        }),
      });

      const data = await response.json();

      setTestResult({
        operation: 'Test API Create User',
        success: data.status === 'success',
        data,
        userId: data.userId
      });

    } catch (error) {
      setTestResult({
        operation: 'Test API Create User',
        success: false,
        error: String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkDbConnection();
    checkSupabaseEnv();
  }, []);

  return (
    <>
      <Head>
        <title>Debug - Business AI Simulator</title>
        <meta name="description" content="Debug page for Business AI Simulator" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Debug Page</h1>

          <div className="mb-8 p-4 border rounded">
            <h2 className="text-xl font-bold mb-4">Authentication Status</h2>
            <div className="mb-4">
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>User ID:</strong> {userId || 'Not logged in'}</p>
              <p><strong>User Email:</strong> {user?.email || 'Not available'}</p>
              <p><strong>Auth ID:</strong> {user?.id || 'Not available'}</p>
              <p><strong>Last Updated:</strong> {new Date().toLocaleTimeString()}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={refreshSession}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Refresh Session
              </button>
              <button
                onClick={forceSignOut}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Force Sign Out
              </button>
            </div>
          </div>

          <div className="mb-8 p-4 border rounded">
            <h2 className="text-xl font-bold mb-4">Environment Variables</h2>
            <div className="mb-4">
              <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {supabaseEnv?.NEXT_PUBLIC_SUPABASE_URL || 'Checking...'}</p>
              <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {supabaseEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'Checking...'}</p>
              <p><strong>URL Length:</strong> {supabaseEnv?.url_length || 0} characters</p>
              <p><strong>Key Length:</strong> {supabaseEnv?.key_length || 0} characters</p>
            </div>
            <button
              onClick={checkSupabaseEnv}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            >
              Refresh Environment Info
            </button>
          </div>

          <div className="mb-8 p-4 border rounded">
            <h2 className="text-xl font-bold mb-4">Database Connection</h2>
            <div className="mb-4">
              <p><strong>Connected:</strong> {dbStatus?.connected ? 'Yes' : 'No'}</p>
              {dbStatus?.error && (
                <p className="text-red-500"><strong>Error:</strong> {dbStatus.error}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={checkDbConnection}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Check Connection
              </button>
              <button
                onClick={testDatabase}
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                disabled={isLoading}
              >
                {isLoading ? 'Testing...' : 'Run Database Test'}
              </button>
              <button
                onClick={testCreateUser}
                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                disabled={isLoading}
              >
                Test User Creation
              </button>
              <button
                onClick={testSignupFlow}
                className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
                disabled={isLoading}
              >
                Test Signup Flow
              </button>
              <button
                onClick={testApiCreateUser}
                className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
                disabled={isLoading}
              >
                Test API Create User
              </button>
            </div>
          </div>

          {testResult && (
            <div className="p-4 border rounded">
              <h2 className="text-xl font-bold mb-4">Test Results</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
