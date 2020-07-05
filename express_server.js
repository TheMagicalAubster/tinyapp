const express = require("express");
const bodyParser = require("body-parser");
const getUserByEmail = require('./helpers');
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const { use } = require("chai");
const password = '1234';
const hashedPassword = bcrypt.hashSync(password, 10);
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: false}));
app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(cookieSession({
  name: "CookieCookie",
  keys: ["secret", "LivinLaVidaRotation"]
}));

function generateRandomString() {
  let funkyURL = Math.random().toString(20).substr(2, 6); 
  return funkyURL;
}

function urlsForUser(userID) {
  const result = {};

  for (const key in urlDatabase) {
    console.log("urlsForUser urlDatabase[key] value is: ", urlDatabase[key]);
    
    if (urlDatabase[key].userID === userID) { 
    result[key] = urlDatabase[key];
    }
  } 
  return result;
}

const users = {
  "userRandomID": {
    id: "userRandomID",
    name: "name1",
    email: "user@example.com",
    password: 1234
  },
  "user2RandomID": {
    id: "user2RandomID",
    name: "name2",
    email: "user2@example.com",
    password: 1234
  },

  "user3RandomID": {
    id: "user3RandomID",
    name: "name3",
    email: "user3@example.com",
    password: password
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user2RandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};


app.get("/urls/new", (req, res) => {
  //if someone isn't logged in here, redirect to login page
  // const name = req.session.name;
  const email= req.session.email;
  const user = users[req.session.userID];
  // console.log("user", user);

  if (!user) {
    return res.redirect('/login');
  }

  let templateVars = { urls: urlDatabase, user }; //this is the urlDatabase from above
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const user = users[req.session.userID];
  const userID = req.session.userID;
    console.log("userID and user is ", userID, user);
  if (userID) {
    const urls = urlsForUser(userID);
    console.log("URLS being returned are: ", urls);
    const templateVars = { urls: urlsForUser(userID), user }; 
    console.log("templateVars in the /urls get is here: ", templateVars);
        
    res.render("urls_index", templateVars); //should be sending the results of urlsForUser
  } else {
    res.redirect('/login?err=1');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = users[req.session.userID];
  const url = urlDatabase[shortURL];
  if (url.userID !== user.id) {
    return res.redirect('/urls');
  }
  const templateVars = { shortURL, url, user };

  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/login', (req, res) => {
  
  const templateVars = { user: undefined, err: req.query.err };
  res.render('login', templateVars);
});

app.get("/registration", (req, res) => {
  const templateVars = { user: undefined };
  res.render("registration", templateVars);
});

app.get("/", (req, res) => {
  const user = users[req.session.userID];
  const userID = req.session.userID;
  if (userID) {
    const templateVars = { urls: urlsForUser(userID), user }; 
        
    res.render("urls_index", templateVars); //should be sending the results of urlsForUser
  } else {
    res.redirect('/login?err=1');
  }
});


app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.userKey };
  res.redirect(`/urls/${shortURL}`);
    
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.userID;
    
  if (urlsForUser(userID)) {
    delete urlDatabase[shortURL];
        
  } else {
    // let templateVars = { urls: urlDatabase, user }; //this is the urlDatabase from above
    // res.render("urls_index", templateVars); //this is the file we made in views. This calls it and applies it then?
    res.redirect('/login');
  }
  res.redirect('/urls');
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.post("/registration", (req, res) => {
  const email = req.body.email;
  const password = req.body.password; //password coming from input

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  for (const userID in users) {
    if (users[userID].email === "") {
      return res.status(400).send('Please enter an email');
    }
    if (users[userID].email === email) {
      return res.status(400).send('email already in use');
    }
 
  }
  
  const userID = generateRandomString();
  const newUser = {
    id: userID,
    email: email,
    password: hash
  };

  Object.assign(users, { newUser }); //add new user to users database
  users[newUser.id] = users['newUser']; //update name of newUser to userID

  req.session.email = email;
  req.session.userID = userID;
  
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const passwordIn = req.body.password;
  
  let userID = getUserByEmail(email , users);
  console.log("userID >>>>> ", userID);
  
  
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  const result = bcrypt.compareSync(passwordIn, hash);
  
  if (result) {
    req.session.userID = userID;
    req.session.email = email;
    res.redirect(`/urls`);
  } else {
    return res.status(403).send('Wrong combination, please try again.');
  }
    
  
  // req.session.name = name;
  
});

app.post("/logout", (req, res) => {
  req.session.userID = null;
  req.session.userKey = null;
  // req.session.name = null;
  req.session.email = null;

  res.redirect(`/login`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});