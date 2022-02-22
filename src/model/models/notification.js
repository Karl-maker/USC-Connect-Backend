const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: false},
  description: { type: String },
  link: { type: String },
  created_by: { type: String }, // Admin ID
});

const Notification = mongoose.model("Notifications", NotificationSchema);

module.exports = Notification;