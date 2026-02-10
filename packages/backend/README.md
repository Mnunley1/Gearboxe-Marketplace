# @gearboxe-market/convex

Shared Convex backend for the Gearboxe Market application.

## Structure

- `schema.ts` - Database schema definitions
- `users.ts` - User management functions
- `vehicles.ts` - Vehicle listing functions
- `events.ts` - Event management functions
- `registrations.ts` - Event registration functions
- `messages.ts` - Messaging functions
- `conversations.ts` - Conversation management
- `favorites.ts` - Favorite listings
- `cities.ts` - City management
- `admin.ts` - Admin functions

## Setup

1. Set up Convex in one of the apps:
```bash
cd apps/web
npx convex dev
```

2. Copy the `NEXT_PUBLIC_CONVEX_URL` to both apps' environment files.

## Usage

```tsx
import { api } from "@gearboxe-market/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";

const data = useQuery(api.vehicles.list);
```
