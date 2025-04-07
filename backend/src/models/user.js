const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations
      User.hasMany(models.Account, { foreignKey: 'user_id', as: 'accounts' });
      User.hasMany(models.Transaction, { foreignKey: 'user_id', as: 'transactions' });
      User.hasMany(models.Category, { foreignKey: 'user_id', as: 'categories' });
      User.hasMany(models.Budget, { foreignKey: 'user_id', as: 'budgets' });
      User.hasMany(models.Goal, { foreignKey: 'user_id', as: 'goals' });
      User.hasMany(models.Asset, { foreignKey: 'user_id', as: 'assets' });
      User.hasMany(models.KpiHistory, { foreignKey: 'user_id', as: 'kpiHistory' });
    }
  }
  
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return User;
};
