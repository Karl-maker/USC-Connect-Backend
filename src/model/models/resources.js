const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Enter Resource Name"],
      unique: false,
    },
    department: { type: String },
    description: { type: String },
    path: { type: String },
    file_type: { type: String },
    created_by: { type: String }, // Admin ID
  },
  {
    timestamps: true,
  }
);

const Resource = mongoose.model("Resources", ResourceSchema);

module.exports = Resource;
