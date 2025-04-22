# Business AI Simulator

A web application that creates AI-powered business simulations with autonomous agents. The application allows users to input the type of business they want to run, and the system creates a virtual business structure with AI agents for different roles (CEO, CTO, CFO, marketing, etc.).

## Features

- Create and manage multiple virtual businesses
- AI agents for different business roles
- Autonomous communication between agents
- Business intelligence and market research
- Reporting and visualization
- Meeting scheduling and management
- Secure file system integration
- Integration with development tools

## Serverless Architecture

This application uses a serverless architecture with the following components:

- **Frontend**: Next.js hosted on Vercel
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Auth0
- **AI Integration**: OpenAI API
- **File Storage**: Supabase Storage

## Getting Started

### Prerequisites

To deploy this application, you'll need accounts with:

1. [Vercel](https://vercel.com)
2. [Supabase](https://supabase.com)
3. [Auth0](https://auth0.com)
4. [OpenAI](https://openai.com)

### Deployment Steps

1. **Set up Supabase**:
   - Create a new Supabase project
   - Run the SQL schema in `supabase/schema.sql`
   - Get your Supabase URL and anon key

2. **Set up Auth0**:
   - Create a new Auth0 application
   - Configure the application for your domain
   - Set up the necessary rules and permissions
   - Get your Auth0 domain, client ID, and client secret

3. **Get an OpenAI API Key**:
   - Sign up for an OpenAI account
   - Create an API key with appropriate permissions

4. **Deploy to Vercel**:
   - Fork this repository to your GitHub account
   - Connect your GitHub repository to Vercel
   - Configure the environment variables as specified in `.env.local.example`
   - Deploy the application

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/business-ai-simulator.git
   cd business-ai-simulator
   ```

2. Copy `.env.local.example` to `.env.local` and fill in your environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

3. Install dependencies (requires Node.js):
   ```bash
   npm install
   # or
   yarn install
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Application pages
- `/src/utils` - Utility functions
- `/src/services` - Service integrations (AI, file system, etc.)
- `/src/models` - Data models and types
- `/src/styles` - Global styles
- `/supabase` - Supabase configuration and schema

## AI Agent System

The application uses OpenAI's GPT-4 model to power the AI agents. Each agent has a specific role in the business and can:

- Communicate with each other
- Perform research and analysis
- Generate reports and visualizations
- Make business decisions
- Suggest new products and strategies

## Security

This application implements several security measures:

- **Authentication**: Auth0 for secure user authentication
- **Authorization**: Row Level Security (RLS) in Supabase
- **Data Protection**: Secure API endpoints and environment variables
- **File Security**: Secure file storage with access controls

## License

MIT
