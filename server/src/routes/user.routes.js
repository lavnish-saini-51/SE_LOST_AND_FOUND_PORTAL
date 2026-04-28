const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { dashboard } = require("../controllers/user.controller");

const router = express.Router();

router.get("/dashboard", requireAuth, dashboard);

module.exports = router;

