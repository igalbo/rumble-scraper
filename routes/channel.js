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
    res.status(400).json("Bad request. Please check syntax");
    return;
  }

  $(itemsQuery).each(function () {
    const item = {};
    $(this)
      .find("*[class^=video-item]")
      .each(function () {
        const valueText = getValue($(this));
        const keyText = cleanupText($(this).attr("class"));

        item[keyText] = $(this).attr("href")
          ? `https://rumble.com${valueText}`
          : valueText;
      });

    results.push(item);
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

const cleanupText = (text) => {
  const reg = /^by-a by-a--c*(.*)/;
  return text
    .replaceAll("video-item--", "")
    .replace("meta ", "")
    .replace(reg, "channel_url")
    .replace("by-verified verification-badge-icon", "verified");
};

const getValue = (text) => {
  return (
    text.attr("src") ||
    text.attr("href") ||
    text.attr("datetime") ||
    text.attr("data-value") ||
    text.text() ||
    true
  );
};

module.exports = router;
