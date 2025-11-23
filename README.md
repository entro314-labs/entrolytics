# Entrolytics

**First-party growth analytics for the edge. One platform. Every touchpoint. Your data.**

Entrolytics unifies web analytics, link tracking, and conversion pixels into a single first-party data plane. Built for modern edge infrastructure with sub-50ms tracking globally.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.18-brightgreen.svg)](https://nodejs.org/)

## ✨ Features

- 🌐 **Unified platform** - Web analytics, link tracking, and conversion pixels in one place
- ⚡ **Edge-native** - Built for Vercel Edge, Cloudflare Workers, Deno Deploy
- 📊 **Growth analytics** - Funnels, attribution, retention, revenue tracking
- 🔗 **Link shortener** - Track campaigns with branded short links
- 📍 **Tracking pixels** - Conversion tracking across channels
- 🔒 **First-party data** - GDPR compliant, cookieless, no sampling
- 🏢 **Team collaboration** - Multi-org support with role-based access control
- 🎯 **Custom events** - Track any user interaction or business metric
- 📱 **Device insights** - Browser, OS, and device analytics
- 🌍 **Global performance** - Sub-50ms tracking worldwide

## 🚀 Quick Start

### Prerequisites

- Node.js 18.18 or higher
- PostgreSQL database
- pnpm package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/entro314-labs/entrolytics.git
cd entrolytics

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up the database
pnpm run check-db

# Configure admin access (optional - see ADMIN_SETUP.md)
echo 'INITIAL_ADMIN_EMAIL="admin@yourdomain.com"' >> .env.local
echo 'AUTO_PROMOTE_FIRST_USER="true"' >> .env.local

# Start development server
pnpm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access your Entrolytics dashboard.

### 🔐 Admin Setup

Entrolytics includes a comprehensive admin management system:

```bash
# Check admin setup status
pnpm admin:status

# Promote a user to admin
pnpm admin:promote user@example.com

# List all admin users
pnpm admin:list
```

📖 **See [ADMIN_SETUP.md](./ADMIN_SETUP.md) for complete setup guide.**

## 🛠 Development

### Available Commands

```bash
# Development
pnpm dev                     # Start development server (port 3000)
pnpm dev-turbo              # Start with Turbopack (port 3001)

# Building
pnpm build                  # Full production build
pnpm build-turbo           # Build with Turbopack
pnpm build-docker          # Docker-specific build

# Database
pnpm check-db              # Verify database connection and apply migrations
pnpm update-db             # Deploy database migrations

# Components & Assets
pnpm build-tracker         # Build analytics tracking script
pnpm build-geo             # Build geolocation database
pnpm build-lang            # Process internationalization files

# Testing
pnpm test                  # Run Jest unit tests
pnpm lint                  # Run ESLint
pnpm cypress-open          # Interactive E2E testing
pnpm cypress-run           # Headless E2E tests
```

### Project Structure

```
src/
├── app/                   # Next.js app router pages and layouts
├── components/            # React components
│   ├── common/           # Shared components
│   ├── forms/           # Form components
│   └── charts/          # Chart components
├── lib/                  # Core utilities and business logic
├── queries/             # Database query functions
├── styles/              # CSS modules and global styles
└── types/               # TypeScript type definitions

drizzle/
└── migrations/          # Database migrations

scripts/                 # Build and utility scripts
public/                  # Static assets and tracking script
```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file with the following required variables:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/entrolytics

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Optional: Application settings
BASE_PATH=/analytics
CLOUD_MODE=1
COLLECT_API_ENDPOINT=/api/send
TRACKER_SCRIPT_NAME=script.js
FORCE_SSL=1
```

### Database Setup

Entrolytics uses PostgreSQL with Drizzle ORM. The system supports:

- **Primary database** for metadata and user management
- **Read replicas** for improved dashboard performance
- **ClickHouse** integration for high-volume analytics (optional)

## 📈 Analytics Integration

### Adding the Tracking Script

Add the tracking script to your website:

```html
<script async src="https://your-entrolytics-domain.com/script.js" data-website-id="your-website-id"></script>
```

### Custom Event Tracking

Track custom events with the JavaScript API:

```javascript
// Track page views (automatic)
entrolytics.track('pageview');

// Track custom events
entrolytics.track('button-click', { button: 'signup' });

// Track with custom data
entrolytics.track('purchase', {
  revenue: 29.99,
  currency: 'USD',
  product: 'Pro Plan'
});
```

### API Integration

Use the REST API for server-side tracking:

```bash
curl -X POST https://your-domain.com/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "website": "website-id",
    "url": "/page-path",
    "event": "pageview"
  }'
