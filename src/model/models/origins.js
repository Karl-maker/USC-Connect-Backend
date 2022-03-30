const mongoose = require("mongoose");

const OriginSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    name: { type: String },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

const Origin = mongoose.model("Origins", OriginSchema);

module.exports = Origin;
