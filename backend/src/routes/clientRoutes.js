const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");

const {
  createClient,
  getClients,
  getClientById
} = require("../controllers/clientController");

router.use(authenticate);

router.post("/clients", authorize("ADMIN"), createClient);
router.get("/clients", getClients);
router.get("/clients/:id", getClientById);
router.put("/clients/:id", authorize("ADMIN"), exports.updateClient = require("../controllers/clientController").updateClient);
router.delete("/clients/:id", authorize("ADMIN"), exports.deleteClient = require("../controllers/clientController").deleteClient);

module.exports = router;