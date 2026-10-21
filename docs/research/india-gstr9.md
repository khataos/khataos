# India GST annual return: GSTR-9 and GSTR-9C

> **Status as of:** 2026-10-21. Clean-room research for KhataOS. **Not legal
> advice.** Every fact carries a source tag `[Sn]` that points to the Sources
> list at the end. Only government texts are used as sources: the CGST Act and
> Rules on the CBIC tax information site, CBIC notifications and circulars, GST
> Council publications and GSTN portal manuals and FAQs. Tags:
> **[PRIMARY]** read in the law, a notification or a circular;
> **[PORTAL]** read in a GSTN manual or FAQ (describes the portal, not the law);
> **[UNCERTAIN]** not confirmed, or a reading KhataOS had to make.
>
> Access note: `gst.gov.in` hosts (tutorial, developer, www) did not resolve
> from the research machine (the `gst.gov.in` name servers did not answer).
> GSTN pages were read from Internet Archive copies of the official URLs; the
> snapshot date is given with each one. Gazette notifications were read in the
> reprints hosted by the ICAI GST and Indirect Taxes Committee (a statutory
> body), because the CBIC copies of 2023 to 2025 notifications could not be
> fetched; the text is the gazette text.

Related: `india-compliance.md` §5 (returns), `india-gst-advanced.md` (GSTR-2B,
Rule 37, Rule 42).

## 1. Who files, and when

| Rule | Source |
|---|---|
| Every registered person files an annual return for each financial year, except an Input Service Distributor, persons paying tax under s.51 or s.52, casual and non-resident taxable persons, and government departments or local authorities whose books are audited by the CAG | CGST Act s.44(1) and second proviso [S15]; Rule 80(1) [S17] [PRIMARY] |
| Form: GSTR-9 (composition taxpayers: GSTR-9A; e-commerce operators collecting TCS: GSTR-9B) | Rule 80(1), (2) [S17] [PRIMARY] |
| Due date: 31 December following the end of the financial year (FY 2020-21 was 28 February 2022) | Rule 80(1), (1A) [S17] [PRIMARY] |
| No annual return may be filed more than three years after its due date (the Government may relax this by notification) | CGST Act s.44(2) [S15] [PRIMARY] |
| All GSTR-1 (or IFF) and GSTR-3B of the year must be filed before GSTR-9 opens | Form GSTR-9 instruction 2 [S1]; GSTN FAQ Q9, Q16 [S21]; FY 2024-25 FAQ Q1, Q2 [S19] [PRIMARY, PORTAL] |
| Filed per GSTIN, not per PAN | GSTN FAQ Q15 [S21] [PORTAL] |
| Cannot be revised once filed | GSTN FAQ Q43 [S21] [PORTAL] |
| Unclaimed ITC cannot be claimed through GSTR-9; extra liability found can be declared and paid through DRC-03 | Instruction 3 and 9 [S1]; FAQ Q35, Q36 [S21] [PRIMARY, PORTAL] |
| DRC-03 payment from the cash ledger only; from the 13/2025 amendment, "electronic cash ledger or electronic credit ledger" (para 9 of GSTR-9 and para 8 of GSTR-9C instructions) | Notif. 13/2025-CT, cl. 9(B)(vii) and 10(b)(iii) [S6] [PRIMARY] |
| Nil GSTR-9 is allowed when there were no supplies, purchases, ITC, refund, demand or late fee | GSTN FAQ Q10 [S21] [PORTAL] |

### 1.1 Exemption up to ₹2 crore

The Commissioner may exempt a class of persons from the annual return (s.44(1)
first proviso) [S15].

| FY | Exemption for aggregate turnover up to ₹2 crore | Source |
|---|---|---|
| 2017-18, 2018-19 | Optional under the special procedure | Notif. 47/2019-CT dated 09.10.2019 (s.148) [S12] [PRIMARY: cited inside 77/2020] |
| 2019-20 | Extended to FY 2019-20 | Notif. 77/2020-CT dated 15.10.2020 amending 47/2019-CT [S12] [PRIMARY]; CBIC press release 09.10.2020 ("mandatory only for taxpayers with aggregate annual turnover above Rs. 2 Cr.") [S23] |
| 2020-21 | Exempt | Notif. 31/2021-CT dated 30.07.2021 [S11] [PRIMARY] |
| 2021-22 | Exempt | Notif. 10/2022-CT dated 05.07.2022 [S10] [PRIMARY] |
| 2022-23 | Exempt | Notif. 32/2023-CT dated 31.07.2023 [S9] [PRIMARY] |
| 2023-24 | Exempt | Notif. 14/2024-CT dated 10.07.2024 [S8] [PRIMARY] |
| 2024-25 **onwards** | "in respect of filing of annual return for the financial year 2024-25 onwards, hereby exempts the registered person whose aggregate turnover in any financial year is up to two crore rupees" | Notif. 15/2025-CT dated 17.09.2025 [S7] [PRIMARY]; GST Council newsletter Sept 2025 [S22] |

