const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const connection=require('./connection')
connection()

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, unique: true },
  googleId: { type: String, default: null },
  // Add these new fields:
  bio: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  location: { type: String, default: '' },
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);
module.exports = User;