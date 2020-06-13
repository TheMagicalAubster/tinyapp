const { assert } = require('chai');

const getUserByEmail = require('../helpers.js');

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "1234"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "1234"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user2@example.com", users);
    const expectedOutput = "user2RandomID";
  });

  it('should not return a user without a valid email', function() {
    const user = getUserByEmail("user10@example.com", users);
    const expectedOutput = undefined;
  });




});