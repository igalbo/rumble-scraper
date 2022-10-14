function authenticateUser(req, res, next) {
  if (req.headers["x-rapidapi-proxy-secret"] !== process.env.RAPID_API_KEY) {
    return res.sendStatus(403);
  }
  next();
}

module.exports = { authenticateUser };
