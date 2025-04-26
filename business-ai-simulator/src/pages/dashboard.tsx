import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Define the Business interface directly in this file to avoid import issues
interface Business {
  id: string;
  name: string;
  type: string;
  description: string;
  createdAt: Date;
  agents: any[];
}

export default function Dashboard() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load businesses from localStorage
    try {
      // Check if window is defined (client-side)
      if (typeof window !== 'undefined') {
        const storedBusinesses = localStorage.getItem('businesses');
        if (storedBusinesses) {
          const parsedBusinesses = JSON.parse(storedBusinesses);
          // Convert string dates back to Date objects
          const businesses = parsedBusinesses.map((business: any) => ({
            ...business,
            createdAt: new Date(business.createdAt)
          }));
          setBusinesses(businesses);
        }
      }
    } catch (error) {
      console.error('Error loading businesses from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Dashboard - Business AI Simulator</title>
        <meta name="description" content="Manage your AI-powered businesses" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <>
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
                        {business.type} • Created {new Date(business.createdAt).toLocaleDateString()}
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
    </>
  );
}
