const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");

const {
  createBike,
  getBikes,
  getBikeById
} = require("../controllers/bikeController");

router.use(authenticate);

router.post("/bikes", authorize("ADMIN"), createBike);
router.get("/bikes", getBikes);
router.get("/bikes/:id", getBikeById);
router.put("/bikes/:id", authorize("ADMIN"), exports.updateBike = require("../controllers/bikeController").updateBike);
router.delete("/bikes/:id", authorize("ADMIN"), exports.deleteBike = require("../controllers/bikeController").deleteBike);

module.exports = router;