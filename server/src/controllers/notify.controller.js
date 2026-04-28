const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const { Notification } = require("../models/Notification");
const { Claim } = require("../models/Claim");

const listMy = asyncHandler(async (req, res) => {
  const { limit = "30" } = req.query || {};
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 30));
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limitNum);

  // Backfill finder details for older claim notifications that only stored claimId.
  const claimIdsToFetch = notifications
    .filter((n) => n.type === "claim" && n.meta?.claimId && !n.meta?.finder)
    .map((n) => n.meta.claimId)
    .filter((id) => mongoose.isValidObjectId(id));

  let claimMap = new Map();
  if (claimIdsToFetch.length) {
    const claims = await Claim.find({ _id: { $in: claimIdsToFetch } })
      .select("lostItem owner finder message contact finderSnapshot createdAt")
      .populate("lostItem", "itemName")
      .populate("finder", "name email");
    claimMap = new Map(claims.map((c) => [String(c._id), c]));
  }

  const enriched = notifications.map((n) => {
    if (n.type !== "claim") return n;
    const claimId = n.meta?.claimId ? String(n.meta.claimId) : "";
    const claim = claimId ? claimMap.get(claimId) : null;
    if (!claim) return n;

    const finderName = claim.contact?.name || claim.finderSnapshot?.name || claim.finder?.name || "";
    const finderEmail = claim.contact?.email || claim.finderSnapshot?.email || claim.finder?.email || "";
    const finderPhone = claim.contact?.phone || "";

    return {
      ...n.toObject(),
      meta: {
        ...(n.meta || {}),
        itemName: n.meta?.itemName || claim.lostItem?.itemName,
        finder: n.meta?.finder || { name: finderName, email: finderEmail, phone: finderPhone },
        claim: n.meta?.claim || { message: claim.message },
        claimCreatedAt: claim.createdAt
      }
    };
  });

  res.json({ notifications: enriched });
});

const markRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error("Invalid id");
  }
  const notif = await Notification.findOne({ _id: id, user: req.user._id });
  if (!notif) {
    res.status(404);
    throw new Error("Notification not found");
  }
  notif.read = true;
  await notif.save();
  res.json({ notification: notif });
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
  res.json({ ok: true });
});

module.exports = { listMy, markRead, markAllRead };