```

## 🏗 Architecture

### Technology Stack

- **Framework**: Next.js 15.5 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk with organization support
- **Styling**: CSS Modules with PostCSS
- **Charts**: Chart.js with date-fns adapter
- **State**: Zustand + TanStack React Query
- **Analytics**: Custom tracking engine
- **UI Components**: [@entro314labs/entro-zen](https://npmjs.com/package/@entro314labs/entro-zen)

### Authentication System

Entrolytics uses Clerk for authentication with the following features:

- **User Management**: Automatic user synchronization to local database
- **Organizations**: Org-based access control and data isolation
- **Roles**: Admin, user, and view-only permissions
- **Security**: JWT-based API authentication with middleware protection

### Analytics Engine

- **Privacy-first**: No PII storage, IP address hashing, GDPR compliant
- **Real-time**: WebSocket connections for live dashboard updates
- **Scalable**: Supports both PostgreSQL and ClickHouse for high-volume sites
- **Accurate**: Advanced bot detection and session management

## 🚢 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t entrolytics .

# Run with Docker Compose
docker-compose up -d
```

### Environment Deployment

Entrolytics supports deployment on:

- **Vercel** - Serverless deployment with edge functions
- **Railway** - Container-based deployment with PostgreSQL
- **DigitalOcean** - VPS deployment with managed databases
- **Self-hosted** - Complete control with Docker or direct installation

### Production Checklist

- [ ] Set all required environment variables
- [ ] Configure PostgreSQL database with proper indexing
- [ ] Run database migrations (`pnpm run update-db`)
- [ ] Build application (`pnpm run build`)
- [ ] Configure domain and SSL certificates
- [ ] Set up database backups
- [ ] Configure monitoring and alerting
- [ ] Test analytics tracking script accessibility

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Install dependencies
pnpm install

# Start development database (PostgreSQL required)
# Update DATABASE_URL in .env.local

# Run initial setup
pnpm run check-db

# Start development server
pnpm run dev
```

## 📚 Documentation

- [Installation Guide](docs/installation.md)
- [Configuration Reference](docs/configuration.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Contributing Guide](CONTRIBUTING.md)

## 🆚 Comparison

| Feature | Entrolytics | Google Analytics | Plausible | Matomo |
|---------|-------------|------------------|-----------|--------|
| Privacy-focused | ✅ | ❌ | ✅ | ✅ |
| Self-hosted | ✅ | ❌ | ✅ | ✅ |
| Real-time data | ✅ | ❌ | ❌ | ✅ |
| Org collaboration | ✅ | ✅ | ❌ | ✅ |
| Custom events | ✅ | ✅ | ❌ | ✅ |
| Revenue tracking | ✅ | ✅ | ❌ | ✅ |
| No cookie required | ✅ | ❌ | ✅ | ✅ |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [React](https://reactjs.org/)
- UI components from [@entro314labs/entro-zen](https://npmjs.com/package/@entro314labs/entro-zen)
- Authentication by [Clerk](https://clerk.com/)
- Charts powered by [Chart.js](https://www.chartjs.org/)
- Database ORM by [Drizzle](https://orm.drizzle.team/)

## 📞 Support

- [GitHub Issues](https://github.com/entro314-labs/entrolytics/issues)
- [Documentation](https://entrolytics.click/docs)
- [Email Support](mailto:hey@entrolytics.click)

---

**Entrolytics** - First-party growth analytics for the edge. One platform. Every touchpoint. Your data.