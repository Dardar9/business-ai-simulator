import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Define the Business and Agent interfaces directly in this file to avoid import issues
export interface Business {
  id: string;
  name: string;
  type: string;
  description: string;
  createdAt: Date;
  agents: Agent[];
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  skills: string[];
  avatar: string;
}

interface BusinessCreationFormProps {
  onCreateBusiness: (business: Business) => void;
}

const BusinessCreationForm = ({ onCreateBusiness }: BusinessCreationFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      // In a real application, this would call an API to create the business and generate agents
      // For now, we'll simulate the creation with a timeout

      setTimeout(() => {
        const newBusiness: Business = {
          id: uuidv4(),
          name: formData.name,
          type: formData.type,
          description: formData.description,
          createdAt: new Date(),
          agents: [
            {
              id: uuidv4(),
              name: 'AI CEO',
              role: 'CEO',
              description: 'Chief Executive Officer responsible for overall business strategy and leadership.',
              skills: ['Leadership', 'Strategy', 'Decision Making', 'Business Development'],
              avatar: '/avatars/ceo.png',
            },
            {
              id: uuidv4(),
              name: 'AI CTO',
              role: 'CTO',
              description: 'Chief Technology Officer responsible for technical strategy and implementation.',
              skills: ['Technical Leadership', 'Software Architecture', 'Innovation', 'Team Management'],
              avatar: '/avatars/cto.png',
            },
            {
              id: uuidv4(),
              name: 'AI CFO',
              role: 'CFO',
              description: 'Chief Financial Officer responsible for financial planning and management.',
              skills: ['Financial Planning', 'Risk Management', 'Budgeting', 'Investment Strategy'],
              avatar: '/avatars/cfo.png',
            },
            {
              id: uuidv4(),
              name: 'AI Marketing Specialist',
              role: 'MARKETING_SPECIALIST',
              description: 'Marketing specialist responsible for promoting the business and its products.',
              skills: ['Digital Marketing', 'Content Creation', 'Market Research', 'Brand Strategy'],
              avatar: '/avatars/marketing.png',
            },
            {
              id: uuidv4(),
              name: 'AI Engineer',
              role: 'AI_ENGINEER',
              description: 'AI Engineer responsible for developing and implementing AI solutions.',
              skills: ['Machine Learning', 'Data Science', 'Software Development', 'Problem Solving'],
              avatar: '/avatars/engineer.png',
            },
          ],
        };

        onCreateBusiness(newBusiness);

        // Reset form
        setFormData({
          name: '',
          type: '',
          description: '',
        });

        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error creating business:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Create a New Business</h2>
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

        <button
          type="submit"
          className="btn-primary w-full"
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
      </form>
    </div>
  );
};

export default BusinessCreationForm;
