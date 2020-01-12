var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fcmToken: {
    type: String,
    required: true,
    unique: true,
  },
  handle: {
    type: String,
    //required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    //required: true,
  },
  // Just the bitcoin address m/44'/1'/1'/0.
  // We can check a signature for it using bitcore-lib.
  xPub: {
    type: String,
    required: true,
    unique: true,
  },
  // TODO: Store all historical data about user
});

UserSchema.index({ email: 1 });
//UserSchema.index({ handle: 1 });

module.exports = mongoose.model('User', UserSchema);
