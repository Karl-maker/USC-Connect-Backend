const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    student_id: { type: Number, required: true },
    belongs_to: { type: String }, // Department ID
  },
  {
    timestamps: true,
  }
);

const Subscription = mongoose.model("Subscriptions", SubscriptionSchema);

module.exports = Subscription;
