# Replit.md - SABIÁ RPG Platform

## Overview

SABIÁ RPG is a gamified educational platform designed for Brazilian public schools (Ensino Fundamental II and Ensino Médio). It uses RPG mechanics to create engaging learning experiences with personalized trails, AI feedback, and comprehensive management tools for educators.

## System Architecture

### Frontend Architecture
- **Framework**: React with Vite as build tool
- **UI Components**: Radix UI with shadcn/ui design system
- **Styling**: Tailwind CSS with custom theme (light mode with earthy colors)
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for client-side routing
- **Authentication**: Custom session-based auth with context provider

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **Session Management**: express-session with MemoryStore
- **File Upload**: Multer for handling image uploads
- **Password Hashing**: bcryptjs and custom SCRYPT implementation

### Database Architecture
- **Primary Database**: PostgreSQL (Supabase hosted)
- **ORM**: Drizzle ORM with migrations
- **Schema**: Comprehensive educational platform schema with user roles, schools, classes, missions, progress tracking
- **Connection**: Pool-based connections with SSL support

## Key Components

### User Management System
- **Roles**: Three main roles (aluno/student, professor/teacher, gestor/manager)
- **Authentication**: Session-based with role-based access control
- **Profile Management**: Separate profile tables for each user type
- **School Linkage**: Users linked to schools through relationship tables

### Educational Content System
- **Missions**: Gamified learning activities with XP rewards
- **Learning Paths**: Personalized educational trajectories
- **Progress Tracking**: Detailed analytics of student performance
- **Diagnostic System**: AI-powered assessment and recommendations

### School Management
- **Multi-School Support**: Managers can oversee multiple schools
- **Class Management**: Teachers manage classes and subjects
- **Administrative Tools**: Comprehensive dashboards for each role
- **Location Management**: Brazilian states and cities integration

### AI Integration
- **OpenAI Integration**: Personalized feedback generation
- **Diagnostic AI**: Learning path recommendations
- **Content Personalization**: Adaptive learning experiences

## Data Flow

1. **User Authentication**: Session-based login → Role verification → Dashboard routing
2. **Content Delivery**: User role → Personalized content → Progress tracking
3. **Assessment Flow**: Mission completion → AI feedback → XP allocation
4. **Management Flow**: Administrative actions → Database updates → Real-time dashboard updates

## External Dependencies

### Primary Services
- **Supabase**: PostgreSQL hosting and authentication
- **OpenAI**: AI-powered educational content generation
- **Brazilian Location Data**: Estados and cidades tables for school registration

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **Vite**: Frontend build system with HMR
- **Express**: Backend API server

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Icon system

## Deployment Strategy

### Production Environment
- **Platform**: Replit with autoscale deployment
- **Build Process**: `npm run build` → Static frontend + Node.js backend
- **Port Configuration**: Internal port 5000 → External port 80
- **SSL**: Automatic HTTPS in production

### Development Environment
- **Hot Reload**: Vite HMR for frontend, tsx for backend
- **Database**: Development connection to Supabase
- **Environment Variables**: Loaded from Replit secrets

### Environment Configuration
- **NODE_ENV**: Controls development vs production behavior
- **DATABASE_URL**: PostgreSQL connection string
- **SUPABASE_***: Authentication and API keys
- **OPENAI_API_KEY**: AI service integration

## Changelog

- June 25, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.