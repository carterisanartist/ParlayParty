# 🎮 Parlay Party - Complete Setup Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **pnpm** 8.x or higher ([Install](https://pnpm.io/installation))
- **Docker** and **Docker Compose** ([Install](https://docs.docker.com/get-docker/))
- **Git** ([Download](https://git-scm.com/downloads))

Optional for deployment:
- **Fly.io CLI** ([Install](https://fly.io/docs/hands-on/install-flyctl/))

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ParlayParty
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install dependencies for all workspace packages (server, web, shared).

### 3. Start Development Services

Start PostgreSQL and Redis using Docker Compose:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

Verify services are running:

```bash
docker-compose -f docker-compose.dev.yml ps
```

You should see `postgres` and `redis` running.

## Environment Configuration

### Server Environment

The server environment variables are already configured in `apps/server/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/parlayparty?schema=public"
REDIS_URL="redis://localhost:6379"
SERVER_SALT="dev-salt-change-in-production"
PORT=8080
NODE_ENV=development
UPLOADS_DIR="./uploads"
```

**⚠️ Important:** Change `SERVER_SALT` in production to a random string for security.

### Web Environment

The web environment variables are in `apps/web/.env.local`:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:8080
```

## Database Setup

### 1. Generate Prisma Client

```bash
cd apps/server
pnpm db:generate
```

### 2. Run Migrations

```bash
pnpm db:migrate
```

Or for development (faster):

```bash
pnpm db:push
```

### 3. Seed Sample Data (Optional)

```bash
pnpm db:seed
```

This creates a sample room with a few players for testing.

## Running the Application

### Development Mode

From the root directory:

```bash
pnpm dev
```

This starts both the server and web app concurrently:

- **Server (API + Sockets)**: http://localhost:8080
- **Web App**: http://localhost:3000
- **Health Check**: http://localhost:8080/healthz

### Individual Services

Run services separately if needed:

```bash
# Server only
cd apps/server
pnpm dev

# Web only
cd apps/web
pnpm dev
```

### Testing the Application

1. **Create a Room**
   - Open http://localhost:3000
   - Click "CREATE ROOM"
   - Note the 4-character room code

2. **Join as Player**
   - On your phone or another browser tab
   - Visit http://localhost:3000/play/[CODE]
   - Enter your name and join

3. **Start a Round**
   - As host, paste a YouTube URL
   - Click "START ROUND"
   - Players submit predictions

## Production Deployment

### Building for Production

```bash
# Build all packages
pnpm build

# Test production build locally
cd apps/server
pnpm start
```

### Docker Build

Build the Docker image:

```bash
docker build -t parlay-party .
```

Test locally:

```bash
docker run -p 8080:8080 \
  -e DATABASE_URL="your-postgres-url" \
  -e REDIS_URL="your-redis-url" \
  -e SERVER_SALT="your-salt" \
  parlay-party
```

### Deploy to Fly.io

1. **Install Fly CLI**

```bash
curl -L https://fly.io/install.sh | sh
```

2. **Login to Fly.io**

```bash
fly auth login
```

3. **Create Postgres Database**

```bash
fly postgres create
```

Note the connection string provided.

4. **Create Redis Instance**

```bash
fly redis create
```

Note the connection string provided.

5. **Run Deployment Script**

```bash
chmod +x scripts/deploy-fly.sh
./scripts/deploy-fly.sh
```

6. **Set Secrets**

When prompted by the script:

```bash
fly secrets set DATABASE_URL="postgresql://..." -a parlay-party
fly secrets set REDIS_URL="redis://..." -a parlay-party
fly secrets set SERVER_SALT="$(openssl rand -hex 32)" -a parlay-party
```

7. **Access Your App**

```
https://parlay-party.fly.dev
```

## Troubleshooting

### Port Already in Use

If port 8080 or 3000 is already in use:

```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Or change the port in .env
PORT=8081
```

### Database Connection Failed

1. Ensure Docker services are running:

```bash
docker-compose -f docker-compose.dev.yml ps
```

2. Restart services:

```bash
docker-compose -f docker-compose.dev.yml restart
```

3. Check logs:

```bash
docker-compose -f docker-compose.dev.yml logs postgres
```

### Prisma Client Not Found

Regenerate the Prisma client:

```bash
cd apps/server
pnpm db:generate
```

### Build Errors

Clear build artifacts and reinstall:

```bash
# Clean all
pnpm clean  # if script exists, or manually:
rm -rf node_modules packages/*/node_modules apps/*/node_modules
rm -rf packages/*/dist apps/*/dist apps/web/.next

# Reinstall
pnpm install

# Rebuild
pnpm build
```

### WebSocket Connection Issues

1. Check server is running on port 8080
2. Verify `NEXT_PUBLIC_SERVER_URL` matches your server URL
3. Check browser console for CORS errors
4. Ensure firewall allows WebSocket connections

### Audio Not Playing

Audio requires user interaction to start:

- Click anywhere on the page first
- Check browser console for Tone.js errors
- Verify browser supports Web Audio API

## Running Tests

```bash
# All tests
pnpm test

# Specific package
pnpm --filter @parlay-party/server test
pnpm --filter @parlay-party/shared test

# With coverage
pnpm test --coverage
```

## Linting & Type Checking

```bash
# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check

# Format code
pnpm format
```

## Development Tips

### Hot Reload

Both server and web support hot reload:

- **Server**: Uses `tsx watch` for instant restarts
- **Web**: Next.js Fast Refresh for React components

### Debugging

**Server:**

```bash
cd apps/server
node --inspect dist/index.js
```

Open `chrome://inspect` in Chrome.

**Web:**

Use Next.js built-in debugging: Open Dev Tools → Sources → Enable breakpoints

### Viewing Database

Use Prisma Studio:

```bash
cd apps/server
npx prisma studio
```

Opens at http://localhost:5555

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Fly.io Documentation](https://fly.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Support

If you encounter issues:

1. Check this guide first
2. Review logs: `docker-compose logs`, `pnpm dev` output
3. Open an issue on GitHub with error details

---

**Happy Gaming! 🎮🎉**

