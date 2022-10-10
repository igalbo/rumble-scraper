require("dotenv").config();
const { authenticateUser } = require("./utils/auth");
const express = require("express");
const rateLimit = require("express-rate-limit");

const PORT = 8000;
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const homepageRoute = require("./routes/homepage");
const searchRoute = require("./routes/search");
const channelRoute = require("./routes/channel");
const videosRoute = require("./routes/videos");
const editorPicksRoute = require("./routes/editorPicks");
const app = express();

app.use(express.json());
app.use(authenticateUser);
app.use(limiter);
app.use("/search", searchRoute);
app.use("/c", channelRoute);
app.use("/videos", videosRoute);
app.use("/editor-picks", editorPicksRoute);
app.use("/", homepageRoute);

// app.post("/login", (req, res) => {
//   const username = req.body.username;
//   const user = { name: username };
//   const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

//   res.json({ accessToken: accessToken });
// });

// app.get("/posts", authenticateToken, (req, res) => {
//   res.json({ name: req.user.name });
// });

// function authenticateToken(req, res, next) {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];
//   if (token == null) return res.sendStatus(401);

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//     console.log(err);
//     if (err) return res.sendStatus(403);

//     req.user = user;
//     console.log(req.user);
//     next();
//   });
// }

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
