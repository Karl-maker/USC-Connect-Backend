const mongoose = require("mongoose");

const CampusSchema = new mongoose.Schema({
  campus_name: { type: String, required: true},
  campus_location: { type: String },
  phone_number: { type: String },
});

const Event = mongoose.model("Campuses", CampusSchema);

module.exports = Campus;