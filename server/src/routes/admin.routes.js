const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const {
  listUsers,
  setUserRole,
  deleteUser,
  listItems,
  setItemStatus,
  deleteItem
} = require("../controllers/admin.controller");

const router = express.Router();

router.get("/users", requireAuth, requireAdmin, listUsers);
router.patch("/users/:id/role", requireAuth, requireAdmin, setUserRole);
router.delete("/users/:id", requireAuth, requireAdmin, deleteUser);

router.get("/items", requireAuth, requireAdmin, listItems);
router.patch("/items/:type/:id/status", requireAuth, requireAdmin, setItemStatus);
router.delete("/items/:type/:id", requireAuth, requireAdmin, deleteItem);

module.exports = router;

