import { beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/parlayparty_test?schema=public'
    },
  },
});

beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
  
  // Run migrations
  const { execSync } = require('child_process');
  execSync('cd apps/server && npx prisma migrate dev --name test-setup', { stdio: 'inherit' });
});

afterAll(async () => {
  // Clean up
  await prisma.$disconnect();
});
