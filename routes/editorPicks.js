const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");

const itemsQuery = "ol > li.video-listing-entry > article";

router.get("/", async (req, res) => {
  const {
    sort = "",
    date = "",
    duration = "",
    license = "",
    page = "",
  } = req.query;
  const results = [];
  let $, title, data;

  const queryString = `?${sort && `&sort=${sort}`}${date && `&date=${date}`}${
    duration && `&duration=${duration}`
  }${license && `&license=${license}`}${page && `&page=${page}`}`;

  try {
    const response = await axios.get(
      `https://rumble.com/editor-picks${queryString}`
    );
    data = response?.data;
    $ = cheerio.load(data);
  } catch (err) {
    console.log(err);
    res.status(400).json("Bad request. Please check syntax");
    return;
  }

  $(itemsQuery).each(function () {
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
      verified: $(this).find(
        "a[rel='author'] > div > svg.verification-badge-icon"
      ).length
        ? true
        : false,
      watching: $(this).find(".video-item--watching-now").attr("data-value"),
      duration: $(this).find(".video-item--duration").attr("data-value"),
      earned: $(this).find(".video-item--earned").attr("data-value"),
      views: $(this).find(".video-item--views").attr("data-value"),
      rumbles: $(this).find(".video-item--rumbles").attr("data-value"),
      date: $(this).find(".video-item--time").attr("datetime"),
    });
  });

  title = $("h1.listing-header--title").text();

  res.json({
    title,
    videos: results,
  });
});

module.exports = router;
