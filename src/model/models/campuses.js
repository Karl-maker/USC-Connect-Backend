const mongoose = require("mongoose");

const CampusSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String },
    phone_number: { type: String },
  },
  {
    timestamps: true,
  }
);

const Campus = mongoose.model("Campuses", CampusSchema);

module.exports = Campus;
