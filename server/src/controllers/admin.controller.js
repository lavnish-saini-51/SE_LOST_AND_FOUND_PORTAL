const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const { User } = require("../models/User");
const { LostItem } = require("../models/LostItem");
const { FoundItem } = require("../models/FoundItem");

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-passwordHash").sort({ createdAt: -1 }).limit(200);
  res.json({ users });
});

const setUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body || {};
  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error("Invalid id");
  }
  if (!["user", "admin"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }
  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.role = role;
  await user.save();
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error("Invalid id");
  }
  if (String(id) === String(req.user._id)) {
    res.status(400);
    throw new Error("You cannot delete yourself");
  }
  await User.deleteOne({ _id: id });
  res.json({ ok: true });
});

const listItems = asyncHandler(async (req, res) => {
  const { type = "all", status } = req.query || {};
  const common = {};
  if (status) common.status = status;

  if (type === "lost") {
    const items = await LostItem.find(common).sort({ createdAt: -1 }).limit(200).populate("owner", "name email");
    return res.json({ type, items });
  }
  if (type === "found") {
    const items = await FoundItem.find(common).sort({ createdAt: -1 }).limit(200).populate("finder", "name email");
    return res.json({ type, items });
  }

  const [lost, found] = await Promise.all([
    LostItem.find(common).sort({ createdAt: -1 }).limit(200).populate("owner", "name email"),
    FoundItem.find(common).sort({ createdAt: -1 }).limit(200).populate("finder", "name email")
  ]);
  res.json({ type: "all", items: { lost, found } });
});

const setItemStatus = asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const { status } = req.body || {};
  if (!["lost", "found"].includes(type)) {
    res.status(400);
    throw new Error("Invalid type");
  }
  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error("Invalid id");
  }
  if (!["pending", "approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }
  const Model = type === "lost" ? LostItem : FoundItem;
  const item = await Model.findById(id);
  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }
  item.status = status;
  await item.save();
  res.json({ item });
});

const deleteItem = asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  if (!["lost", "found"].includes(type)) {
    res.status(400);
    throw new Error("Invalid type");
  }
  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error("Invalid id");
  }
  const Model = type === "lost" ? LostItem : FoundItem;
  await Model.deleteOne({ _id: id });
  res.json({ ok: true });
});

module.exports = {
  listUsers,
  setUserRole,
  deleteUser,
  listItems,
  setItemStatus,
  deleteItem
};

