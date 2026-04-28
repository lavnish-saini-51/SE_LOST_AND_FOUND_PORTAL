const asyncHandler = require("express-async-handler");
const { LostItem } = require("../models/LostItem");
const { FoundItem } = require("../models/FoundItem");
const { Notification } = require("../models/Notification");
const { Claim } = require("../models/Claim");

const dashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const [lostItems, foundItems, notifications, claims] = await Promise.all([
    LostItem.find({ owner: userId }).sort({ createdAt: -1 }).limit(20),
    FoundItem.find({ finder: userId }).sort({ createdAt: -1 }).limit(20),
    Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(20),
    Claim.find({ $or: [{ owner: userId }, { finder: userId }] }).sort({ createdAt: -1 }).limit(20)
  ]);

  res.json({
    user: req.user,
    stats: {
      lostCount: await LostItem.countDocuments({ owner: userId }),
      foundCount: await FoundItem.countDocuments({ finder: userId }),
      unreadNotifications: await Notification.countDocuments({ user: userId, read: false }),
      claimsCount: await Claim.countDocuments({ $or: [{ owner: userId }, { finder: userId }] })
    },
    lostItems,
    foundItems,
    notifications,
    claims
  });
});

module.exports = { dashboard };

