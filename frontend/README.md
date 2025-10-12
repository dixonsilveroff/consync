# ConSync Frontend

ConSync is a modern web-based Construction Lifecycle Management System (CLMS) built with Vite, React, and Tailwind CSS.

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp .env.development .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Mock Data Mode

The application includes a mock data mode for development and demonstration purposes. This allows you to work on the frontend without requiring a backend connection.

### Enabling Mock Mode

1. Set `VITE_USE_MOCK=true` in your `.env` file
2. Mock data is located in `src/data/mockData.js`
3. Mock configuration settings are in `src/config/mock.js`

### Available Mock Features

- Global summary statistics
- Project listings and details
- Activity trends and timelines
- Cost tracking and analysis
- Task management data
- Resource allocation metrics

### Production Mode

For production deployment:

1. Use `.env.production`
2. Ensure `VITE_USE_MOCK=false`
3. Configure `VITE_API_URL` to point to your production API

## Project Structure

- `/src` - Application source code
  - `/api` - API client and interceptors
  - `/components` - Reusable React components
  - `/context` - React Context providers
  - `/data` - Mock data for development
  - `/pages` - Page components
  - `/theme` - Theme configuration
  - `/utils` - Utility functions

## Features

- Modern, responsive UI with Tailwind CSS
- Role-based access control
- Real-time project tracking
- Task management
- Resource allocation
- Cost tracking
- Analytics and reporting
