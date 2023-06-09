const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

const { User } = require("./../../models/user");

const userOneId = new ObjectId();
const userTwoId = new ObjectId();
const users = [
  {
    _id: userOneId,
    email: process.env.SEED_EMAIL,
    password: process.env.SEED_PASS,
    tokens: [
      {
        access: "auth",
        token: jwt.sign({ _id: userOneId, access: "auth" }, process.env.SECRET_KEY),
      },
    ],
  },
  {
    _id: userTwoId,
    email: "john.doe@test.com",
    password: "fake_pass2",
    tokens: [
      {
        access: "auth",
        token: jwt.sign(
          { _id: userTwoId, access: "auth" },
          process.env.SECRET_KEY
        ),
      },
    ],
  },
];

const populateUsers = (done) => {
  User.deleteMany({})
    .then(async () => {
      var userOne = await new User(users[0]).save();
      var userTwo = await new User(users[1]).save();

      return Promise.all(['userOne', 'userTwo']);
    })
    .then(() => done());
};

module.exports = { users, populateUsers };
