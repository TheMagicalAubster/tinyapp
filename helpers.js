

const getUserByEmail = function(email, users) {
  for (const key in users) {
    if (users[key].email === email) {
      return users[key].id;
    }
  }
  return false;
};

module.exports = getUserByEmail;