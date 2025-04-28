import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, userId, loading, refreshSession } = useAuth();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('ProtectedRoute: Checking authentication...', { user, loading, retryCount });

      if (!loading) {
        if (!user && retryCount < 2) {
          // Try refreshing the session once before redirecting
          console.log('ProtectedRoute: No user found, attempting to refresh session...');
          await refreshSession();
          setRetryCount(prev => prev + 1);
        } else if (!user) {
          // Redirect to login page if not authenticated after retry
          console.log('ProtectedRoute: No user found after retry, redirecting to login...');
          router.push('/login');
        } else {
          // User is authenticated
          console.log('ProtectedRoute: User is authenticated:', user);
          setAuthChecked(true);
        }
      }
    };

    checkAuth();
  }, [user, loading, router, refreshSession, retryCount]);

  // Show loading state while checking authentication
  if (loading || (!authChecked && retryCount < 3)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-gray-600">Verifying authentication...</p>
        {retryCount > 0 && (
          <p className="text-sm text-gray-500 mt-2">Retry attempt: {retryCount}/2</p>
        )}
      </div>
    );
  }

  // Only render children if authenticated
  return user ? <>{children}</> : null;
};

export default ProtectedRoute;
