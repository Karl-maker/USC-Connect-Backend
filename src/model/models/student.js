const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  student_id: { type: Number required: true, unique: true},
  first_name: { type: String},
  last_name: { type: String},
  email: { type: String},
  is_confirmed: { type: Boolean},
  campus_name: { type: String},
  belongs_to: { type: String }, // Department ID
});

const Student = mongoose.model("Students", StudentSchema);

module.exports = Student;