const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.MONGOMS_MD5_CHECK = '0';
let mongoServer;

const connectTestDB = async () => {
  try {
    if (!mongoServer) {
      mongoServer = await MongoMemoryServer.create({
        binary: {
          checkMD5: false,
        },
        instance: {
          launchTimeout: 60000,
        },
      });
    }
    const uri = mongoServer.getUri();
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }
  } catch (error) {
    console.warn('[TestSetup] In-memory MongoDB notice, using fallback:', error.message);
    const fallbackUri = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/parttimeconnect_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(fallbackUri);
    }
  }
};

const clearTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};

const closeTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = {
  connectTestDB,
  clearTestDB,
  closeTestDB,
};
