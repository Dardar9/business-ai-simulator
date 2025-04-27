import Head from 'next/head';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BusinessCreationForm from '@/components/business/BusinessCreationForm';
import BusinessList from '@/components/business/BusinessList';
import { useRouter } from 'next/router';
import { useAuth } from '@/utils/auth';
import { getBusinesses } from '@/utils/supabaseUtils';
import { Business } from '@/utils/supabaseClient';
import { Business as FormBusiness } from '@/components/business/BusinessCreationForm';

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, userId } = useAuth();

  // Load businesses from Supabase when user is authenticated
  useEffect(() => {
    const fetchBusinesses = async () => {
      if (userId) {
        try {
          setLoading(true);
          const businessesData = await getBusinesses(userId);
          setBusinesses(businessesData);
        } catch (error) {
          console.error('Error fetching businesses:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [userId]);

  const handleCreateBusiness = (business: FormBusiness) => {
    // Redirect to the create business page
    router.push('/create-business');
  };

  return (
    <>
      <Head>
        <title>Business AI Simulator</title>
        <meta name="description" content="AI-powered business simulation platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <section className="mb-12">
            <h1 className="text-4xl font-bold mb-6 text-center">
              Business AI Simulator
            </h1>
            <p className="text-xl text-center max-w-3xl mx-auto">
              Create and manage AI-powered virtual businesses. Input your business idea, and our AI will create a complete business structure with autonomous agents for each role.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-12">
            <BusinessCreationForm onCreateBusiness={handleCreateBusiness} />
            <BusinessList businesses={businesses} loading={loading} />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
