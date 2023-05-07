
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    default: "m",
  },
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String,
  },
  isActive: {
    type: Boolean,
  },
  roleId: {
    type: Schema.Types.ObjectId,
    index: true,
    ref: "Role"
  },
});

UserSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});


// Check if password matches
UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
}

const User = mongoose.model('User', UserSchema);

module.exports = User;


// UserSchema.pre("save", async function (next) {
//   const user = this;
//   if (!user.isModified("password")) {
//     return next();
//   }
//   const salt = await bcrypt.genSalt(10);
//   user.password = await bcrypt.hash(user.password, salt);
//   next();
// });

// UserSchema.methods.toJSON = function () {
//   var obj = this.toObject();
//   return obj;
// };

// module.exports = mongoose.model("User", UserSchema);
