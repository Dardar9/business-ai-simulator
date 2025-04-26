import Head from 'next/head';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BusinessCreationForm from '@/components/business/BusinessCreationForm';
import BusinessList from '@/components/business/BusinessList';
import { useRouter } from 'next/router';

// Define the Business interface directly in this file to avoid import issues
interface Business {
  id: string;
  name: string;
  type: string;
  description: string;
  createdAt: Date;
  agents: any[];
}

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const router = useRouter();

  // Load businesses from localStorage on component mount
  useEffect(() => {
    try {
      // Check if window is defined (client-side)
      if (typeof window !== 'undefined') {
        const storedBusinesses = localStorage.getItem('businesses');
        if (storedBusinesses) {
          const parsedBusinesses = JSON.parse(storedBusinesses);
          setBusinesses(parsedBusinesses);
        }
      }
    } catch (error) {
      console.error('Error loading businesses from localStorage:', error);
    }
  }, []);

  const handleCreateBusiness = (business: Business) => {
    // Add the new business to the state
    const updatedBusinesses = [...businesses, business];
    setBusinesses(updatedBusinesses);

    // Save to localStorage (only on client-side)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('businesses', JSON.stringify(updatedBusinesses));

        // Redirect to the business detail page after a short delay
        setTimeout(() => {
          router.push(`/businesses/${business.id}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving businesses to localStorage:', error);
    }
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
            <BusinessList businesses={businesses} />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
