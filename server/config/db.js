const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  // Avoid creating unnecessary duplicate connections
  if (isConnected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/parttimeconnect';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.error(`Attempted URI: ${mongoUri}`);
    console.error('Ensure your local MongoDB Windows Service is running (net start MongoDB)');
    process.exit(1);
  }
};

module.exports = connectDB;
