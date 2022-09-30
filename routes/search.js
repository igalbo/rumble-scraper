const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");

router.get("/video", async (req, res) => {
  const {
    q,
    sort = "",
    date = "",
    duration = "",
    license = "",
    page = "",
  } = req.query;
  const results = [];
  let data;
  let $;
  const queryString = `${sort && `&sort=${sort}`}${date && `&date=${date}`}${
    duration && `&duration=${duration}`
  }${license && `&license=${license}`}${page && `&page=${page}`}`;

  if (!q) {
    res.status(400).json("Search term missing");
    return;
  }

  try {
    const response = await axios.get(
      `https://rumble.com/search/video?q=${q}${queryString}`
    );
    data = response?.data;
    $ = cheerio.load(data);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
    return;
  }

  $("ol > li.video-listing-entry > article.video-item", data).each(function () {
    results.push({
      title: $(this).find("h3.video-item--title").text(),
      url: `https://rumble.com${$(this)
        .find("a[class^=video-item]")
        .attr("href")}`,
      image: $(this).find("img.video-item--img").attr("src"),
      channel: $(this).find("a[rel='author'] > div").text(),
      channel_url: `https://rumble.com${$(this)
        .find("a[rel='author']")
        .attr("href")}`,
      duration: $(this).find(".video-item--duration").attr("data-value"),
      views: $(this).find(".video-item--views").attr("data-value"),
      rumbles: $(this).find(".video-item--rumbles").attr("data-value"),
      date: $(this).find(".video-item--time").attr("datetime"),
    });
  });

  res.json(results);
});

module.exports = router;
