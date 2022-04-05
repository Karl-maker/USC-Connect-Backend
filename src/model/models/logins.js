const mongoose = require("mongoose");

const LoginSchema = new mongoose.Schema(
  {
    user_id: { type: String },
    token: { type: String },
    user_type: { type: String },
  },
  {
    timestamps: true,
  }
);

const Login = mongoose.model("Logins", LoginSchema);

module.exports = Login;
