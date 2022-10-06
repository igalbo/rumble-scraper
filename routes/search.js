const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");
const { getItem } = require("../utils/sharedFunctions");

const itemsQuery = "ol > li.video-listing-entry > article";

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

  $(itemsQuery).each((i, item) => results.push(getItem(item, "video-item")));

  res.json(results);
});

router.get("/channel", async (req, res) => {
  const { q } = req.query;
  const results = [];
  let data;
  let $;

  if (!q) {
    res.status(400).json("Search term missing");
    return;
  }

  try {
    const response = await axios.get(
      `https://rumble.com/search/channel?q=${q}`
    );
    data = response?.data;
    $ = cheerio.load(data);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
    return;
  }

  $(itemsQuery).each((i, item) => {
    results.push(getItem(item, "channel-item"));
  });

  res.json(results);
});

module.exports = router;
