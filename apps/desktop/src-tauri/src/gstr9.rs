//! GSTR-9 (India's annual GST return) from the books, with hand entries,
//! exports and a comparison with files downloaded from the GST portal. The
//! rules are in `khata_in::gstr9`; this module gathers the year's documents
//! the way GSTR-1 and GSTR-3B do (`gst::collect_period`), plus what only
//! the masters know:
//! - SEZ recipients: the party's address is marked as in an SEZ;
//! - suppliers abroad: the party's address is in another country (import
//!   of services on reverse charge goes to 6F, IGST on goods to 6E);
//! - capital goods: purchase lines on a ledger under Fixed Assets;
//! - Rule 37 reversals falling due in the year (`gst_rcm::rule37_rows`);
//! - the sales accounts in the profit and loss account (GSTR-9C 5A).
//!
//! **Hand entries** for a year are one shared record of the company,
//! `gst.gstr9.<YYYY-YY>` (e.g. `gst.gstr9.2025-26`): row id → column key →
//! amount. They sync with the company like the other records
//! (`docs/sync-settings.md`). Nothing here talks to the GST portal: the
//! user downloads the files and picks them.

use std::collections::{BTreeMap, BTreeSet};

use khata_core::{Book, GroupId, Ledger, UserRole};
use khata_in::gstr9::{self, DocRef, Entries, Gstr9, Gstr9Input, Gstr9Recon};
use khata_in::returns::{self, Amounts};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

use crate::api::{ApiResult, Slot, err, open_mut, open_ref, parse_amount};
use crate::gst::collect_period;

/// Shared-record key prefix: `gst.gstr9.2025-26` → the year's entries (JSON).
pub const ENTRIES_KEY: &str = "gst.gstr9.";

fn key(fy_start: i32) -> String {
    format!("{ENTRIES_KEY}{}", gstr9::fy_label(fy_start))
}

fn check_year(fy_start: i32) -> ApiResult<()> {
    // GST began on 1 July 2017.
    if !(2017..=2100).contains(&fy_start) {
        return Err(format!("{fy_start} is not a GST financial year (2017-18 onward)"));
    }
    Ok(())
}

fn store_of(slot: &Slot) -> ApiResult<&khata_store::Store> {
    slot.as_ref().map(|(s, _)| s).ok_or_else(|| "no company is open".to_owned())
}

fn entries(slot: &Slot, fy_start: i32) -> ApiResult<Entries> {
    match store_of(slot)?.record(&key(fy_start)).map_err(err)? {
        Some(json) => serde_json::from_str(&json).map_err(|e| format!("the saved GSTR-9 entries for {} cannot be read: {e}", gstr9::fy_label(fy_start))),
        None => Ok(Entries::new()),
    }
}

