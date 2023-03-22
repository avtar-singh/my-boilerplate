const chai = require("chai");
const express = require("express");
const request = require("supertest");
const { ObjectId } = require('mongodb');
const { User } = require("./../models/user.js");
// ALWAYS DECLARE APP BEFORE SEEDING DB
const app = require('./../server.js');
const { users, populateUsers } = require('./seed/seed.js');

let expect = chai.expect;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SEED DB USER
beforeEach(populateUsers);

// 1. TEST USER AUTHENTICATION
describe("Check if User is valid", () => {
  it("should return user if authenticate", (done) => {
    const token = users[0].tokens[0].token;
    request(app)
      .get("/api/v1/user/home")
      .set("x-auth", token)
      .set("Connection", "keep-alive")
      .expect((res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body._id).to.equal(users[0]._id.toHexString());
        expect(res.body.email).to.equal(users[0].email);
      })
      .end(done);
  });

  it("should return 401 if not authenticate", (done) => {
    request(app)
      .get('/api/v1/user/home')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('x-auth', 'fdssdffdsfds')
      .end((err, res) => {
        expect(res.statusCode).to.equal(401);
        done();

        if (err) {
          return done(err);
        }
      });
  });
});

// 2. TEST NEW USER
describe("Adding new user", () => {
  it("should create a user", (done) => {
    request(app)
      .post('/api/v1/user/register')
      .send({ email: 'john.doe3@test3.com', password: 'test@123' })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.statusCode).to.equal(200);
        expect(res.body.email).to.equal('john.doe3@test3.com');
        done();
      });
  });

  it("should return validation error if request invalid", (done) => {
    request(app)
      .post('/api/v1/user/register')
      .send({ email: 'john.dotest3.com', password: 'tes21ds@t' })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.statusCode).to.equal(400);
        done();
      });
  });

  it("should not create user if email already in use", (done) => {
    request(app)
      .post('/api/v1/user/register')
      .send({ email: process.env.SEED_EMAIL, password: 'test@dssd12' })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.statusCode).to.equal(400);
        done();
      });
  });
});

// 3. TEST USER LOGIN
describe("User login", () => {
  it("should login if valid user", (done) => {
    request(app)
      .post('/api/v1/user/login')
      .send({
        email: users[1].email,
        password: users[1].password,
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).to.be.a('string');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id)
          .then((user) => {
            expect(user.tokens[1]).to.include({
              access: 'auth',
              token: res.headers['x-auth'],
            });
            done();
          })
          .catch((e) => done(e));
      });
  });

  it("should not login if invalid user", (done) => {
    request(app)
      .post('/api/v1/user/login')
      .send({
        email: 'wrong.email@mail.com',
        password: users[1].password,
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body).to.be.an('object').that.is.empty;
        expect(res.headers['x-auth']).to.be.undefined;
        done();
      });
  });
});

// 4. TEST USER LOGOUT
describe("User logout", () => {
  it("should remove token on successful logout", (done) => {
    const token = users[0].tokens[0].token;
    request(app)
      .delete('/api/v1/user/logout')
      .set('x-auth', token)
      .set('Connection', 'keep-alive')
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id)
          .then((user) => {
            expect(user.tokens.length).is.equal(0);
            done();
          })
          .catch((e) => done(e));
      });
  });
});
