// Question-bank maintenance.
//   node tools/bank.js stats
//   node tools/bank.js add <batch.json>        batch: [{ level, cat, q, options[4], explain, expansion, followup: { q, options[4], explain } }]
//   node tools/bank.js followups <map.json>    map: { "<parent id>": { q, options[4], explain } } rewrites "<parent>-F1"
// The correct answer is always options[0]; the game shuffles.
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "questions");
const KEYS = ["id", "parent", "cat", "q", "options", "answer", "explain", "expansion"];
const file = l => path.join(DIR, `level-${String(l).padStart(2, "0")}.json`);
const load = l => JSON.parse(fs.readFileSync(file(l), "utf8"));

function save(d) {
  const qs = d.questions.map(q => {
    const lines = KEYS.filter(k => q[k] !== undefined).map(k => `      ${JSON.stringify(k)}: ${JSON.stringify(q[k])}`);
    return "    {\n" + lines.join(",\n") + "\n    }";
  });
  fs.writeFileSync(file(d.level), `{\n  "level": ${d.level},\n  "questions": [\n${qs.join(",\n")}\n  ]\n}\n`);
}

function check(q, where) {
  if (!q.q || !Array.isArray(q.options) || q.options.length !== 4) throw new Error(`bad question at ${where}`);
  if (new Set(q.options).size !== 4) throw new Error(`duplicate options at ${where}`);
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === "stats") {
  let total = 0;
  for (let l = 1; l <= 10; l++) {
    const qs = load(l).questions, main = qs.filter(q => !q.parent).length;
    total += qs.length;
    console.log(`level ${String(l).padStart(2)}: ${String(main).padStart(3)} main + ${qs.length - main} follow-ups`);
  }
  console.log("total:", total);
} else if (cmd === "add") {
  const batch = JSON.parse(fs.readFileSync(arg, "utf8")), byLevel = {};
  batch.forEach((b, i) => { check(b, `#${i}`); check(b.followup, `#${i} follow-up`); (byLevel[b.level] ||= []).push(b); });
  for (const [l, items] of Object.entries(byLevel)) {
    const d = load(+l), known = new Set(d.questions.map(q => q.q));
    let n = Math.max(0, ...d.questions.filter(q => !q.parent).map(q => +q.id.slice(4)));
    for (const b of items) {
      if (known.has(b.q)) { console.warn("skip duplicate:", b.q); continue; }
      const id = `L${String(l).padStart(2, "0")}-${String(++n).padStart(3, "0")}`;
      d.questions.push({ id, cat: b.cat, q: b.q, options: b.options, answer: 0, explain: b.explain || "", expansion: b.expansion });
      d.questions.push({ id: id + "-F1", parent: id, cat: b.cat, q: b.followup.q, options: b.followup.options, answer: 0, explain: b.followup.explain || "" });
    }
    save(d);
    console.log(`level ${l}: +${items.length}`);
  }
} else if (cmd === "followups") {
  const map = JSON.parse(fs.readFileSync(arg, "utf8"));
  let done = 0;
  for (let l = 1; l <= 10; l++) {
    const d = load(l);
    let changed = false;
    for (const q of d.questions) {
      const f = q.parent && map[q.parent];
      if (!f) continue;
      check(f, q.id);
      Object.assign(q, { q: f.q, options: f.options, explain: f.explain || "" });
      changed = true; done++;
    }
    if (changed) save(d);
  }
  console.log("follow-ups rewritten:", done, "of", Object.keys(map).length);
} else if (cmd === "cats") {
  // merge stray category labels into the main ones, then print the topic table
  const MERGE = { "חשבון": "מתמטיקה", "חגים": "יהדות", "שחמט": "ספורט", "תרבות": "כללי", "ארכאולוגיה": "היסטוריה" };
  const table = {};
  for (let l = 1; l <= 10; l++) {
    const d = load(l);
    let changed = false;
    for (const q of d.questions) {
      if (MERGE[q.cat]) { q.cat = MERGE[q.cat]; changed = true; }
      if (!q.parent) ((table[q.cat] ||= Array(10).fill(0))[l - 1]++);
    }
    if (changed) save(d);
  }
  for (const [c, row] of Object.entries(table).sort((a, b) => b[1].reduce((x, y) => x + y) - a[1].reduce((x, y) => x + y)))
    console.log(`${c}\t${row.reduce((x, y) => x + y)}\t${row.join(" ")}`);
} else {
  console.log("usage: node tools/bank.js stats | add <batch.json> | followups <map.json> | cats");
}
