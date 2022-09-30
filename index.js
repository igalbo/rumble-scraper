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
  const result = [];
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

  const topVideosData = $("article:has(h1:contains('Top Videos'))");
  const topVideos = [
    {
      title: topVideosData.find("h3").attr("title"),
      channel: topVideosData.find("h4.mediaList-by-heading").text(),
      link: `https://rumble.com${topVideosData
        .find("a.mediaList-link")
        .attr("href")}`,
      thumbnail: topVideosData.find(".mediaList-image").attr("src"),
      date: topVideosData.find(".mediaList-timestamp").text(),
      watching: topVideosData.find(".mediaList-liveCount").text() || undefined,
      views: topVideosData.find(".mediaList-plays").text(),
    },
  ];

  $("section > a").each(function () {
    const category = $(this)
      .attr("href")
      .replace("/category", "")
      .replace("/", "");

    result.push({ [category]: fetchCategoryItems(data, category) });
  });

  res.json([
    { "top-videos": topVideos },
    { "editor-picks": editorPicks },
    ...result,
  ]);
});

const fetchCategoryItems = (data, category) => {
  const $ = cheerio.load(data);
  const items = [];
  $(
    `section:has(a[href*="${category}"]) > ul.mediaList-list > li.mediaList-item`
  ).each(function () {
    items.push({
      title: $(this).children().children().find("h3").attr("title"),
      channel: $(this).children().children().find("h4").text(),
      link: `https://rumble.com${$(this).children("a").attr("href")}`,
      thumbnail: $(this).find(".mediaList-image").attr("src"),
      duration: $(this).find(".mediaList-duration").text() || undefined,
      rumbles: $(this).find(".mediaList-rumbles").text() || undefined,
    });
  });

  return items;
};

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
