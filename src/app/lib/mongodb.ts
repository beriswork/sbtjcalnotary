import mongoose, { Connection } from 'mongoose';

interface CachedConnection {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

const cached: CachedConnection = {
  conn: null,
  promise: null,
};

export async function connectToDatabase(): Promise<Connection> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
    };

    try {
      console.log('Connecting to MongoDB...');
      // Create a new promise that explicitly returns a Connection
      cached.promise = mongoose.connect(process.env.MONGODB_URI, {
        ...opts,
        dbName: process.env.MONGODB_DB || 'notary_calculator',
      }).then(() => mongoose.connection);
      
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('Error resolving MongoDB connection:', error);
    throw error;
  }
}

export default connectToDatabase; 