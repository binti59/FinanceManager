const app = require('./app');
const config = require('./config/config');
const { sequelize } = require('./models');

// Start the server
const PORT = config.app.port;

const startServer = async () => {
  try {
    // Sync database models
    if (config.app.env !== 'production') {
      await sequelize.sync();
      console.log('Database synced successfully');
    }

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${config.app.env} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();
