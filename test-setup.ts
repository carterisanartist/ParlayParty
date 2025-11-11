import { beforeAll, afterAll } from 'vitest';
// Note: Prisma client import disabled for workspace testing

beforeAll(async () => {
  // Test setup - database setup disabled for workspace testing
  console.log('Test environment initialized');
});

afterAll(async () => {
  // Test cleanup
  console.log('Test environment cleaned up');
});
