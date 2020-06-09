const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

function generateRandomString() {
    let funkyURL = Math.random().toString(20).substr(2, 6); //thanks to help from dev.to!
    return funkyURL;
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


//this is what a route handler is
app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
    shortURL = req.params.shortURL;
    const longURL = urlDatabase[shortURL];
    res.redirect(longURL);
  });

app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase }; //this is the urlDatabase from above
    res.render("urls_index", templateVars); //this is the file we made in views. This calls it and applies it then?
});

app.get("/urls/:shortURL", (req, res) => {
    shortURL = req.params.shortURL;
    longURL = urlDatabase[shortURL];
    let templateVars = { shortURL, longURL }; 
    res.render("urls_show", templateVars); 
});

app.get("/", (req, res) => {   
    res.send("Hello");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

  //when someone submits a url it goes to this one
app.post("/urls", (req, res) => {
    
    //Everything the person submits in the form is here
    console.log(req.body);  // Log the POST request body to the console
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);

  });

app.post("/urls/:shortURL/delete", (req, res) => {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls'); 
  });

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});