const asyncHandler = require("express-async-handler");
const { FoundItem } = require("../models/FoundItem");
const { LostItem } = require("../models/LostItem");
const { Notification } = require("../models/Notification");
const { saveImageFromMulter } = require("../utils/uploadImage");
const { scoreRoughMatch } = require("../utils/match");

function shouldRequireApproval() {
  return String(process.env.REQUIRE_POST_APPROVAL || "false").toLowerCase() === "true";
}

function parseContact(body) {
  const contact = body?.contact && typeof body.contact === "object" ? body.contact : {};
  return {
    name: body?.finderContactName || body?.contactName || contact.name || "",
    email: body?.finderContactEmail || body?.contactEmail || contact.email || "",
    phone: body?.finderContactPhone || body?.contactPhone || contact.phone || ""
  };
}

const createFound = asyncHandler(async (req, res) => {
  const { itemName, category, description, foundLocation, dateFound } = req.body || {};

  if (!itemName || !category || !description || !foundLocation || !dateFound) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  const image = await saveImageFromMulter(req.file);
  const contact = parseContact(req.body);

  const doc = await FoundItem.create({
    finder: req.user._id,
    itemName: String(itemName).trim(),
    category: String(category).trim(),
    description: String(description).trim(),
    foundLocation: String(foundLocation).trim(),
    dateFound: new Date(dateFound),
    image,
    contact,
    status: shouldRequireApproval() ? "pending" : "approved"
  });

  // Matching & notifications: notify owners of likely matches (approved + not resolved)
  const visibleStatuses = shouldRequireApproval() ? ["approved"] : ["approved", "pending"];
  const candidates = await LostItem.find({
    status: { $in: visibleStatuses },
    resolved: false,
    category: doc.category
  })
    .limit(40)
    .select("owner itemName category lastSeenLocation");

  const scored = candidates
    .map((lost) => ({ lost, score: scoreRoughMatch({ lost, found: doc }) }))
    .filter((x) => x.score >= 60)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (scored.length) {
    await Promise.all(
      scored.map(({ lost, score }) =>
        Notification.create({
          user: lost.owner,
          type: "match",
          title: "Possible match found",
          message: `A found item looks similar to "${lost.itemName}" (match score ${score}).`,
          meta: { lostItemId: lost._id, foundItemId: doc._id, score }
        })
      )
    );
  }

  res.status(201).json({ item: doc, matchesNotified: scored.length });
});

const myFoundItems = asyncHandler(async (req, res) => {
  const items = await FoundItem.find({ finder: req.user._id }).sort({ createdAt: -1 });
  res.json({ items });
});

module.exports = { createFound, myFoundItems };
