const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not a valid email",
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  tokens: [
    {
      access: {
        required: true,
        type: String,
      },
      token: {
        required: true,
        type: String,
      },
    },
  ],
});

UserSchema.methods.toJSON = function () {
  var user = this;

  var userObject = user.toObject();

  return _.pick(userObject, ["_id", "email"]);
};

UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;

  return User.findOne({ email }).then((user) => {
    if (!user) {
      return Promise.reject(`User doesn't exist`);
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        //if both match then
        if (res) {
          resolve(user);
        } else {
          reject(`User doesn't exist`);
        }
      });
    });
  });
};

UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded,
    id = undefined;
  try {
    decoded = jwt.verify(token, process.env.SECRET_KEY);
  } catch (e) {
    return Promise.reject();
  }

  if (decoded) {
    id = decoded.id ? decoded.id : decoded._id;
  }

  return User.findOne({
    _id: id,
    "tokens.token": token,
    "tokens.access": "auth",
  });
};

UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = "auth";
  var token = jwt
    .sign({ id: user._id.toHexString(), access }, process.env.SECRET_KEY)
    .toString();

  user.tokens.push({ access, token });

  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.removeToken = function (token) {
  var user = this;

  return user.updateOne({
    $pull: {
      tokens: { token },
    },
  });
};

UserSchema.pre("save", function (next) {
  var user = this;

  if (user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

var User = mongoose.model("User", UserSchema);

module.exports = { User };
