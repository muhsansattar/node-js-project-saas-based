// models/companyModel.js
const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
});

module.exports = mongoose.model("Company", companySchema);
