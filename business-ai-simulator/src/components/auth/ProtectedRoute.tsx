import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('ProtectedRoute: Starting authentication check');

      // First check: If we have a user from the auth context, we're authenticated
      if (user) {
        console.log('ProtectedRoute: User found in auth context');
        setIsAuthenticated(true);
        return;
      }

      // Second check: Check if we have a user ID in localStorage
      const localUserId = typeof window !== 'undefined' ? window.localStorage.getItem('temp_user_id') : null;
      if (localUserId) {
        console.log('ProtectedRoute: User ID found in localStorage');
        setIsAuthenticated(true);
        return;
      }

      // Third check: Check if we're on the dashboard page and there's a user in localStorage
      if (typeof window !== 'undefined' && window.location.pathname.includes('/dashboard')) {
        // This is a special case for the dashboard page
        console.log('ProtectedRoute: On dashboard page, checking localStorage');

        // Try to get user from API
        try {
          const response = await fetch('/api/auth/user');
          const data = await response.json();

          if (data.status === 'success' && data.authenticated) {
            console.log('ProtectedRoute: User authenticated via API');
            setIsAuthenticated(true);
            return;
          }
        } catch (error) {
          console.error('ProtectedRoute: Error checking auth via API:', error);
        }
      }

      // If we get here, we're not authenticated
      console.log('ProtectedRoute: No authentication found, redirecting to login');
      setIsAuthenticated(false);
      window.location.href = '/login';
    };

    checkAuth();

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isAuthenticated === null) {
        console.log('ProtectedRoute: Authentication check timed out');
        setTimeoutOccurred(true);

        // Force authentication if we're on the dashboard page
        if (typeof window !== 'undefined' && window.location.pathname.includes('/dashboard')) {
          console.log('ProtectedRoute: Forcing authentication for dashboard');
          setIsAuthenticated(true);
        }
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [user, router]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-gray-600">Verifying authentication...</p>
        {timeoutOccurred && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Authentication is taking longer than expected.
            </p>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setIsAuthenticated(true)}
                className="text-primary-600 underline"
              >
                Continue Anyway
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="text-primary-600 underline"
              >
                Return to Login
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;
