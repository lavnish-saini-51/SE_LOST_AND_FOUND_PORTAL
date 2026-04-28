const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 80 },
    email: { type: String, trim: true, lowercase: true, maxlength: 120 },
    phone: { type: String, trim: true, maxlength: 40 }
  },
  { _id: false }
);

const claimSchema = new mongoose.Schema(
  {
    lostItem: { type: mongoose.Schema.Types.ObjectId, ref: "LostItem", required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    finder: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    finderSnapshot: {
      name: { type: String, trim: true, maxlength: 80 },
      email: { type: String, trim: true, lowercase: true, maxlength: 120 }
    },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    contact: { type: contactSchema, default: {} },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending", index: true }
  },
  { timestamps: true }
);

claimSchema.index({ lostItem: 1, finder: 1 }, { unique: true });

const Claim = mongoose.model("Claim", claimSchema);

module.exports = { Claim };
