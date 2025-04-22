import Head from 'next/head';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BusinessCreationForm from '@/components/business/BusinessCreationForm';
import BusinessList from '@/components/business/BusinessList';
import { Business } from '@/models/Business';

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([]);

  const handleCreateBusiness = (business: Business) => {
    setBusinesses([...businesses, business]);
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
