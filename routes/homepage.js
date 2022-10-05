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
    const response = await axios.get("https://rumble.com/");
    data = response?.data;
    $ = cheerio.load(data);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
    return;
  }
  $("div.tab-editor-picks > ul.mediaList-list > li").each(function () {
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

router.get("/:video", async (req, res) => {
  const result = [];
  const related = [];
  const { video } = req.params;
  let $ = "";
  let data;

  try {
    const response = await axios.get(`https://rumble.com/${video}`);
    data = response?.data;
    $ = cheerio.load(data);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
    return;
  }
  result.push({
    title: $("article > h1.h1").text(),
    channel_url: `https://rumble.com${$(".media-by--a").attr("href")}`,
    channel: $(".media-by--a >.media-heading-name").text(),
    verified: $(
      ".media-by--a >.media-heading-name > svg.verification-badge-icon"
    ).length
      ? true
      : false,
    published: $(".media-heading-published")
      .children()
      .remove()
      .end()
      .text()
      .substring(1),
    views: $(".media-heading-info:not(.media-heading-published)")
      .text()
      .replace(" Views", ""),
    subscribers: $(".subscribe-button-count").text().substring(1),
    streamed: $(".streamed-on > time").attr("datetime"),
    rumbles: $("span.rumbles-count").text(),
  });
  $("ul.mediaList-list > li").each(function () {
    related.push({
      title: $(this).children().children().find("h3").attr("title"),
      channel: $(this).children().children().find("h4").text(),
      url: `https://rumble.com${$(this).children("a").attr("href")}`,
      thumbnail: $(this).find(".mediaList-image").attr("src"),
      duration: $(this).find(".mediaList-duration").text(),
      watching: $(this).find(".mediaList-liveCount").text() || undefined,
    });
  });
  res.json({ video: result, related });
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
