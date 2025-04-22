import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/utils/auth';
import Image from 'next/image';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading, user, login, logout } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              BusinessAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/dashboard" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">
                  Dashboard
                </Link>
                <Link href="/market-research" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">
                  Research
                </Link>
              </>
            )}
            <Link href="/about" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">
              About
            </Link>
          </nav>

          {/* Auth Buttons / Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                    {user?.picture && (
                      <img
                        src={user.picture}
                        alt={user.name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span className="text-gray-700 dark:text-gray-200">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-700 dark:text-gray-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={login}
                className="btn-primary"
              >
                Log In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 dark:text-gray-200 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 space-y-4">
            <Link 
              href="/" 
              className="block text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  href="/dashboard" 
                  className="block text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/market-research" 
                  className="block text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Research
                </Link>
              </>
            )}
            <Link 
              href="/about" 
              className="block text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            
            {/* Mobile Auth */}
            {isLoading ? (
              <div className="w-full py-2">
                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : isAuthenticated ? (
              <>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                      {user?.picture && (
                        <img
                          src={user.picture}
                          alt={user.name || 'User'}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span className="text-gray-700 dark:text-gray-200">
                      {user?.name || 'User'}
                    </span>
                  </div>
                  <Link 
                    href="/profile" 
                    className="block text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link 
                    href="/settings" 
                    className="block text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                    className="block w-full text-left text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 py-1"
                  >
                    Log Out
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  login();
                }}
                className="block w-full text-left text-primary-600 dark:text-primary-400 font-medium py-1"
              >
                Log In
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
