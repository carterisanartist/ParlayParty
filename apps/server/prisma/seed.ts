import { PrismaClient } from '@prisma/client';
import { generateRoomCode, DEFAULT_ROOM_SETTINGS } from '@parlay-party/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const room = await prisma.room.create({
    data: {
      code: generateRoomCode(),
      hostId: 'seed-host',
      status: 'lobby',
      settings: DEFAULT_ROOM_SETTINGS,
    },
  });

  const host = await prisma.player.create({
    data: {
      roomId: room.id,
      name: 'Host Player',
      isHost: true,
      latencyMs: 50,
    },
  });

  await prisma.room.update({
    where: { id: room.id },
    data: { hostId: host.id },
  });

  await prisma.player.createMany({
    data: [
      {
        roomId: room.id,
        name: 'Player 2',
        isHost: false,
        latencyMs: 75,
      },
      {
        roomId: room.id,
        name: 'Player 3',
        isHost: false,
        latencyMs: 60,
      },
    ],
  });

  console.log(`Created sample room with code: ${room.code}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

