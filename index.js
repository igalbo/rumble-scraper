const express = require("express");

const PORT = 8000;
const homepageRoute = require("./routes/homepage");
const searchRoute = require("./routes/search");
const channelhRoute = require("./routes/channel");
const app = express();

app.use("/", homepageRoute);
app.use("/search", searchRoute);
app.use("/c", channelhRoute);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
