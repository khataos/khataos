// GSTR-9, India's annual GST return, for a financial year, worked out from
// the books (khata-in gstr9.rs; src-tauri gstr9.rs), and the GSTR-9C
// turnover reconciliation (Part A, Tables 5 and 7) as groundwork.
//
// Keys: Enter opens the vouchers behind a row; Ctrl+Enter enters a row's
// figures by hand (kept per company and year as a shared record, so they
// sync); F2 changes the year; Ctrl+Alt+J saves the GSTN JSON (check it in
// the GST offline tool); Ctrl+Alt+X saves the table under the cursor as
// CSV (Tables 17 and 18 in the offline tool's HSN order); Alt+S compares
// with files downloaded from the GST portal; Ctrl+Alt+C opens GSTR-9C.
// Nothing here talks to the portal: the user downloads and picks the files.
import "../gst.css";
import { open, save } from "@tauri-apps/plugin-dialog";
import { api, gstr9Api } from "../api";
import { h } from "../dom";
import * as D from "../dates";
import { ltr, t as tr } from "../i18n";
import * as M from "../money";
import type { KeyEv, Shell } from "../shell";
import type { GstAmounts, Gstr9, Gstr9DocRef, Gstr9HsnLine, Gstr9PortalKind, Gstr9Recon, Gstr9ReconStatus, Gstr9Row, Gstr9Table, VoucherKind } from "../types";
import { Report } from "./reports";
import { savedVoucherScreen } from "./stockjournal";

const EXPORT_JSON = "Ctrl+Alt+J";
const TABLE_CSV = "Ctrl+Alt+X";
const IMPORT_KEY = "Alt+S";
const GSTR9C_KEY = "Ctrl+Alt+C";
const TOLERANCE_KEY = "Ctrl+Alt+T";

function today(shell: Shell): string {
  return shell.company?.today ?? D.todayIso();
}

/** The financial year before the one containing today: the one usually filed. */
function lastYear(shell: Shell): number {
  const d = today(shell);
  const y = Number(d.slice(0, 4));
  return (Number(d.slice(5, 7)) >= 4 ? y : y - 1) - 1;
}

