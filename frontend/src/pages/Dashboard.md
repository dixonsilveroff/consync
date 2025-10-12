# ConSync Dashboard

## Overview
The ConSync Dashboard provides a comprehensive analytics overview for construction project management, displaying real-time project performance summaries, cost trends, and activity insights.

## Features

### 📊 Stats Cards
- **Total Projects**: Shows the total number of active projects
- **Total Tasks**: Displays the total number of tasks across all projects
- **Average Progress**: Shows overall project completion percentage with visual progress bar
- **Total Expenses**: Displays total expenses with color coding (red for high, green for low)

### 📈 Charts
- **Activity Trend**: Line chart showing activity volume over the last 14 days
- **Cost Trend**: Area chart displaying project cost flow (requires project selection)

### 📋 Recent Activities
- Real-time activity feed showing recent system actions
- Color-coded action badges (Create, Update, Delete, Complete)
- User attribution and project references
- Relative timestamps (e.g., "2h ago", "1d ago")

## API Endpoints Used
- `GET /api/analytics/summary/global` - Global project statistics
- `GET /api/analytics/trends/activity` - Activity trends over time
- `GET /api/analytics/trends/cost?project=<id>` - Cost trends for specific project
- `GET /api/activities?limit=5` - Recent system activities

## Components
- `Dashboard.jsx` - Main dashboard page
- `DashboardCard.jsx` - Reusable stats card component
- `TrendChart.jsx` - SVG-based chart component
- `ActivityList.jsx` - Recent activities list component

## Responsive Design
- Mobile-first approach with Tailwind CSS
- Grid layouts that adapt to screen size
- Charts that scale appropriately on different devices

## Development Features
- Mock data fallback for development
- Loading states and error handling
- Automatic token refresh integration
- Role-based access control
