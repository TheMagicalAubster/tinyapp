

const getUserByEmail = function(email, users) {
  for (const key in users) {
    console.log("users[key].email from function getUserByEmail: ",users[key].email);

    if (users[key].email === email) {
      return users[key].id;
    }
  }
  return false;
};

module.exports = getUserByEmail;