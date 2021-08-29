const cookieSession = require('cookie-session');
const express = require('express');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;
const getUserUrlsById = require('./helpers');
const generateRandomString = require('./helpers');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const urlDatabase = {};
const users = {};




app.listen(PORT, () => {
  console.log(`TinyApp server running & listening on ${PORT}`);
});




app.get("/urls/new", (req, res) => {
  const currentUserByCookieIdObject = users[req.session["userId"]];
  const templateVars = { currentUserByCookieIdObject };
  currentUserByCookieIdObject ?
    res.render("urls_new", templateVars) :
    res.render("login", templateVars);
});




app.post("/urls/:shorturl/delete", (req, res) => {
  const currentUserByCookieIdObject = users[req.session["userId"]];

  if (!currentUserByCookieIdObject) return res.sendStatus(403).end();
  const currentUserURLs = getUserUrlsById(currentUserByCookieIdObject.userId, urlDatabase);

  for (const url in currentUserURLs) {
    if (req.params.shorturl === url) {
      delete urlDatabase[req.params.shorturl];
      res.redirect('/urls');
    }
  }

  return res.sendStatus(403).end();
});




app.get("/urls", (req, res) => {
  const currentUserByCookieIdObject = users[req.session["userId"]];
  const urls =  currentUserByCookieIdObject ? getUserUrlsById(currentUserByCookieIdObject.userId, urlDatabase) : {};
  const templateVars = { currentUserByCookieIdObject, urls };
  res.render("urls_index", templateVars);
});




app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();

  class registerNewUrl {
    constructor() {
      this.userId = req.session["userId"],
      this.longURL = req.body.longURL;
    }
  }

  urlDatabase[shortURL] = new registerNewUrl();

  res.redirect('/urls');
});




app.get("/login", (req, res) => {
  const currentUserByCookieIdObject = users[req.session["userId"]];
  const templateVars = { currentUserByCookieIdObject };
  res.render("login", templateVars);
});




app.post("/login", (req, res) => {

  for (const user in users) {
    if (users[user].email === req.body.email && bcrypt.compareSync(req.body.password, users[user].password)) {
      req.session.userId = user;
      return res.redirect('/urls');
    }
  }

  return res.sendStatus(403).end();
});




app.post("/logout", (req, res) => {
  req.session.userId = null;
  res.redirect("/urls");
});




app.get("/register", (req, res) => {
  const currentUserByCookieIdObject = users[req.session["userId"]];
  const templateVars = { currentUserByCookieIdObject };
  res.render("register", templateVars);
});




app.post("/register", (req, res) => {

  if (!req.body.email || !req.body.password) {
    return res.sendStatus(400).end();
  }

  for (const user in users) {
    if (users[user].email === req.body.email) {
      return res.sendStatus(400).end();
    }
  }
  
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const userId = generateRandomString();
  class registerNewUser {
    constructor(userId) {
      this.userId = userId,
      this.email = req.body.email,
      this.password = hashedPassword;
    }
  }

  const newUser = new registerNewUser(userId);
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
  const currentUserByCookieIdObject = users[req.session["userId"]];
  const templateVars = { currentUserByCookieIdObject, shortURL: req.params.shorturl, longURL: urlDatabase[shortURL]};
  res.render("urls_show", templateVars);
});




app.get("/", (req, res) => {
  res.redirect("/urls");
});