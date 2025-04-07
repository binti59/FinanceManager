const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Asset extends Model {
    static associate(models) {
      // Define associations
      Asset.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  
  Asset.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: true
    },
    shares: {
      type: DataTypes.DECIMAL(15, 6),
      allowNull: true
    },
    purchase_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    current_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    purchase_date: {
      type: DataTypes.DATE,
      allowNull: true
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
    modelName: 'Asset',
    tableName: 'assets',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return Asset;
};
