const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Enter Event Name"], unique: false },
    phone_number: { type: String },
    campus_name: { type: String, required: [true, "Enter Campus Name"] },
  },
  {
    timestamps: true,
  }
);

const Department = mongoose.model("Departments", DepartmentSchema);

module.exports = Department;
