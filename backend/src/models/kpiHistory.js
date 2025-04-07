const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class KpiHistory extends Model {
    static associate(models) {
      // Define associations
      KpiHistory.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  
  KpiHistory.init({
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
    net_worth: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    monthly_income: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    monthly_expenses: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    savings_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    debt_to_income: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    fi_index: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
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
    modelName: 'KpiHistory',
    tableName: 'kpi_history',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return KpiHistory;
};
