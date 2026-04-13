const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const { getUsers, updateUser } = require("../controllers/userController");

router.get("/users", authenticate, authorize("ADMIN"), getUsers);
router.patch("/users/:id", authenticate, authorize("ADMIN"), updateUser);
router.delete("/users/:id", authenticate, authorize("ADMIN"), exports.deleteUser = require("../controllers/userController").deleteUser);

module.exports = router;
