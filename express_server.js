const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

const generateRandomString = () => {
  const randomString = (Math.random() + 1).toString(36).substring(6);
  return randomString;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.listen(PORT, () => {
  console.log(`TinyApp listening port ${PORT}`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[`${shortURL}`] = [`${req.body.longURL}`];
  res.redirect('/urls');
});


app.get("/u/:shorturl", (req, res) => {
  const shortURL = req.params.shorturl;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shorturl", (req, res) => {
  urlDatabase[req.params.shorturl] = req.body.newLongURL;
  res.redirect("/urls");
});

app.get("/urls/:shorturl", (req, res) => {
  const shortURL = req.params.shorturl;
  const templateVars = { shortURL: req.params.shorturl, longURL: urlDatabase[shortURL]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shorturl/delete", (req, res) => {
  delete urlDatabase[req.params.shorturl];
  res.redirect('/urls');
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});