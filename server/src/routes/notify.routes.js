const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { listMy, markRead, markAllRead } = require("../controllers/notify.controller");

const router = express.Router();

router.get("/", requireAuth, listMy);
router.patch("/:id/read", requireAuth, markRead);
router.patch("/read-all", requireAuth, markAllRead);

module.exports = router;

