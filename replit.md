# CloudScale Commerce - Auto-Scaling E-commerce Platform

## Overview

CloudScale Commerce is a comprehensive full-stack e-commerce application with AWS auto-scaling infrastructure and self-healing capabilities. The system features a React frontend with real-time monitoring dashboard, Express.js backend, and complete AWS infrastructure deployment using Terraform. The application demonstrates enterprise-grade auto-scaling, self-healing infrastructure, and real-time metrics visualization.

**Latest Update (January 12, 2025):** Successfully completed the full CloudScale Commerce platform with real user authentication, Profile/Orders pages, and comprehensive GitHub deployment guide. The system tracks real users for AWS auto-scaling triggers and is ready for production deployment.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

✓ **Authentication System** - Complete user registration and login with bcrypt password hashing
✓ **Real User Tracking** - Session-based user activity monitoring for auto-scaling triggers  
✓ **Order Management** - Full checkout process with order history and status tracking
✓ **Address Management** - User shipping and billing address storage
✓ **Enhanced Security** - Session middleware with IP tracking and user agent logging
✓ **Auto-scaling Logic** - Real metrics: scale up when 4+ users active, scale down when traffic drops
✓ **Frontend Integration** - Complete authentication UI with Profile and Orders pages working
✓ **AWS Deployment** - Complete deployment guide with GitHub integration steps created

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

## AWS Infrastructure & Terraform

### Infrastructure Components
- **Auto Scaling Groups**: Automatic EC2 instance scaling based on CPU thresholds
- **Application Load Balancer**: Traffic distribution across multiple availability zones (ap-south-1a, ap-south-1b)
- **CloudWatch Monitoring**: Real-time metrics collection and alerting
- **Self-Healing Module**: Automated drift detection and resource recovery
- **VPC & Networking**: Secure multi-AZ deployment with public/private subnets

### Self-Healing Features
- **Configuration Drift Detection**: Monitors and reverts unauthorized infrastructure changes
- **Automatic Instance Recovery**: Restarts failed instances and replaces unhealthy ones
- **Performance-Based Healing**: CPU and memory threshold monitoring with automatic remediation
- **SNS Notifications**: Real-time alerts for scaling and healing events

### Terraform Configuration
- **Main Infrastructure**: Complete AWS resource provisioning in ap-south-1 region
- **Self-Healing Integration**: Based on yashodhan271/terraform-aws-self-healing-infrastructure module
- **Auto-Scaling Policies**: Scale up at 70% CPU, scale down at 30% CPU
- **Multi-AZ Deployment**: High availability across ap-south-1a and ap-south-1b zones

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity (optional for production)
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

### GitHub Integration
- **Repository Setup**: Complete guide for pushing project to GitHub
- **Terraform Configuration**: Auto-deployment from GitHub repository
- **CI/CD Ready**: Infrastructure automatically pulls latest code

### AWS Auto-Deployment Process
1. **Auto Scaling Groups** launch EC2 instances across ap-south-1a and ap-south-1b
2. **User Data Scripts** automatically clone GitHub repo and install dependencies
3. **Application Load Balancer** distributes traffic with health checks
4. **Self-Healing Module** monitors and recovers from infrastructure issues
5. **Real-Time Scaling** triggers when 4+ users are actively using the platform

### Environment Requirements
- **AWS Account**: With EC2, ALB, CloudWatch, and SNS permissions
- **GitHub Repository**: Public repository with complete project code
- **Terraform**: Infrastructure as Code for repeatable deployments
- **Database**: PostgreSQL (Neon) with connection string

### Production Features
- Multi-AZ deployment for high availability
- Auto-scaling based on CPU and user metrics
- Real-time monitoring dashboard
- Automatic instance recovery and drift detection

The application demonstrates modern full-stack development practices with a focus on type safety, real-time capabilities, and scalable architecture patterns suitable for e-commerce platforms.