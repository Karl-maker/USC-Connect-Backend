const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  department_name: { type: String, required: true },
  phone_number: { type: String },
});

const Department = mongoose.model("Departments", DepartmentSchema);

module.exports = Department;