import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/utils/auth';
import { getBusinessById } from '@/utils/supabaseUtils';
import { Business, Agent } from '@/utils/supabaseClient';

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: Date;
  duration: number;
  attendees: string[];
  agenda: string[];
  notes?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  createdBy: string;
  createdAt: Date;
  dueDate: Date;
  completedAt?: Date;
}

interface Report {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  content: string;
}

export default function BusinessDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchBusiness = async () => {
      if (id && typeof id === 'string') {
        try {
          setLoading(true);

          // First try using the admin API endpoint
          try {
            console.log('Trying admin API endpoint for business ID:', id);

            const response = await fetch(`/api/debug/admin-get-business?id=${id}`);
            const data = await response.json();

            if (data.status === 'success' && data.business) {
              console.log('Found business using admin API:', data.business);
              setBusiness(data.business);
              setLoading(false);
              return;
            } else {
              console.error('Admin API did not return business:', data);
            }
          } catch (adminError) {
            console.error('Error using admin API endpoint:', adminError);
          }

          // If admin API fails, try using the utility function
          console.log('Falling back to utility function for business ID:', id);
          const businessData = await getBusinessById(id);

          if (businessData) {
            console.log('Found business using utility function:', businessData);
            setBusiness(businessData);
          } else {
            console.error('Business not found with ID:', id);
            // If business not found, redirect to businesses page
            router.push('/businesses');
          }
        } catch (error) {
          console.error('Error fetching business:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBusiness();
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
              {business.type} • Created on {new Date(business.created_at).toLocaleDateString()}
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
                        <p className="text-2xl font-bold">{business.agents?.length || 0}</p>
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
                  {business.agents?.map((agent) => (
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
                        {(() => {
                          // Parse skills if it's a string
                          let skillsArray = [];

                          if (agent.skills) {
                            if (typeof agent.skills === 'string') {
                              try {
                                skillsArray = JSON.parse(agent.skills);
                              } catch (e) {
                                console.error('Error parsing skills:', e);
                                // If parsing fails, just display the string
                                skillsArray = [agent.skills];
                              }
                            } else if (Array.isArray(agent.skills)) {
                              skillsArray = agent.skills;
                            }
                          }

                          return skillsArray.map((skill, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded"
                            >
                              {skill}
                            </span>
                          ));
                        })()}
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
