const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const {
  createLost,
  listPublicLost,
  myLostItems,
  markLostResolved,
  claimLostItem
} = require("../controllers/lost.controller");

const router = express.Router();

// Public
router.get("/all", listPublicLost);

router.post("/create", requireAuth, upload.single("image"), createLost);
router.get("/my-items", requireAuth, myLostItems);
router.post("/:id/mark-found", requireAuth, markLostResolved);
router.post("/:id/claim", requireAuth, claimLostItem);

module.exports = router;
