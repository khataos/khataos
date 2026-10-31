// Self-check for the date parser (src/dates.ts): typed dates, short
// forms, periods, financial and assessment years. Like calc-check, it
// transpiles the modules with the installed typescript package and runs the cases.
//   node scripts/dates-check.mjs        (or: pnpm dates-check)
// Exits 1 when a case fails.
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const src = join(import.meta.dirname, "..", "src");
const out = mkdtempSync(join(tmpdir(), "khata-dates-"));

/** Transpile `file` and every relative module it imports, as .mjs files under `out`. */
function build(file, seen = new Set()) {
  if (seen.has(file)) return;
  seen.add(file);
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, verbatimModuleSyntax: false },
    fileName: file,
  }).outputText;
  const js = code.replace(/(from\s+|import\s*\(\s*)(["'])(\.{1,2}\/[^"']+)\2/g, (m, head, q, spec) => {
    if (spec.endsWith(".css")) return m;
    build(resolve(dirname(file), spec + ".ts"), seen);
    return `${head}${q}${spec}.mjs${q}`;
  });
  // A bare CSS import (none today) would not load in node.
  const target = join(out, relative(src, file)).replace(/\.ts$/, ".mjs");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, js.replace(/^import\s+["'][^"']+\.css["'];?$/gm, ""));
}

let D;
try {
  build(join(src, "dates.ts"));
  D = await import(pathToFileURL(join(out, "dates.mjs")).href);
} finally {
  rmSync(out, { recursive: true, force: true });
}

