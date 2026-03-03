const fs = require("fs");
const js = fs.readFileSync(__dirname + "/../dist/script.js", "utf-8");
const bookmark = "javascript:" + js.replaceAll("%", encodeURI("%"));
fs.writeFileSync(__dirname + "/../dist/bookmark.txt", bookmark);
