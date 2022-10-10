function authenticateUser(req, res, next) {
  if (req.headers["x-rapidapi-key"] !== process.env.RAPID_API_KEY) {
    return res.sendStatus(403);
  }
  next();
}

module.exports = { authenticateUser };
