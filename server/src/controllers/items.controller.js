const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const { LostItem } = require("../models/LostItem");
const { FoundItem } = require("../models/FoundItem");
const { scoreRoughMatch } = require("../utils/match");

function shouldRequireApproval() {
  return String(process.env.REQUIRE_POST_APPROVAL || "false").toLowerCase() === "true";
}

function buildFilters({ type, category, location, q }) {
  const base = shouldRequireApproval()
    ? { status: "approved" }
    : { status: { $in: ["approved", "pending"] } };
  const and = [];

  // Hide resolved lost items from public search results
  if (type === "lost") {
    and.push({ isResolved: { $ne: true } });
    and.push({ resolved: { $ne: true } });
  }

  if (category) and.push({ category: String(category).trim() });

  if (location) {
    const rx = new RegExp(String(location).trim(), "i");
    if (type === "lost") and.push({ lastSeenLocation: rx });
    if (type === "found") and.push({ foundLocation: rx });
    if (!type) and.push({ $or: [{ lastSeenLocation: rx }, { foundLocation: rx }] });
  }

  if (q) {
    const rx = new RegExp(String(q).trim(), "i");
    and.push({ $or: [{ itemName: rx }, { description: rx }] });
  }

  if (and.length) return { ...base, $and: and };
  return base;
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

function mapFound(doc) {
  return {
    id: doc._id,
    type: "found",
    itemName: doc.itemName,
    category: doc.category,
    description: doc.description,
    location: doc.foundLocation,
    date: doc.dateFound,
    image: doc.image,
    resolved: false,
    finder: doc.finder,
    createdAt: doc.createdAt
  };
}

const getAll = asyncHandler(async (req, res) => {
  const {
    type,
    category,
    location,
    q,
    sort = "newest",
    page = "1",
    limit = "12"
  } = req.query || {};

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(50, Math.max(1, Number(limit) || 12));
  const skip = (pageNum - 1) * limitNum;

  const sortObj = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

  if (type === "lost") {
    const filters = buildFilters({ type: "lost", category, location, q });
    const [items, total] = await Promise.all([
      LostItem.find(filters)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate("owner", "name email"),
      LostItem.countDocuments(filters)
    ]);
    return res.json({
      items: items.map(mapLost),
      page: pageNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    });
  }

  if (type === "found") {
    const filters = buildFilters({ type: "found", category, location, q });
    const [items, total] = await Promise.all([
      FoundItem.find(filters)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate("finder", "name email"),
      FoundItem.countDocuments(filters)
    ]);
    return res.json({
      items: items.map(mapFound),
      page: pageNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    });
  }

  const lostFilters = buildFilters({ type: "lost", category, location, q });
  const foundFilters = buildFilters({ type: "found", category, location, q });
  const [lost, found] = await Promise.all([
    LostItem.find(lostFilters).sort(sortObj).limit(100).populate("owner", "name email"),
    FoundItem.find(foundFilters).sort(sortObj).limit(100).populate("finder", "name email")
  ]);
  const merged = [...lost.map(mapLost), ...found.map(mapFound)].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const pageItems = merged.slice(skip, skip + limitNum);
  res.json({
    items: pageItems,
    page: pageNum,
    total: merged.length,
    totalPages: Math.ceil(merged.length / limitNum)
  });
});

const getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { matches } = req.query || {};

  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error("Invalid id");
  }

  const visibleStatuses = shouldRequireApproval() ? ["approved"] : ["approved", "pending"];
  const lost = await LostItem.findOne({
    _id: id,
    status: { $in: [...visibleStatuses, "found"] }
  }).populate("owner", "name email");
  if (lost) {
    const payload = { item: mapLost(lost), contact: lost.contact };
    if (matches === "1") {
      const found = await FoundItem.find({ status: "approved", category: lost.category })
        .limit(30)
        .select("itemName category foundLocation dateFound image finder createdAt")
        .populate("finder", "name email");
      const scored = found
        .map((f) => ({ f, score: scoreRoughMatch({ lost, found: f }) }))
        .filter((x) => x.score >= 55)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map(({ f, score }) => ({ ...mapFound(f), score }));
      payload.matches = scored;
    }
    return res.json(payload);
  }

  const found = await FoundItem.findOne({ _id: id, status: { $in: visibleStatuses } }).populate("finder", "name email");
  if (!found) {
    res.status(404);
    throw new Error("Item not found");
  }

  res.json({ item: mapFound(found), contact: found.contact });
});

const search = asyncHandler(async (req, res) => {
  return getAll(req, res);
});

module.exports = { getAll, getById, search };
