# Entrolytics Authentication

Entrolytics uses [Clerk](https://clerk.com) for modern, secure authentication. This document outlines the complete authentication system.

## Architecture

### Core Components

- **Clerk** - Primary authentication provider
- **Database Sync** - User data synchronized via webhooks
- **Role System** - Internal role-based permissions maintained
- **Middleware** - Route protection via `clerkMiddleware`

### Authentication Flow

1. User signs in/up via Clerk components (`/sign-in`, `/sign-up`)
2. Clerk webhook triggers user sync to database
3. API routes protected by middleware + `checkAuth()`
4. Internal role system provides granular permissions

## Setup

### 1. Environment Variables

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Webhooks
CLERK_WEBHOOK_SECRET="whsec_Dj/nvzAxUDqCuoQ8Zd5VMG5WT2m6UVe1"
```

### 2. Database Schema

Users are stored with Clerk integration:

```sql
CREATE TABLE "user" (
  "user_id" UUID PRIMARY KEY,
  "clerk_id" VARCHAR(255) UNIQUE NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "first_name" VARCHAR(255),
  "last_name" VARCHAR(255),
  "image_url" VARCHAR(2183),
  "display_name" VARCHAR(255),
  "role" VARCHAR(50) DEFAULT 'user',
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ
);
```

### 3. Webhook Setup

Configure Clerk webhook at `/api/webhooks/clerk` for events:
- `user.created`
- `user.updated`
- `user.deleted`

### 4. Admin Setup

Configure automatic admin user promotion:

```env
# Email address that receives admin privileges automatically
INITIAL_ADMIN_EMAIL="admin@yourdomain.com"

# Auto-promote first user to admin (recommended for initial setup)
AUTO_PROMOTE_FIRST_USER="true"
```

**Admin Management Commands:**
```bash
pnpm admin:status           # Check admin setup status
pnpm admin:promote <email>  # Promote user to admin
pnpm admin:list            # List all admin users
pnpm admin:validate        # Validate admin configuration
```

📖 **See [ADMIN_SETUP.md](./ADMIN_SETUP.md) for complete admin setup guide.**

## Usage

### Frontend Authentication

```tsx
import { useUser, useAuth } from '@clerk/nextjs';

function MyComponent() {
  const { user } = useUser();
  const { signOut } = useAuth();
  
  if (!user) return <div>Not signed in</div>;
  
  return (
    <div>
      <p>Hello {user.firstName}!</p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}
```

### API Routes

```typescript
import { checkAuth } from '@/lib/auth';

export async function GET(request: Request) {
  const { auth, error } = await parseRequest(request);
  
  if (error) return error();
  
  // auth.user - Database user record
  // auth.clerkUserId - Clerk user ID
  // auth.orgId - Clerk organization ID
  
  return json({ user: auth.user });
}
```

### Protected Routes

Routes are automatically protected by middleware:

- `/dashboard/*` - Main app
- `/admin/*` - Admin functions
- `/settings/*` - User settings
- `/teams/*` - Team management
- Most `/api/*` routes

## Roles & Permissions

Entrolytics maintains its own role system:

```typescript
// Internal roles
const ROLES = {
  admin: 'admin',
  user: 'user', 
  viewOnly: 'view-only',
  teamOwner: 'team-owner',
  teamManager: 'team-manager',
  teamMember: 'team-member',
  teamViewOnly: 'team-view-only',
};

// Check permissions
import { hasPermission } from '@/lib/auth';

const canCreate = await hasPermission(user.role, 'website:create');
```

## Migration Notes

This is a complete rewrite of authentication:

- ✅ **Clerk-native** - No JWT tokens or password hashing
- ✅ **Database sync** - Webhook-driven user synchronization  
- ✅ **Clean slate** - No legacy compatibility layers
- ✅ **Modern security** - Industry-standard auth patterns
- ✅ **Role preservation** - Existing permission system maintained

## Security Features

- **MFA Support** - Built into Clerk
- **Social Logins** - Google, GitHub, etc.
- **Passkeys** - Modern passwordless auth
- **Session Management** - Automatic token rotation
- **CSRF Protection** - Built-in security
- **Audit Logs** - User activity tracking via Clerk

## Development

### Testing Auth

1. Set up Clerk development instance
2. Configure webhook endpoints
3. Test user creation/update flow
4. Verify permission system

### Debugging

Enable debug logging:
```env
DEBUG=entrolytics:auth
```

## Production Deployment

1. Configure production Clerk instance
2. Set up webhook endpoints with proper secrets
3. Run database migrations
4. Configure environment variables
5. Test authentication flow

---

*Entrolytics - Modern analytics with secure authentication*