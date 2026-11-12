import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env.js';

// Some Windows DNS resolvers refuse SRV lookups required by mongodb+srv
dns.setServers(['8.8.8.8', '1.1.1.1']);

let memoryServer: { getUri: () => string; stop: () => Promise<boolean> } | null = null;

async function startMemoryMongo(): Promise<string> {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  return memoryServer.getUri('shoppilot-ai');
}

async function ensureSeeded(): Promise<void> {
  const { Product } = await import('../models/Product.js');
  const count = await Product.countDocuments();
  if (count > 0) return;

  console.log('No products found — seeding sample data...');
  const { seedDatabase } = await import('../utils/seed.js');
  await seedDatabase({ clear: true });
}

export async function connectDB(): Promise<void> {
  const options = {
    serverSelectionTimeoutMS: 8000,
  };

  try {
    const connection = await mongoose.connect(env.mongoUri, options);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('MongoDB Atlas connection failed:', message);

    if (env.nodeEnv === 'production') {
      process.exit(1);
    }

    console.warn(
      'Falling back to in-memory MongoDB for local development.\n' +
        'To use Atlas again: https://cloud.mongodb.com → Network Access → Add IP Address\n' +
        '(also resume the cluster if it is paused).'
    );

    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      const uri = await startMemoryMongo();
      const connection = await mongoose.connect(uri, options);
      console.log(`MongoDB connected (memory): ${connection.connection.host}`);
      await ensureSeeded();
    } catch (fallbackError) {
      console.error('In-memory MongoDB fallback failed:', fallbackError);
      process.exit(1);
    }
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
