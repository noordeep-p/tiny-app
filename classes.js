class Url {
  constructor(userId, longUrl) {
    this.userId = userId;
    this.longURL = longUrl;
  }
}

class User {
  constructor(userId, userEmail, userPassword) {
    this.userId = userId,
    this.email = userEmail,
    this.password = userPassword;
  }
}

module.exports = { Url, User };