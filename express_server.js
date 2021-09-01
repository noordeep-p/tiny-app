// SETTING TEMPLATING ENGINE, MIDDLEWARES AND IMPORTING HELPER FUNCTIONS

const cookieSession = require('cookie-session');
const express = require('express');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;
const { generateRandomString, getUserUrlsById } = require('./helpers');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// DATA STORAGE OBJECTS

const urlDatabase = {};
const users = {};

// SERVER RESPONSES TO CLIENT REQUESTS AND RELATIVE PATHS

app.listen(PORT, () => {
  console.log(`tinyURL is listening on ${PORT}`);
});

app.get("/urls/new", (req, res) => {
  const currentUserByCookie = users[req.session["userId"]];
  const templateVars = { currentUserByCookie };

  currentUserByCookie ?
    res.render("urls_new", templateVars) :
    res.render("login", templateVars);
});

app.post("/urls/:shorturl/delete", (req, res) => {
  const currentUserByCookie = users[req.session["userId"]];

  if (!currentUserByCookie) {
    return res.sendStatus(403);
  }

  const currentUserURLs = getUserUrlsById(currentUserByCookie.userId, urlDatabase);

  for (const url in currentUserURLs) {
    if (req.params.shorturl === url) {
      delete urlDatabase[req.params.shorturl];
      return res.redirect('/urls');
    }
  }

  return res.sendStatus(403);
});

app.get("/urls", (req, res) => {
  const currentUserByCookie = users[req.session["userId"]];
  const urls =  currentUserByCookie ? getUserUrlsById(currentUserByCookie.userId, urlDatabase) : {};
  const templateVars = { currentUserByCookie, urls };

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();

  class NEWURL {
    constructor() {
      this.userId = req.session["userId"],
      this.longURL = req.body.longURL;
    }
  }
  urlDatabase[shortURL] = new NEWURL();

  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  const currentUserByCookie = users[req.session["userId"]];
  const templateVars = { currentUserByCookie };

  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  for (const user in users) {
    if (users[user].email === req.body.email && bcrypt.compareSync(req.body.password, users[user].password)) {
      req.session.userId = user;
      return res.redirect('/urls');
    }
  }
  return res.sendStatus(403);
});

app.post("/logout", (req, res) => {
  req.session.userId = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const currentUserByCookie = users[req.session["userId"]];
  const templateVars = { currentUserByCookie };

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.sendStatus(400);
  }
  for (const user in users) {
    if (users[user].email === req.body.email) {
      return res.sendStatus(400);
    }
  }
  
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();

  class NEWUSER {
    constructor(userId) {
      this.userId = userId,
      this.email = req.body.email,
      this.password = hashedPassword;
    }
  }

  const newUser = new NEWUSER(userId);
  users[userId] = newUser;
  req.session.userId = userId;

  res.redirect("/urls");
});

app.get("/u/:shorturl", (req, res) => {
  const shortURL = req.params.shorturl;
  urlDatabase[shortURL] ? res.redirect(urlDatabase[shortURL].longURL) : res.send("Error: This is not a valid short URL");
});

app.post("/urls/:shorturl", (req, res) => {
  urlDatabase[req.params.shorturl].longURL = req.body.newLongURL;
  res.redirect("/urls");
});

app.get("/urls/:shorturl", (req, res) => {
  const shortURL = req.params.shorturl;
  const currentUserByCookie = users[req.session["userId"]];
  const templateVars = { currentUserByCookie, shortURL: req.params.shorturl, longURL: urlDatabase[shortURL]};

  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});