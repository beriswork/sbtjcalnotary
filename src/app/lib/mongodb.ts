import mongoose, { Connection } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

interface CachedConnection {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

let cached = (global as any).mongoose || { conn: null, promise: null };

if (!(global as any).mongoose) {
  (global as any).mongoose = cached;
}

async function dbConnect() {
  if (cached.conn) {
    console.log('[MongoDB] Using existing connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    console.log('[MongoDB] Creating new connection');
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then(() => mongoose.connection);
  }

  try {
    cached.conn = await cached.promise;
    console.log('[MongoDB] Successfully connected');
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.error('[MongoDB] Connection error:', e);
    throw e;
  }
}

export default dbConnect; 