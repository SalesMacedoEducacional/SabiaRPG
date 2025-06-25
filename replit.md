# SABIÁ RPG - Sistema de Aprendizagem Gamificada

## Overview

O SABIÁ RPG é uma plataforma educacional gamificada voltada para estudantes do Ensino Fundamental II e Ensino Médio das escolas públicas brasileiras. O sistema utiliza elementos de RPG medieval para criar uma experiência educativa imersiva, combinando trilhas personalizadas, inteligência artificial e elementos de gamificação.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom theme
- **UI Components**: Radix UI components with shadcn/ui
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Custom session-based auth with bcrypt
- **AI Integration**: OpenAI API for personalized feedback

### Database Design
- **Primary Database**: Supabase (PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations
- **Session Storage**: Express-session with MemoryStore
- **File Storage**: Local file system for uploads

## Key Components

### User Management System
- **Multi-role Authentication**: Support for students (aluno), teachers (professor), and managers (gestor)
- **CPF-based Registration**: Users can register using CPF as temporary password
- **School Association**: Users are linked to specific schools and classes

### Educational Components
- **Learning Paths (Trilhas)**: Personalized learning journeys based on diagnostic assessments
- **Missions (Missões)**: Interactive challenges aligned with BNCC curriculum
- **Progress Tracking**: XP system and achievement tracking
- **AI Feedback**: Personalized recommendations using OpenAI

### School Management
- **Multi-school Support**: Managers can oversee multiple schools
- **Class Organization**: Support for different grades and subjects
- **Component Mapping**: Subject areas mapped to Brazilian educational standards

### Gamification Elements
- **Avatar System**: Character progression based on performance
- **XP and Achievements**: Point system with unlockable rewards
- **Medieval Theme**: RPG aesthetics with custom fonts (Cinzel, MedievalSharp)

## Data Flow

### Authentication Flow
1. User logs in with email/CPF and password
2. System validates credentials against PostgreSQL
3. Session is created and stored in memory
4. User role determines accessible features

### Learning Flow
1. Student takes diagnostic assessment
2. AI generates personalized learning path
3. Student completes missions and receives XP
4. Progress is tracked and achievements unlocked
5. Teachers can monitor class performance

### Management Flow
1. Managers register schools and associate teachers
2. Teachers create classes and assign students
3. Real-time dashboard shows engagement metrics
4. Reports can be generated for performance analysis

## External Dependencies

### Database Services
- **Supabase**: Primary PostgreSQL database with real-time capabilities
- **Connection Pooling**: @neondatabase/serverless for efficient connections

### AI Services
- **OpenAI API**: GPT-3.5 for generating personalized feedback and recommendations
- **Model Configuration**: Configurable via MODEL_ID environment variable

### UI Libraries
- **Radix UI**: Comprehensive component library for accessibility
- **Lucide Icons**: Icon set for consistent visual design
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **Drizzle Kit**: Database schema management and migrations
- **TypeScript**: Type safety across the entire codebase
- **Vite**: Fast development server with HMR

## Deployment Strategy

### Environment Configuration
- **Development**: Local development with hot reload
- **Production**: Node.js server with built static assets
- **Database**: Supabase connection with SSL
- **Secrets**: Environment variables for API keys and database URLs

### Build Process
1. Vite builds the React frontend
2. esbuild bundles the Express backend
3. Assets are served from dist/public
4. Server runs on configurable port (default 5000)

### Monitoring and Logging
- **Session Tracking**: User engagement metrics
- **Error Handling**: Comprehensive error catching and logging
- **Performance**: Database query optimization with indexes

## Changelog

- June 25, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.