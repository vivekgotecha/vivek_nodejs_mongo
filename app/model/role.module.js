const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const RoleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true,
    unique: true,
  },
  accessModule: {
    type: [String],
    unique: true,
  },
  active: {
    type: Boolean,
  },
});

const Role = mongoose.model("Role", RoleSchema);

module.exports = Role;
