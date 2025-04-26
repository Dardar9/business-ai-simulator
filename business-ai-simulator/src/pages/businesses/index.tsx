import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/utils/auth';
import { supabase } from '@/utils/supabaseClient';

// Define the Business interface directly in this file to avoid import issues
interface Business {
  id: string;
  name: string;
  type: string;
  description: string;
  createdAt: Date;
  agents: any[];
}

export default function Businesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // For now, we'll use localStorage to get businesses since we don't have a backend yet
    const fetchBusinesses = () => {
      try {
        setLoading(true);

        // Check if window is defined (client-side)
        if (typeof window !== 'undefined') {
          // Try to get businesses from localStorage
          const storedBusinesses = localStorage.getItem('businesses');
          if (storedBusinesses) {
            const parsedBusinesses = JSON.parse(storedBusinesses);
            setBusinesses(parsedBusinesses);
          }
        }
      } catch (error) {
        console.error('Error fetching businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

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
            </>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
