import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);

  useEffect(() => {
    // Simple check - if no user after loading is done, redirect to login
    if (!loading && !user) {
      console.log('ProtectedRoute: No user found, redirecting to login...');
      window.location.href = '/login';
    }

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('ProtectedRoute: Authentication check timed out');
        setTimeoutOccurred(true);
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-gray-600">Verifying authentication...</p>
        {timeoutOccurred && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Authentication is taking longer than expected.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="text-primary-600 underline"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    );
  }

  // Only render children if authenticated
  return user ? <>{children}</> : null;
};

export default ProtectedRoute;
