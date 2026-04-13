const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Bike = sequelize.define("Bike", {
  placa: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  brand: DataTypes.STRING,
  model: DataTypes.STRING,
  cylinder: DataTypes.INTEGER,
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Bike;