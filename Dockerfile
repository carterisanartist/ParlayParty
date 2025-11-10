# Build stage for shared package
FROM node:20-alpine AS shared-builder
WORKDIR /app
RUN npm install -g pnpm
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile
COPY packages/shared ./packages/shared
RUN cd packages/shared && pnpm build

# Build stage for web
FROM node:20-alpine AS web-builder
WORKDIR /app
RUN npm install -g pnpm
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/web/package.json ./apps/web/
COPY --from=shared-builder /app/packages/shared ./packages/shared
RUN pnpm install --frozen-lockfile
COPY apps/web ./apps/web
ENV NEXT_PUBLIC_SERVER_URL=http://localhost:8080
RUN cd apps/web && pnpm build

# Build stage for server
FROM node:20-alpine AS server-builder
WORKDIR /app
RUN npm install -g pnpm
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/server/package.json ./apps/server/
COPY --from=shared-builder /app/packages/shared ./packages/shared
RUN pnpm install --frozen-lockfile
COPY apps/server ./apps/server
RUN cd apps/server && pnpm build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

RUN npm install -g pnpm prisma

# Copy shared package
COPY --from=shared-builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=shared-builder /app/packages/shared/package.json ./packages/shared/

# Copy server
COPY --from=server-builder /app/apps/server/dist ./apps/server/dist
COPY --from=server-builder /app/apps/server/package.json ./apps/server/
COPY --from=server-builder /app/apps/server/prisma ./apps/server/prisma

# Copy web build
COPY --from=web-builder /app/apps/web/.next ./apps/server/dist/.next
COPY --from=web-builder /app/apps/web/public ./apps/server/dist/public
COPY --from=web-builder /app/apps/web/package.json ./apps/web/

# Copy workspace files
COPY pnpm-workspace.yaml package.json ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Create uploads directory
RUN mkdir -p /data/uploads

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Generate Prisma client
WORKDIR /app/apps/server
RUN npx prisma generate

# Start server
WORKDIR /app/apps/server
CMD ["node", "dist/index.js"]

