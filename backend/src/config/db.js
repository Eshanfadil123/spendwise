const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && !uri.includes('127.0.0.1') && !uri.includes('localhost')) {
    try {
      console.log('[MongoDB] Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`[MongoDB] Atlas connection error: ${error.message}`);
      console.error('[MongoDB] The API will remain online, but requests needing the DB will fail until MONGODB_URI is valid.');
      return null;
    }
  }

  // Local development fallback
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/spendwise', {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected to local MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Built-in memory database active at ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.warn('[MongoDB] Running without active database. Please configure MONGODB_URI in Render.');
      return null;
    }
  }
};

module.exports = connectDB;
