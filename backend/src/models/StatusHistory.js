const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const StatusHistory = sequelize.define("StatusHistory", {
  work_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  from_status: {
    type: DataTypes.STRING,
    allowNull: true // nullable para el primer estado
  },
  to_status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  changed_by_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: "work_order_status_history",
  indexes: [
    {
      fields: ["work_order_id", { attribute: "createdAt", order: "DESC" }]
    }
  ]
});

module.exports = StatusHistory;
