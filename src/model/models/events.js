const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Enter Event Name"], unique: false },
    date: { type: Date },
    location: { type: String },
    description: { type: String },
    campus_name: { type: String },
    more_details: {},
    created_by: { type: String }, // Admin ID
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Events", EventSchema);

module.exports = Event;
