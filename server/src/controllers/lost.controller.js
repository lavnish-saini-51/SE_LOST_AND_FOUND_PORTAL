const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const { LostItem } = require("../models/LostItem");
const { Claim } = require("../models/Claim");
const { Notification } = require("../models/Notification");
const { saveImageFromMulter } = require("../utils/uploadImage");

function shouldRequireApproval() {
  return String(process.env.REQUIRE_POST_APPROVAL || "false").toLowerCase() === "true";
}

function mapLost(doc) {
  return {
    id: doc._id,
    type: "lost",
    itemName: doc.itemName,
    category: doc.category,
    description: doc.description,
    location: doc.lastSeenLocation,
    date: doc.dateLost,
    image: doc.image,
    reward: doc.reward,
    resolved: doc.resolved,
    owner: doc.owner,
    createdAt: doc.createdAt
  };
}

function parseContact(body) {
  const contact = body?.contact && typeof body.contact === "object" ? body.contact : {};
  return {
    name: body?.contactName || contact.name || "",
    email: body?.contactEmail || contact.email || "",
    phone: body?.contactPhone || contact.phone || ""
  };
}

const createLost = asyncHandler(async (req, res) => {
  const {
    itemName,
    category,
    description,
    lastSeenLocation,
    dateLost,
    reward
  } = req.body || {};

  if (!itemName || !category || !description || !lastSeenLocation || !dateLost) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  const image = await saveImageFromMulter(req.file);
  const contact = parseContact(req.body);

  const doc = await LostItem.create({
    owner: req.user._id,
    itemName: String(itemName).trim(),
    category: String(category).trim(),
    description: String(description).trim(),
    lastSeenLocation: String(lastSeenLocation).trim(),
    dateLost: new Date(dateLost),
    reward: reward !== undefined && reward !== "" ? Number(reward) : undefined,
    image,
    contact,
    status: shouldRequireApproval() ? "pending" : "approved"
  });

  res.status(201).json({ item: doc });
});

const listPublicLost = asyncHandler(async (req, res) => {
  const { page = "1", limit = "12" } = req.query || {};
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(50, Math.max(1, Number(limit) || 12));
  const skip = (pageNum - 1) * limitNum;

  const filters = shouldRequireApproval()
    ? { status: "approved", isResolved: { $ne: true } }
    : { status: { $in: ["approved", "pending"] }, isResolved: { $ne: true } };
  filters.resolved = { $ne: true };
  const [items, total] = await Promise.all([
    LostItem.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limitNum).populate("owner", "name email"),
    LostItem.countDocuments(filters)
  ]);

  res.json({
    items: items.map(mapLost),
    page: pageNum,
    total,
    totalPages: Math.ceil(total / limitNum)
  });
});

const myLostItems = asyncHandler(async (req, res) => {
  const items = await LostItem.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ items });
});

const markLostResolved = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error("Invalid id");
  }
  const item = await LostItem.findById(id);
  if (!item) {
    res.status(404);
    throw new Error("Lost item not found");
  }
  if (String(item.owner) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not allowed");
  }

  item.status = "found";
  item.isResolved = true;
  item.resolved = true;
  item.resolvedAt = new Date();
  await item.save();
  res.json({ item });
});

const claimLostItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message, contactName, contactEmail, contactPhone } = req.body || {};
  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error("Invalid id");
  }
  if (!message) {
    res.status(400);
    throw new Error("Message is required");
  }

  const lost = await LostItem.findById(id);
  if (!lost) {
    res.status(404);
    throw new Error("Lost item not found");
  }
  if (lost.resolved) {
    res.status(400);
    throw new Error("This item is already marked as found");
  }
  if (String(lost.owner) === String(req.user._id)) {
    res.status(400);
    throw new Error("You cannot claim your own item");
  }

  const derivedName = String(contactName || req.user.name || "").trim();
  const derivedEmail = String(contactEmail || req.user.email || "").trim().toLowerCase();
  const derivedPhone = String(contactPhone || "").trim();

  const claim = await Claim.create({
    lostItem: lost._id,
    owner: lost.owner,
    finder: req.user._id,
    finderSnapshot: { name: req.user.name, email: req.user.email },
    message: String(message).trim(),
    contact: {
      name: derivedName,
      email: derivedEmail,
      phone: derivedPhone
    }
  });

  const finderLines = [
    `${derivedName || req.user.name} says they found your item "${lost.itemName}".`,
    derivedPhone ? `Phone: ${derivedPhone}` : "",
    derivedEmail ? `Email: ${derivedEmail}` : "",
    `Message: ${String(message).trim()}`
  ].filter(Boolean);

  await Notification.create({
    user: lost.owner,
    type: "claim",
    title: "Someone says they found your item",
    message: finderLines.join("\n"),
    meta: {
      lostItemId: lost._id,
      claimId: claim._id,
      itemName: lost.itemName,
      finder: { name: derivedName || req.user.name, email: derivedEmail, phone: derivedPhone },
      claim: { message: String(message).trim() }
    }
  });

  res.status(201).json({ claim });
});

module.exports = { createLost, listPublicLost, myLostItems, markLostResolved, claimLostItem };
