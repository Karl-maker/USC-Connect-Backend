const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: false },
    description: { type: String },
    department: { type: String }, // Help with emitting to rooms
    created_by: { type: String }, // Admin ID
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notifications", NotificationSchema);

module.exports = Notification;
