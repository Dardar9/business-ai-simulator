import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/utils/auth';
import { supabase } from '@/utils/supabaseClient';

export default function DebugPage() {
  const { user, userId, loading, refreshSession } = useAuth();
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

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

  useEffect(() => {
    checkDbConnection();
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
            </div>
            <button 
              onClick={refreshSession}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Refresh Session
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
            <button 
              onClick={checkDbConnection}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
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
