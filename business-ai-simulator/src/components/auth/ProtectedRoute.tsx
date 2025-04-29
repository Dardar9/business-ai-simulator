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
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    // Check for user ID in localStorage as a fallback
    const localUserId = typeof window !== 'undefined' ? window.localStorage.getItem('temp_user_id') : null;

    const checkAuth = async () => {
      console.log('ProtectedRoute: Checking authentication...', {
        user: user ? 'Present' : 'Not present',
        userId,
        localUserId,
        loading,
        retryCount
      });

      // If we're not in the loading state, proceed with auth check
      if (!loading) {
        if (!user && retryCount < 2) {
          // Try refreshing the session before redirecting
          console.log('ProtectedRoute: No user found, attempting to refresh session...');
          try {
            await refreshSession();
            setRetryCount(prev => prev + 1);
          } catch (error) {
            console.error('ProtectedRoute: Error refreshing session:', error);
            setRetryCount(prev => prev + 1);
          }
        } else if (!user) {
          // Redirect to login page if not authenticated after retry
          console.log('ProtectedRoute: No user found after retry, redirecting to login...');

          // Use window.location for a hard redirect to clear any stale state
          window.location.href = '/login';
        } else {
          // User is authenticated
          console.log('ProtectedRoute: User is authenticated:', user.id);
          setAuthChecked(true);
          setLocalLoading(false);
        }
      }
    };

    checkAuth();

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (localLoading && retryCount >= 2) {
        console.log('ProtectedRoute: Authentication check timed out, redirecting to login...');
        window.location.href = '/login';
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [user, loading, router, refreshSession, retryCount]);

  // Show loading state while checking authentication
  if (loading || localLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-gray-600">Verifying authentication...</p>
        {retryCount > 0 && (
          <p className="text-sm text-gray-500 mt-2">Retry attempt: {retryCount}/2</p>
        )}
        {retryCount >= 2 && (
          <button
            onClick={() => window.location.href = '/login'}
            className="mt-4 text-primary-600 underline"
          >
            Return to Login
          </button>
        )}
      </div>
    );
  }

  // Only render children if authenticated
  return user ? <>{children}</> : null;
};

export default ProtectedRoute;
