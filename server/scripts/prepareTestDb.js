const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.MONGOMS_MD5_CHECK = '0';

async function prepare() {
  console.log('Starting MongoMemoryServer with launchTimeout: 60000ms...');
  const mongoServer = await MongoMemoryServer.create({
    binary: {
      checkMD5: false,
    },
    instance: {
      launchTimeout: 60000,
    },
  });
  console.log('MongoDB Test Server successfully initialized at:', mongoServer.getUri());
  await mongoServer.stop();
  console.log('Success! MongoDB test binary is verified and ready.');
  process.exit(0);
}

prepare().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
