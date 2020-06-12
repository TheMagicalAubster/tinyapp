const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
// const cookieSession = require('cookie-session');
const morgan = require('morgan');

const app = express();
const PORT = 8080;

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.set("view engine", "ejs");
// app.use(cookieSession({
//     //something here, currently empty
//     key1: "something1",
//     key2: ["something2", "something2"]
// }));
app.use(morgan('dev'));



function generateRandomString() {
    let funkyURL = Math.random().toString(20).substr(2, 6); //thanks to help from dev.to!
    return funkyURL;
    }

const users = {
"userRandomID": {
    id: "userRandomID",
    name: "name1",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
"user2RandomID": {
    id: "user2RandomID",
    name: "name2",
    email: "user2@example.com",
    password: "1234"
  }
}


// const urlDatabase = {
//     "b2xVn2": "http://www.lighthouselabs.ca",
//     "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
  };

  app.get("/urls/:shortURL/urls", (req, res) => {
    // let templateVars = { urls: urlDatabase }; //this is the urlDatabase from above
    // console.log('urls_index: ', urls_index);
    res.render("urls_index");
 });

app.get("/urls/new", (req, res) => {
    //if someone isn't logged in here, redirect to login page
    const name = req.cookies.name;
    console.log("name", name);

    if (!name) {
        return res.redirect('/login');
    }
    res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
    const user = users[req.cookies.userKey]
    console.log("req.cookies ", req.cookies);
    console.log("user  ", user);
    const templateVars = { urls: urlDatabase, user };
    const shortURL = req.params.shortURL;
   
    const longURL = urlDatabase[shortURL].longURL;
    console.log("longURL:: ", longURL);

    res.redirect(longURL);
  });

app.get("/urls", (req, res) => {   
    // const test = Object.keys(req.cookies).length;
    const user = users[req.cookies.userID];
    // console.log('user ', user);
    console.log("req.cookies.name ", req.cookies.name);
    if (user) {

        console.log("user is: ", user);
        console.log("req.cookies ", req.cookies);

        const templateVars = { urls: urlDatabase, user }; //cannot read property 'name' of undefined  , username: user.name
        console.log("templateVars ", templateVars);

        res.render("urls_index", templateVars); 
    } else {
        let templateVars = { urls: urlDatabase, user }; //this is the urlDatabase from above
        res.render("urls_index", templateVars); //this is the file we made in views. This calls it and applies it then?
    }
});


app.get("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;

    console.log("shortURL" , shortURL);
    const name = req.cookies.name;
    console.log("name", name);

    const longURL = urlDatabase[shortURL];
    // let templateVars = { shortURL, longURL }; 
    const user = users[req.cookies.userKey]
    const templateVars = { shortURL, url: urlDatabase[shortURL], user }
    console.log("templateVars ", templateVars);
    res.render("urls_show", templateVars); 
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get('/login', (req, res) => {
    const templateVars = { user: undefined };
    res.render('login', templateVars);
});

app.get("/registration", (req, res) => {
    const templateVars = { user: undefined };
    res.render("registration", templateVars);
});

app.get("/", (req, res) => {   
    res.send("Hello");
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies.userKey } ;
    res.redirect(`/urls/${shortURL}`);
    
});

app.post("/urls/:shortURL/delete", (req, res) => {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls'); 
});

app.post("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL] = req.body.longURL;
    // console.log(shortURL);
    res.redirect(`/urls`);
    // console.log("Hello");
});

app.post("/registration", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;


    console.log('req.body info: ', email, password, name);

    let confirmedUser;

    for (const userID in users) {
        if (users[userID].email === "") {
             return res.status(400).send('email cannot be empty');
        }
        if (confirmedUser) {
            return res.status(400).send('email already in use');
       }
        if (users[userID].email === email) {
            confirmedUser = users[userID];
        }
    }
    if (confirmedUser) {
        return res.status(400).send('failure - username taken');
    }
    
    const userID = generateRandomString();
    console.log("userID ", userID);
    const newUser = {
        id: userID, 
        name: name,
        email: email,
        password: password
    }

    console.log('newUser ', newUser);
    users[userID] = newUser;
    // const templateVars = { newUser: id }

    console.log("users[userID].id" , users[userID].id);
    
    // console.log("templateVars ", templateVars);
    res.cookie('userID', userID);
    res.cookie('name', name);
    res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    console.log("name ", name);
    // const name = req.body.name;

    let confirmedUser;
    let confirmedUserKey;

    for (let userID in users) {
        if (users[userID].email === email) {
            confirmedUser = users[userID];
            confirmedUserKey = userID;
        } 
    }
    if (confirmedUser.password === password) {
        console.log("Welcome!");
    } else if (confirmedUser.password !== password) {
        return res.status(403).send('Wrong combination, please try again.');
    }

    const userId = generateRandomString();

    confirmedUser.userID = userID;
    
    res.cookie('userID', userID);
    res.cookie('userKey', confirmedUserKey);
    res.cookie('name', name);
    res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
    console.log("req.cookies.userID ",req.cookies.userID);
    const userID = req.cookies.userID;
    const userKey = req.cookies.userKey
    const name = req.cookies.name;
    res.clearCookie('userID', userID);
    res.clearCookie('userKey', userKey);
    res.clearCookie('name', name);
    res.redirect(`/urls`);
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});