let failed = 0;
let passed = 0;
function check(name, got, want) {
  if (got === want) passed++;
  else {
    failed++;
    console.error(`FAIL ${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
  }
}

const period = (p) => (p ? `${p.from}..${p.to}` : null);
const ref = "2026-10-19";
const today = D.todayIso();

// Calendar years (no company open): the year comes from the field.
D.setFyStartMonth(1);
check("calendar 1-4", D.parseUser("1-4", ref), "2026-04-01");
check("calendar 31-3", D.parseUser("31-3", ref), "2026-03-31");
check("calendar Q1", period(D.parsePeriod("Q1", ref)), "2026-01-01..2026-03-31");
check("calendar 2026", period(D.parsePeriod("2026", ref)), "2026-01-01..2026-12-31");
check("calendar FY26", D.parseYear("FY26"), 2026);
check("calendar YA 2027", D.parseYear("YA 2027"), 2026);

// India: years start in April.
D.setFyStartMonth(4);
const dates = [
  ["19", "2026-10-19"],
  ["5", "2026-10-05"],
  ["19-10", "2026-10-19"],
  ["19/10", "2026-10-19"],
  ["1-4", "2026-04-01"],
  ["31-3", "2027-03-31"],
  ["15-2", "2027-02-15"],
  ["1-4-25", "2025-04-01"],
  ["19.10.2026", "2026-10-19"],
  ["19 oct 2026", "2026-10-19"],
  ["19-Oct", "2026-10-19"],
  ["19 october", "2026-10-19"],
  ["Oct 19", "2026-10-19"],
  ["oct 19 2025", "2025-10-19"],
  ["5 jan", "2027-01-05"],
  ["2026-10-19", "2026-10-19"],
  ["1910", "2026-10-19"],
  ["191025", "2025-10-19"],
  ["19102025", "2025-10-19"],
  ["+1", "2026-10-20"],
  ["-1", "2026-10-18"],
  ["+ 15", "2026-11-03"],
  ["+2w", "2026-11-02"],
  ["+1m", "2026-11-19"],
  ["-1y", "2025-10-19"],
  ["t", today],
  ["today", today],
  ["y", D.addDays(today, -1)],
  ["19 أكتوبر", "2026-10-19"],
  ["١٩-١٠", "2026-10-19"],
  ["19-Oct-2026 (8 Jumada I 1448 AH)", "2026-10-19"],
  ["32-10", null],
  ["29-2-2027", null],
  ["19-13", null],
  ["oct", null],
  ["octx 19", null],
  ["2026", null],
  ["abc", null],
  ["", null],
];
for (const [text, want] of dates) check(`date ${JSON.stringify(text)}`, D.parseUser(text, ref), want);
check("+1m from 31 Jan", D.parseUser("+1m", "2026-01-31"), "2026-02-28");
check("due 14-4 after 15-3-2027", D.parseUser("14-4", "2027-03-15", true), "2027-04-14");
check("due 10-3 after 15-3-2027", D.parseUser("10-3", "2027-03-15", true), "2028-03-10");
check("due 15-3 on 15-3-2027", D.parseUser("15-3", "2027-03-15", true), "2027-03-15");
check("due day 5 after 28-3", D.parseUser("5", "2027-03-28", true), "2027-04-05");
check("due day 31 after 1-4", D.parseUser("31", "2027-04-01", true), "2027-05-31");
check("due 29-2 after 1-3-2027", D.parseUser("29-2", "2027-03-01", true), "2028-02-29");
check("due with a year is as typed", D.parseUser("1-1-2026", "2027-03-15", true), "2026-01-01");
check("due +30", D.parseUser("+30", "2027-03-15", true), "2027-04-14");
check("day only keeps the field's month and year", D.parseUser("3", "2027-02-10"), "2027-02-03");

const years = [
  ["2026-27", 2026],
  ["2026-2027", 2026],
  ["26-27", 2026],
  ["2026", 2026],
  ["26", 2026],
  ["FY 2026-27", 2026],
  ["fy26-27", 2026],
  ["FY27", 2026],
  ["FY 2027", 2026],
  ["F.Y. 2026-27", 2026],
  ["AY 2027-28", 2026],
  ["A.Y. 2027-28", 2026],
  ["ay27-28", 2026],
  ["AY 2027", 2026],
  ["TY 2026-27", 2026],
  ["YA 2027", 2025],
  ["2099-00", 2099],
  ["2026-28", null],
  ["AY 2027-29", null],
  ["hello", null],
  ["this year", Number(D.fyStart(today).slice(0, 4))],
  ["last year", Number(D.fyStart(today).slice(0, 4)) - 1],
];
for (const [text, want] of years) check(`year ${JSON.stringify(text)}`, D.parseYear(text), want);
check("bare 26 is not a year in a date field", D.parseYear("26", 4, false), null);
check("calendar-year field", D.parseYear("2026", 1), 2026);

const periods = [
  ["Q1", "2026-04-01..2026-06-30"],
  ["q2", "2026-07-01..2026-09-30"],
  ["Q4", "2027-01-01..2027-03-31"],
  ["Q2 2025-26", "2025-07-01..2025-09-30"],
  ["Q3 FY27", "2026-10-01..2026-12-31"],
  ["Q1 AY 2026-27", "2025-04-01..2025-06-30"],
  ["H1", "2026-04-01..2026-09-30"],
  ["H2", "2026-10-01..2027-03-31"],
  ["2026-27", "2026-04-01..2027-03-31"],
  ["26-27", "2026-04-01..2027-03-31"],
  ["2026", "2026-04-01..2027-03-31"],
  ["FY27", "2026-04-01..2027-03-31"],
  ["AY 2027-28", "2026-04-01..2027-03-31"],
  ["AY 2026-27", "2025-04-01..2026-03-31"],
  ["Apr", "2026-04-01..2026-04-30"],
  ["feb", "2027-02-01..2027-02-28"],
  ["February", "2027-02-01..2027-02-28"],
  ["Feb 2028", "2028-02-01..2028-02-29"],
  ["oct-2025", "2025-10-01..2025-10-31"],
  ["oct-25", null], // a date: 25 October
  ["2026-09", "2026-09-01..2026-09-30"],
  ["9-2026", "2026-09-01..2026-09-30"],
  ["أبريل", "2026-04-01..2026-04-30"],
  ["1-4 to 31-3", "2026-04-01..2027-03-31"],
  ["1-4..30-6", "2026-04-01..2026-06-30"],
  ["Apr to Jun", "2026-04-01..2026-06-30"],
  ["30-6 to 1-4", null],
  ["19", null],
  ["19-10", null],
  ["t", null],
  ["Q5", null],
  ["H3", null],
  ["xyz", null],
];
for (const [text, want] of periods) check(`period ${JSON.stringify(text)}`, period(D.parsePeriod(text, ref)), want);

const month = today.slice(0, 7);
const thisMonth = D.parsePeriod("this month", ref);
check("this month starts", thisMonth.from, `${month}-01`);
check("last month ends before this one", D.parsePeriod("last month", ref).to, D.addDays(`${month}-01`, -1));
check("mtd", period(D.parsePeriod("mtd", ref)), `${month}-01..${today}`);
check("ytd", period(D.parsePeriod("ytd", ref)), `${D.fyStart(today)}..${today}`);
const q = D.parsePeriod("this quarter", ref);
check("this quarter spans three months", D.addMonths(q.from, 3), D.addDays(q.to, 1));
check("last quarter ends where this starts", D.addDays(D.parsePeriod("last quarter", ref).to, 1), q.from);

check("bound: a date", D.parseBound("19-10", ref), "2026-10-19");
check("bound: month start", D.parseBound("Jun", ref), "2026-06-01");
check("bound: month end", D.parseBound("Jun", ref, true), "2026-06-30");
check("bound: FY end", D.parseBound("2025-26", ref, true), "2026-03-31");
check("bound: nonsense", D.parseBound("zz", ref), null);

// + and - in reports: the next or previous period of the same length.
const steps = [
  ["2026-04-01", "2026-04-30", 1, "2026-05-01..2026-05-31"],
  ["2026-01-01", "2026-01-31", 1, "2026-02-01..2026-02-28"],
  ["2026-03-01", "2026-03-31", -1, "2026-02-01..2026-02-28"],
  ["2026-07-01", "2026-09-30", 1, "2026-10-01..2026-12-31"],
  ["2027-01-01", "2027-03-31", 1, "2027-04-01..2027-06-30"],
  ["2026-04-01", "2027-03-31", 1, "2027-04-01..2028-03-31"],
  ["2026-04-01", "2027-03-31", -1, "2025-04-01..2026-03-31"],
  ["2026-10-19", "2026-10-19", 1, "2026-10-20..2026-10-20"],
  ["2026-10-31", "2026-10-31", 1, "2026-11-01..2026-11-01"],
  ["2026-10-01", "2026-10-19", 1, "2026-10-20..2026-11-07"],
  ["2026-10-13", "2026-10-19", -1, "2026-10-06..2026-10-12"],
];
for (const [from, to, dir, want] of steps) check(`step ${from}..${to} ${dir > 0 ? "+" : "-"}`, period(D.stepPeriod({ from, to }, dir)), want);
check("step as at month end +", D.stepDate("2026-03-31", 1), "2026-04-30");
check("step as at month end -", D.stepDate("2026-03-31", -1), "2026-02-28");
check("step as at Feb end", D.stepDate("2028-02-29", 1), "2028-03-31");
check("step as at a day", D.stepDate("2026-10-19", 1), "2026-10-20");
check("step as at a day back", D.stepDate("2026-11-01", -1), "2026-10-31");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
