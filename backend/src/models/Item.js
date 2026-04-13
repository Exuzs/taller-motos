const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Item = sequelize.define("Item", {
  type: {
    type: DataTypes.ENUM("MANO_OBRA", "REPUESTO")
  },
  description: DataTypes.STRING,
  count: {
    type: DataTypes.INTEGER,
    validate: { min: 1 }
  },
  unitValue: {
    type: DataTypes.FLOAT,
    validate: { min: 0 }
  }
});

module.exports = Item;