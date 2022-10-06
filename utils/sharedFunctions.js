const cheerio = require("cheerio");

const cleanupText = (text) =>
  text
    .replaceAll("video-item--", "")
    .replaceAll("channel-item--", "")
    .replace("meta ", "")
    .replace("img", "image")
    .replace(/^a$/, "link")
    .replace(/^by$/, "channel")
    .replace(/^by-a by-a--c*(.*)/, "channel_url")
    .replace("by-verified verification-badge-icon", "verified");

const getValue = (text) =>
  text.attr("src") ||
  text.attr("href") ||
  text.attr("datetime") ||
  text.attr("data-value") ||
  text.text() ||
  true;

function getItem(data, tag) {
  $ = cheerio.load(data);
  const item = {
    verified: $(data).find("a > h3 > svg.verification-badge-icon").length
      ? true
      : undefined,
  };

  $(data)
    .find(`*[class^=${tag}]`)
    .each(function () {
      const valueText = getValue($(this));
      const keyText = cleanupText($(this).attr("class"));

      item[keyText] = $(this).attr("href")
        ? `https://rumble.com${valueText}`
        : valueText;
    });
  item["footer ellipsis-1"] = undefined;

  return item;
}

module.exports = { cleanupText, getValue, getItem };
