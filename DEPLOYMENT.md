# Deployment Guide for Business AI Simulator

This guide provides detailed instructions for deploying the Business AI Simulator application using a serverless architecture.

## Prerequisites

Before you begin, ensure you have accounts with the following services:

1. [GitHub](https://github.com) - For source code hosting
2. [Vercel](https://vercel.com) - For hosting the Next.js frontend
3. [Supabase](https://supabase.com) - For database and storage
4. [Auth0](https://auth0.com) - For authentication
5. [OpenAI](https://openai.com) - For AI capabilities

## Step 1: Set Up Supabase

1. **Create a new Supabase project**:
   - Go to [Supabase](https://supabase.com) and sign in
   - Click "New Project" and fill in the details
   - Choose a strong database password and save it securely

2. **Set up the database schema**:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase/schema.sql` from this repository
   - Paste it into the SQL Editor and click "Run"

3. **Create a storage bucket**:
   - Go to Storage in your Supabase dashboard
   - Verify that the "business-files" bucket was created by the SQL script
   - If not, create it manually and set it to private

4. **Get your API credentials**:
   - Go to Settings > API in your Supabase dashboard
   - Copy the "URL" and "anon/public" key for later use

## Step 2: Set Up Auth0

1. **Create a new Auth0 application**:
   - Go to [Auth0](https://auth0.com) and sign in
   - Go to Applications > Applications
   - Click "Create Application"
   - Name it "Business AI Simulator" and select "Single Page Web Applications"
   - Click "Create"

2. **Configure the application**:
   - In the application settings, add the following URLs to "Allowed Callback URLs":
     ```
     http://localhost:3000/api/auth/callback,
     https://your-vercel-domain.vercel.app/api/auth/callback
     ```
   - Add the same URLs to "Allowed Logout URLs" and "Allowed Web Origins"
   - Save changes

3. **Set up API**:
   - Go to Applications > APIs
   - Click "Create API"
   - Name it "Business AI Simulator API"
   - Set the identifier (audience) to `https://business-ai-simulator/api`
   - Click "Create"

4. **Get your API credentials**:
   - From your application settings, copy the "Domain", "Client ID", and "Client Secret"
   - From your API settings, copy the "Identifier" (audience)

## Step 3: Get an OpenAI API Key

1. **Create an OpenAI account**:
   - Go to [OpenAI](https://openai.com) and sign up
   - Navigate to the API section

2. **Generate an API key**:
   - Go to API Keys
   - Click "Create new secret key"
   - Name it "Business AI Simulator"
   - Copy the API key (you won't be able to see it again)

## Step 4: Deploy to Vercel

> **Important Note:** This project has a unique structure with files in both the root directory and the `business-ai-simulator` subdirectory. A setup script is included to copy files from the subdirectory to the root during build.

1. **Fork the repository**:
   - Fork this repository to your GitHub account

2. **Connect to Vercel**:
   - Go to [Vercel](https://vercel.com) and sign in
   - Click "New Project"
   - Import your forked repository
   - Configure the project name and framework preset (Next.js)

3. **Configure environment variables**:
   - In your Vercel project, go to Settings > Environment Variables
   - Add the following environment variables one by one:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     NEXT_PUBLIC_AUTH0_DOMAIN=your_auth0_domain
     NEXT_PUBLIC_AUTH0_CLIENT_ID=your_auth0_client_id
     NEXT_PUBLIC_AUTH0_AUDIENCE=your_auth0_audience
     AUTH0_CLIENT_SECRET=your_auth0_client_secret
     OPENAI_API_KEY=your_openai_api_key
     NEXT_PUBLIC_APP_URL=your_vercel_deployment_url
     ```
   - Replace the placeholders with your actual values
   - Make sure to click "Add" after each variable
   - For sensitive variables like API keys, ensure they are marked as secrets

4. **Deploy the application**:
   - Click "Deploy"
   - Wait for the deployment to complete
   - Once deployed, Vercel will provide you with a URL for your application

5. **Update Auth0 configuration**:
   - Go back to your Auth0 application settings
   - Update the "Allowed Callback URLs", "Allowed Logout URLs", and "Allowed Web Origins" with your Vercel deployment URL

## Step 5: Test the Deployment

1. **Visit your deployed application**:
   - Go to the URL provided by Vercel
   - Verify that the application loads correctly

2. **Test authentication**:
   - Click "Log In" and verify that Auth0 authentication works
   - After logging in, you should be redirected back to the application

3. **Test business creation**:
   - Create a new business
   - Verify that AI agents are generated
   - Test the various features of the application

## Troubleshooting

If you encounter issues during deployment, check the following:

1. **Environment Variables**:
   - Ensure all environment variables are correctly set in Vercel
   - Check for typos or missing values
   - If you see an error like `Environment Variable "NEXT_PUBLIC_SUPABASE_URL" references Secret "next_public_supabase_url", which does not exist`, it means you need to add the environment variables directly in the Vercel dashboard under Project Settings > Environment Variables, not as references to secrets

2. **Auth0 Configuration**:
   - Verify that the callback URLs are correctly configured
   - Check that the application type is set to "Single Page Web Applications"

3. **Supabase Setup**:
   - Ensure the database schema was applied correctly
   - Check that the storage bucket is properly configured

4. **OpenAI API Key**:
   - Verify that your OpenAI API key is valid and has sufficient credits
   - Check that the API key has the necessary permissions

5. **Vercel Logs**:
   - Check the deployment logs in Vercel for any errors
   - Use the function logs to debug API issues

## Updating the Application

To update the application after making changes:

1. Push your changes to the GitHub repository
2. Vercel will automatically redeploy the application
3. Check the deployment logs for any issues

## Custom Domain (Optional)

To use a custom domain with your application:

1. Go to your project settings in Vercel
2. Navigate to the "Domains" section
3. Add your custom domain and follow the instructions to configure DNS

## Conclusion

Your Business AI Simulator should now be deployed and accessible via the Vercel URL or your custom domain. Users can create accounts, log in, and start creating AI-powered virtual businesses.
