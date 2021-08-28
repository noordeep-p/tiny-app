const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const generateRandomString = () => {
  const randomString = (Math.random() + 1).toString(36).substring(6);
  return randomString;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.listen(PORT, () => {
  console.log(`TinyApp listening port ${PORT}`);
});

app.get("/urls/new", (req, res) => {
  const currentUserByCookieIdObject = users[req.cookies["userId"]];
  const templateVars = { currentUserByCookieIdObject };
  res.render("urls_new", templateVars);
});

app.post("/urls/:shorturl/delete", (req, res) => {
  delete urlDatabase[req.params.shorturl];
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  const currentUserByCookieIdObject = users[req.cookies["userId"]];
  const templateVars = { currentUserByCookieIdObject, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[`${shortURL}`] = [`${req.body.longURL}`];
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  res.cookie('userId', req.body.userId);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('userId');
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  console.log(users);
  const currentUserByCookieIdObject = users[req.cookies["userId"]];
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

  const userId = generateRandomString();
  class registerNewUser {
    constructor(userId) {
      this.userId = userId,
      this.email = req.body.email,
      this.password = req.body.password;
    }
  }

  const newUser = new registerNewUser(userId);
  users[userId] = newUser;
  res.cookie("userId", userId);
  res.redirect("/urls");
});

app.get("/u/:shorturl", (req, res) => {
  const shortURL = req.params.shorturl;
  urlDatabase[shortURL] ? res.redirect(urlDatabase[shortURL]) : res.send("Error: This is not a valid short URL");
});

app.post("/urls/:shorturl", (req, res) => {
  urlDatabase[req.params.shorturl] = req.body.newLongURL;
  res.redirect("/urls");
});

app.get("/urls/:shorturl", (req, res) => {
  const shortURL = req.params.shorturl;
  const currentUserByCookieIdObject = users[req.cookies["userId"]];
  const templateVars = { currentUserByCookieIdObject, shortURL: req.params.shorturl, longURL: urlDatabase[shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});