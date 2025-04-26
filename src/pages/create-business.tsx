import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Business } from '@/models/Business';
import { v4 as uuidv4 } from 'uuid';

interface BusinessTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
}

// Mock templates - in a real app, these would come from an API
const businessTemplates: Record<string, BusinessTemplate> = {
  'tech-startup': {
    id: 'tech-startup',
    name: 'Tech Startup',
    type: 'Technology',
    description: 'A technology startup focused on software development and innovation.',
  },
  'ecommerce': {
    id: 'ecommerce',
    name: 'E-commerce Store',
    type: 'Retail',
    description: 'An online retail business selling products directly to consumers.',
  },
  'marketing-agency': {
    id: 'marketing-agency',
    name: 'Marketing Agency',
    type: 'Services',
    description: 'A full-service marketing agency offering digital and traditional marketing services.',
  },
  // Add more templates as needed
};

export default function CreateBusiness() {
  const router = useRouter();
  const { template: templateId } = router.query;
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
  });
  
  useEffect(() => {
    if (templateId && typeof templateId === 'string' && businessTemplates[templateId]) {
      const template = businessTemplates[templateId];
      setFormData({
        name: template.name,
        type: template.type,
        description: template.description,
      });
    }
  }, [templateId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real application, this would call an API to create the business
      // For now, we'll simulate the creation with a timeout
      
      setTimeout(() => {
        const newBusiness: Business = {
          id: uuidv4(),
          name: formData.name,
          type: formData.type,
          description: formData.description,
          createdAt: new Date(),
          agents: [],
        };
        
        // In a real app, this would save the business to a database
        // For now, we'll just redirect to the home page
        
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Error creating business:', error);
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Head>
        <title>Create Business - Business AI Simulator</title>
        <meta name="description" content="Create a new AI-powered business" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Create a New Business</h1>
          
          <div className="max-w-2xl mx-auto">
            <div className="card">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="Enter business name"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="type" className="block text-gray-700 dark:text-gray-300 mb-2">
                    Business Type *
                  </label>
                  <input
                    type="text"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="e.g., E-commerce, SaaS, Consulting"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 mb-2">
                    Business Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input w-full h-32"
                    placeholder="Describe your business idea, goals, and target market"
                  />
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Business...
                      </span>
                    ) : (
                      'Create Business'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
