const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const { Claim } = require("../models/Claim");
const { LostItem } = require("../models/LostItem");
const { Notification } = require("../models/Notification");

const getClaimById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error("Invalid id");
  }

  const claim = await Claim.findById(id)
    .populate("lostItem", "itemName category lastSeenLocation dateLost image")
    .populate("finder", "name email")
    .populate("owner", "name email");

  if (!claim) {
    res.status(404);
    throw new Error("Claim not found");
  }

  const isOwner = String(claim.owner?._id) === String(req.user._id);
  const isFinder = String(claim.finder?._id) === String(req.user._id);
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isFinder && !isAdmin) {
    res.status(403);
    throw new Error("Not allowed");
  }

  res.json({ claim });
});

const acceptClaim = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error("Invalid id");
  }

  const claim = await Claim.findById(id);
  if (!claim) {
    res.status(404);
    throw new Error("Claim not found");
  }
  const isOwner = String(claim.owner) === String(req.user._id);
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("Not allowed");
  }

  if (claim.status !== "pending") {
    return res.json({ claim });
  }

  claim.status = "accepted";
  await claim.save();

  const item = await LostItem.findById(claim.lostItem);
  if (item) {
    item.status = "found";
    item.isResolved = true;
    item.resolved = true;
    item.resolvedAt = new Date();
    await item.save();
  }

  await Notification.create({
    user: claim.finder,
    type: "system",
    title: "Claim accepted",
    message: "The owner accepted your claim. They may contact you shortly.",
    meta: { claimId: claim._id, lostItemId: claim.lostItem }
  });

  res.json({ claim });
});

module.exports = { getClaimById, acceptClaim };