fn abroad(l: &Ledger) -> bool {
    l.mailing.as_ref().and_then(|m| m.country.as_deref()).is_some_and(|c| !c.trim().is_empty() && !c.trim().eq_ignore_ascii_case("IN"))
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct Gstr9Dto {
    pub gstin: Option<String>,
    pub state: String,
    /// The user may save hand entries (an accountant or the owner).
    pub can_edit: bool,
    #[serde(flatten)]
    pub ret: Gstr9,
}

/// GSTR-9 for the financial year starting in April `fy_start`.
pub(crate) fn build(book: &Book, entries: &Entries, fy_start: i32) -> ApiResult<Gstr9Dto> {
    check_year(fy_start)?;
    let period = gstr9::fy_period(fy_start);
    let docs = collect_period(book, period)?;
    let ledger = |id: &Option<khata_core::LedgerId>| id.and_then(|l| book.ledger(l));
    let sez: BTreeSet<String> = docs
        .outward
        .iter()
        .zip(&docs.outward_party)
        .filter(|(_, p)| ledger(p).and_then(|l| l.mailing.as_ref()).is_some_and(|m| m.special_zone))
        .map(|(d, _)| d.id.clone())
        .collect();
    let abroad: BTreeSet<String> =
        docs.inward.iter().zip(&docs.inward_info).filter(|(_, i)| ledger(&i.party).is_some_and(abroad)).map(|(d, _)| d.id.clone()).collect();
    let mut rule37 = Amounts::default();
    for r in crate::gst_rcm::rule37_rows(book, period.to)?.rows.iter().filter(|r| period.contains(r.reverse_from)) {
        rule37.igst += r.reversal.igst;
        rule37.cgst += r.reversal.cgst;
        rule37.sgst += r.reversal.sgst;
        rule37.cess += r.reversal.cess;
    }
    let sales = GroupId::default_named("Sales Accounts");
    let pl = khata_core::reports::profit_and_loss(book, period.from, period.to);
    let books_turnover = pl.incomes.iter().filter(|g| g.group == sales).map(|g| g.amount).sum::<Decimal>();
    let input = Gstr9Input {
        period,
        supplier_state: &docs.state,
        outward: &docs.outward,
        inward: &docs.inward,
        sez,
        abroad,
        rule37,
        books_turnover: Some(books_turnover),
        hsn_digits: book.profile().and_then(|p| p.hsn_digits),
    };
    let mut ret = gstr9::gstr9(&input, entries);
    ret.warnings.splice(0..0, docs.warnings);
    let can_edit = crate::api::require(book, UserRole::Accountant).is_ok();
    Ok(Gstr9Dto { gstin: docs.gstin, state: docs.state, can_edit, ret })
}

pub fn gstr9(slot: &Slot, fy_start: i32) -> ApiResult<Gstr9Dto> {
    let e = entries(slot, fy_start)?;
    build(open_ref(slot)?, &e, fy_start)
}

/// Save hand entries for one row (column key → amount as typed), or clear
/// them (`None` or every value blank): the books' figure comes back.
pub fn gstr9_set_row(slot: &mut Slot, fy_start: i32, row: &str, values: Option<BTreeMap<String, String>>) -> ApiResult<Gstr9Dto> {
    check_year(fy_start)?;
    let mut all = entries(slot, fy_start)?;
    let mut parsed: BTreeMap<String, Decimal> = BTreeMap::new();
    for (k, v) in values.unwrap_or_default() {
        if v.trim().is_empty() {
            continue;
        }
        parsed.insert(k, parse_amount(&v)?);
    }
    gstr9::check_entry(row, &parsed)?;
    if parsed.is_empty() {
        all.remove(row);
    } else {
        all.insert(row.to_owned(), parsed);
    }
    {
        let (store, book) = open_mut(slot)?;
        crate::api::require(book, UserRole::Accountant)?;
        if book.country() != Some("IN") {
            return Err("GST returns are for companies in India".into());
        }
        let json = serde_json::to_string(&all).map_err(err)?;
        let value = (!all.is_empty()).then_some(json);
        store.set_record(&key(fy_start), value.as_deref(), &crate::api::os_user()).map_err(err)?;
    }
    gstr9(slot, fy_start)
}

/// The documents behind a row ("4B") or an HSN line's key ("17|847130|NOS|18").
pub fn gstr9_docs(slot: &Slot, fy_start: i32, key: &str) -> ApiResult<Vec<DocRef>> {
    let g = gstr9(slot, fy_start)?;
    Ok(g.ret.docs.get(key).cloned().unwrap_or_default())
}

/// The GSTN-shaped JSON (needs validation in the GST offline tool).
pub fn gstr9_json(slot: &Slot, fy_start: i32) -> ApiResult<String> {
    let g = gstr9(slot, fy_start)?;
    let gstin = g.gstin.clone().ok_or("set the company's GSTIN first (Company → Tax registration)")?;
    serde_json::to_string_pretty(&gstr9::gstr9_json(&g.ret, &gstin)).map_err(err)
}

/// One table as CSV ("4" to "19", "9C-5", "9C-7", or "all").
pub fn gstr9_csv(slot: &Slot, fy_start: i32, table: &str) -> ApiResult<String> {
    let g = gstr9(slot, fy_start)?;
    gstr9::table_csv(&g.ret, table)
}

/// GSTR-1 Table 12 (HSN summary) for a period as CSV: `which` "b2b",
/// "b2c", or anything else for both together.
pub fn gstr1_hsn_csv(slot: &Slot, from: &str, to: &str, which: &str) -> ApiResult<String> {
    let r = crate::gst::gstr1(slot, from, to)?.ret;
    let rows: Vec<returns::HsnRow> = match which {
        "b2b" => r.hsn_b2b,
        "b2c" => r.hsn_b2c,
        _ => r.hsn_b2b.into_iter().chain(r.hsn_b2c).collect(),
    };
    Ok(gstr9::hsn_csv_gstr1(&rows))
}

/// A file the user picked: its name and text.
#[derive(Debug, Clone, Deserialize)]
pub struct PickedFile {
    pub name: String,
    pub text: String,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct Gstr9ReconDto {
    pub gstin: Option<String>,
    /// A file is for another GSTIN than the company's.
    pub other_gstin: bool,
    #[serde(flatten)]
    pub recon: Gstr9Recon,
}

/// Compare the books' GSTR-9 with files downloaded from the portal (the
/// GSTR-9 JSON with system-computed values, or GSTR-1, GSTR-3B and GSTR-2B
/// JSON). `tolerance`: rupees a figure may differ (default ₹1).
pub fn gstr9_reconcile(slot: &Slot, fy_start: i32, files: &[PickedFile], tolerance: Option<&str>) -> ApiResult<Gstr9ReconDto> {
    if files.is_empty() {
        return Err("pick at least one file downloaded from the GST portal".into());
    }
    let g = gstr9(slot, fy_start)?;
    let picked: Vec<(String, String)> = files.iter().map(|f| (f.name.clone(), f.text.clone())).collect();
    let portal = gstr9::parse_portal(&picked, fy_start)?;
    let tol = match tolerance.map(str::trim).filter(|t| !t.is_empty()) {
        Some(t) => parse_amount(t)?.abs(),
        None => Decimal::ONE,
    };
    let mut recon = gstr9::reconcile(&g.ret, &portal, tol);
    let other: Vec<String> = portal
        .files
        .iter()
        .filter_map(|f| f.gstin.clone())
        .filter(|f| g.gstin.as_deref().is_some_and(|c| !c.eq_ignore_ascii_case(f)))
        .collect();
    let other_gstin = !other.is_empty();
    if other_gstin {
        recon.warnings.insert(0, format!("these files are for {}, not the company's GSTIN {}", other.join(", "), g.gstin.clone().unwrap_or_default()));
    }
    Ok(Gstr9ReconDto { gstin: g.gstin, other_gstin, recon })
}

/// Read a return's .json file the user picked (desktop; at most 20 MB).
pub fn read_json_file(path: &str) -> ApiResult<String> {
    let p = std::path::Path::new(path);
    if !p.extension().is_some_and(|e| e.eq_ignore_ascii_case("json")) {
        return Err("pick a .json file downloaded from the GST portal".into());
    }
    let meta = std::fs::metadata(p).map_err(|e| e.to_string())?;
    if meta.len() > 20 * 1024 * 1024 {
        return Err("the file is larger than 20 MB".into());
    }
    std::fs::read_to_string(p).map_err(|e| format!("cannot read {path}: {e}"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::api::tests::{entry, group_id, indian_company, ledger, voucher};
    use crate::api::{StockLineInput, create_party_ledger, post_voucher};
    use crate::masters::{LedgerInput, StockItemInput, alter_ledger, save_stock_item, save_unit};
    use crate::tax::{set_company_tax, set_ledger_tax, set_tax_rate};
    use khata_core::{DrCr, TaxSide};
    use khata_in::gstr9::ReconStatus;
    use rust_decimal_macros::dec;

    fn mailing(slot: &mut Slot, id: &str, group: &str, tax_id: Option<&str>, m: khata_core::Mailing) {
        let l = crate::masters::get_ledger(slot, id).unwrap();
        alter_ledger(slot, id, &LedgerInput {
            name: l.name,
            group_id: group_id(slot, group),
            opening: String::new(),
            credit_days: None,
            tax_id: tax_id.map(str::to_owned),
            tax_id_override: None,
            tax_component: None,
            tax_side: None,
            mailing: Some(m),
            tax_class: None,
            pan: None,
            tds: None,
        })
        .unwrap();
    }

    fn items(item_id: &str, qty: &str, rate: &str) -> Vec<StockLineInput> {
        vec![StockLineInput {
            item_id: item_id.into(),
            qty: qty.into(),
            rate: rate.into(),
            amount: String::new(),
            godown_id: String::new(),
            batch: String::new(),
        }]
    }

    /// FY 2025-26 books of a Maharashtra company: B2B and B2C sales, a sales
    /// return, an SEZ supply under LUT, purchases of goods and of a machine
    /// (a fixed asset), a purchase return, and software bought from abroad
    /// on reverse charge.
    fn sample_books(name: &str) -> (crate::api::tests::TempFile, Slot) {
        let (f, mut slot) = indian_company(name);
        set_company_tax(&mut slot, "27AAPFU0939F1ZV", "").unwrap();
        for (class, rate) in [("847130", "18"), ("8462", "18"), ("997331", "18")] {
            set_tax_rate(&mut slot, class, "2017-07-01", rate).unwrap();
        }
        let debtors = group_id(&slot, "Sundry Debtors");
        let creditors = group_id(&slot, "Sundry Creditors");
        let ka = "29AAGCB7383J1Z4";
        let buyer = create_party_ledger(&mut slot, "Bengaluru Co", &debtors, "", None, Some(ka), None).unwrap().ledger.id;
        let walk_in = ledger(&mut slot, "Walk-in", "Sundry Debtors", "");
        let sez = ledger(&mut slot, "SEZ Unit", "Sundry Debtors", "");
        mailing(&mut slot, &sez, "Sundry Debtors", None, khata_core::Mailing { region: Some("27".into()), special_zone: true, ..Default::default() });
        let supplier = create_party_ledger(&mut slot, "KA Supplier", &creditors, "", None, Some(ka), None).unwrap().ledger.id;
        let foreign = ledger(&mut slot, "US Software Inc", "Sundry Creditors", "");
        mailing(&mut slot, &foreign, "Sundry Creditors", None, khata_core::Mailing { country: Some("US".into()), ..Default::default() });
        let sales = ledger(&mut slot, "Sales", "Sales Accounts", "");
        let purchase = ledger(&mut slot, "Purchase", "Purchase Accounts", "");
        let machinery = ledger(&mut slot, "Plant and Machinery", "Fixed Assets", "");
        let software = ledger(&mut slot, "Software subscriptions", "Indirect Expenses", "");
        let (fixed_assets, indirect) = (group_id(&slot, "Fixed Assets"), group_id(&slot, "Indirect Expenses"));
        alter_ledger(&mut slot, &machinery, &LedgerInput {
            name: "Plant and Machinery".into(),
            group_id: fixed_assets,
            opening: String::new(),
            credit_days: None,
            tax_id: None,
            tax_id_override: None,
            tax_component: None,
            tax_side: None,
            mailing: None,
            tax_class: Some("8462".into()),
            pan: None,
            tds: None,
        })
        .unwrap();
        alter_ledger(&mut slot, &software, &LedgerInput {
            name: "Software subscriptions".into(),
            group_id: indirect,
            opening: String::new(),
            credit_days: None,
            tax_id: None,
            tax_id_override: None,
            tax_component: None,
            tax_side: None,
            mailing: None,
            tax_class: Some("RCM:997331".into()),
            pan: None,
            tds: None,
        })
        .unwrap();
        let mut tax = BTreeMap::new();
        for (name, component, side) in [
            ("Output CGST", "CGST", TaxSide::Output),
            ("Output SGST", "SGST", TaxSide::Output),
            ("Output IGST", "IGST", TaxSide::Output),
            ("Input IGST", "IGST", TaxSide::Input),
        ] {
            let id = ledger(&mut slot, name, "Duties & Taxes", "");
            set_ledger_tax(&mut slot, &id, component, side).unwrap();
            tax.insert(name, id);
        }
        let nos = save_unit(&mut slot, "", "Nos", "", 0).unwrap();
        let laptop = save_stock_item(&mut slot, &StockItemInput {
            id: String::new(),
            name: "Laptop".into(),
            group_id: String::new(),
            unit_id: nos.id,
            opening_qty: "10".into(),
            opening_rate: "30000".into(),
            opening_value: String::new(),
            tax_class: "847130".into(),
            costing: None,
        })
        .unwrap()
        .id;
        let line = |ledger: &str, side: DrCr, amount: &str, qty: &str, rate: &str| {
            let mut e = entry(ledger, side, amount);
            e.items = items(&laptop, qty, rate);
            e
        };
        let mut post = |kind: &str, date: &str, entries| post_voucher(&mut slot, voucher(kind, date, entries)).unwrap();
        post("Sales", "2025-05-02", vec![entry(&buyer, DrCr::Dr, "118000"), line(&sales, DrCr::Cr, "100000", "2", "50000"), entry(&tax["Output IGST"], DrCr::Cr, "18000")]);
        post("Sales", "2025-06-03", vec![
            entry(&walk_in, DrCr::Dr, "47200"),
            line(&sales, DrCr::Cr, "40000", "1", "40000"),
            entry(&tax["Output CGST"], DrCr::Cr, "3600"),
            entry(&tax["Output SGST"], DrCr::Cr, "3600"),
        ]);
        post("CreditNote", "2025-07-10", vec![entry(&buyer, DrCr::Cr, "59000"), line(&sales, DrCr::Dr, "50000", "1", "50000"), entry(&tax["Output IGST"], DrCr::Dr, "9000")]);
        post("Sales", "2025-09-01", vec![entry(&sez, DrCr::Dr, "45000"), line(&sales, DrCr::Cr, "45000", "1", "45000")]);
        post("Purchase", "2025-05-05", vec![entry(&supplier, DrCr::Cr, "106200"), line(&purchase, DrCr::Dr, "90000", "3", "30000"), entry(&tax["Input IGST"], DrCr::Dr, "16200")]);
        post("Purchase", "2025-06-05", vec![entry(&supplier, DrCr::Cr, "59000"), entry(&machinery, DrCr::Dr, "50000"), entry(&tax["Input IGST"], DrCr::Dr, "9000")]);
        post("DebitNote", "2025-07-05", vec![entry(&supplier, DrCr::Dr, "35400"), line(&purchase, DrCr::Cr, "30000", "1", "30000"), entry(&tax["Input IGST"], DrCr::Cr, "5400")]);
        // Import of services on reverse charge: IGST owed (output) and taken as credit (input).
        post("Purchase", "2025-10-05", vec![
            entry(&foreign, DrCr::Cr, "20000"),
            entry(&software, DrCr::Dr, "20000"),
            entry(&tax["Input IGST"], DrCr::Dr, "3600"),
            entry(&tax["Output IGST"], DrCr::Cr, "3600"),
        ]);
        // Next year: not in FY 2025-26.
        post("Sales", "2026-04-02", vec![entry(&buyer, DrCr::Dr, "1180"), line(&sales, DrCr::Cr, "1000", "1", "1000"), entry(&tax["Output IGST"], DrCr::Cr, "180")]);
        (f, slot)
    }

    #[test]
    fn sample_books_give_the_expected_tables() {
        let (_f, slot) = sample_books("gstr9-books");
        let g = gstr9(&slot, 2025).unwrap();
        assert_eq!((g.gstin.as_deref(), g.ret.fy.as_str(), g.can_edit), (Some("27AAPFU0939F1ZV"), "2025-26", true));
        let v = |id: &str, k: &str| g.ret.value(id, k);
        assert_eq!((v("4A", "txval"), v("4A", "camt")), (dec!(40000), dec!(3600)));
        assert_eq!((v("4B", "txval"), v("4B", "iamt")), (dec!(100000), dec!(18000)));
        assert_eq!((v("4I", "txval"), v("4I", "iamt")), (dec!(50000), dec!(9000)));
        assert_eq!(v("5B", "txval"), dec!(45000), "the SEZ supply under LUT");
        assert_eq!((v("4G", "txval"), v("4G", "iamt")), (dec!(20000), dec!(3600)));
        assert_eq!(v("4N", "txval"), dec!(110000));
        assert_eq!(v("5N", "txval"), dec!(135000), "4N + 5M − 4G");
        assert_eq!(v("6B-IP", "iamt"), dec!(10800), "goods less the purchase return");
        assert_eq!(v("6B-CG", "iamt"), dec!(9000), "the machine is under Fixed Assets");
        assert_eq!(v("6F", "iamt"), dec!(3600), "reverse charge from a supplier abroad");
        assert_eq!(v("6A", "iamt"), dec!(23400));
        // GSTR-9C 5A: the sales accounts for the year (net of the return; the April 2026 sale is out).
        assert_eq!(v("9C-5A", "txval"), dec!(135000));
        assert_eq!(v("9C-5R", "txval"), dec!(0));
        let t17: Vec<_> = g.ret.hsn_outward.iter().map(|h| (h.hsn.as_str(), h.uqc.as_str(), h.rate, h.qty, h.amounts.taxable)).collect();
        // The SEZ line keeps the rate on file (as in GSTR-1 Table 12), with no tax.
        assert_eq!(t17, [("847130", "NOS", dec!(18), dec!(3), dec!(135000))]);
        let t18: Vec<_> = g.ret.hsn_inward.iter().map(|h| (h.hsn.as_str(), h.rate, h.amounts.taxable)).collect();
        assert_eq!(t18, [("8462", dec!(18), dec!(50000)), ("847130", dec!(18), dec!(60000)), ("997331", dec!(18), dec!(20000))]);
        // Drill-down to the vouchers.
        let docs = gstr9_docs(&slot, 2025, "4I").unwrap();
        assert_eq!((docs.len(), docs[0].kind, docs[0].inward), (1, returns::DocKind::CreditNote, false));
        let key = g.ret.hsn_outward[0].key.clone();
        assert_eq!(gstr9_docs(&slot, 2025, &key).unwrap().len(), 4);
        assert!(gstr9(&slot, 2016).is_err());
    }

    #[test]
    fn entries_are_a_shared_record_per_year() {
        let (_f, mut slot) = sample_books("gstr9-entries");
        let mut values = BTreeMap::new();
        values.insert("txval".to_owned(), "1,500".to_owned());
        let g = gstr9_set_row(&mut slot, 2025, "5D", Some(values)).unwrap();
        assert_eq!(g.ret.value("5D", "txval"), dec!(1500));
        assert_eq!(g.ret.value("5N", "txval"), dec!(136500));
        let stored = store_of(&slot).unwrap().record("gst.gstr9.2025-26").unwrap().unwrap();
        assert!(stored.contains("\"5D\""), "{stored}");
        assert!(khata_store::records::is_shared_key("gst.gstr9.2025-26"), "it syncs with the company");
        // Another year is untouched; totals cannot be entered; blank clears.
        assert_eq!(gstr9(&slot, 2024).unwrap().ret.value("5D", "txval"), dec!(0));
        assert!(gstr9_set_row(&mut slot, 2025, "5N", Some(BTreeMap::new())).unwrap_err().contains("total"));
        let blank: BTreeMap<String, String> = [("txval".to_owned(), " ".to_owned())].into();
        let g = gstr9_set_row(&mut slot, 2025, "5D", Some(blank)).unwrap();
        assert_eq!(g.ret.value("5D", "txval"), dec!(0));
        assert!(store_of(&slot).unwrap().record("gst.gstr9.2025-26").unwrap().is_none());
    }

    #[test]
    fn exports_json_and_csv() {
        let (_f, slot) = sample_books("gstr9-export");
        let j: serde_json::Value = serde_json::from_str(&gstr9_json(&slot, 2025).unwrap()).unwrap();
        assert_eq!((j["gstin"].as_str(), j["fp"].as_str()), (Some("27AAPFU0939F1ZV"), Some("032026")));
        assert_eq!(j["table5"]["sez"]["txval"], serde_json::json!(45000.0));
        assert_eq!(j["table6"]["ios"]["iamt"], serde_json::json!(3600.0));
        assert!(gstr9_csv(&slot, 2025, "18").unwrap().contains("\r\n8462,,NA,0,50000,N,18,9000,0,0,0\r\n"));
        let hsn = gstr1_hsn_csv(&slot, "2025-04-01", "2026-03-31", "all").unwrap();
        assert!(hsn.starts_with("HSN,Description,UQC,Total Quantity,Total Value,Rate,Taxable Value"));
        assert!(hsn.contains("\r\n847130,,NOS,1,59000,18,50000,9000,0,0,0\r\n"), "{hsn}");
    }

    #[test]
    fn reconciles_with_portal_files() {
        let (_f, slot) = sample_books("gstr9-recon");
        let portal = serde_json::json!({ "data": { "gstin": "27AAPFU0939F1ZV", "fp": "032026",
            "table4": { "b2b": { "txval": 100000, "iamt": 18000, "camt": 0, "samt": 0, "csamt": 0 },
                        "b2c": { "txval": 39000, "iamt": 0, "camt": 3510, "samt": 3510, "csamt": 0 } },
            "table8": { "itc_2b": { "iamt": 20000, "camt": 0, "samt": 0, "csamt": 0 } } } });
        let files = [PickedFile { name: "GSTR9.json".into(), text: portal.to_string() }];
        let r = gstr9_reconcile(&slot, 2025, &files, None).unwrap();
        assert!(!r.other_gstin);
        let line = |row: &str, k: &str| r.recon.lines.iter().find(|l| l.row == row && l.key == k).unwrap().clone();
        assert_eq!(line("4B", "txval").status, ReconStatus::Matched);
        let b2c = line("4A", "txval");
        assert_eq!((b2c.status, b2c.difference), (ReconStatus::Differs, dec!(1000)));
        assert_eq!(line("8A", "iamt").portal, Some(dec!(20000)));
        // ₹1,000 tolerance accepts 4A's taxable value.
        let r = gstr9_reconcile(&slot, 2025, &files, Some("1000")).unwrap();
        assert_eq!(r.recon.lines.iter().find(|l| l.row == "4A" && l.key == "txval").unwrap().status, ReconStatus::Matched);
        let other = [PickedFile { name: "x.json".into(), text: portal.to_string().replace("27AAPFU0939F1ZV", "29AAGCB7383J1Z4") }];
        assert!(gstr9_reconcile(&slot, 2025, &other, None).unwrap().other_gstin);
        assert!(gstr9_reconcile(&slot, 2025, &[], None).is_err());
        assert!(read_json_file("gstr9.csv").is_err());
    }
}
