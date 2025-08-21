# DealerPro

## Overview

DealerPro is a comprehensive dealership management system designed to streamline vehicle inventory management, sales tracking, and business operations. The application provides an intuitive interface for managing car inventory, processing sales transactions, and generating business insights through a modern web-based platform.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool and development server
- **Routing**: Client-side routing implemented with Wouter for lightweight navigation
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **UI Components**: Radix UI primitives with shadcn/ui component system for consistent, accessible design
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API development
- **Development Setup**: Full-stack development with Vite middleware integration for hot reloading
- **API Structure**: RESTful endpoints organized by resource (inventory, sales) with comprehensive CRUD operations
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Request Processing**: JSON and URL-encoded request parsing with request logging middleware

### Data Storage Solutions
- **Database**: PostgreSQL as the primary database with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Connection**: Neon Database serverless PostgreSQL for cloud-based data storage
- **Development Storage**: In-memory storage implementation for development and testing

### Database Schema Design
- **Inventory Table**: Comprehensive vehicle information including VIN, stock numbers, pricing, and vehicle specifications
- **Sales Table**: Customer transaction records with support for trade-ins and delivery tracking
- **Data Validation**: Zod schema validation ensuring data integrity at both API and database levels
- **Constraints**: Unique constraints on VIN numbers and stock numbers to prevent duplicates

### Authentication and Authorization
- **Current State**: No authentication system implemented
- **Session Management**: Connect-pg-simple ready for PostgreSQL-based session storage
- **Future Considerations**: Session-based authentication infrastructure prepared

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **Connection Management**: @neondatabase/serverless for optimized serverless connections

### UI and Component Libraries
- **Radix UI**: Comprehensive collection of accessible, unstyled UI primitives
- **Lucide React**: Icon library providing consistent iconography throughout the application
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development

### Development and Build Tools
- **Vite**: Fast build tool and development server with hot module replacement
- **TypeScript**: Static type checking for enhanced code quality and developer experience
- **ESBuild**: High-performance JavaScript bundler for production builds

### Data Management
- **Drizzle ORM**: TypeScript-first ORM with excellent performance and developer experience
- **TanStack Query**: Powerful data synchronization for React applications
- **Zod**: TypeScript-first schema declaration and validation library

### Form and Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Hookform Resolvers**: Integration layer for various validation libraries

### Development Environment
- **Replit Integration**: Specialized plugins and configurations for Replit development environment
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer plugins