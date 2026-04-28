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

const foundItemSchema = new mongoose.Schema(
  {
    finder: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    itemName: { type: String, required: true, trim: true, maxlength: 120, index: true },
    category: { type: String, required: true, trim: true, maxlength: 60, index: true },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    foundLocation: { type: String, required: true, trim: true, maxlength: 180, index: true },
    dateFound: { type: Date, required: true },
    image: { type: imageSchema, default: {} },
    contact: { type: contactSchema, default: {} },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    linkedLostItem: { type: mongoose.Schema.Types.ObjectId, ref: "LostItem", default: null, index: true }
  },
  { timestamps: true }
);

foundItemSchema.index({ itemName: "text", description: "text", foundLocation: "text" });

const FoundItem = mongoose.model("FoundItem", foundItemSchema);

module.exports = { FoundItem };

