import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { Auth0ProviderWithHistory } from '@/utils/auth';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  // Add a check for environment variables in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const missingEnvVars = [];
      
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingEnvVars.push('NEXT_PUBLIC_SUPABASE_URL');
      if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingEnvVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
      if (!process.env.NEXT_PUBLIC_AUTH0_DOMAIN) missingEnvVars.push('NEXT_PUBLIC_AUTH0_DOMAIN');
      if (!process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID) missingEnvVars.push('NEXT_PUBLIC_AUTH0_CLIENT_ID');
      if (!process.env.OPENAI_API_KEY) missingEnvVars.push('OPENAI_API_KEY');
      
      if (missingEnvVars.length > 0) {
        console.warn(`Missing environment variables: ${missingEnvVars.join(', ')}`);
        console.warn('Some features may not work correctly without these variables.');
      }
    }
  }, []);
  
  return (
    <Auth0ProviderWithHistory>
      <main className={inter.className}>
        <Component {...pageProps} />
      </main>
    </Auth0ProviderWithHistory>
  );
}
