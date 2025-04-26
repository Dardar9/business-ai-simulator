import Link from 'next/link';
import { Business } from '@/utils/supabaseClient';

interface BusinessListProps {
  businesses: Business[];
  loading?: boolean;
}

const BusinessList = ({ businesses, loading = false }: BusinessListProps) => {
  if (loading) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">My Businesses</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">My Businesses</h2>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You haven't created any businesses yet.
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Use the form to create your first AI-powered business.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">My Businesses</h2>
      <div className="space-y-4">
        {businesses.map((business) => (
          <Link
            href={`/businesses/${business.id}`}
            key={business.id}
            className="block"
          >
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <h3 className="text-xl font-semibold mb-2">{business.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Type: {business.type}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Created: {new Date(business.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Agents: {business.agents?.length || 0}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BusinessList;
