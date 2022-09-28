const PORT = 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

app.get("/", (req, res) => {
  res.json("Rumble Search API");
});

app.get("/homepage", async (req, res) => {
  const editorPicks = [];
  let categories = [
    "news",
    "viral",
    "finance",
    "podcasts",
    "battle-leaderboard",
    "entertainment",
    "sports",
    "science",
    "vlogs",
    "gaming",
    "cooking",
    "music",
  ];

  let result = [];
  const { data } = await axios.get("https://rumble.com/");
  const $ = cheerio.load(data);

  $("div.tab-editor-picks > ul.mediaList-list > li", data).each(function () {
    editorPicks.push({
      title: $(this).children().children().find("h3").attr("title"),
      channel: $(this).children().children().find("h4").text(),
      link: `https://rumble.com${$(this).children("a").attr("href")}`,
      thumbnail: $(this).find(".mediaList-image").attr("src"),
      duration: $(this).find(".mediaList-duration").text(),
    });
  });

  categories.map((category) =>
    result.push({ [category]: fetchCategoryItems(data, category) })
  );

  res.json([{ "editor-picks": editorPicks }, ...result]);
});

const fetchCategoryItems = (data, category) => {
  const $ = cheerio.load(data);
  const items = [];
  $(
    `section:has(a[href*="${category}"]) > ul.mediaList-list > li.mediaList-item`,
    data
  ).each(function () {
    items.push({
      title: $(this).children().children().find("h3").attr("title"),
      channel: $(this).children().children().find("h4").text(),
      link: `https://rumble.com${$(this).children("a").attr("href")}`,
      thumbnail: $(this).find(".mediaList-image").attr("src"),
      duration: $(this).find(".mediaList-duration").text(),
    });
  });

  return items;
};

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
