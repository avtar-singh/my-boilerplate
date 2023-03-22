const { User } = require('./../models/user.js');
const _ = require('lodash');

exports.registerUser = async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    const user = new User(body);
    await user.save();
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
};

exports.loginUser = async (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  try {
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
};

exports.getUser = (req, res) => {
  res.send(req.user);
};

exports.logoutUser = async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    res.status(200).send("User logged out successfully");
  } catch (e) {
    res.status(400).send(e);
  }
};
