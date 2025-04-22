import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Business, Agent, Meeting, Task, Report } from '@/models/Business';

// Mock data - in a real app, this would come from an API
const mockBusinesses: Business[] = [];

export default function BusinessDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  useEffect(() => {
    if (id) {
      // In a real app, this would be an API call
      const foundBusiness = mockBusinesses.find(b => b.id === id);
      
      if (foundBusiness) {
        setBusiness(foundBusiness);
      } else {
        // If no business is found, redirect to the home page
        router.push('/');
      }
      
      setLoading(false);
    }
  }, [id, router]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
          <p className="mb-4">The business you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>{business.name} - Business AI Simulator</title>
        <meta name="description" content={`Manage your ${business.name} business with AI agents`} />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {business.type} • Created on {business.createdAt.toLocaleDateString()}
            </p>
          </div>
          
          <div className="mb-8">
            <nav className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                className={`py-4 px-6 font-medium ${
                  activeTab === 'dashboard'
                    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`py-4 px-6 font-medium ${
                  activeTab === 'agents'
                    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('agents')}
              >
                Agents
              </button>
              <button
                className={`py-4 px-6 font-medium ${
                  activeTab === 'tasks'
                    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('tasks')}
              >
                Tasks
              </button>
              <button
                className={`py-4 px-6 font-medium ${
                  activeTab === 'meetings'
                    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('meetings')}
              >
                Meetings
              </button>
              <button
                className={`py-4 px-6 font-medium ${
                  activeTab === 'reports'
                    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('reports')}
              >
                Reports
              </button>
            </nav>
          </div>
          
          <div className="mb-8">
            {activeTab === 'dashboard' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Business Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card">
                    <h3 className="text-xl font-semibold mb-4">Business Overview</h3>
                    <p className="mb-4">{business.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Agents</p>
                        <p className="text-2xl font-bold">{business.agents.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tasks</p>
                        <p className="text-2xl font-bold">0</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card">
                    <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      No recent activity to display.
                    </p>
                  </div>
                  
                  <div className="card">
                    <h3 className="text-xl font-semibold mb-4">Upcoming Meetings</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      No upcoming meetings scheduled.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'agents' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">AI Agents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {business.agents.map((agent) => (
                    <div key={agent.id} className="card">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mr-4"></div>
                        <div>
                          <h3 className="text-xl font-semibold">{agent.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{agent.role}</p>
                        </div>
                      </div>
                      <p className="mb-4">{agent.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {agent.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'tasks' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Tasks</h2>
                <div className="card">
                  <p className="text-gray-500 dark:text-gray-400">
                    No tasks have been created yet.
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === 'meetings' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Meetings</h2>
                <div className="card">
                  <p className="text-gray-500 dark:text-gray-400">
                    No meetings have been scheduled yet.
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === 'reports' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Reports</h2>
                <div className="card">
                  <p className="text-gray-500 dark:text-gray-400">
                    No reports have been generated yet.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
