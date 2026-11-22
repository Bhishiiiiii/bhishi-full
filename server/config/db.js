import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryInstance = null;
let dbStatus = 'disconnected';

export const getDbStatus = () => dbStatus;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bishi_db';
  
  // Try connecting to specified MongoDB server first with 2.5s timeout
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    dbStatus = 'connected';
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[MongoDB] Local daemon not reachable at ${uri} (${err.message}).`);
    console.log('[MongoDB] Starting self-contained In-Memory MongoDB for standalone / offline demo mode...');

    try {
      mongoMemoryInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'bishi_db'
        }
      });
      const memoryUri = mongoMemoryInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      dbStatus = 'memory';
      console.log(`[MongoDB] In-Memory MongoDB running successfully at ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error('[MongoDB] Fatal error initializing MongoDB:', memErr);
      dbStatus = 'disconnected';
      throw memErr;
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryInstance) {
    await mongoMemoryInstance.stop();
  }
};
