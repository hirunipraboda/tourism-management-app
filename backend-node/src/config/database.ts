import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export const connectDB = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    console.log('[Database] PostgreSQL connected successfully via Prisma.');
    return true;
  } catch (error) {
    console.error('[Database] Connection Error:', error);
    return false;
  }
};

export const disconnectDB = async (): Promise<void> => {
  await prisma.$disconnect();
};
