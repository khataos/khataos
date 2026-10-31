// Date, period and year fields in dialogs (F2, Alt+F2, report periods, return
// years). Each field reads short forms (dates.ts), says under the
// fields what the text means as it is typed, and on Enter shows it as a date:
// "Q2" typed in From fills From and To with the quarter.
import * as D from "./dates";
import { t as tr } from "./i18n";

/** A plain date; the start of a period; its end; a date a report is "as at" (a period means its end). */
export type DateKind = "date" | "from" | "to" | "asAt";

type Opts = { leave: (at: number, values: string[]) => string[] | null; note: (at: number, values: string[]) => string };

function hint(): string {
  return tr("t today · y yesterday · +1 next day · 1-4 · Apr · Q2 · 2026-27 · AY 2027-28");
}

function range(p: D.Period): string {
  return tr("{from} to {to}", { from: D.show(p.from), to: D.show(p.to) });
}

function day(isoDate: string): string {
  return `${D.weekday(isoDate)}, ${D.show(isoDate)}`;
}

/** The date a field of `kind` holds, or null. */
export function readDate(kind: DateKind, text: string, ref: string): string | null {
  return kind === "date" ? D.parseUser(text, ref) : D.parseBound(text, ref, kind !== "from");
}

/**
 * `shell.dialog` options for fields of these kinds; `ref` gives the date each
 * field's missing parts come from. A period in a "from" field also fills the
 * "to" field after it.
 */
export function dateFields(kinds: DateKind[], ref: (at: number, values: string[]) => string): Opts {
  return {
    leave: (at, values) => {
      const kind = kinds[at];
      if (!kind || !values[at].trim()) return null;
      const r = ref(at, values);
      const out = [...values];
      const p = kind === "from" && kinds[at + 1] === "to" ? D.parsePeriod(values[at], r) : null;
      if (p) {
        out[at] = D.editable(p.from);
        out[at + 1] = D.editable(p.to);
        return out;
      }
      const d = readDate(kind, values[at], r);
      if (!d) return null;
      out[at] = D.editable(d);
      return out;
    },
    note: (at, values) => {
      const kind = kinds[at];
      if (!kind) return "";
      const r = ref(at, values);
      const p = kind === "from" && kinds[at + 1] === "to" ? D.parsePeriod(values[at], r) : null;
      if (p) return range(p);
      const d = readDate(kind, values[at], r);
      return d ? day(d) : hint();
    },
  };
}

/** A financial year field: what the typed year covers ("AY 2027-28" taxes 1-Apr-2026 to 31-Mar-2027). */
export function yearNote(text: string, startMonth: number): string {
  const y = D.parseYear(text, startMonth);
  if (y !== null) return range(D.fyPeriod(y, startMonth));
  return startMonth === 1 ? tr("2026 · this year · last year") : tr("2026-27 · 26-27 · FY27 · AY 2027-28 · last year");
}
