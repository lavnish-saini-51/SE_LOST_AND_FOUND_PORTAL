const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const { createFound, myFoundItems } = require("../controllers/found.controller");

const router = express.Router();

router.post("/create", requireAuth, upload.single("image"), createFound);
router.get("/my-items", requireAuth, myFoundItems);

module.exports = router;

