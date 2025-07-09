# CloudScale Commerce - Auto-Scaling E-commerce Platform

## Overview

CloudScale Commerce is a full-stack e-commerce application that demonstrates auto-scaling capabilities with real-time monitoring. The application features a React frontend with TypeScript, an Express.js backend, and uses Drizzle ORM with PostgreSQL for data persistence. The system includes real-time WebSocket connections for monitoring metrics and showcases AWS-style auto-scaling behavior.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Style**: RESTful APIs with structured error handling
- **Real-time Communication**: WebSocket server for live metrics updates
- **Development Server**: Vite middleware integration for seamless full-stack development

### Data Storage
- **Database**: PostgreSQL (configured for Neon Database)
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Session Storage**: In-memory storage with fallback to PostgreSQL sessions

## Key Components

### Database Schema
- **Users**: Basic user authentication with username/password
- **Products**: E-commerce catalog with categories, pricing, and inventory
- **Cart Items**: Shopping cart functionality linked to users and products
- **AWS Metrics**: Real-time monitoring data for auto-scaling demonstration

### API Endpoints
- **Products API**: CRUD operations for product catalog with category filtering
- **Cart API**: Shopping cart management (add, update, remove items)
- **WebSocket**: Real-time metrics broadcasting for monitoring dashboard

### Frontend Features
- **Product Grid**: Responsive product catalog with category filtering
- **Shopping Cart**: Slide-out cart with quantity management
- **Monitoring Sidebar**: Real-time AWS-style metrics dashboard with charts
- **Responsive Design**: Mobile-first approach with adaptive layouts

### Monitoring System
- **Real-time Metrics**: CPU utilization, response times, active users
- **Auto-scaling Simulation**: Dynamic EC2 instance scaling based on load
- **Interactive Charts**: Chart.js integration for data visualization
- **Status Indicators**: Visual health indicators for system status

## Data Flow

1. **Client Requests**: Frontend makes API calls to Express backend
2. **Database Operations**: Backend uses Drizzle ORM for database interactions
3. **Real-time Updates**: WebSocket connection provides live metrics updates
4. **State Management**: React Query handles caching and synchronization
5. **UI Updates**: Components reactively update based on state changes

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm** & **drizzle-zod**: Type-safe ORM with validation
- **@tanstack/react-query**: Server state management
- **chart.js**: Data visualization for monitoring charts
- **ws**: WebSocket implementation for real-time communication

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives for components
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Consistent icon system
- **class-variance-authority**: Component variant management

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production builds
- **vite**: Development server and build tool

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations ensure schema consistency

### Environment Requirements
- **Node.js**: ES modules support required
- **Database**: PostgreSQL instance with connection string
- **Environment Variables**: `DATABASE_URL` for database connectivity

### Production Considerations
- Static file serving through Express for single deployment
- WebSocket support for real-time monitoring features
- Database connection pooling for scalability
- Error handling and logging for production debugging

The application demonstrates modern full-stack development practices with a focus on type safety, real-time capabilities, and scalable architecture patterns suitable for e-commerce platforms.