So FY 2025-26 is covered by 15/2025-CT (standing exemption). Nothing found
withdrawing it as of 2026-10-21. KhataOS treats the exemption as making filing
optional, so a person under ₹2 crore may still file [UNCERTAIN: the
notifications say "exempts"; the GSTN FAQ Q4 says GSTR-9 "may, however, be made
optional for taxpayers having AATO up to a certain threshold" [S21]].

### 1.2 GSTR-9C (reconciliation statement)

| Rule | Source |
|---|---|
| Required when aggregate turnover in the FY **exceeds ₹5 crore**; **self-certified** (no CA or cost accountant certification) since 01.08.2021 | Rule 80(3) as substituted by Notif. 30/2021-CT dated 30.07.2021 [S2, S17] [PRIMARY] |
| Part B (auditor certification) omitted; new self-verification text; Pt. V heading becomes "Additional Liability due to non-reconciliation" | Notif. 30/2021-CT cl. 4 [S2] [PRIMARY] |
| Filed along with GSTR-9, same due date (31 December) | Rule 80(3) [S17] [PRIMARY] |
| Before 01.08.2021: audit by CA or CMA above ₹2 crore (₹5 crore for FY 2018-19 and 2019-20) | Rule 80(3) old text, footnote on the CBIC page [S17] [PRIMARY] |

## 2. GSTR-9 structure (Parts I to VI)

Base form: Notif. 74/2018-CT dated 31.12.2018, as amended (consolidated text
in the CBIC forms compilation, pages 174 to 193) [S1]. Later rows come from
12/2024-CT [S5] and 13/2025-CT [S6]. Columns for Tables 4, 10 and 11: taxable
value, CGST, SGST/UTGST, IGST, cess. Table 5: taxable value only (the form shows
tax columns, but nothing is payable) [S1].

**Pt. I Basic details**: 1 financial year, 2 GSTIN, 3A legal name, 3B trade
name [S1].

**Pt. II Outward and inward supplies.**

Table 4, supplies on which tax is payable [S1]:

| Row | Text | Fill from (instructions) |
|---|---|---|
| 4A | Supplies to unregistered persons (B2C) | GSTR-1 Tables 5, 7 with amendments in 9, 10; net of credit and debit notes; includes e-commerce |
| 4B | Supplies to registered persons (B2B), incl. UIN, excl. reverse charge | GSTR-1 4A, 4C |
| 4C | Exports on payment of tax (except to SEZ) | GSTR-1 6A |
| 4D | Supplies to SEZ on payment of tax | GSTR-1 6B |
| 4E | Deemed exports | GSTR-1 6C |
| 4F | Advances on which tax paid but invoice not issued | GSTR-1 11A |
| 4G | Inward supplies on which tax is paid on reverse charge (incl. import of services) | GSTR-3B 3.1(d) |
| 4G1 | Supplies on which the e-commerce operator pays tax under s.9(5) [operator reports] (inserted by 12/2024) | GSTR-1 Tables 15, 15A [S5] |
| 4H | Sub-total (A to G1) | auto |
| 4I | Credit notes on 4B to 4E (-) | GSTR-1 9B |
| 4J | Debit notes on 4B to 4E (+) | GSTR-1 9B |
| 4K | Supplies or tax declared through amendments (+) | GSTR-1 9A, 9C |
| 4L | Supplies or tax reduced through amendments (-) | GSTR-1 9A, 9C |
| 4M | Sub-total (I to L) | auto |
| 4N | Supplies and advances on which tax is to be paid (H + M) | auto |

"FORM GSTR-1" in these instructions reads "FORM GSTR-1 as amended by FORM
GSTR-1A, if any" from 12/2024 [S5].

Table 5, outward supplies on which tax is not payable [S1, S5]:

| Row | Text |
|---|---|
| 5A | Zero rated exports without payment of tax |
| 5B | Supplies to SEZ without payment of tax |
| 5C | Supplies on which the recipient pays tax on reverse charge (GSTR-1 4B) |
| 5C1 | Supplies through an e-commerce operator who pays tax under s.9(5) [supplier reports] (inserted by 12/2024; GSTR-1 14(b), 14A(b)) |
| 5D | Exempted |
| 5E | Nil rated |
| 5F | Non-GST supply (includes "no supply") |
| 5G | Sub-total (A to F) |
| 5H | Credit notes on A to F (-) |
| 5I | Debit notes on A to F (+) |
| 5J | Supplies declared through amendments (+) |
| 5K | Supplies reduced through amendments (-) |
| 5L | Sub-total (H to K) |
| 5M | Turnover on which tax is not to be paid (G + L) |
| 5N | Total turnover incl. advances (4N + 5M - 4G - 4G1); excludes reverse charge inward supplies and s.9(5) supplies |

**Pt. III ITC for the financial year.** Columns: CGST, SGST/UTGST, IGST, cess;
6B to 6E also have a "type" split [S1].

Table 6, ITC availed [S1, S6]:

| Row | Text |
|---|---|
| 6A | Total ITC availed through GSTR-3B (sum of 3B Table 4A) `<Auto>` |
| 6A1 | ITC of the preceding FY availed in this FY (included in 6A), other than ITC reclaimed under Rule 37 and 37A (from FY 2024-25) |
| 6A2 | Net ITC of the FY = A - A1 (from FY 2024-25) |
| 6B | Inward supplies other than imports and reverse charge (incl. services from SEZ): inputs / capital goods / input services (3B 4(A)(5)) |
| 6C | Reverse charge from unregistered persons: inputs / capital goods / input services (3B 4(A)(3)) |
| 6D | Reverse charge from registered persons: inputs / capital goods / input services (3B 4(A)(3)) |
| 6E | Import of goods incl. from SEZ: inputs / capital goods (3B 4(A)(1)) |
| 6F | Import of services, excluding from SEZ (3B 4(A)(2)) |
| 6G | ITC received from ISD (3B 4(A)(4)) |
| 6H | ITC reclaimed under the Act (the words "other than B above" omitted by 13/2025) |
| 6I | Sub-total (B to H) |
| 6J | Difference (I - A); from FY 2024-25 "(I - A2)", auto populated |
| 6K | Transition credit through TRAN-I (incl. revisions) |
| 6L | Transition credit through TRAN-II |
| 6M | Any other ITC; from 13/2025 "ITC availed through ITC-01, ITC-02 and ITC-02A (other than GSTR-3B and TRAN forms)" |
| 6N | Sub-total (K to M) |
| 6O | Total ITC availed (I + N) |

For FY 2024-25 onwards: ITC availed, reversed and reclaimed is shown as the
first availment in 6B, the reversal in Table 7, and the reclaim only in 6H.
Prior-year ITC reversed under Rule 37 or 37A and reclaimed this year goes to
6H; prior-year ITC reversed for other reasons and reclaimed this year goes to
6A1, not 6H [S6 cl. 9(B)(iv)(B), (C), (E); S19 Q6 to Q9, Q24].

Table 7, ITC reversed and ineligible [S1, S6]:

| Row | Text |
|---|---|
| 7A | As per Rule 37 |
| 7A1 | As per Rule 37A (inserted by 13/2025) |
| 7A2 | As per Rule 38 (inserted by 13/2025) |
| 7B | As per Rule 39 |
| 7C | As per Rule 42 |
| 7D | As per Rule 43 |
| 7E | As per section 17(5) |
| 7F | Reversal of TRAN-I credit |
| 7G | Reversal of TRAN-II credit |
| 7H | Other reversals (please specify); includes ITC-03 and any reversal not listed above |
| 7I | Total ITC reversed (A to H) |
| 7J | Net ITC available for utilisation (6O - 7I) |

Table 4(B) of GSTR-3B "may be used" to fill Table 7 [S1, S6]. The user asked
about Rule 37A splitting 7A into 7A1 and 7A2: the notified split is 7A1 = Rule
37A and 7A2 = Rule 38 (not two halves of Rule 37) [S6] [PRIMARY].

Table 8, other ITC information [S1, S5, S6]:

| Row | Text |
|---|---|
| 8A | ITC as per GSTR-2A (Tables 3 and 5) up to FY 2022-23; **GSTR-2B Table 3(I) from FY 2023-24** `<Auto>` |
| 8B | ITC as per 6B and 6H `<Auto>`; **from FY 2024-25 "ITC as per 6(B) above" only** |
| 8C | ITC on inward supplies (8A type) received in the FY but availed in the next FY up to the specified period |
| 8D | Difference [A - (B + C)] (may be negative) |
| 8E | ITC available but not availed |
| 8F | ITC available but ineligible |
| 8G | IGST paid on import of goods (incl. from SEZ) |
| 8H | IGST credit availed on import of goods (as per 6E) "in the financial year" `<Auto>` |
| 8H1 | IGST credit on import of goods availed in the next financial year (out of 8G) (inserted by 13/2025) |
| 8I | Difference (G - H); from 13/2025 "G - (H + H1)" |
| 8J | ITC available but not availed on import of goods (equal to I) |
| 8K | Total ITC to be lapsed in the current FY (E + F + J) `<Auto>` |

**Pt. IV Table 9, tax paid as declared in returns** [S1, S6]. Rows: IGST,
CGST, SGST/UTGST, cess, interest, late fee, penalty, other. Columns up to FY
2023-24: (1) description, (2) tax payable, (3) paid through cash, (4 to 7)
paid through ITC as CGST, SGST/UTGST, IGST, cess. From 13/2025 two columns are
added: (8) total tax paid = 3+4+5+6+7 and (9) difference = 2 - 8. Source in
books: GSTR-3B Table 6.1 [S1 instruction 6].

**Pt. V Tables 10 to 14, transactions of the FY declared in the next FY's
returns** [S1, S6]:

| Row | Text (13/2025 wording) |
|---|---|
| 10 | Supplies or tax declared through invoices, debit notes or amendments (+) (earlier: "through Amendments (+) (net of debit notes)") |
| 11 | Supplies or tax reduced through amendments or credit notes (-) |
| 12 | ITC of the FY reversed in the next FY (not part of Table 7) |
| 13 | ITC of the FY availed in the next FY (Rule 37 or 37A reclaims excluded; they go to 6H of the next year) |
| 14 | Differential tax paid on account of 10 and 11: payable, paid, difference (2 - 3) for IGST, CGST, SGST/UTGST, cess, interest |

The "specified period" for Part V by FY [S1, S2, S3, S4, S5, S6]:
2017-18: returns of Apr 2018 to Mar 2019; 2018-19 to 2020-21: April to
September of the next year; 2021-22: April to September 2022 per 14/2022, later
read as returns up to 30 November 2022 [UNCERTAIN: amending notification not
read; 38/2023 refers to "filed upto 30th November, 2022"]; 2022-23: April to
October 2023 filed up to 30 November 2023; 2023-24: April to October 2024 filed
up to 30 November 2024; 2024-25 onwards: April to October of the next FY filed
up to 30 November of the next FY.

**Pt. VI Other information** [S1]:

| Table | Content |
|---|---|
| 15A to 15D | Refund claimed, sanctioned, rejected, pending (IGST, CGST, SGST, cess, interest, penalty, late fee/others) |
| 15E to 15G | Demand of taxes confirmed by order, taxes paid against it, demand pending |
| 16A | Supplies received from composition taxpayers (3B Table 5) |
| 16B | Deemed supply to job worker under s.143(3), (4) |
| 16C | Goods sent on approval, not returned within 180 days |
| 17 | HSN summary of outward supplies: HSN code, UQC, total quantity, taxable value, rate, CGST, SGST/UTGST, IGST, cess. Fill from GSTR-1 Table 12 |
| 18 | HSN summary of inward supplies, same columns; only for inward supplies that are 10% or more of total inward value |
| 19 | Late fee payable and paid: CGST, SGST (payable, paid) |

**HSN digits for Tables 17 and 18.** Original instruction: optional up to ₹1.5
crore, 2 digits above ₹1.5 crore up to ₹5 crore, 4 digits above ₹5 crore [S1].
From FY 2021-22: "mandatory to report HSN code at six digits level for
taxpayers having annual turnover in the preceding year above ₹ 5.00 Cr and at
four digits level for all B2B supplies for taxpayers having annual turnover in
the preceding year upto ₹ 5.00 Cr" [S3] [PRIMARY]. This matches the invoice
rule in Notif. 78/2020-CT (4 digits up to ₹5 crore, 6 digits above, from
01.04.2021) [S14], but 78/2020 itself governs invoices (Rule 46), not GSTR-9.
The portal dropdown offers 4, 6 or 8 digits up to ₹5 crore and 6 or 8 above;
codes starting with 99 need no UQC or quantity; services use UQC "OTH" and
quantity zero [S20, S21] [PORTAL]. The "concessional rate" (65%) checkbox
exists in the portal UI up to FY 2023-24 and was removed from Tables 17 and 18
for FY 2024-25 (disabled in the offline tool) [S19 Q22] [PORTAL].

## 3. Table index

Optional column: what the instructions allow for the **latest notified year
(FY 2024-25)**; history in §4. Auto column: what the portal fills.

| Table | Description | Source in books | Optional (FY 2024-25) | Auto-filled by portal |
|---|---|---|---|---|
| 4A to 4G | Taxable outward supplies, advances, RCM inward | Sales, credit and debit notes, advances, RCM purchases | No | Yes, from GSTR-1/1A/IFF and 3B (editable) [S19 Q2, Q5; S20] |
| 4G1 | ECO s.9(5) supplies (operator) | ECO books | No | Yes [S19 Q2] [UNCERTAIN for row level] |
| 4I to 4L | Credit/debit notes, amendments | Sales returns, amendments | No (net option ended FY 2020-21) | Yes |
| 5A to 5C1 | Zero rated, SEZ, RCM outward, s.9(5) (supplier) | Sales | No | Yes |
| 5D, 5E, 5F | Exempt, nil, non-GST | Sales | 5F separate; 5D and 5E may be combined in 5D | Yes |
| 5H to 5K | Credit/debit notes and amendments on Table 5 | Sales returns | May be netted into 5A to 5F | Yes |
| 6A | ITC in 3B | 3B | No | Yes, **not editable** [S20, S21] |
| 6A1, 6A2 | Prior year ITC in this year; net | Purchase register by invoice date | No | 6A2 computed |
| 6B to 6D | ITC split inputs/capital goods/input services | Purchase register | Capital goods separate; inputs and input services may be combined | No (taxpayer splits) |
| 6E | Import of goods ITC | Bill of entry register | Split mandatory (option ended FY 2023-24) [UNCERTAIN] | No |
| 6F, 6H, 6M | Import of services, reclaimed, ITC-01/02/02A | ITC ledger | No | No |
| 6G, 6K, 6L | ISD, TRAN-I, TRAN-II | 3B / ledger | No | Yes [S21 Q19] |
| 6J | Difference | computed | n/a | Yes (FY 2024-25) |
| 7A to 7E | Rule 37, 37A, 38, 39, 42, 43, s.17(5) | Reversal journals | **No** (option to put all in 7H ended FY 2023-24) | No |
| 7F, 7G, 7H | TRAN reversals, others | Reversal journals | No | No |
| 8A | ITC per GSTR-2B (2A until FY 2022-23) | portal | n/a | Yes, **not editable**; document list in Excel |
| 8B, 8H, 8K | Derived | computed | n/a | Yes |
| 8C, 8E, 8F, 8G, 8H1 | Next year ITC, not availed, ineligible, import IGST | Purchase register, BoE | No | No |
| 9 | Tax payable and paid | Tax ledgers | No | Yes; paid columns not editable; tax payable editable [S19 Q20, S20] |
| 10, 11 | Next year amendments | Sales amendments | No (no option text found) | No |
| 12, 13 | Next year ITC reversal or availment | Purchase register | Option ended FY 2023-24; FY 2024-25 mandatory [UNCERTAIN] | No |
| 14 | Differential tax | Payments | No | No |
| 15A to 15G | Refunds and demands | Refund and demand registers | Yes | No |
| 16A to 16C | Composition, job work, approval | Purchase / stock | Yes | No |
| 17 | HSN outward | Item master, sales | No (4 or 6 digits) | Not auto filled; GSTR-1/1A Table 12 HSN Excel download offered for FY 2024-25 [S19 Q21] |
| 18 | HSN inward | Item master, purchases | **Yes** | No |
| 19 | Late fee | computed | n/a | Yes, after "Compute liabilities" [S20, S21 Q30, Q32] |

## 4. Changes by financial year

Each yearly amending notification repeats or extends the "option" sentences in
the GSTR-9 instructions. Readings below follow the exact year lists in the
amending text [PRIMARY]; where a list was not re-extended the option is taken
to have ended [UNCERTAIN as an interpretation].

| FY | Notification | What changed |
|---|---|---|
| 2017-18, 2018-19 | 56/2019-CT (14.11.2019), 31/2019-CT | Options: 4B to 4E net of credit/debit notes and amendments; 5D to 5F in "exempted" only; 6B to 6E all as inputs; 6C+6D combined; 7A to 7E into 7H; tables 12, 13, 15, 16, 17, 18 optional; 8A to 8D may be uploaded as signed PDF in GSTR-9C [S1] |
| 2019-20 | 79/2020-CT (15.10.2020) | Same options extended; capital goods split now mandatory in 6B to 6E [S1] |
| 2020-21 | 30/2021-CT (30.07.2021) | Same options extended [S2]; GSTR-9C self-certified |
| 2021-22 | 14/2022-CT (05.07.2022) | 5F reported separately (5D, 5E may still be combined); 5H to 5K, 6B to 6E, 7A to 7H, 12, 13, 15, 16 options extended; **HSN 6 digits above ₹5 crore, 4 digits up to ₹5 crore; Table 18 optional; Table 17 mandatory** [S3] |
| 2022-23 | 38/2023-CT (04.08.2023) | Same options extended, Table 18 optional; Part V period April to October, filed up to 30 November [S4] |
| 2023-24 | 12/2024-CT (10.07.2024) | Options extended (6B to 6E, 7A to 7H, 12, 13, 15, 16, 18); rows **4G1, 5C1** added (ECO s.9(5)); GSTR-1 read with GSTR-1A; **Table 8A from GSTR-2B Table 3(I)** [S5] |
| 2024-25 | 13/2025-CT (17.09.2025, in force 22.09.2025) | New rows **6A1, 6A2, 7A1 (Rule 37A), 7A2 (Rule 38), 8H1**; 6J auto; 8B = 6B only; Table 9 gets total paid and difference columns; Tables 10 to 14 relabelled; options extended for 5D to 5F, 5H to 5K, 6B, 6C, 6D, 15, 16, 18; **not** extended for 6E, 7A to 7E, 12, 13 [S6]. GSTR-9 enabled only after all GSTR-1 and 3B filed; Tables 4, 5, 6, 8, 9 auto populated from GSTR-1/1A/IFF, 2B, 3B [S19] |
| 2025-26 | none found | No GSTR-9 form amendment for FY 2025-26 found as of 2026-10-21 (CBIC Central Tax notifications 1/2026 and 2/2026 do not touch GSTR-9). The FY 2024-25 FAQ says next year's reporting "may subject to change based on any amendments/changes notified for GSTR 9 of FY 2025-26" [S19]. If nothing is notified, the FY 2024-25 form applies and the year-bound options (which list FYs up to 2024-25) would not cover FY 2025-26 [UNCERTAIN] |

**Table 8A source per FY** [S1, S5, S19, S20, S21]:

| FY | 8A auto-populated from |
|---|---|
| 2017-18 | GSTR-2A (Tables 3 and 5) as generated on 1 May 2019 |
| 2018-19 | GSTR-2A as on 1 November 2019 |
| 2019-20 | GSTR-2A as on 1 November 2020 |
| 2020-21 to 2022-23 | GSTR-2A (Tables 3 and 5), documents from filed GSTR-1 or GSTR-5 of suppliers |
| 2023-24 onwards | GSTR-2B Table 3(I) "pertaining to the financial year" |
| 2024-25 (portal detail) | Documents of FY 2024-25 in GSTR-2B, plus FY 2024-25 documents appearing in 2B of April to October 2025, minus FY 2023-24 documents appearing in 2B of April to October 2024; IMS accepted or deemed accepted records flow through 2B [S19 Q3, Q4, Q14] |

## 5. What the portal pre-fills and lets you download

| Item | Detail | Source |
|---|---|---|
| Computation | The portal computes GSTR-9 values from filed GSTR-1 and GSTR-3B and from GSTR-2A (now 2B) and fills them in editable form, except 6A, 8A and Table 9 paid columns | Manual §13 note [S20]; FAQ Q19 to Q21, Q29 [S21] |
| FY 2024-25 | "All the relevant cells of Table 4,5,6,8 and 9 of GSTR 9 will be auto populated based on ... GSTR 1/1A/IFF or GSTR 2B or GSTR 3B"; 1A amendments count for Tables 4 and 5 | FAQ Q2, Q5 [S19] |
| Variance highlight | Entered values more than 20% away from the computed value are highlighted red | Manual §14 [S20] |
| Download GSTR-9 system computed summary | **PDF** | Manual 13.1 [S20]; FAQ Q24 [S21] |
| Download GSTR-1/IFF summary | **PDF**, all periods of the FY | Manual 13.2 [S20]; FAQ Q25 [S21] |
| Download GSTR-3B summary | **PDF**, all periods | Manual 13.3 [S20]; FAQ Q26 [S21] |
| Download Table 8A document details | **Excel** in a zip (split into parts when large); sheets B2B, B2BA, CDNR, CDNRA. Excel may show records that the online 8A excludes (RCM, PoS amendments, documents moved across years) | Manual 13.4 [S20]; FAQ Q27, Q28 [S21]; FY 2024-25 FAQ Q11 to Q13 [S19] |
| Download Table 12 of GSTR-1/1A HSN details | **Excel**, with an extra sheet in Table 17 layout (FY 2024-25) | FAQ Q21 [S19] |
| Preview draft GSTR-9 | **PDF** (watermarked draft) and **Excel** (zip) | Manual §15, §22 [S20]; FAQ Q42 [S21] |
| Filed GSTR-9 | PDF and Excel | FAQ Q44 [S21] |
| Offline tool | An offline tool exists for GSTR-9 ("Yes. Form GSTR-9 return can be filed through offline tool") with its own manual, `tutorial.gst.gov.in/downloads/gstr9offlineutility.pdf` (listed by search engines as "Last Updated on: 8 September 2026") | FAQ Q12 [S21]; manual itself **not retrieved** [UNCERTAIN] |
| JSON download | No official text read that names a "Download GSTR-9 details (JSON)" button. The offline tool imports a portal JSON (see §7) [UNCERTAIN] | — |
| Late fee | "Compute liabilities" computes late fee; Table 19 opens after that; cannot file without paying it | FAQ Q30 to Q33 [S21]; Manual §16 to §20 [S20] |
| Table 17 check | Compute liabilities without Table 17 gives an error; Table 17 is not mandatory where the prior-year turnover was above ₹5 crore and the current year liability is nil (from FY 2021-22) | Manual §12 note, 14.11.3 [S20] |

## 6. GSTR-9C structure (Part A)

Base form in [S1] (pages 200 onwards), amended by 30/2021 [S2], 38/2023 [S4],
12/2024 [S5] and 13/2025 [S6].

| Part / Table | Content |
|---|---|
| Pt. I 1 to 4 | FY, GSTIN, legal and trade name (auto), "Are you liable to audit under any Act?" |
| Pt. II **5** | Reconciliation of gross turnover: 5A turnover per audited statements for the State; adjustments 5B unbilled revenue at start (+), 5C unadjusted advances at end (+), 5D deemed supply Sch. I (+), 5E credit notes after year end in the annual return (-), 5F trade discounts not permissible (+), 5G turnover April to June 2017 (-), 5H unbilled revenue at end (-), 5I unadjusted advances at start (-), 5J credit notes not permissible (+), 5K SEZ to DTA (-), 5L composition period turnover (-), 5M s.15 valuation (+/-), 5N foreign exchange (+/-), 5O other reasons (+/-); 5P adjusted turnover (auto); 5Q turnover per GSTR-9; 5R unreconciled (Q - P), "AT1" |
| **6** | Reasons for unreconciled gross turnover (text) |
| **7** | Reconciliation of taxable turnover: 7A adjusted turnover (5P), 7B exempt/nil/non-GST/no supply, 7C zero rated without tax, 7D reverse charge supplies, **7D1 supplies on which ECO pays tax under s.9(5) (supplier reports; added by 13/2025)**, 7E taxable turnover (A - B - C - D - D1), 7F taxable turnover per GSTR-9 (from 13/2025 "(4N - 4G - 4G1)"), 7G unreconciled (F - E), "AT2" |
| **8** | Reasons (text) |
| Pt. III **9** | Rate-wise liability: 5%, 5% (RC), 6% (B-1, added by 38/2023), 12%, 12% (RC), 18%, 18% (RC), 28%, 28% (RC), 3%, 0.25%, 0.10%, K-1 others (30/2021), K-2 supplies on which ECO pays under s.9(5) (13/2025), interest, late fee, penalty, others; 9P total payable, 9Q paid per GSTR-9 (13/2025: "payable"), 9R unreconciled "PT1" |
| **10** | Reasons for unreconciled payment (text) |
| **11** | Additional amount payable but not paid (reasons in 6, 8, 10), by rate, "to be paid through cash" (13/2025: "cash or ITC"), plus others and s.9(5) row |
| Pt. IV **12** | Reconciliation of net ITC: 12A ITC per audited statements, 12B earlier-year ITC claimed this year (+), 12C this year's ITC to be claimed later (-), 12D ITC per books (auto), 12E ITC per GSTR-9, 12F unreconciled "ITC 1" |
| **13** | Reasons (text) |
| **14** | ITC declared in GSTR-9 vs ITC on expenses: 14A purchases, B freight, C power and fuel, D imported goods, E rent and insurance, F goods lost or gifted, G royalties, H employees' cost, I conveyance, J bank charges, K entertainment, L stationery, M repairs, N other miscellaneous, O capital goods, P, Q any other; R total eligible ITC (auto), S ITC per GSTR-9, T unreconciled "ITC 2" |
| **15** | Reasons (text) |
| **16** | Tax payable on unreconciled ITC: CGST, SGST, IGST, cess, interest, penalty |
| Pt. V | Additional liability due to non-reconciliation (rates, ITC, interest, late fee, penalty, erroneous refund, outstanding demands, others, s.9(5) row); "cash or ITC" from 13/2025 |
| **17** | Late fee payable and paid: IGST, CGST, SGST/UTGST (added by 13/2025; "late fee will be payable as per section 47(2)") |
| Part B | Certification by CA/CMA, omitted by 30/2021 |

**Optional in GSTR-9C** [S1, S2, S3, S4, S5, S6] [PRIMARY, reading of the
year lists]: Tables 5B to 5N may be left blank and adjustments reported in 5O;
the year list was extended each year and reached FY 2024-25 in 13/2025 ("2022-23
and 2023-24" replaced "wherever they occur" in para 4). Table 14 option
extended to FY 2024-25 (para 6). Tables 12B and 12C: option text covered FY
2017-18 to 2020-21; later notifications amended only "serial number 14" in
para 6, so 12B and 12C look mandatory from FY 2021-22 [UNCERTAIN].

**9C late fee mechanics (FY 2024-25)**: late fee runs from the due date until
the complete annual return (GSTR-9 plus 9C) is furnished; the portal charges
the GSTR-9 part when GSTR-9 is filed and the rest in 9C Table 17
[S18 para 3.3; S19 Q23].

## 7. JSON format

**What official sources confirm.** No official public document read for this
research shows GSTR-9 JSON key names. The GSTN developer portal
(`developer.gst.gov.in`, API list and the release note
`/pages/apiportal/data/ReleaseNotes/Release_notes_Gstr9_Gstr9c_API.pdf`, "GSTR-9
and GSTR-9C Changes for FY 2024-25 for API Version 3.0") could not be reached
or found in the Internet Archive. GSTN FAQ and manual confirm only that an
offline tool and portal JSON exist (FAQ Q12) [S21].

**What was observed instead (not sources, listed for validation):**
(a) a GSTR-9 JSON downloaded from the portal for FY 2021-22, named
`returns_29122022_R9_<GSTIN>_offline_others_0.json`, found in a public code
repository; (b) GSP API documentation that mirrors the GSTN "GSTR9 save", "GSTR9
details" and "GSTR9 auto calculated details" calls; (c) open source client
code. Confidence: **M** = in the portal-generated file and in GSP docs;
**L** = GSP docs or third-party code only; **?** = not found. Validate every
key against the current offline tool's import and export before shipping.

Envelope: `gstin` (M); `fp` (M) = return period as `MMYYYY` of the last month
of the FY, e.g. `"032022"` for FY 2021-22 (M); each table object carries
`chksum` in downloads (M) and `flag` in save requests (L). Auto-calculated
response also has `hsnMinLen` (L). Amount fields: `txval`, `iamt`, `camt`,
`samt`, `csamt` (M); export and SEZ rows carry no `camt`/`samt` (M).

| Form row | Key | Conf. |
|---|---|---|
| 4A, 4B, 4C, 4D, 4E, 4F, 4G | `table4.b2c`, `b2b`, `exp`, `sez`, `deemed`, `at`, `rchrg` | M |
| 4G1 | `table4.ecom` | L |
| 4H | `table4.sub_totalAG` (from FY 2023-24 possibly `sub_totalAG1`) | M / L |
| 4I, 4J, 4K, 4L | `table4.cr_nt`, `dr_nt`, `amd_pos`, `amd_neg` | M |
| 4M, 4N | `table4.sub_totalIL`, `sup_adv` | M |
| 5A, 5B, 5C, 5D, 5E, 5F | `table5.zero_rtd`, `sez`, `rchrg`, `exmt`, `nil`, `non_gst` | M |
| 5C1 | `table5.ecom_14` | L |
| 5G, 5H, 5I, 5J, 5K, 5L | `table5.sub_totalAF`, `cr_nt`, `dr_nt`, `amd_pos`, `amd_neg`, `sub_totalHK` | M |
| 5M, 5N | `table5.tover_tax_np`, `total_tover` | M |
| 6A | `table6.itc_3b` | M |
| 6B, 6C, 6D | `table6.supp_non_rchrg[]`, `supp_rchrg_unreg[]`, `supp_rchrg_reg[]`, each item with `itc_typ` = `ip` (inputs), `cg` (capital goods), `is` (input services) | M |
| 6E | `table6.iog[]` with `itc_typ` `ip` or `cg` (IGST and cess only) | M |
| 6F, 6G, 6H | `table6.ios`, `isd`, `itc_clmd` | M |
| 6I, 6J | `table6.sub_totalBH`, `difference` | M |
| 6K, 6L, 6M, 6N, 6O | `table6.tran1`, `tran2` (CGST, SGST only), `other`, `sub_totalKM`, `total_itc_availed` | M |
| 6A1, 6A2 | not found | ? |
| 7A, 7B, 7C, 7D, 7E | `table7.rule37`, `rule39`, `rule42`, `rule43`, `sec17` | L |
| 7F, 7G, 7H | `table7.revsl_tran1`, `revsl_tran2`, `other[]` (with `desc`) | L |
| 7I, 7J | `table7.tot_itc_revd`, `net_itc_aval` | L / M |
| 7A1, 7A2 | not found | ? |
| 8A | `table8.itc_2a`; auto-calculated response also shows `itc_2b` | M / L |
| 8B, 8C, 8D | `table8.itc_tot`, `itc_inwd_supp`, `differenceABC` | M / L / M |
| 8E, 8F, 8G | `table8.itc_nt_availd`, `itc_nt_eleg`, `iog_taxpaid` (mapping inferred from order; GSP descriptions are shifted by one row) | L |
| 8H, 8I, 8J, 8K | `table8.iog_itc_availd`, `differenceGH`, `iog_itc_ntavaild`, `tot_itc_lapsed` | M |
| 8H1 | not found | ? |
| 9 | `table9.iamt`, `camt`, `samt`, `csamt`, `intr`, `fee`, `pen`, `other`; each with `txpyble`, `txpaid_cash`, `tax_paid_itc_iamt`, `tax_paid_itc_camt`, `tax_paid_itc_samt`, `tax_paid_itc_csamt` (only the heads that apply) | M (`pen`, `other`: L) |
| 10, 11, 12, 13 | all inside `table10`: `dbn_amd`, `cdn_amd`, `itc_rvsl`, `itc_availd` (the downloaded file also had `table10.total_turnover`) | L |
| 14 | `table14.iamt`, `camt`, `samt`, `csamt`, `intr`, each `txpyble`, `txpaid` | L |
| 15A to 15G | `table15.rfd_clmd`, `rfd_sanc`, `rfd_rejt`, `rfd_pend`, `tax_dmnd`, `tax_paid`, `dmnd_pend` (tax heads plus `intr`, `pen`, `fee` on demand rows) | L |
| 16A, 16B, 16C | `table16.comp_supp` (`txval` only), `deemed_supp`, `not_returned` | L |
| 17, 18 | `table17.items[]`, `table18.items[]`: `hsn_sc`, `desc`, `isconcesstional` (sic, `"Y"`/`"N"`), `uqc`, `qty`, `txval`, `rt`, `iamt`, `camt`, `samt`, `csamt` | L |
| 19 | no save key (system computed) | ? |

Table 8A document download (API "section 8A details", and probably the Excel
columns): `gstin`, `fy`, `docid`, `b2b[]`/`b2ba[]`/`cdn[]` by supplier `stin`,
`rtnPrd`, `filingdt`, `documents[]` with `inum`, `idt`, `val`, `pos`, `rchrg`,
`inv_typ`, `txval`, `iamt`, `camt`, `samt`, `csamt`, `iseligible`, `reason`;
amendments add `oinum`, `oidt`; notes use `nt_num`, `nt_dt`, `ntty` (L).

For FY 2024-25 the GSTN API added methods to generate updated 8A data and to
fetch GSTR-1/1A HSN data (per a GSP's summary of the release note) (L).

## 8. Late fee

| Rule | Source |
|---|---|
| s.47(2): ₹100 for every day of delay, maximum a quarter per cent of turnover in the State or UT. This is under the CGST Act; the SGST/UTGST Act levies the same, so the gross figure is ₹200 a day and 0.5% | CGST Act s.47(2) [S16] [PRIMARY]; SGST mirror [UNCERTAIN: State Acts not read] |
| Waiver from FY 2022-23 onwards (Notif. 7/2023-CT, s.128): aggregate turnover up to ₹5 crore: ₹25 a day, max 0.02% of State/UT turnover; above ₹5 crore up to ₹20 crore: ₹50 a day, max 0.02%. Above ₹20 crore: no waiver, s.47(2) applies | Notif. 7/2023-CT dated 31.03.2023 [S13] [PRIMARY] |
| Same notification: late returns for FY 2017-18 to 2021-22 filed between 01.04.2023 and 30.06.2023 capped at ₹10,000 | [S13] [PRIMARY] |
| Gross (CGST + SGST) under 7/2023: ₹50 a day max 0.04% (up to ₹5 crore); ₹100 a day max 0.04% (₹5 to 20 crore); ₹200 a day max 0.5% (above ₹20 crore) | derived [UNCERTAIN: assumes matching State notifications] |
| Late fee is for the complete annual return: where 9C is required, the return is not complete until both GSTR-9 and 9C are filed; no separate fee for each | Circular 246/03/2025-GST dated 30.01.2025 [S18] [PRIMARY] |
| Due date 31 December after the FY; late fee is computed by the portal and must be paid before filing | Rule 80 [S17]; FAQ Q31, Q33 [S21] |

## 9. Uncertain

1. GSTR-9 JSON keys: no official source read; keys in §7 are from a
   portal-generated file and GSP docs. Keys for 4G1, 5C1, 6A1, 6A2, 7A1, 7A2,
   8H1 and the new Table 9 columns are unknown. Inspect the current offline
   tool or a fresh FY 2024-25 portal JSON.
2. Whether the portal offers a "Download GSTR-9 details (JSON)" button for
   the online flow, beyond the offline tool's import file.
3. Table 12 and 13 optional status for FY 2024-25 (option not re-extended by
   13/2025); 6E split for FY 2024-25; 12B and 12C of 9C after FY 2020-21.
4. FY 2025-26: no form amendment found; year-bound options may lapse.
5. 4G1 and 5C1 rows: inserted 10.07.2024, so they apply to returns filed after
   that date (FY 2023-24 onward); portal display for FY 2023-24 not checked.
6. Whether the "optional up to ₹1.5 crore" sentence for Tables 17 and 18
   still has effect (never deleted, but the FY 2021-22 text makes Table 17
   mandatory at 4 digits up to ₹5 crore).
7. Part V period for FY 2021-22 (September 2022 per 14/2022, 30 November 2022
   per later wording).
8. State GST late fee and waiver amounts (assumed equal to CGST).
9. The GSTN FY 2024-25 FAQ numbers two questions "20"; citations use the
   printed numbers.

## 9a. How KhataOS uses this

The rows, year ranges and JSON keys above are in
`crates/khata-in/src/gstr9.rs` (`ROWS`, `row_years`, `JSON_ROWS`,
`JSON_UNKNOWN`, `applicability`); what the books fill and what is entered by
hand is in `docs/india-gst-returns.md`. Rows whose JSON keys are marked `?`
above are not written to the JSON; every key is to be checked in the GST
offline tool before an upload.

## 10. Sources

Gazette notifications marked (ICAI) were read in the ICAI GST and Indirect
Taxes Committee reprint listed at <https://idtc.icai.org/gst_new.php?gst_type=CENTRAL+GOODS+AND+SERVICES+TAX>.

- **[S1]** CBIC, "Central Goods and Services Tax (CGST) Rules, 2017, Part B Forms" (as amended up to 01.06.2021), FORM GSTR-9 pp. 174 to 193, FORM GSTR-9C pp. 200 onwards, with amendment footnotes (74/2018, 31/2019, 56/2019, 79/2020-CT). <https://cbic-gst.gov.in/pdf/01062021-CGST-Rules-2017-Part-B-Forms.pdf>
- **[S2]** Notification 30/2021-Central Tax dated 30.07.2021 (CGST Sixth Amendment Rules 2021; Rule 80 substituted, GSTR-9/9C changes). (ICAI) <https://d23z1tp9il9etb.cloudfront.net/download/gstlaw/30_30_2021_rl_cgst21noti.pdf>
- **[S3]** Notification 14/2022-Central Tax dated 05.07.2022, cl. 12 and 13. (ICAI) <https://d23z1tp9il9etb.cloudfront.net/download/gstlaw/14_14_2022_cgst_rl_noti.pdf>
- **[S4]** Notification 38/2023-Central Tax dated 04.08.2023, cl. 25 and 26. (ICAI) <https://d23z1tp9il9etb.cloudfront.net/download/gstlaw/38_38_2023_cgst_rl_noti.pdf>
- **[S5]** Notification 12/2024-Central Tax dated 10.07.2024 (CGST Amendment Rules 2024), cl. 39 and 40. (ICAI) <https://d23z1tp9il9etb.cloudfront.net/download/gstlaw/12_12_2024_cgst_rl_noti.pdf>
- **[S6]** Notification 13/2025-Central Tax dated 17.09.2025 (CGST Third Amendment Rules 2025, in force 22.09.2025), cl. 9 (GSTR-9) and 10 (GSTR-9C). (ICAI) <https://d23z1tp9il9etb.cloudfront.net/download/gstlaw/centaltax-13-20251758198016.pdf>
- **[S7]** Notification 15/2025-Central Tax dated 17.09.2025 (exemption up to ₹2 crore, FY 2024-25 onwards). (ICAI) <https://d23z1tp9il9etb.cloudfront.net/download/gstlaw/centaltax-15-20251758198082.pdf>
- **[S8]** Notification 14/2024-Central Tax dated 10.07.2024 (FY 2023-24 exemption). (ICAI) <https://d23z1tp9il9etb.cloudfront.net/download/gstlaw/14_14_2024_cgst_rl_noti.pdf>
- **[S9]** Notification 32/2023-Central Tax dated 31.07.2023 (FY 2022-23). (ICAI) <https://d23z1tp9il9etb.cloudfront.net/download/gstlaw/32_32_2023_cgst_rl_noti.pdf>
- **[S10]** Notification 10/2022-Central Tax dated 05.07.2022 (FY 2021-22). (ICAI) <https://d23z1tp9il9etb.cloudfront.net/download/gstlaw/10_10_2022_cgst_rl_noti.pdf>
- **[S11]** Notification 31/2021-Central Tax dated 30.07.2021 (FY 2020-21). (ICAI) <https://d23z1tp9il9etb.cloudfront.net/download/gstlaw/31_31_2021_rl_cgst21noti.pdf>
- **[S12]** Notification 77/2020-Central Tax dated 15.10.2020, amending 47/2019-Central Tax dated 09.10.2019 (s.148). (ICAI) <https://d23z1tp9il9etb.cloudfront.net/download/gstlaw/83_77_2020_rl_cgst20noti.pdf>
- **[S13]** Notification 07/2023-Central Tax dated 31.03.2023 (late fee waiver, FY 2022-23 onwards). (ICAI) <https://d23z1tp9il9etb.cloudfront.net/download/gstlaw/07_07_20231728989812.pdf>
- **[S14]** Notification 78/2020-Central Tax dated 15.10.2020 (HSN digits on invoices from 01.04.2021). (ICAI) <https://d23z1tp9il9etb.cloudfront.net/download/gstlaw/84_78_2020_rl_cgst20noti.pdf>
- **[S15]** CGST Act 2017 s.44 (CBIC tax information portal). <https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/acts/2017_CGST_act/active/chapter9/section44_v1.00.html>
- **[S16]** CGST Act 2017 s.47. <https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/acts/2017_CGST_act/active/chapter9/section47_v1.00.html>
- **[S17]** CGST Rules 2017 Rule 80. <https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/rules/cgst_rules/active/chapter8/rule80_v1.00.html>
- **[S18]** CBIC Circular 246/03/2025-GST dated 30.01.2025 (late fee for GSTR-9C). <https://cbic-gst.gov.in/pdf/cir-cgst-246-03-2025.pdf>
- **[S19]** GSTN, "FAQ on GSTR 9/9C for the FY 2024-25", dated 15.10.2025 (v6). <https://tutorial.gst.gov.in/downloads/news/faq_on_gstr9_for_24_25_dt_15_oct_25_v6_final.pdf> (read from Internet Archive snapshot 19.10.2025)
- **[S20]** GST portal user manual "Manual > GSTR-9". <https://tutorial.gst.gov.in/userguide/returns/Manual_gstr9.htm> (Internet Archive snapshot 05.08.2024)
- **[S21]** GST portal "FAQs > About Form GSTR-9". <https://tutorial.gst.gov.in/userguide/returns/FAQs_gstr9.htm> (Internet Archive snapshot 29.09.2023; predates the 2B switch for 8A)
- **[S22]** GST Council Newsletter, Issue 78, September 2025, pp. 6 to 7 (summary of 13/2025 and 15/2025-CT). <https://gstcouncil.gov.in/sites/default/files/2025-10/september_newsletter.pdf>
- **[S23]** CBIC Press Release dated 09.10.2020, "Annual Return (GSTR-9) and Reconciliation Statement (GSTR 9C) for FY 2018-19". <https://cbic-gst.gov.in/pdf/press-release/Annual-Return-Press-Release-09102020.pdf>

Known official documents not retrieved: GSTR-9 Offline Utility manual
(`tutorial.gst.gov.in/downloads/gstr9offlineutility.pdf`); GSTN API release
note for GSTR-9/9C API v3.0
(`developer.gst.gov.in/pages/apiportal/data/ReleaseNotes/Release_notes_Gstr9_Gstr9c_API.pdf`);
GSTN developer portal API list (`developer.gst.gov.in/apiportal/taxpayer`).
