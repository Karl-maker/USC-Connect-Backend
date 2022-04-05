const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("../../config");

const saltOrRounds = config.bcrypt.SALTORROUNDS;

const StudentSchema = new mongoose.Schema(
  {
    student_id: { type: String, unique: true },
    first_name: { type: String },
    last_name: { type: String },
    password: { type: String, require: [true, "Password required"] },
    email: { type: String },
    is_confirmed: { type: Boolean, default: false },
    campus_name: { type: String },
    belongs_to: { type: String }, // Department ID
  },
  {
    timestamps: true,
  }
);

StudentSchema.pre("save", async function (next) {
  let encrypted_password = await bcrypt.hash(this.password, saltOrRounds);
  this.password = encrypted_password;
  next();
});

StudentSchema.methods.isValidPassword = async function (password) {
  const user = this;

  let isValid = await bcrypt.compare(password, this.password);

  return isValid;
};

const Student = mongoose.model("Students", StudentSchema);

module.exports = Student;
