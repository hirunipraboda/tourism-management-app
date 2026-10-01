import app from './app';
import { connectDB } from './config/database';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Travel Link Backend Server running on port ${PORT}`);
    console.log(`🛢️ Database: PostgreSQL via Prisma ORM`);
    console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📚 Swagger Docs: http://localhost:${PORT}/api/docs`);
    console.log(`====================================================`);
  });
};

startServer();
