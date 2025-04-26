import { useState } from 'react';
import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { generateResearchReport } from '@/services/researchService';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface ResearchReport {
  query: string;
  summary: string;
  keyFindings: string[];
  sources: SearchResult[];
}

export default function MarketResearch() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<ResearchReport | null>(null);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const researchReport = await generateResearchReport(query);
      setReport(researchReport);
    } catch (error) {
      console.error('Error generating research report:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Head>
        <title>Market Research - Business AI Simulator</title>
        <meta name="description" content="Research market trends and opportunities" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Market Research</h1>
          
          <div className="card mb-8">
            <h2 className="text-xl font-bold mb-4">Research a Business or Industry</h2>
            <form onSubmit={handleSearch}>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input flex-grow"
                  placeholder="Enter a business type or industry (e.g., 'SaaS', 'E-commerce', 'Renewable Energy')"
                />
                <button
                  type="submit"
                  className="btn-primary whitespace-nowrap"
                  disabled={isLoading}
                >
                  {isLoading ? 'Researching...' : 'Research'}
                </button>
              </div>
            </form>
          </div>
          
          {isLoading && (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          )}
          
          {report && !isLoading && (
            <div className="space-y-8">
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Research Report: {report.query}</h2>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Summary</h3>
                  <p className="text-gray-700 dark:text-gray-300">{report.summary}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Key Findings</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {report.keyFindings.map((finding, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">{finding}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Sources</h3>
                <div className="space-y-4">
                  {report.sources.map((source, index) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                      <h4 className="font-medium text-primary-600 dark:text-primary-400 mb-1">
                        <a href={source.url} target="_blank" rel="noopener noreferrer">
                          {source.title}
                        </a>
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{source.url}</p>
                      <p className="text-gray-700 dark:text-gray-300">{source.snippet}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    // In a real app, this would save the report or create a business based on the research
                    alert('This feature would save the report or create a business based on the research.');
                  }}
                  className="btn-secondary"
                >
                  Use This Research
                </button>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
