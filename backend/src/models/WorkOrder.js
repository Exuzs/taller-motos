const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const WorkOrder = sequelize.define("WorkOrder", {
  entryDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  faultDescription: DataTypes.STRING,
  status: {
    type: DataTypes.STRING,
    defaultValue: "RECIBIDA"
  },
  total: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  BikeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = WorkOrder;