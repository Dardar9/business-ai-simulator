import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface BusinessTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  agentCount: number;
  complexity: 'Low' | 'Medium' | 'High';
  tags: string[];
}

const businessTemplates: BusinessTemplate[] = [
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    type: 'Technology',
    description: 'A technology startup focused on software development and innovation.',
    agentCount: 8,
    complexity: 'Medium',
    tags: ['Technology', 'Software', 'Innovation'],
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Store',
    type: 'Retail',
    description: 'An online retail business selling products directly to consumers.',
    agentCount: 7,
    complexity: 'Medium',
    tags: ['Retail', 'E-commerce', 'Online'],
  },
  {
    id: 'marketing-agency',
    name: 'Marketing Agency',
    type: 'Services',
    description: 'A full-service marketing agency offering digital and traditional marketing services.',
    agentCount: 9,
    complexity: 'Medium',
    tags: ['Marketing', 'Agency', 'Services'],
  },
  {
    id: 'consulting-firm',
    name: 'Consulting Firm',
    type: 'Services',
    description: 'A business consulting firm providing expert advice to organizations.',
    agentCount: 6,
    complexity: 'Medium',
    tags: ['Consulting', 'Services', 'Business'],
  },
  {
    id: 'saas-company',
    name: 'SaaS Company',
    type: 'Technology',
    description: 'A software-as-a-service company offering cloud-based solutions.',
    agentCount: 10,
    complexity: 'High',
    tags: ['SaaS', 'Technology', 'Cloud'],
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    type: 'Food & Beverage',
    description: 'A restaurant business with dine-in and takeout services.',
    agentCount: 5,
    complexity: 'Low',
    tags: ['Restaurant', 'Food', 'Service'],
  },
  {
    id: 'real-estate',
    name: 'Real Estate Agency',
    type: 'Real Estate',
    description: 'A real estate agency helping clients buy, sell, and rent properties.',
    agentCount: 6,
    complexity: 'Medium',
    tags: ['Real Estate', 'Property', 'Agency'],
  },
  {
    id: 'healthcare-provider',
    name: 'Healthcare Provider',
    type: 'Healthcare',
    description: 'A healthcare provider offering medical services to patients.',
    agentCount: 8,
    complexity: 'High',
    tags: ['Healthcare', 'Medical', 'Services'],
  },
  {
    id: 'education-platform',
    name: 'Education Platform',
    type: 'Education',
    description: 'An online education platform offering courses and learning resources.',
    agentCount: 7,
    complexity: 'Medium',
    tags: ['Education', 'Online', 'Learning'],
  },
];

export default function Templates() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Get all unique tags
  const allTags = Array.from(new Set(businessTemplates.flatMap(template => template.tags)));
  
  // Filter templates based on search term and selected tags
  const filteredTemplates = businessTemplates.filter(template => {
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => template.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });
  
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  const handleUseTemplate = (templateId: string) => {
    // In a real app, this would redirect to a form pre-filled with the template data
    router.push(`/create-business?template=${templateId}`);
  };
  
  return (
    <>
      <Head>
        <title>Business Templates - Business AI Simulator</title>
        <meta name="description" content="Browse pre-configured business templates" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Business Templates</h1>
          
          <div className="card mb-8">
            <div className="mb-4">
              <label htmlFor="search" className="block text-gray-700 dark:text-gray-300 mb-2">
                Search Templates
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full"
                placeholder="Search by name, type, or description"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Filter by Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedTags.includes(tag)
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <div key={template.id} className="card">
                <h2 className="text-xl font-bold mb-2">{template.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {template.type} • {template.agentCount} Agents • {template.complexity} Complexity
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handleUseTemplate(template.id)}
                  className="btn-primary w-full"
                >
                  Use Template
                </button>
              </div>
            ))}
          </div>
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No templates match your search criteria.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTags([]);
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
