# Business AI Simulator - Setup Guide

This document provides instructions for setting up and running the Business AI Simulator project.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js (v18 or later)
- npm (v8 or later) or yarn (v1.22 or later)

## Installation

1. Clone the repository or download the project files.

2. Navigate to the project directory:
   ```bash
   cd business-ai-simulator
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

This will start the Next.js development server at [http://localhost:3000](http://localhost:3000).

## Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
```

To start the production server:

```bash
npm run start
# or
yarn start
```

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Application pages
- `/src/utils` - Utility functions
- `/src/services` - Service integrations (AI, file system, etc.)
- `/src/models` - Data models and types
- `/src/styles` - Global styles

## Key Features

- Create and manage multiple virtual businesses
- AI agents for different business roles
- Autonomous communication between agents
- Business intelligence and market research
- Reporting and visualization
- Meeting scheduling and management
- File system integration
- Integration with development tools

## Configuration

The application uses environment variables for configuration. Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
# Add any other environment variables here
```

## Adding AI Integration

To integrate with an AI service like OpenAI:

1. Sign up for an API key at [OpenAI](https://openai.com)
2. Add the API key to your `.env.local` file:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
3. Update the AI agent service to use the OpenAI API

## File System Integration

The application includes a mock file system service. To implement actual file system access:

1. Create a secure API endpoint for file system operations
2. Update the file system service to use the API
3. Implement proper authentication and authorization

## Troubleshooting

If you encounter any issues during setup or development:

1. Ensure all dependencies are installed correctly
2. Check that you're using the correct versions of Node.js and npm/yarn
3. Clear your browser cache and restart the development server
4. Check the console for error messages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
