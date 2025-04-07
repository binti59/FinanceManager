require('dotenv').config();

module.exports = {
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    apiUrl: process.env.API_URL || 'http://localhost:3000/api',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000'
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key',
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
    jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log'
  }
};
