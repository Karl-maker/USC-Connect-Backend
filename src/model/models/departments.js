const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone_number: { type: String },
  },
  {
    timestamps: true,
  }
);

const Department = mongoose.model("Departments", DepartmentSchema);

module.exports = Department;
