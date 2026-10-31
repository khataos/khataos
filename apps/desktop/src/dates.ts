// Dates travel as ISO "YYYY-MM-DD" strings; users see "19-Oct-2026", or
// "19-أكتوبر-2026" in Arabic: same order, Latin digits, Gregorian calendar.
// With "Show Hijri dates" on, the Umm al-Qura date follows in brackets; it is
// display only, never parsed into or stored in the books.
import { hijriOn, language, latinDigits, type Lang } from "./i18n";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
/** Gulf usage (as in Saudi and UAE business documents). */
const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

/** Arabic month names as typed: hamza and madda forms of alef count as plain alef. */
function plainAlef(s: string): string {
  return s.replace(/[أإآ]/g, "ا");
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function iso(y: number, m: number, d: number): string | null {
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

function parts(isoDate: string): [number, number, number] {
  const [y, m, d] = isoDate.split("-").map(Number);
  return [y, m, d];
}

export function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** "19-Oct-2026" ("19-أكتوبر-2026"); with Hijri dates on, "19-Oct-2026 (8 Jumada I 1448 AH)". */
export function show(isoDate: string): string {
  const [y, m, d] = parts(isoDate);
  const shown = `${d}-${(language() === "ar" ? MONTHS_AR : MONTHS)[m - 1]}-${y}`;
  const h = hijriOn() ? hijri(isoDate) : null;
  return h ? `${shown} (${h})` : shown;
}

const HIJRI_FORMATS = new Map<Lang, Intl.DateTimeFormat | null>();

function hijriFormat(l: Lang): Intl.DateTimeFormat | null {
  if (!HIJRI_FORMATS.has(l)) {
    let f: Intl.DateTimeFormat | null = null;
    try {
      // Latin digits (-nu-latn), as everywhere else in the app.
      f = new Intl.DateTimeFormat(l === "ar" ? "ar-SA-u-ca-islamic-umalqura-nu-latn" : "en-u-ca-islamic-umalqura-nu-latn", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
      // An engine without the calendar falls back to Gregorian: show nothing rather than a wrong date.
      if (!f.resolvedOptions().calendar.startsWith("islamic")) f = null;
    } catch {
      f = null;
    }
    HIJRI_FORMATS.set(l, f);
  }
  return HIJRI_FORMATS.get(l) ?? null;
}

/**
 * The Umm al-Qura (Saudi official) Hijri date of an ISO date, from the
 * webview's Intl calendar: "8 Jumada I 1448 AH", "8 جمادى الأولى 1448 هـ".
 * null when the engine has no Islamic calendar.
 */
export function hijri(isoDate: string, l: Lang = language()): string | null {
  const f = hijriFormat(l);
  if (!f) return null;
  const [y, m, d] = parts(isoDate);
  const p = f.formatToParts(new Date(Date.UTC(y, m - 1, d)));
  const get = (type: string) => p.find((x) => x.type === type)?.value ?? "";
  const year = get("year") || get("relatedYear");
  return `${get("day")} ${get("month")} ${year} ${l === "ar" ? "هـ" : "AH"}`;
}

export function weekday(isoDate: string): string {
  const [y, m, d] = parts(isoDate);
  return (language() === "ar" ? DAYS_AR : DAYS)[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

/** The first day of the financial year containing the date, for years
 *  starting in `startMonth` (April in India, January in most countries). */
export function fyStart(isoDate: string, startMonth = 4): string {
  const [y, m] = parts(isoDate);
  return `${m >= startMonth ? y : y - 1}-${pad(startMonth)}-01`;
}

/** The last day of the financial year that starts on `fyStartDate`. */
export function fyEnd(fyStartDate: string): string {
  const [y, m, d] = parts(fyStartDate);
  return addDays(`${y + 1}-${pad(m)}-${pad(d)}`, -1);
}

/** The month financial years start in (4 in India), set when a company opens. A date
 *  typed without a year falls in the financial year of the date already in the field. */
let fyMonth = 1;

export function setFyStartMonth(m: number): void {
  fyMonth = Number.isInteger(m) && m >= 1 && m <= 12 ? m : 1;
}

/** Typed text as parsed: Latin digits, lower case, without a shown Hijri date in brackets. */
function clean(text: string): string {
  // A shown date fed back keeps its Gregorian part: "19-Oct-2026 (8 Jumada I 1448 AH)".
  return latinDigits(text).replace(/\s*\([^)]*\)\s*$/, "").trim().toLowerCase().replace(/\s+/g, " ");
}

/** 1 to 12 for a month name: "oct", "october", "أكتوبر"; else 0. */
function monthOf(word: string): number {
  if (/^[a-z]{3,}$/.test(word)) {
    const i = MONTHS.findIndex((mn) => word.startsWith(mn.toLowerCase()));
    if (i >= 0 && "january february march april may june july august september october november december".split(" ")[i].startsWith(word)) return i + 1;
    return 0;
  }
  return MONTHS_AR.findIndex((mn) => plainAlef(mn) === plainAlef(word)) + 1;
}

/** The year a month falls in, within the financial year containing `ref`. */
function yearInFy(m: number, ref: string, startMonth = fyMonth): number {
  const start = fyOf(ref, startMonth);
  return m >= startMonth ? start : start + 1;
}

/** The calendar year a financial year containing `isoDate` starts in. */
function fyOf(isoDate: string, startMonth = fyMonth): number {
  const [y, m] = parts(isoDate);
  return m >= startMonth ? y : y - 1;
}

function lastDay(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** ISO date `months` after `isoDate`; the 31st becomes the month's last day. */
export function addMonths(isoDate: string, months: number): string {
  const [y, m, d] = parts(isoDate);
  const n = y * 12 + (m - 1) + months;
  const ny = Math.floor(n / 12);
  const nm = (n % 12) + 1;
  return `${ny}-${pad(nm)}-${pad(Math.min(d, lastDay(ny, nm)))}`;
}

/** "t" today, "y" yesterday, "+1" the next day, "-7" a week back, "+1m", "-1y"; else undefined. */
function relative(s: string, ref: string): string | null | undefined {
  if (s === "t" || s === "today") return todayIso();
  if (s === "y" || s === "yesterday") return addDays(todayIso(), -1);
  if (s === "tomorrow") return addDays(todayIso(), 1);
  const r = /^([+-]) ?(\d{1,4}) ?([dwmy]?)$/.exec(s);
  if (!r) return undefined;
  const n = Number(r[2]) * (r[1] === "-" ? -1 : 1);
  if (r[3] === "m") return addMonths(ref, n);
  if (r[3] === "y") return addMonths(ref, n * 12);
  return addDays(ref, r[3] === "w" ? n * 7 : n);
}

/**
 * Parse what accountants type: "19", "19-10", "19/10/26", "19.10.2026",
 * "19-Oct", "Oct 19", "19 oct 2026", "1910", "191026" or ISO "2026-10-19"; in
 * any language also Arabic month names ("19 أكتوبر") and Arabic-Indic digits.
 * Shortcuts: "t" today, "y" yesterday, "+1"/"-1" a day after or before the date in
 * the field, "+2w", "+1m", "-1y". A missing month comes from `ref`; a missing year
 * puts the date in the financial year of `ref`, so in 2026-27 "1-4" is
 * 1-Apr-2026 and "31-3" is 31-Mar-2027. With `onOrAfter` (a due date, a bank
 * date) the missing parts give the first such date on or after `ref` instead.
 */
export function parseUser(text: string, ref: string, onOrAfter = false): string | null {
  const s = clean(text);
  if (!s) return null;
  const rel = relative(s, ref);
  if (rel !== undefined) return rel;
  const [ry, rm] = parts(ref);
  const isoM = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
  if (isoM) return iso(+isoM[1], +isoM[2], +isoM[3]);
  let bits = s.split(/[-/.\s]+/).filter(Boolean);
  // Typed without separators: "1910", "191026", "19102026".
  if (bits.length === 1 && /^(\d{4}|\d{6}|\d{8})$/.test(bits[0])) {
    const b = bits[0];
    bits = [b.slice(0, 2), b.slice(2, 4), ...(b.length > 4 ? [b.slice(4)] : [])];
  }
  // Month first: "Oct 19", "Oct 19 2026".
  if (bits.length >= 2 && monthOf(bits[0]) && /^\d+$/.test(bits[1])) bits = [bits[1], bits[0], ...bits.slice(2)];
  if (bits.length === 0 || bits.length > 3) return null;
  if (!/^\d{1,2}$/.test(bits[0])) return null;
  const d = Number(bits[0]);
  let m = rm;
  if (bits.length >= 2) m = /^\d{1,2}$/.test(bits[1]) ? Number(bits[1]) : monthOf(bits[1]) || NaN;
  if (!Number.isInteger(m) || m < 1 || m > 12) return null;
  if (bits.length === 3) {
    if (!/^\d{2}(\d{2})?$/.test(bits[2])) return null;
    const y = Number(bits[2]);
    return iso(y < 100 ? y + 2000 : y, m, d);
  }
  if (onOrAfter) {
    // The next month (day only) or year (day and month) that has the date.
    for (let i = 0; i < 12 * 4; i++) {
      const [y, mm] = bits.length === 1 ? parts(addMonths(`${ry}-${pad(rm)}-01`, i)) : [ry + i, m];
      const out = iso(y, mm, d);
      if (out && out >= ref) return out;
      if (bits.length === 2 && i >= 4) break;
    }
    return null;
  }
  return iso(bits.length === 1 ? ry : yearInFy(m, ref), m, d);
}

/** A period: first and last day, both included. */
export interface Period {
  from: string;
  to: string;
}

function monthPeriod(y: number, m: number): Period {
  return { from: `${y}-${pad(m)}-01`, to: `${y}-${pad(m)}-${pad(lastDay(y, m))}` };
}

/** `months` months from the first day of month `m` of year `y`. */
function span(y: number, m: number, months: number): Period {
  const from = `${y}-${pad(m)}-01`;
  return { from, to: addDays(addMonths(from, months), -1) };
}

/** The financial year starting in `year` (2026 for 2026-27). */
export function fyPeriod(year: number, startMonth = fyMonth): Period {
  return span(year, startMonth, 12);
}

/** "2026-27" for a year starting in April; "2026" for a calendar year. */
export function fyLabel(year: number, startMonth = fyMonth): string {
  return startMonth === 1 ? String(year) : `${year}-${pad((year + 1) % 100)}`;
}

/**
 * The calendar year a typed financial year starts in, or null:
 * - "2026-27", "2026-2027", "26-27", "2026": 2026-27 (or "2026" for calendar years)
 * - "FY 2026-27", "FY26-27", or "FY27" and "FY 2027": the year ending in 2027
 * - "AY 2027-28", "AY27-28", "AY 2027": assessment year 2027-28 taxes 2026-27
 * - "TY 2026-27": tax year 2026-27 (India from April 2026), the same as FY
 * - "YA 2027": Singapore year of assessment, taxing the year that ended in 2026
 * - "this year", "last year", "next year": around today
 * `allowShort` also takes a bare "26" (a year field, never a date field).
 */
export function parseYear(text: string, startMonth = fyMonth, allowShort = true): number | null {
  const s = clean(text).replace(/\./g, "");
  if (!s) return null;
  const word = /^(this|current|last|previous|prev|next) (financial )?year$/.exec(s);
  if (word) return fyOf(todayIso(), startMonth) + (word[1] === "next" ? 1 : /^(last|prev)/.test(word[1]) ? -1 : 0);
  const p = /^(fy|ay|ya|ty)? ?(\d{2}|\d{4})(?: ?[-/] ?(\d{2}|\d{4}))?$/.exec(s);
  if (!p) return null;
  const [, kind, a, b] = p;
  const first = a.length === 2 ? 2000 + Number(a) : Number(a);
  if (b !== undefined) {
    // A two-year label: the second year follows the first.
    const second = b.length === 2 ? Math.floor(first / 100) * 100 + Number(b) : Number(b);
    if (second !== first + 1 && !(b.length === 2 && second + 100 === first + 1)) return null;
  } else if (a.length === 2 && !kind && !allowShort) return null;
  if (first < 1900 || first > 2999) return null;
  const single = b === undefined;
  switch (kind) {
    case "fy":
      return single && startMonth !== 1 ? first - 1 : first;
    case "ay":
      return first - 1;
    case "ya":
      return startMonth === 1 ? first - 1 : first - 2;
    default:
      return first;
  }
}

/**
 * A period typed in one field, or null (also for a plain date):
 * - "Apr", "April", "Apr 2026", "Apr-26", "2026-04", "4-2026": a month; without a
 *   year, the one in the financial year of `ref`
 * - "Q1" to "Q4", "H1", "H2": quarters and halves of the financial year, of `ref`
 *   or given after them: "Q2 2026-27", "Q3 FY27"
 * - any year `parseYear` takes: "2026-27", "FY27", "AY 2027-28", "last year"
 * - "this month", "last month", "this quarter", "last quarter", "mtd", "qtd", "ytd"
 * - "1-4 to 30-6": two dates, read as `parseUser` reads them
 */
export function parsePeriod(text: string, ref: string, startMonth = fyMonth): Period | null {
  const s = clean(text);
  if (!s || parseUser(s, ref)) return null;
  const now = todayIso();
  const quarterStart = (isoDate: string): string => {
    const [y, m] = parts(isoDate);
    const back = (((m - startMonth) % 3) + 3) % 3;
    return addMonths(`${y}-${pad(m)}-01`, -back);
  };
  const word = /^(this|current|last|previous|prev|next) (month|quarter)$/.exec(s);
  if (word) {
    const step = word[1] === "next" ? 1 : /^(last|prev)/.test(word[1]) ? -1 : 0;
    const size = word[2] === "month" ? 1 : 3;
    const first = word[2] === "month" ? `${now.slice(0, 8)}01` : quarterStart(now);
    const [y, m] = parts(addMonths(first, step * size));
    return span(y, m, size);
  }
  if (s === "mtd") return { from: `${now.slice(0, 8)}01`, to: now };
  if (s === "qtd") return { from: quarterStart(now), to: now };
  if (s === "ytd") return { from: fyPeriod(fyOf(now, startMonth), startMonth).from, to: now };
  const two = s.split(/ to | ?\.\. ?/);
  if (two.length === 2) {
    const from = parseUser(two[0], ref) ?? parsePeriod(two[0], ref, startMonth)?.from;
    const to = from && (parseUser(two[1], from) ?? parsePeriod(two[1], from, startMonth)?.to);
    return from && to && from <= to ? { from, to } : null;
  }
  const part = /^([qh])([1-4])(?: ?(.+))?$/.exec(s);
  if (part && (part[1] === "q" || Number(part[2]) <= 2)) {
    const year = part[3] ? parseYear(part[3], startMonth) : fyOf(ref, startMonth);
    if (year === null) return null;
    const size = part[1] === "q" ? 3 : 6;
    const [y, m] = parts(addMonths(`${year}-${pad(startMonth)}-01`, (Number(part[2]) - 1) * size));
    return span(y, m, size);
  }
  const year = parseYear(s, startMonth, false);
  if (year !== null) return fyPeriod(year, startMonth);
  const named = /^([^\d\s/-]+)(?: ?[-/ ] ?(\d{2}|\d{4}))?$/.exec(s);
  if (named) {
    const m = monthOf(named[1]);
    if (!m) return null;
    const y = named[2] === undefined ? yearInFy(m, ref, startMonth) : named[2].length === 2 ? 2000 + Number(named[2]) : Number(named[2]);
    return monthPeriod(y, m);
  }
  const numeric = /^(\d{4})-(\d{1,2})$/.exec(s) ?? /^(\d{1,2})[-/](\d{4})$/.exec(s);
  if (numeric) {
    const [y, m] = numeric[1].length === 4 ? [+numeric[1], +numeric[2]] : [+numeric[2], +numeric[1]];
    return m >= 1 && m <= 12 ? monthPeriod(y, m) : null;
  }
  return null;
}

/** A date for one end of a period: a typed date, or the first (or with `end`, last) day of a typed period. */
export function parseBound(text: string, ref: string, end = false): string | null {
  const date = parseUser(text, ref);
  if (date) return date;
  const p = parsePeriod(text, ref);
  return p && (end ? p.to : p.from);
}

/** Editable form of a date: "19-10-2026". */
export function editable(isoDate: string): string {
  const [y, m, d] = parts(isoDate);
  return `${pad(d)}-${pad(m)}-${y}`;
}

/** ISO date `days` after `isoDate`. */
export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = parts(isoDate);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}
