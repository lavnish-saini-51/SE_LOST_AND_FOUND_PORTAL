const express = require("express");
const { getAll, getById, search } = require("../controllers/items.controller");

const router = express.Router();

router.get("/all", getAll);
router.get("/search", search);
router.get("/:id", getById);

module.exports = router;

