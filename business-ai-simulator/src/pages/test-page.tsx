import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TestPage() {
  return (
    <>
      <Head>
        <title>Test Page - Business AI Simulator</title>
        <meta name="description" content="Test page for routing" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Test Page</h1>
          <p className="mb-4">This is a test page to verify routing is working correctly.</p>
          <div className="space-y-4">
            <p>Try navigating to these pages:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <Link href="/" className="text-primary-600 hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/businesses" className="text-primary-600 hover:underline">
                  Businesses
                </Link>
              </li>
              <li>
                <Link href="/create-business" className="text-primary-600 hover:underline">
                  Create Business
                </Link>
              </li>
            </ul>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
