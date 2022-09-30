const express = require("express");

const PORT = 8000;
const homepageRoute = require("./routes/homepage");
const searchRoute = require("./routes/search");
const app = express();

app.use("/homepage", homepageRoute);
app.use("/search", searchRoute);

app.get("/", (req, res) => {
  res.json("Rumble Search API");
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
