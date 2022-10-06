const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");
const { getItem } = require("../utils/sharedFunctions");

const itemsQuery = "ol > li.video-listing-entry > article";

router.get("/:channel", async (req, res) => {
  const { channel } = req.params;
  const { sort, date, duration, page } = req.query;
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
    res.status(400).json("Bad request. Please check syntax");
    return;
  }

  $(itemsQuery).each((i, item) => results.push(getItem(item, "video-item")));

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
    sort,
    date,
    duration,
    page,
    videos: results,
  });
});

module.exports = router;
