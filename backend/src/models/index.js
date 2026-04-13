const Client = require("./Client");
const Bike = require("./Bike");
const WorkOrder = require("./WorkOrder");
const Item = require("./Item");
const User = require("./User");
const StatusHistory = require("./StatusHistory");

Client.hasMany(Bike, { foreignKey: "clientId" });
Bike.belongsTo(Client, { foreignKey: "clientId" });

Bike.hasMany(WorkOrder, { foreignKey: "BikeId" });
WorkOrder.belongsTo(Bike, { foreignKey: "BikeId" });

WorkOrder.hasMany(Item);
Item.belongsTo(WorkOrder);

// Historial de estados
WorkOrder.hasMany(StatusHistory, { foreignKey: "work_order_id" });
StatusHistory.belongsTo(WorkOrder, { foreignKey: "work_order_id" });

User.hasMany(StatusHistory, { foreignKey: "changed_by_user_id" });
StatusHistory.belongsTo(User, { foreignKey: "changed_by_user_id" });

module.exports = {
  Client,
  Bike,
  WorkOrder,
  Item,
  User,
  StatusHistory
};