const { Sequelize, DataTypes } = require('sequelize');

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
    logging: false
  }
);

// Define models
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// User model
db.user = require('./user.model')(sequelize, DataTypes);

module.exports = db;
