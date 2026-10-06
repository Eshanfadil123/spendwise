const mongoose = require('mongoose');

const connectDB = async () => {
  if (process.env.MONGODB_URI) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`[MongoDB] Connected successfully to Atlas: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`[MongoDB] Connection error: ${error.message}`);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }

  // Try local MongoDB or automatically spin up in-memory MongoDB for seamless development
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/spendwise', {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected to local MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.log('[MongoDB] Local MongoDB daemon not active. Starting built-in memory database server...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Live! Built-in database initialized at ${uri}`);
    return conn;
  }
};

module.exports = connectDB;
