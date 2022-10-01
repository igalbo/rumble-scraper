const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");

const itemsQuery = "ol > li.video-listing-entry > article";

router.get("/:channel", async (req, res) => {
  const { channel } = req.params;
  const { sort = "", date = "", duration = "", page = "" } = req.query;
  const results = [];
  let $, title, subscribers, coverImage, data, thumbnail, verified;

  const queryString = `?${sort && `&sort=${sort}`}${date && `&date=${date}`}${
    duration && `&duration=${duration}`
  }${page && `&page=${page}`}`;

  if (!channel) {
    res.status(400).json("Search term missing");
    return;
  }

  try {
    const response = await axios.get(
      `https://rumble.com/c/${channel}${queryString}`
    );
    data = response?.data;
    $ = cheerio.load(data);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
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
      duration: $(this).find(".video-item--duration").attr("data-value"),
      earned: $(this).find(".video-item--earned").attr("data-value"),
      views: $(this).find(".video-item--views").attr("data-value"),
      rumbles: $(this).find(".video-item--rumbles").attr("data-value"),
      date: $(this).find(".video-item--time").attr("datetime"),
    });
  });

  title = $("h1.listing-header--title").text();
  subscribers = $("span.subscribe-button-count").text();
  coverImage = $("img.listing-header--backsplash-img").attr("src");
  thumbnail = $("img.listing-header--thumb").attr("src");
  verified = $("svg.listing-header--verified.verification-badge-icon").length
    ? true
    : false;

  res.json({
    title,
    subscribers,
    background_image: coverImage,
    thumbnail,
    verified,
    videos: results,
  });
});

module.exports = router;
