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
        } else if (!userId && localUserId) {
          // We have a user but no userId, try to use the one from localStorage
          console.log('ProtectedRoute: User is authenticated but no userId, using localStorage value:', localUserId);

          // Make a direct API call to verify the user ID
          try {
            const response = await fetch('/api/auth/user');
            const data = await response.json();

            console.log('ProtectedRoute: API auth check response:', data);

            if (data.status === 'success' && data.authenticated && data.userId) {
              console.log('ProtectedRoute: Got userId from API:', data.userId);
              // Store in localStorage and proceed
              window.localStorage.setItem('temp_user_id', data.userId);
              setAuthChecked(true);
              setLocalLoading(false);
            } else {
              // Use the localStorage value as a fallback
              console.log('ProtectedRoute: Using localStorage userId as fallback');
              setAuthChecked(true);
              setLocalLoading(false);
            }
          } catch (error) {
            console.error('ProtectedRoute: Error checking auth via API:', error);
            // Still use the localStorage value as a fallback
            console.log('ProtectedRoute: Using localStorage userId as fallback after API error');
            setAuthChecked(true);
            setLocalLoading(false);
          }
        } else if (!userId && !localUserId && retryCount < 2) {
          // We have a user but no userId and no localStorage value, try to create a user via API
          console.log('ProtectedRoute: User is authenticated but no userId, trying to create user via API...');
          try {
            // Try to create a user via the API
            const response = await fetch('/api/auth/create-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: user.email,
                name: user.user_metadata?.name || user.email.split('@')[0],
                auth0_id: user.id
              }),
            });

            const apiData = await response.json();
            console.log('ProtectedRoute: API create user response:', apiData);

            if (apiData.status === 'success' && apiData.userId) {
              console.log('ProtectedRoute: User created via API with ID:', apiData.userId);

              // Store in localStorage and proceed
              window.localStorage.setItem('temp_user_id', apiData.userId);
              setAuthChecked(true);
              setLocalLoading(false);
            } else {
              // If API call fails, try refreshing the session one more time
              console.log('ProtectedRoute: API call failed, trying to refresh session...');
              try {
                await refreshSession();
                setRetryCount(prev => prev + 1);
              } catch (refreshError) {
                console.error('ProtectedRoute: Error refreshing session for userId:', refreshError);
                setRetryCount(prev => prev + 1);
              }
            }
          } catch (error) {
            console.error('ProtectedRoute: Error creating user via API:', error);
            setRetryCount(prev => prev + 1);
          }
        } else if (!userId && !localUserId) {
          // After retries, still no userId, try one last direct API call
          console.log('ProtectedRoute: User is authenticated but no userId after retries, trying direct API call...');
          try {
            const response = await fetch('/api/auth/user');
            const data = await response.json();

            console.log('ProtectedRoute: Final API auth check response:', data);

            if (data.status === 'success' && data.authenticated && data.userId) {
              console.log('ProtectedRoute: Got userId from final API call:', data.userId);
              // Store in localStorage and proceed
              window.localStorage.setItem('temp_user_id', data.userId);
              setAuthChecked(true);
              setLocalLoading(false);
            } else {
              // If all else fails, redirect to login
              console.log('ProtectedRoute: All attempts failed, redirecting to login...');
              window.location.href = '/login?error=no_user_id';
            }
          } catch (error) {
            console.error('ProtectedRoute: Error in final API check:', error);
            window.location.href = '/login?error=api_error';
          }
        } else {
          // User is authenticated and we have a userId
          console.log('ProtectedRoute: User is authenticated:', user.id, 'with userId:', userId || localUserId);
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
  }, [user, userId, loading, router, refreshSession, retryCount]);

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
