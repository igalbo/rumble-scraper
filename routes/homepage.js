const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");

router.get("/", async (req, res) => {
  const editorPicks = [];
  const result = [];
  let $ = "";
  let data;
  try {
    response = await axios.get("https://rumble.com/");
    data = response?.data;
    $ = cheerio.load(data);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
    return;
  }

  $("div.tab-editor-picks > ul.mediaList-list > li", data).each(function () {
    editorPicks.push({
      title: $(this).children().children().find("h3").attr("title"),
      channel: $(this).children().children().find("h4").text(),
      url: `https://rumble.com${$(this).children("a").attr("href")}`,
      thumbnail: $(this).find(".mediaList-image").attr("src"),
      duration: $(this).find(".mediaList-duration").text(),
      watching: $(this).find(".mediaList-liveCount").text() || undefined,
    });
  });

  const topVideosData = $("article:has(h1:contains('Top Videos'))");
  const topVideos = [
    {
      title: topVideosData.find("h3").attr("title"),
      channel: topVideosData.find("h4.mediaList-by-heading").text(),
      url: `https://rumble.com${topVideosData
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

    result.push({
      [category.replace("-", "_")]: fetchCategoryItems(data, category),
    });
  });

  res.json([
    { top_videos: topVideos },
    { editor_picks: editorPicks },
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
      url: `https://rumble.com${$(this).children("a").attr("href")}`,
      thumbnail: $(this).find(".mediaList-image").attr("src"),
      duration: $(this).find(".mediaList-duration").text() || undefined,
      rumbles: $(this).find(".mediaList-rumbles").text() || undefined,
    });
  });

  return items;
};

module.exports = router;
