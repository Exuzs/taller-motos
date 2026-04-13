const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
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
  role: {
    type: DataTypes.ENUM("ADMIN", "MECANICO"),
    allowNull: false,
    defaultValue: "MECANICO"
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// Hook para hashear password antes de crear
User.beforeCreate(async (user) => {
  if (user.password_hash) {
    user.password_hash = await bcrypt.hash(user.password_hash, 10);
  }
});

// Hook para hashear password antes de update (solo si cambió)
User.beforeUpdate(async (user) => {
  if (user.changed("password_hash")) {
    user.password_hash = await bcrypt.hash(user.password_hash, 10);
  }
});

// Método para validar password
User.prototype.validatePassword = async function (password) {
  return bcrypt.compare(password, this.password_hash);
};

// Método para retornar usuario sin password
User.prototype.toSafeJSON = function () {
  const values = { ...this.get() };
  delete values.password_hash;
  return values;
};

module.exports = User;
