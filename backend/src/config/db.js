const mongoose = require('mongoose');

global.mongoStatus = {
  state: 'disconnected',
  error: null,
  host: null,
  uriProvided: false,
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && !uri.includes('127.0.0.1') && !uri.includes('localhost')) {
    global.mongoStatus.uriProvided = true;
    try {
      console.log('[MongoDB] Connecting to MongoDB Atlas...');
      global.mongoStatus.state = 'connecting';
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}`);
      global.mongoStatus.state = 'connected';
      global.mongoStatus.host = conn.connection.host;
      global.mongoStatus.error = null;
      return conn;
    } catch (error) {
      console.error(`[MongoDB] Atlas connection error: ${error.message}`);
      global.mongoStatus.state = 'error';
      global.mongoStatus.error = error.message;
      return null;
    }
  }

  // Local development fallback
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/spendwise', {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected to local MongoDB: ${conn.connection.host}`);
    global.mongoStatus.state = 'connected_local';
    global.mongoStatus.host = conn.connection.host;
    return conn;
  } catch (err) {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Built-in memory database active at ${memoryUri}`);
      global.mongoStatus.state = 'connected_memory';
      return conn;
    } catch (memErr) {
      console.warn('[MongoDB] Running without active database.');
      global.mongoStatus.state = 'no_database';
      global.mongoStatus.error = 'No database available';
      return null;
    }
  }
};

module.exports = connectDB;
