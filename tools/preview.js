// Serves the site on this computer only, with no caching, so a refresh shows the latest files.
//   node tools/preview.js   then open http://localhost:8080/
const fs = require("fs"), path = require("path"), http = require("http");
const root = path.join(__dirname, "..");
const types = { ".html": "text/html;charset=utf-8", ".json": "application/json", ".js": "text/javascript" };
http.createServer((q, r) => {
  let u = decodeURIComponent(q.url.split("?")[0]); if (u === "/") u = "/index.html";
  const f = path.join(root, path.normalize(u));
  if (!f.startsWith(root) || f.includes(".git")) { r.writeHead(404); return r.end(); }
  fs.readFile(f, (e, d) => {
    if (e) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream", "cache-control": "no-store" });
    r.end(d);
  });
}).listen(8080, "127.0.0.1", () => console.log("http://localhost:8080/"));
