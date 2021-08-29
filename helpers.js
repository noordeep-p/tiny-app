const getUserUrlsById = (id, urlDatabase) => {
  const urlsByUser = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userId === id) {
      urlsByUser[url] = urlDatabase[url];
    }
  }
  return urlsByUser;
};

const generateRandomString = () => {
  const randomString = (Math.random() + 1).toString(36).substring(6);
  return randomString;
};

module.exports = { getUserUrlsById, generateRandomString };