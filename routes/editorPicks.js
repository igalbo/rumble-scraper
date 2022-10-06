const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");
const { getItem } = require("../utils/sharedFunctions");

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

  $(itemsQuery).each((i, item) => results.push(getItem(item, "video-item")));

  title = $("h1.listing-header--title").text();

  res.json({
    title,
    sort,
    date,
    duration,
    license,
    page,
    videos: results,
  });
});

module.exports = router;
