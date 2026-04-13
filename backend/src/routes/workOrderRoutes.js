const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");

const {
  createWorkOrder,
  getWorkOrders,
  getWorkOrderById,
  updateStatus,
  addItem,
  deleteItem,
  getStatusHistory
} = require("../controllers/workOrderController");

// Todas las rutas requieren autenticación
router.use(authenticate);

router.post("/work-orders", authorize("ADMIN"), createWorkOrder);
router.get("/work-orders", getWorkOrders);
router.get("/work-orders/:id", getWorkOrderById);
router.put("/work-orders/:id", authorize("ADMIN"), exports.updateWorkOrder = require("../controllers/workOrderController").updateWorkOrder);
router.delete("/work-orders/:id", authorize("ADMIN"), exports.deleteWorkOrder = require("../controllers/workOrderController").deleteWorkOrder);
router.patch("/work-orders/:id/status", updateStatus);
router.get("/work-orders/:id/history", getStatusHistory);
router.post("/work-orders/:id/items", addItem);
router.delete("/work-orders/items/:itemId", authorize("ADMIN"), deleteItem);

module.exports = router;