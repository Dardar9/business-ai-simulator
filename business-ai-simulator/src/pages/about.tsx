import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function About() {
  return (
    <>
      <Head>
        <title>About - Business AI Simulator</title>
        <meta name="description" content="Learn about the Business AI Simulator platform" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <section className="mb-12">
            <h1 className="text-4xl font-bold mb-6">About Business AI Simulator</h1>
            <p className="text-xl mb-4">
              Business AI Simulator is a revolutionary platform that allows you to create and manage AI-powered virtual businesses.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Our platform uses advanced artificial intelligence to create a complete business structure with autonomous agents for each role, from CEO to marketing specialist to software developer.
            </p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card">
                <div className="text-4xl font-bold text-primary-500 mb-4">1</div>
                <h3 className="text-xl font-semibold mb-2">Create Your Business</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Input your business idea, type, and description. Our AI will analyze your input and create a tailored business structure.
                </p>
              </div>
              <div className="card">
                <div className="text-4xl font-bold text-primary-500 mb-4">2</div>
                <h3 className="text-xl font-semibold mb-2">Meet Your AI Team</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your business will be populated with AI agents for each role, each with their own skills, expertise, and personality.
                </p>
              </div>
              <div className="card">
                <div className="text-4xl font-bold text-primary-500 mb-4">3</div>
                <h3 className="text-xl font-semibold mb-2">Run Your Business</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Assign tasks, hold meetings, and watch as your AI team works together to achieve your business goals.
                </p>
              </div>
            </div>
          </section>
          
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-xl font-semibold mb-2">Autonomous AI Agents</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Each AI agent has a specific role, skills, and expertise. They can work independently and collaborate with other agents.
                </p>
              </div>
              <div className="card">
                <h3 className="text-xl font-semibold mb-2">Real-time Communication</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Agents communicate with each other in real-time, sharing information, updates, and insights.
                </p>
              </div>
              <div className="card">
                <h3 className="text-xl font-semibold mb-2">Market Research</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  AI agents can research market trends, competitor analysis, and business opportunities.
                </p>
              </div>
              <div className="card">
                <h3 className="text-xl font-semibold mb-2">Business Intelligence</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get detailed reports, analytics, and insights about your business performance.
                </p>
              </div>
              <div className="card">
                <h3 className="text-xl font-semibold mb-2">File System Integration</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  AI agents can securely access and manage files on your local system.
                </p>
              </div>
              <div className="card">
                <h3 className="text-xl font-semibold mb-2">Multiple Businesses</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Create and manage multiple virtual businesses simultaneously.
                </p>
              </div>
            </div>
          </section>
          
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Use Cases</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <h3 className="text-xl font-semibold mb-2">Business Planning</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Test business ideas and strategies in a virtual environment before implementing them in the real world.
                </p>
              </div>
              <div className="card">
                <h3 className="text-xl font-semibold mb-2">Education</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Learn about business management, leadership, and entrepreneurship through hands-on experience.
                </p>
              </div>
              <div className="card">
                <h3 className="text-xl font-semibold mb-2">Productivity</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Delegate tasks to AI agents and focus on high-level strategy and decision-making.
                </p>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
