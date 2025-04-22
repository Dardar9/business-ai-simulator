import { useAuth } from '@/utils/auth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // If the user is not authenticated and not in the process of logging in, redirect to login
    if (!isLoading && !isAuthenticated) {
      // Store the current path to redirect back after login
      const returnUrl = encodeURIComponent(router.asPath);
      
      // Redirect to login
      login();
    }
  }, [isAuthenticated, isLoading, login, router]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  // If authenticated, render the children
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;
