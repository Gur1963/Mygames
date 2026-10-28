// run: node tools/build-listen.js, then open tools/listen.html in Edge
// builds listen.html: every kids question read the way kids.html reads it, with the same dictionary,
// and a way to mark the sentences that sound wrong. Data is embedded so the page opens from disk.
const fs = require("fs"), path = require("path"), root = path.join(__dirname, "../questions/");
const d = JSON.parse(fs.readFileSync(root + "kids.json", "utf8"));
const qs = Array.isArray(d) ? d : (d.questions || Object.values(d).flat());
const say = JSON.parse(fs.readFileSync(root + "say.json", "utf8"));
const tpl = fs.readFileSync(path.join(__dirname, "listen.tpl.html"), "utf8");
fs.writeFileSync(path.join(__dirname, "listen.html"), tpl.replace("/*DATA*/", `const QS = ${JSON.stringify(qs)};\nconst LEX = ${JSON.stringify(say)};`));
console.log(qs.length, "questions,", Object.keys(say).length, "dictionary words");
