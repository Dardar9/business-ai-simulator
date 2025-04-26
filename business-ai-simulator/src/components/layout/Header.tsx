import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/utils/auth';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

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

            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">
                  Dashboard
                </Link>
                <Link href="/businesses" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">
                  My Businesses
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">
                  Log In
                </Link>
                <Link href="/signup" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">
                  Sign Up
                </Link>
              </>
            )}

            <Link href="/about" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">
              About
            </Link>
          </nav>

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
            <Link href="/" className="block text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">
              Home
            </Link>

            {user ? (
              <>
                <Link href="/dashboard" className="block text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">
                  Dashboard
                </Link>
                <Link href="/businesses" className="block text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">
                  My Businesses
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">
                  Log In
                </Link>
                <Link href="/signup" className="block text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">
                  Sign Up
                </Link>
              </>
            )}

            <Link href="/about" className="block text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">
              About
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
