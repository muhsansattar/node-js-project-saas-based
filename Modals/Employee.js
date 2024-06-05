// models/employeeModel.js
const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  profileImage: String,
  address: String,
  phoneNumber: String,
  message: String,
  request: {
    type: {
      employeeId: {
        type: Schema.Types.ObjectId,
        ref: "Employee",
      },
      reason: String,
    },
    default: null,
  },

  certifications: [
    {
      authority: String,
      description: String,
      certificateImages: [String],
    },
  ],
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("Employee", employeeSchema);
