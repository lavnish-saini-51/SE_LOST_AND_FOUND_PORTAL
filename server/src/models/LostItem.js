const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 80 },
    email: { type: String, trim: true, lowercase: true, maxlength: 120 },
    phone: { type: String, trim: true, maxlength: 40 }
  },
  { _id: false }
);

const imageSchema = new mongoose.Schema(
  {
    url: { type: String },
    publicId: { type: String }
  },
  { _id: false }
);

const lostItemSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    itemName: { type: String, required: true, trim: true, maxlength: 120, index: true },
    category: { type: String, required: true, trim: true, maxlength: 60, index: true },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    lastSeenLocation: { type: String, required: true, trim: true, maxlength: 180, index: true },
    dateLost: { type: Date, required: true },
    image: { type: imageSchema, default: {} },
    contact: { type: contactSchema, default: {} },
    reward: { type: Number, min: 0, max: 1000000 },
    status: { type: String, enum: ["pending", "approved", "rejected", "found"], default: "pending", index: true },
    isResolved: { type: Boolean, default: false, index: true },
    // Back-compat (older code paths); keep in sync with isResolved.
    resolved: { type: Boolean, default: false, index: true },
    resolvedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

lostItemSchema.index({ itemName: "text", description: "text", lastSeenLocation: "text" });

const LostItem = mongoose.model("LostItem", lostItemSchema);

module.exports = { LostItem };
