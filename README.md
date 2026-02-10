# Gearboxe Market Monorepo

This is a monorepo setup for the Gearboxe Market application using pnpm workspaces and Turborepo.

## Structure

```
car-market/
├── apps/
│   ├── web/          # Main customer-facing application
│   └── admin/        # Admin panel application
├── packages/
│   ├── convex/       # Shared Convex backend functions
│   └── ui/           # Shared UI components (shadcn)
└── package.json      # Root package.json with turbo scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+

### Installation

```bash
# Install dependencies for all packages
pnpm install
```

### Development

```bash
# Run all apps in development mode (web on port 3000, admin on port 3001)
pnpm dev

# Run web app only (http://localhost:3000)
pnpm dev:web
# OR
pnpm --filter @gearboxe-market/web dev

# Run admin app only (http://localhost:3001)
pnpm dev:admin
# OR
pnpm --filter @gearboxe-market/admin dev

# Run both apps simultaneously
pnpm dev
```

### Building

```bash
# Build all apps
pnpm build

# Build web app only
pnpm build:web
# OR
pnpm --filter @gearboxe-market/web build

# Build admin app only
pnpm build:admin
# OR
pnpm --filter @gearboxe-market/admin build
```

### Linting

```bash
# Lint all packages
pnpm lint

# Lint specific package
pnpm --filter @gearboxe-market/web lint
```

## Packages

### @gearboxe-market/convex

Shared Convex backend functions, schema, and mutations/queries used by both apps.

### @gearboxe-market/ui

Shared UI components (shadcn/ui base components) used by both applications.

### Apps

- **@gearboxe-market/web**: Main customer-facing application
- **@gearboxe-market/admin**: Admin panel for managing the marketplace

## Convex Setup

Each app has its own Convex deployment:

```bash
# Setup Convex for web app
cd apps/web
npx convex dev

# Setup Convex for admin app (optional separate deployment)
cd apps/admin
npx convex dev
```

Note: You can point both apps to the same Convex deployment by sharing the `NEXT_PUBLIC_CONVEX_URL` environment variable.

## Environment Variables

Copy the example environment files and configure them:

```bash
cp .env.example apps/web/.env.local
cp .env.example apps/admin/.env.local
```

Required variables:
- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOY_KEY`
- Clerk keys
- Stripe keys
- Cloudinary keys

## Architecture Decisions

1. **Shared Convex backend**: Both apps share the same Convex functions and database
2. **Shared UI components**: Base shadcn/ui components are shared via the `@gearboxe-market/ui` package
3. **Separate apps**: Web and Admin are separate Next.js applications for better separation of concerns
4. **Turborepo**: Used for efficient builds and caching
5. **pnpm workspaces**: Efficient dependency management across packages

## Migration Notes

The monorepo was created from a single Next.js application. Key changes:

1. Convex functions moved to `packages/convex/`
2. Base UI components moved to `packages/ui/`
3. Main app moved to `apps/web/`
4. Admin pages extracted to `apps/admin/`
5. All imports updated to use workspace packages

## Scripts

### Root level
- `pnpm dev` - Run all apps simultaneously
- `pnpm dev:web` - Run web app only (port 3000)
- `pnpm dev:admin` - Run admin app only (port 3001)
- `pnpm build` - Build all apps
- `pnpm build:web` - Build web app only
- `pnpm build:admin` - Build admin app only
- `pnpm start` - Start all apps in production mode
- `pnpm start:web` - Start web app in production
- `pnpm start:admin` - Start admin app in production
- `pnpm lint` - Lint all packages
- `pnpm format` - Format all packages

### Ports
- **Web app**: http://localhost:3000
- **Admin app**: http://localhost:3001

### App level
Each app has its own scripts accessible via:
```bash
pnpm --filter <app-name> <script>
```

## Deployment

Each app can be deployed independently:
- Web app can be deployed to Vercel
- Admin app can be deployed to a separate Vercel project or subdomain