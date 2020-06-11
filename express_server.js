const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");


app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");



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


const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

  app.get("/urls/:shortURL/urls", (req, res) => {
    // let templateVars = { urls: urlDatabase }; //this is the urlDatabase from above
    // console.log('urls_index: ', urls_index);
    res.render("urls_index");
 });

app.get("/urls/new", (req, res) => {
    username = req.params.username;
    // console.log(username);
    res.render("urls_new", username);
});

app.get("/u/:shortURL", (req, res) => {
    shortURL = req.params.shortURL;
    const longURL = urlDatabase[shortURL];
    res.redirect(longURL);
  });

app.get("/urls", (req, res) => {   
    console.log("req.cookies ", req.cookies);
    const test = Object.keys(req.cookies).length;
    console.log(test);
    if (test !== 0) {
    const user = users[req.cookies.userKey]
    const templateVars = { urls: urlDatabase, username: user.name };
    console.log('templateVars ', templateVars);
    res.render("urls_index", templateVars); //this is the file we made in views. This calls it and applies it then?

    } else {
    let templateVars = { urls: urlDatabase }; //this is the urlDatabase from above
    res.render("urls_index", templateVars); //this is the file we made in views. This calls it and applies it then?

    }

});


app.get("/urls/:shortURL", (req, res) => {
    shortURL = req.params.shortURL;
    longURL = urlDatabase[shortURL];
    let templateVars = { shortURL, longURL }; 
    res.render("urls_show", templateVars); 
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get('/login', (req, res) => {
    const templateVars = { username: "" }
    res.render('login', templateVars);
});

app.get("/registration", (req, res) => {
    const templateVars = { username: "" };
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
    urlDatabase[shortURL] = req.body.longURL;
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

    let confirmedUser;

    for (let userID in users) {
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
    
    const id = generateRandomString();
    const newUser = {
        id: id, 
        name: name,
        email: email,
        password: password
    }
    users[id] = newUser;
    const templateVars = { newUser: id }
    
    console.log("templateVars ", templateVars);
    res.cookie('username', newUser.email);
    res.redirect(`/urls`);
});

//fix login
app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
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

    const cookieId = generateRandomString();

    confirmedUser.cookieId = cookieId;
    
    res.cookie('cookieId', cookieId);
    res.cookie('userKey', confirmedUserKey);
    res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
    cookieId = req.cookies.cookieId;
    userKey = req.cookies.userKey
    res.clearCookie('cookieId', cookieId);
    res.clearCookie('userKey', userKey);
    res.redirect(`/urls`);
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});