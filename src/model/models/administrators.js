const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("../../config");

const saltOrRounds = config.bcrypt.SALTORROUNDS;

const AdministratorSchema = new mongoose.Schema(
  {
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String },
    phone_number: { type: String },
    password: { type: String },
    is_confirmed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

AdministratorSchema.pre("save", async function (next) {
  let encrypted_password = await bcrypt.hash(this.password, saltOrRounds);
  this.password = encrypted_password;
  next();
});

AdministratorSchema.methods.isValidPassword = async function (password) {
  const user = this;

  let isValid = await bcrypt.compare(password, this.password);

  return isValid;
};

const Administrator = mongoose.model("Administrators", AdministratorSchema);

module.exports = Administrator;