function yearLabel(start: number): string {
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

function num(text: string | null): HTMLElement {
  return h("td.num", text === null ? "" : M.fmt(text, true));
}

/** "6B-IP" → "6B", "9-CAMT" → "", "9C-5B" → "5B". */
function shownId(id: string): string {
  if (/^(9|14|19)-/.test(id)) return "";
  return id.replace(/^9C-/, "").replace(/-(IP|CG|IS)$/, "");
}

function warnings(list: string[]): HTMLElement | null {
  if (!list.length) return null;
  return h(
    "div.gst-warnings",
    { role: "status" },
    h("div.gst-warn-title", list.length === 1 ? tr("1 thing to check") : tr("{n} things to check", { n: list.length })),
    // Warnings come from Rust in English.
    h("ul", ...list.map((w) => h("li", { dir: "auto" }, w))),
  );
}

/** The voucher type a document opens as. */
function voucherKind(d: Gstr9DocRef): VoucherKind {
  if (d.inward) return d.kind === "CreditNote" ? "DebitNote" : "Purchase";
  return d.kind === "CreditNote" ? "CreditNote" : "Sales";
}

async function saveCsv(shell: Shell, csv: string, name: string): Promise<void> {
  const path = await save({ defaultPath: `${name}.csv`, filters: [{ name: "CSV", extensions: ["csv"] }] });
  if (!path) return;
  const file = path.toLowerCase().endsWith(".csv") ? path : `${path}.csv`;
  await api.writeCsv(file, csv);
  shell.info(tr("Exported to {path}", { path: ltr(file) }));
}

/** Pick one or more .json files downloaded from the GST portal and read them (phones too). */
async function pickPortalFiles(shell: Shell): Promise<{ name: string; text: string }[] | null> {
  let picked: string | string[] | null;
  try {
    picked = await open({ multiple: true, title: tr("Choose the files downloaded from the GST portal"), filters: [{ name: "JSON", extensions: ["json", "JSON"] }] });
  } catch (e) {
    shell.error(e);
    return null;
  }
  const paths = Array.isArray(picked) ? picked : picked ? [picked] : [];
  if (!paths.length) return null;
  const files: { name: string; text: string }[] = [];
  for (const p of paths) files.push({ name: p.split(/[\\/]/).pop() ?? p, text: await shell.transition(gstr9Api.readFile(p)) });
  return files;
}

type Meta = { table: string; row?: Gstr9Row; hsn?: Gstr9HsnLine };

// ------------------------------------------------------------------ GSTR-9

export class Gstr9Report extends Report {
  title = "GSTR-9";
  protected override period = "range" as const;
  private data: Gstr9 | null = null;
  private meta: Meta[] = [];

  constructor(
    shell: Shell,
    private year = lastYear(shell),
    /** "GSTR-9" or "GSTR-9C" (Part A groundwork). */
    private form: "GSTR-9" | "GSTR-9C" = "GSTR-9",
  ) {
    super(shell);
    if (form === "GSTR-9C") this.title = "GSTR-9C";
  }

  async load(): Promise<void> {
    this.render(await gstr9Api.get(this.year));
  }

  private render(g: Gstr9): void {
    this.data = g;
    this.resetPicks();
    this.meta = [];
    const title = this.form === "GSTR-9" ? tr("GSTR-9 annual return") : tr("GSTR-9C turnover reconciliation");
    this.heading(
      title,
      `${g.gstin ? ltr(g.gstin) : tr("No GSTIN")} · ${tr("Financial year {fy}", { fy: ltr(g.fy) })} · ${tr("Turnover in the books {amount}", { amount: M.fmt(g.turnover) })}`,
    );
    const parts: (HTMLElement | null)[] = [warnings(g.warnings)];
    if (this.form === "GSTR-9") parts.push(h("ul.gst-note", ...g.notes.map((n) => h("li", tr(n)))));
    for (const t of g.tables.filter((t) => t.form === this.form)) {
      parts.push(this.tableEl(t, g.can_edit));
      if (t.id === "16") {
        parts.push(this.hsnTable("17", "HSN summary of outward supplies", g.hsn_outward));
        parts.push(this.hsnTable("18", "HSN summary of inward supplies", g.hsn_inward));
      }
    }
    parts.push(
      h(
        "p.gst-note",
        this.form === "GSTR-9"
          ? tr(
              "Figures come from the year's vouchers, classified as GSTR-1 and GSTR-3B classify them. Enter opens the vouchers behind a row; {alter} enters a row's figures by hand, kept for this company and year (all blank brings the books' figure back). {json} saves the JSON in the GSTN layout: it needs validation in the GST offline tool before upload. {csv} saves the table under the cursor as CSV. {import} compares with files downloaded from the GST portal. {c} opens GSTR-9C. A preparation aid, not legal advice.",
              { alter: ltr("Ctrl+Enter"), json: ltr(EXPORT_JSON), csv: ltr(TABLE_CSV), import: ltr(IMPORT_KEY), c: ltr(GSTR9C_KEY) },
            )
          : tr(
              "GSTR-9C Part A groundwork: turnover in the profit and loss account (sales accounts) against GSTR-9. Enter the adjustments with {alter}. Tables 9 to 17 of GSTR-9C (tax paid and ITC) are not worked out yet. {csv} saves the table under the cursor as CSV.",
              { alter: ltr("Ctrl+Enter"), csv: ltr(TABLE_CSV) },
            ),
      ),
    );
    this.bodyEl.replaceChildren(...parts.filter((x): x is HTMLElement => x !== null));
  }

  private tableEl(t: Gstr9Table, canEdit: boolean): HTMLElement {
    const tbody = h("tbody");
    for (const r of t.rows) {
      const entered = r.entered !== null;
      const hint = entered ? tr("entered by hand") : r.source === "total" ? "" : r.note ? tr(r.note) : "";
      const editable = canEdit && r.source !== "total";
      const open = r.docs > 0 ? () => void this.shell.push(new Gstr9DocsReport(this.shell, this.year, [r.id], `${shownId(r.id) || tr("Table {n}", { n: t.id })} ${tr(r.label)}`)) : editable ? () => void this.edit(t, r) : undefined;
      tbody.append(
        this.pick(
          h(
            "tr",
            { class: entered ? "gst-entered" : "" },
            h("td", ltr(shownId(r.id))),
            h(r.source === "total" ? "td.strong" : "td", tr(r.label), hint ? h("div.muted", hint) : null),
            ...r.value.map((v) => num(v)),
          ),
          open,
        ),
      );
      this.meta.push({ table: t.id, row: r });
    }
    const name = t.form === "GSTR-9" ? tr("Table {n}", { n: t.id }) : tr("Table {n}", { n: t.id.replace(/^9C-/, "") });
    return h(
      "div.tside",
      h("div.tside-title", `${name}: ${tr(t.title)}`),
      h("table.rtable", h("thead", h("tr", h("th", tr("Row")), h("th", tr("Particulars")), ...t.columns.map((c) => h("th.num", tr(c))))), tbody),
    );
  }

  private hsnTable(id: string, title: string, lines: Gstr9HsnLine[]): HTMLElement {
    const tbody = h("tbody");
    for (const l of lines) {
      tbody.append(
        this.pick(
          h(
            "tr",
            { class: l.hsn ? "" : "warnrow" },
            h("td", l.hsn ? ltr(l.hsn) : tr("(none)")),
            h("td", ltr(l.uqc)),
            num(l.qty),
            h("td.num", `${l.rate.includes(".") ? l.rate.replace(/\.?0+$/, "") : l.rate}%`),
            num(l.amounts.taxable),
            num(l.amounts.igst),
            num(l.amounts.cgst),
            num(l.amounts.sgst),
            num(l.amounts.cess),
          ),
          l.docs > 0 ? () => void this.shell.push(new Gstr9DocsReport(this.shell, this.year, [l.key], `${tr("Table {n}", { n: id })} · ${l.hsn || tr("(none)")}`)) : undefined,
        ),
      );
      this.meta.push({ table: id, hsn: l });
    }
    if (!lines.length) tbody.append(h("tr.empty", h("td", { colSpan: 9 }, tr("Nothing in this table for the year."))));
    const heads = ["HSN/SAC", "UQC", "Quantity", "Rate", "Taxable Value", "IGST", "CGST", "SGST/UTGST", "Cess"];
    return h(
      "div.tside",
      h("div.tside-title", `${tr("Table {n}", { n: id })}: ${tr(title)}`),
      h("table.rtable", h("thead", h("tr", ...heads.map((c, i) => h(i < 2 ? "th" : "th.num", tr(c))))), tbody),
    );
  }

  private atCursor(): Meta | undefined {
    return this.meta[this.cursor];
  }

  private async edit(t: Gstr9Table, r: Gstr9Row): Promise<void> {
    if (!this.data?.can_edit) {
      this.shell.warn(tr("Only an accountant or the owner can enter GSTR-9 figures."));
      return;
    }
    if (r.source === "total") {
      this.shell.warn(tr("This row is a total of other rows."));
      return;
    }
    const start = r.entered ?? r.books ?? r.value;
    const title = tr("Row {row}: enter figures", { row: `${shownId(r.id)} ${tr(r.label)}`.trim() });
    const v = await this.shell.dialog(
      title,
      t.columns.map((c, i) => ({ label: c, value: M.of(start[i] ?? "0") === 0n && r.entered === null ? "" : start[i] })),
      (vals) => {
        const bad = vals.find((x) => x.trim() !== "" && M.parse(x) === null);
        return bad === undefined ? null : tr('"{text}" is not an amount.', { text: bad });
      },
    );
    if (!v) return;
    const values: Record<string, string> = {};
    t.keys.forEach((k, i) => {
      if (v[i].trim()) values[k] = M.toDecimal(M.parse(v[i])!);
    });
    try {
      this.render(await gstr9Api.setRow(this.year, r.id, Object.keys(values).length ? values : null));
      this.paint();
      this.shell.refresh();
    } catch (e) {
      this.shell.error(e);
    }
  }

  override handles(a: string): boolean {
    return a === "AlterMasterInline" || super.handles(a);
  }

  override bottom() {
    const b = super.bottom();
    const cur = this.atCursor();
    const ctx = this.contexts();
    const extra = [
      this.shell.btn("AlterMasterInline", ctx, "Alter", Boolean(this.data?.can_edit && cur?.row && cur.row.source !== "total")),
      { chord: TABLE_CSV, label: "Table CSV", enabled: Boolean(cur) },
      ...(this.form === "GSTR-9"
        ? [
            { chord: EXPORT_JSON, label: "Export JSON", enabled: true },
            { chord: IMPORT_KEY, label: "Compare with portal", enabled: true },
            { chord: GSTR9C_KEY, label: "GSTR-9C", enabled: true },
          ]
        : []),
    ];
    b.splice(b.length - 1, 0, ...extra.filter((x): x is NonNullable<typeof x> => x !== null));
    return b;
  }

  override key(e: KeyEv): boolean {
    switch (e.chord) {
      case TABLE_CSV:
        void this.exportTable();
        return true;
      case EXPORT_JSON:
        if (this.form !== "GSTR-9") return false;
        void this.exportJson();
        return true;
      case IMPORT_KEY:
        if (this.form !== "GSTR-9") return false;
        void this.compare();
        return true;
      case GSTR9C_KEY:
        if (this.form !== "GSTR-9") return false;
        void this.shell.push(new Gstr9Report(this.shell, this.year, "GSTR-9C"));
        return true;
    }
    return super.key(e);
  }

  override action(a: string): boolean {
    if (a === "AlterMasterInline") {
      const cur = this.atCursor();
      const t = this.data?.tables.find((x) => x.id === cur?.table);
      if (cur?.row && t) void this.edit(t, cur.row);
      return true;
    }
    return super.action(a);
  }

  private async exportJson(): Promise<void> {
    try {
      const json = await gstr9Api.json(this.year);
      const name = `GSTR9-${this.data?.gstin ?? "draft"}-${yearLabel(this.year)}`;
      const path = await save({ defaultPath: `${name}.json`, filters: [{ name: "JSON", extensions: ["json"] }] });
      if (!path) return;
      const file = path.toLowerCase().endsWith(".json") ? path : `${path}.json`;
      await api.writeGstJson(file, json);
      this.shell.info(tr("GSTR-9 JSON saved to {file}. It needs validation in the GST offline tool before upload.", { file: ltr(file) }));
    } catch (e) {
      this.shell.error(e);
    }
  }

  private async exportTable(): Promise<void> {
    const table = this.atCursor()?.table ?? (this.form === "GSTR-9" ? "4" : "9C-5");
    try {
      const csv = await gstr9Api.csv(this.year, table);
      await saveCsv(this.shell, csv, `GSTR9-${yearLabel(this.year)}-table-${table}`);
    } catch (e) {
      this.shell.error(e);
    }
  }

  private async compare(): Promise<void> {
    try {
      const files = await pickPortalFiles(this.shell);
      if (files) await this.shell.push(new Gstr9ReconReport(this.shell, this.year, files));
    } catch (e) {
      this.shell.error(e);
    }
  }

  protected override async askPeriod(): Promise<void> {
    const v = await this.shell.dialog("Change year", [{ label: "Financial year", value: yearLabel(this.year) }], ([y]) =>
      /^\s*\d{4}(-\d{2})?\s*$/.test(y) && Number(y.trim().slice(0, 4)) >= 2017 ? null : tr('"{text}" is not a financial year (e.g. 2026-27).', { text: ltr(y) }),
    );
    if (!v) return;
    this.year = Number(v[0].trim().slice(0, 4));
    this.cursor = 0;
    await this.reload();
  }
}

// ------------------------------------------------------------- drill-down

/** The vouchers behind a row or HSN line; Enter opens one. */
class Gstr9DocsReport extends Report {
  constructor(
    shell: Shell,
    private year: number,
    private keys: string[],
    public title: string,
  ) {
    super(shell);
  }

  async load(): Promise<void> {
    const lists = await Promise.all(this.keys.map((k) => gstr9Api.docs(this.year, k)));
    const docs = lists.flat().sort((a, b) => (a.date + a.number).localeCompare(b.date + b.number));
    this.heading(`${ltr("GSTR-9")} · ${this.title}`, tr("Financial year {fy}", { fy: ltr(yearLabel(this.year)) }));
    this.resetPicks();
    const tbody = h("tbody");
    const total: Record<keyof GstAmounts, bigint> = { taxable: 0n, igst: 0n, cgst: 0n, sgst: 0n, cess: 0n };
    for (const d of docs) {
      for (const k of Object.keys(total) as (keyof GstAmounts)[]) total[k] += M.of(d.amounts[k]);
      const kind = voucherKind(d);
      tbody.append(
        this.pick(
          h("tr", h("td", D.show(d.date)), h("td", ltr(d.number)), h("td", tr(kind === "Sales" ? "Sales" : kind === "Purchase" ? "Purchase" : kind === "CreditNote" ? "Credit Note" : "Debit Note")), h("td.strong", d.party), num(d.amounts.taxable), num(d.amounts.igst), num(d.amounts.cgst), num(d.amounts.sgst), num(d.amounts.cess)),
          () => void this.shell.push(savedVoucherScreen(this.shell, kind, d.date, d.id)),
        ),
      );
    }
    if (!docs.length) tbody.append(h("tr.empty", h("td", { colSpan: 9 }, tr("No vouchers behind this row."))));
    const heads = ["Date", "No.", "Type", "Party", "Taxable Value", "IGST", "CGST", "SGST/UTGST", "Cess"];
    const foot = (Object.keys(total) as (keyof GstAmounts)[]).map((k) => num(M.toDecimal(total[k])));
    this.bodyEl.replaceChildren(
      h(
        "table.rtable",
        h("thead", h("tr", ...heads.map((c, i) => h(i < 4 ? "th" : "th.num", tr(c))))),
        tbody,
        h("tfoot", h("tr", h("td", { colSpan: 4 }, tr("Total")), ...foot)),
      ),
      h("p.gst-note", tr("Amounts are what each voucher adds to the row; credit notes on a net row are negative.")),
    );
  }
}

// --------------------------------------------------------- reconciliation

const STATUS_LABEL: Record<Gstr9ReconStatus, string> = {
  Matched: "Matched",
  Differs: "Differs",
  NotInFiles: "Not in the files",
};

const KIND_LABEL: Record<Gstr9PortalKind, string> = { Gstr9: "GSTR-9", Gstr1: "GSTR-1", Gstr3b: "GSTR-3B", Gstr2b: "GSTR-2B" };

export class Gstr9ReconReport extends Report {
  title = "GSTR-9 against the portal";
  private tolerance: string | null = null;

  constructor(
    shell: Shell,
    private year: number,
    private files: { name: string; text: string }[],
  ) {
    super(shell);
  }

  async load(): Promise<void> {
    this.render(await gstr9Api.reconcile(this.year, this.files, this.tolerance));
  }

  private render(r: Gstr9Recon): void {
    this.resetPicks();
    const files = r.files.map((f) => `${ltr(f.name)} (${ltr(KIND_LABEL[f.kind])}${f.period ? ` ${ltr(f.period)}` : ""})`).join(", ");
    this.heading(tr("GSTR-9: books against the GST portal"), `${r.gstin ? ltr(r.gstin) : ""} · ${tr("Financial year {fy}", { fy: ltr(r.fy) })} · ${files}`);
    const tbody = h("tbody");
    for (const l of r.lines) {
      const cls = l.status === "Differs" ? "warnrow" : l.status === "NotInFiles" ? "muted" : "";
      const open = l.docs > 0 ? () => void this.shell.push(new Gstr9DocsReport(this.shell, this.year, [l.row], `${shownId(l.row)} ${tr(l.label)}`)) : undefined;
      tbody.append(
        this.pick(
          h(
            "tr",
            { class: cls },
            h("td", ltr(shownId(l.row) || tr("Table {n}", { n: l.table }))),
            h("td", tr(l.label), l.from && l.from !== "Gstr9" ? h("div.muted", tr("from {kind}", { kind: ltr(KIND_LABEL[l.from]) })) : null),
            h("td", tr(l.column)),
            num(l.books),
            num(l.portal),
            num(l.status === "NotInFiles" ? null : l.difference),
            h("td", tr(STATUS_LABEL[l.status])),
          ),
          open,
        ),
      );
    }
    if (!r.lines.length) tbody.append(h("tr.empty", h("td", { colSpan: 7 }, tr("The files have no figures for the tables of GSTR-9."))));
    const parts: (HTMLElement | null)[] = [
      warnings(r.warnings),
      h("p.gst-note", tr("{matched} matched, {differs} differ.", { matched: r.matched, differs: r.differs })),
      h(
        "table.rtable",
        h("thead", h("tr", h("th", tr("Row")), h("th", tr("Particulars")), h("th", tr("Column")), h("th.num", tr("Books")), h("th.num", tr("Portal")), h("th.num", tr("Difference")), h("th", tr("Status")))),
        tbody,
      ),
    ];
    if (r.hsn.length) {
      const hb = h("tbody");
      const tax = (a: GstAmounts | null) => (a ? M.toDecimal(M.of(a.igst) + M.of(a.cgst) + M.of(a.sgst) + M.of(a.cess)) : null);
      for (const x of r.hsn) {
        hb.append(
          this.pick(
            h(
              "tr",
              { class: x.status === "Differs" ? "warnrow" : "" },
              h("td", ltr(x.table)),
              h("td", x.hsn ? ltr(x.hsn) : tr("(none)"), x.differences.length ? h("div.muted", { dir: "auto" }, x.differences.join("; ")) : null),
              h("td.num", `${x.rate}%`),
              num(x.books?.taxable ?? null),
              num(x.portal?.taxable ?? null),
              num(tax(x.books)),
              num(tax(x.portal)),
              h("td", tr(STATUS_LABEL[x.status])),
            ),
            x.keys.length ? () => void this.shell.push(new Gstr9DocsReport(this.shell, this.year, x.keys, `${tr("Table {n}", { n: x.table })} · ${x.hsn}`)) : undefined,
          ),
        );
      }
      parts.push(
        h("div.tside-title", tr("HSN summaries (Tables 17 and 18) by HSN and rate")),
        h(
          "table.rtable",
          h("thead", h("tr", h("th", tr("Table")), h("th", tr("HSN/SAC")), h("th.num", tr("Rate")), h("th.num", tr("Books taxable value")), h("th.num", tr("Portal taxable value")), h("th.num", tr("Books tax")), h("th.num", tr("Portal tax")), h("th", tr("Status")))),
          hb,
        ),
      );
    }
    parts.push(
      h(
        "p.gst-note",
        tr(
          "Difference is books less portal, row by row and column by column; a difference up to the tolerance (₹1 unless changed with {tol}) counts as matched. Enter opens the vouchers behind a row. {key} picks other files. Read the GSTR-9 JSON with system-computed values, or GSTR-1, GSTR-3B and GSTR-2B JSON files for the year's periods (each is added in).",
          { tol: ltr(TOLERANCE_KEY), key: ltr(IMPORT_KEY) },
        ),
      ),
    );
    this.bodyEl.replaceChildren(...parts.filter((x): x is HTMLElement => x !== null));
  }

  override bottom() {
    const b = super.bottom();
    b.splice(b.length - 1, 0, { chord: IMPORT_KEY, label: "Compare with portal", enabled: true }, { chord: TOLERANCE_KEY, label: "Tolerance", enabled: true });
    return b;
  }

  override key(e: KeyEv): boolean {
    if (e.chord === IMPORT_KEY) {
      void this.pickAgain();
      return true;
    }
    if (e.chord === TOLERANCE_KEY) {
      void this.askTolerance();
      return true;
    }
    return super.key(e);
  }

  private async pickAgain(): Promise<void> {
    try {
      const files = await pickPortalFiles(this.shell);
      if (!files) return;
      this.files = files;
      this.cursor = 0;
      await this.reload();
    } catch (e) {
      this.shell.error(e);
    }
  }

  private async askTolerance(): Promise<void> {
    const v = await this.shell.dialog("Tolerance", [{ label: "Amount (₹)", value: this.tolerance ?? "1" }], ([a]) =>
      M.parse(a) === null ? tr('"{text}" is not an amount.', { text: a }) : null,
    );
    if (!v) return;
    this.tolerance = v[0].trim();
    await this.reload();
  }
}
