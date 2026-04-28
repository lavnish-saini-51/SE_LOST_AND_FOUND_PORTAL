const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getClaimById, acceptClaim } = require("../controllers/claims.controller");

const router = express.Router();

router.get("/:id", requireAuth, getClaimById);
router.post("/:id/accept", requireAuth, acceptClaim);

module.exports = router;
