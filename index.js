const express = require("express");

const PORT = 8000;
const homepageRoute = require("./routes/homepage");
const searchRoute = require("./routes/search");
const channelRoute = require("./routes/channel");
const videosRoute = require("./routes/videos");
const editorPicksRoute = require("./routes/editorPicks");
const app = express();

app.use("/search", searchRoute);
app.use("/c", channelRoute);
app.use("/videos", videosRoute);
app.use("/editor-picks", editorPicksRoute);
// Least specific route should be at the end
app.use("/", homepageRoute);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
