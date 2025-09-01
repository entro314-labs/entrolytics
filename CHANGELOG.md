# Changelog

All notable changes to Entrolytics will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-09-01

### Added
- Initial independent release as @entro314labs/entrolytics
- Privacy-focused web analytics with GDPR compliance
- Real-time dashboard with WebSocket support
- Team collaboration with role-based access control
- Revenue tracking and e-commerce analytics
- Custom event tracking with flexible data structure
- Geolocation analytics with privacy protection
- Device and browser analytics
- Multi-language support (40+ languages)
- Self-hosted deployment options

### Authentication & Security
- Migrated from Supabase Auth to Clerk authentication
- Organization-based access control
- JWT-based API authentication
- Advanced session management
- Security middleware for route protection

### Analytics Engine
- Custom JavaScript tracking script
- Advanced bot detection and filtering
- IP address hashing for privacy
- Session tracking with configurable timeout
- Real-time data processing
- ClickHouse integration for high-volume sites

### Dashboard Features
- Interactive charts with Chart.js
- Customizable date ranges and filters
- Website comparison tools
- UTM campaign tracking
- Funnel analysis
- User journey visualization
- Attribution reporting
- Retention analysis
- Goal tracking
- Segment analysis

### Technical Architecture
- Next.js 15.5 with App Router
- PostgreSQL with Prisma ORM
- TanStack React Query for data fetching
- Zustand for state management
- CSS Modules for styling
- @entro314labs/entro-zen UI components
- TypeScript throughout

### Developer Experience
- Comprehensive build system with multiple stages
- Database migration tools
- Development server with hot reloading
- Jest unit testing
- Cypress end-to-end testing
- ESLint and Prettier configuration
- Docker support for deployment

### Deployment Options
- Vercel serverless deployment
- Railway container deployment
- Docker Compose setup
- Self-hosted installation
- Environment variable validation
- Health checks and monitoring

## [Unreleased]

### Planned
- A/B testing framework
- Advanced cohort analysis
- Email reporting
- Slack/Discord integrations
- Mobile app analytics
- Enhanced data export options
- Custom dashboard builder
- Advanced filtering system
- API rate limiting
- Two-factor authentication

### Performance Improvements
- Database query optimization
- Read replica support
- Caching layer implementation
- CDN integration for tracking script
- Background job processing

---

For more details about each release, visit our [GitHub releases page](https://github.com/entro314-labs/entrolytics/releases).

## Migration Guide

### From Original Fork
This version represents a complete rebranding and enhancement of the original analytics platform. Key changes:

1. **Authentication**: Migrated from Supabase Auth to Clerk
2. **UI Components**: Now uses @entro314labs/entro-zen component library
3. **Branding**: Updated all references to Entrolytics and Entro314 Labs
4. **Enhanced Features**: Added team collaboration, revenue tracking, and advanced analytics

### Environment Variables
Update your environment variables to use Clerk authentication:
```bash
# Remove Supabase variables
# SUPABASE_URL=...
# SUPABASE_ANON_KEY=...

# Add Clerk variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### Database Schema
Run the provided migrations to update your database schema for Clerk integration and new features.