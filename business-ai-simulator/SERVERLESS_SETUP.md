# Business AI Simulator - Serverless Setup Guide

This document provides instructions for setting up and deploying the Business AI Simulator project using a serverless architecture.

## Serverless Architecture Overview

Instead of running a local Node.js server, we'll use the following serverless services:

1. **Vercel**: For hosting the Next.js frontend
2. **Supabase**: For database and backend functionality
3. **Auth0**: For user authentication
4. **OpenAI API**: For AI agent functionality
5. **Vercel Edge Functions**: For secure file system operations

## Prerequisites

- A GitHub account
- A Vercel account (can sign up with GitHub)
- A Supabase account
- An Auth0 account
- An OpenAI API key

## Deployment Steps

### 1. Push the code to GitHub

1. Create a new GitHub repository
2. Push the project code to the repository

### 2. Set up Supabase

1. Create a new Supabase project
2. Set up the following tables:
   - `businesses`
   - `agents`
   - `tasks`
   - `meetings`
   - `reports`
3. Set up Row Level Security (RLS) policies for data protection
4. Get your Supabase URL and anon key

### 3. Set up Auth0

1. Create a new Auth0 application
2. Configure the application for your domain
3. Set up the necessary rules and permissions
4. Get your Auth0 domain, client ID, and client secret

### 4. Get an OpenAI API Key

1. Sign up for an OpenAI account
2. Create an API key with appropriate permissions

### 5. Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Configure the following environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_AUTH0_DOMAIN`
   - `NEXT_PUBLIC_AUTH0_CLIENT_ID`
   - `AUTH0_CLIENT_SECRET`
   - `OPENAI_API_KEY`
3. Deploy the application

## Implementing AI Integration

Update the `aiAgentService.ts` file to use the OpenAI API:

```typescript
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Function to generate agent responses
export const generateAgentResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await openai.createCompletion({
      model: 'gpt-4',
      prompt,
      max_tokens: 500,
      temperature: 0.7,
    });
    
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error generating agent response:', error);
    return 'I apologize, but I am unable to respond at the moment.';
  }
};
```

## Implementing Database Integration

Update the services to use Supabase:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to create a business
export const createBusiness = async (business) => {
  const { data, error } = await supabase
    .from('businesses')
    .insert([business]);
    
  if (error) throw error;
  return data;
};
```

## Implementing Authentication

Update the application to use Auth0:

```typescript
import { useAuth0 } from '@auth0/auth0-react';

// In your component
const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

// Check if user is authenticated
if (!isAuthenticated) {
  return <button onClick={() => loginWithRedirect()}>Log In</button>;
}
```

## Implementing File System Access

For secure file system access, we'll use Vercel Edge Functions:

```typescript
// pages/api/files.js
export default async function handler(req, res) {
  // Implement secure file operations here
  // This would typically involve using a service like AWS S3 or Google Cloud Storage
}
```

## Local Development

For local development without Node.js, you can use Vercel's local development environment:

1. Install the Vercel CLI using npm (requires Node.js on your development machine)
2. Run `vercel dev` to start the local development server

Alternatively, you can use Gitpod or GitHub Codespaces for a cloud development environment.

## Conclusion

This serverless approach allows you to deploy and run the Business AI Simulator without needing to install Node.js locally. It leverages cloud services for all the necessary functionality, making it easier to deploy and scale.
