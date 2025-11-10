# Simple single-stage build for easier deployment
FROM node:20-alpine

WORKDIR /app

# Install pnpm and prisma globally  
RUN npm install -g pnpm@latest prisma

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy all package.json files
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages ./packages
COPY apps ./apps
COPY tsconfig.json ./

# Build shared package
RUN cd packages/shared && pnpm build

# Generate Prisma client
RUN cd apps/server && npx prisma generate

# Build web app
ENV NEXT_PUBLIC_SERVER_URL=https://parlay-party.fly.dev
RUN cd apps/web && pnpm build

# Build server
RUN cd apps/server && pnpm run build || tsc

# Create uploads directory
RUN mkdir -p /data/uploads

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Start server
WORKDIR /app/apps/server
CMD ["node", "dist/index.js"]
