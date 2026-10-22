// Builds index.html for GitHub Pages from snakes-ladders.html.
// The game file is a fragment that the Claude artifact host wraps in a document skeleton
// (doctype, viewport, and a [hidden] rule); this adds the same skeleton for a plain web host.
//   node tools/build-site.js
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const game = fs.readFileSync(path.join(root, "snakes-ladders.html"), "utf8");
const head = `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
`;
fs.writeFileSync(path.join(root, "index.html"), head + game + "\n</body>\n</html>\n");
console.log("index.html built");
