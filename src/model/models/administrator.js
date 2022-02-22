const mongoose = require("mongoose");

const AdministratorSchema = new mongoose.Schema({
  first_name: { type: String},
  last_name: { type: String},
  email: { type: String},
  phone_number: { type: String },
});

const Administrator = mongoose.model("Administrators", AdministratorSchema);

module.exports = Administrator;