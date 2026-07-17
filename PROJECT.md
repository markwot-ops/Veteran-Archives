# VETERAN ARCHIVES — Project Brief

**Purpose of this file:** the single source of truth for the Veteran Archives project. In a new chat, point Claude here to re-sync completely. Read this first, then read the actual repo files before making any change.

**Maintained by:** Mark (project lead).
**Communication:** short, bottom-line-first, scannable. Approval before building. Flag every source conflict; never silently resolve discrepancies.

---

## 1. What this is

An interactive memorial that maps Holyoke's veterans across the city's cemeteries, plus a research queue for veterans identified but not yet located. Hosted free on GitHub Pages.

- **Org / repo:** `markwot-ops/Veteran-Archives` (note the capital V and A — the URL is case-sensitive)
- **Live root:** https://markwot-ops.github.io/Veteran-Archives/

---

## 2. The core architecture (the whole point)

**Data is separated from the template.** This is what makes the future admin panel possible.

- **`template.html`** — one shared shell (map, sidebar index, click-to-open window, badges, era filters). Identical for every site. Fix it once, every site inherits the fix.
- **`data.js`** per site — all the content, as `window.VA = { site:{...}, veterans:[...] }`.

Each site = a folder containing an **identical `index.html`** (a copy of `template.html`) **+ its own `data.js`**.

```
/                     landing page (index.html) + template.html + PROJECT.md
/calvary/             index.html + data.js
/forestdale/          index.html + data.js
/elmwood/             index.html + data.js
/research-queue/      index.html + data.js
```

---

## 3. Data schema

### Per-veteran object (in `data.js` → veterans[])
| field | meaning |
|---|---|
| `id` | slug, unique |
| `name` | display name. "Last, First" or "First Last" both OK — template handles sorting either way. NO symbols in the name. |
| `era` | e.g. "World War II" (template's normEra canonicalizes) |
| `branch` | e.g. "Army", "Navy", "Marine", "Air", "Coast Guard" — drives the sidebar icon |
| `branchLabel` | optional display line, e.g. "U.S. Army – World War I". Shown in the window if present, else branch+era |
| `lat`, `lng` | coordinates, or `null` for queue entries |
| `photo` | full URL, or "" |
| `extraPhotos` | list of `{src, caption}` — renders as "View document" links |
| `narrative` | the story text; "" → template shows the queue placeholder text |
| `sourceNote` | small dim credit line rendered UNDER the narrative. If present, the template also renders the standard contact close from its own constant. Legacy entries have no `sourceNote` and keep the close inside `narrative`. |
| `badges` | list, e.g. ["KIA","Purple Heart"] |
| `status` | "located" or "queue" |
| `source` | provenance note |

### Site config (in `data.js` → site{})
| field | meaning |
|---|---|
| `name`, `title` | display names |
| `address` | shown under the title |
| `kind` | "cemetery" or "queue" |
| `center` | [lat, lng] map center |
| `zoom` | initial zoom |

---

## 4. Template behaviors worth knowing

- Reads everything from `window.VA`. No content is hard-coded in `template.html`.
- **Queue mode** (`site.kind === "queue"`): entries have no coordinates → no map pins, but they still appear in the index; clicking opens the window with no map pan.
- **No photo + queue entry** → shows a dashed placeholder box: "Resting Place Pending Geo-location".
- **Empty narrative** → window shows the queue text (identified, not yet researched).
- Index is scrollable while a window is open (the overlay is pass-through); clicking another name swaps the window.
- Index sorts by surname; handles suffixes (Jr./Sr./II).
- Era filters + legend are built automatically from the data.
- **Landing cards** use an empty stretched `<a>` overlay so no text sits inside a link → no underlines. Green dot = live, amber = in progress, gray = reserved.

---

## 5. Build / migrate workflow

To add or migrate a site:
1. Normalize source data into the schema above → write `SITE/data.js` with `window.VA = {site, veterans}`.
2. Copy `template.html` → `SITE/index.html` (unchanged).
3. Validate: `node --check SITE/data.js`; confirm entry count and that narratives/photos survived.
4. Deliver both files; Mark uploads the folder to GitHub.

**Migration note:** parse legacy JS arrays with Node (`eval`), not Python `json` — the old files have JS-isms JSON rejects. Strip stray symbols (★ ✦ ⚓ 🦅 ✈ ⚑) from names or they break alphabetical sort.

---

## 6. Deploy & verify

- **Upload:** GitHub web uploader → drag the folder → Commit. Watch that `data.js` lands in the right subfolder path (it has dropped before). Mac: make the folder locally first, drag it whole.
- **Claude cannot reach the github.io Pages site.** Verify only via `raw.githubusercontent.com/markwot-ops/Veteran-Archives/main/<path>` (HEAD/GET). Never claim to have checked the live Pages URL.
- If repo is updated but the page looks stale: GitHub Pages CDN or browser cache. Bust with `?v=N` on the URL, and hard refresh **Shift+Cmd+R**. If still stale, check the repo's **Actions** tab for a stuck deploy.

---

## 7. Current state (live)

| Site | Entries | Status |
|---|---|---|
| Landing | — | live (375 / 352 / 61 / 4 / 4 / 3,052) + the Honors box |
| Calvary | 375 | live |
| Forestdale | 351 | live |
| Elmwood | 44 | live |
| Research Queue | **3,052** | live |

Photos currently load from the **old repos** (`calvary-map`, `forestdale-map`, `elmwood-map`) via raw URLs. Those repos are still live and must not have their image files deleted yet.

---

## 8. Parked / next up

- **St. Jerome + Rock Valley** — landing cards ready; each needs a `data.js` when mapped. Plus 2 unnamed "TBD" card slots.
- **Retire old repos** — after photos are migrated into Veteran-Archives.
- **Admin panel** — the payoff of the data/template split. A git-based CMS (login + form with photo URL and document-link fields, optional upload-to-GitHub) so an authorized webmaster edits `data.js` through a form, never touching code. Role-based: master vs limited.
- **Franklin, Paul** (Forestdale) — the 88th Div / 351st Inf unit attribution is UNVERIFIED; no public casualty record ties it to Holyoke's Paul Franklin. Birth/death/parents are sound. Left as-is pending Mass Archives check or Mark's source.
- **Curran, Patrick J.** — CONFIRMED two different men: Elmwood's is a Tank Corps sergeant who died 1965; the Research Queue's is an SATC-Amherst man who died of pneumonia Dec 9, 1918. Both entries correctly stand.

---

## 9. Standing rules & traps

- Approval before building. Flag all source conflicts explicitly; never silently resolve.
- Narrative standard: rank and role carry the story; specific historical setting; honest hedges carved per-entry; no two entries alike; no placeholder filler ("not yet come down to us"). Standard contact close verbatim: "If you have further information about this veteran, please contact the City of Holyoke Veterans Graves Officer at (413) 322-5630 at 310 Appleton Street, 1st Floor, Holyoke, MA 01040."
- Known false-match traps (same name, different man): Konopka, Zebrowski, Dowd, Walker, Welch, MacDonald, Curran. Harper "Story of Holyoke" has a two-column date problem — verify dates.
- WWII research: Massachusetts Archives casualty index (RG PS1/447X) is the authoritative Army source.

---

## 10. Session update — Honors filter, Forestdale photo batch, Cold War era

**Forestdale grew to 351** (was 244): 107 new graves added from the FD4/FD5 photo batch. Method: fetched JPEGs' GPS via HTTP range from raw.githubusercontent.com/markwot-ops/forestdale-map, clustered by location, kept graves not already mapped. These 107 are **placeholders** — provisional names from filenames, GPS pins, photo attached, "narrative pending" text, era/branch blank. **Phase 2 (next work): review ~10 at a time — open each photo, read the stone for the real name, research, write the narrative, set era/branch/honors.** 4 need names read off the stone (were IMG_7557, Thomas?, Albert?, Griot?).

**Honors feature (was "Distinctions"):** legend box (bottom-left) lists this site's honors with counts, click to filter, distinguished graves get a gold ring on the map. Order: Medal of Honor, Distinguished Service Cross, Croix de Guerre, KIA, Purple Heart, Distinguished Service Medal, Air Medal, Silver Star, Bronze Star (built from DISTINCTION_ORDER in template). Full names spelled out. Era filters are colored chips above the names in the sidebar (with counts), flex-fill so no black gaps.

**Filter rule:** Era and Honors are mutually exclusive — clicking an era clears the active Honor; clicking an Honor resets eras to all. Prevents empty-result traps.

**Cold War era** added to the template (teal) — appears as a filter only once a veteran is tagged era "Cold War". None tagged yet.

**Badge/era vocab** lives in the template; canonBadge matches case-insensitively so data casing doesn't matter for grouping.

**OUTSTANDING when this session ended:** the Honors/era-chip template was rebuilt but may not be fully uploaded to all four folders yet (Calvary hit a GitHub 400 mid-session). Verify each site's index.html has `<h4>Honors</h4>` via raw before assuming it's live.


---

## 11. Open work list (from end of session 10)

**Done this session:** era keys all-lit-at-start + toggle-off-to-hide; name symbols +50% brighter with stronger active pulse; honor label/count brightness matched to names; smaller honor dots; era chips natural width (Vietnam no longer stretches).

**Still to do:**
1. **Tag honors from Zack's "Holyoke in the Great War"** (see list below) — match each to map/queue entries, add badges. Many are Co D/HQ 104th Inf, 26th Div.
2. **Landing page: credit key sources** (Zack's *Holyoke in the Great War*; Harper's *Story of Holyoke*; NARA; Mass Archives).
3. **Campaign-ribbon symbols** for each honor instead of the color dot (Medal of Honor, DSC, Croix de Guerre, Purple Heart, etc.).
4. **Pulse on honor-click:** the honor dot pulses and matching vets' name-symbols pulse.
5. **Zack's long hero stories** transcribed → linked below the vet's photo (uses extraPhotos link mechanism), crediting source. Known long stories: Major W.P. Ryan (Joinville); "Lost Battalion" (Pvt. Raymond Flynn, Co E 308th); Cpl. Roy MacMenigall (Co D 104th, capture story); Chaplain W.F. Davitt (last officer killed, Nov 11 1918). Also referenced: a Petty Officer Hunter story.
6. **Eras to 2 rows** (old Calvary map had 2; new has 3). Compare against old map look — smaller chips/dots preferred.

**Zack's honor recipients to tag (from OCR excerpt):**
- *Croix de Guerre + DSM:* Joseph E. Blair (Co E 104th, KIA 4/12/1918).
- *Distinguished Service Cross:* William F. Davitt (chaplain, also DSM, KIA 11/11/1918).
- *DSM:* William A. Stack (175th FA); William P. Ryan (Medical, Joinville); Alexander Boudreau (MG Co 104th); William McNally (USMC, KIA); John McNulty (USMC 6th MG Bn); Harry David Read (MG Co 104th); William Doyle (Co D 104th); Ernest J. Roy (HQ 104th).
- *Croix de Guerre:* Michael J. Donoghue (339th Inf, also British cite); Albert Blais (HQ Co 9th Inf); John R. Flood (HQ 104th); Patrick Desilets (30th Inf); Francis C. Heywood; Robert C. Slattery (HQ 104th); Robert R. Twiss (HQ 104th); Richard M. Weiser (Med 104th); William F. Wruck (HQ 104th); John Stefanik (Co G 104th); Kay A. Leduc (Co H 104th); Alexander MacDonald (26th Div PM); John D. LaFlesh (Co D 104th); Edwin C. Parsons (Lafayette Escadrille, + French Military Medal); Reginald Turner (Co E 1st Engrs); Ernest H. Young (Co K 104th); George S.L. Connor (chaplain 3rd Army); Samuel Levenson (Co M 104th); Alfred S. Anderson (HQ 104th, deceased); Arthur V. Leverault (HQ 104th); Henry A. Brown (Co D 104th); Anthony H. Manley (aviation); Joseph E. Comeau (HQ 104th); Stewart A. Russell (Sanitary Det 104th).
- *British Military Medal:* Hugh Weir (46th Canadian Inf).
- *Medal of Honor (Navy):* John MacKenzie (USS Remlik) — already tagged.

**Deep-dig list (citation men, no open-web record — use Mark's city graves cards / clerk / FamilySearch):** Leduc Kay A. (verify Kay vs Ray on physical Zack's page), LaFlesh John D., MacDonald Alexander, Young Ernest H., Levenson Samuel, Leverault Arthur V., Comeau Joseph E., Brown Henry A., Manley Anthony H., Russell Stewart A. — current honest queue entries stand. DONE to full standard: Turner Reginald (b. 7/24/1893 Holyoke, d. 10/29/1945, buried Forestdale — grave to photograph), Connor Rev. George S.L. (Croix de Guerre badge ADDED — real medal per Holy Cross HOF; Holy Cross class of 1907, Davitt's classmate; WWII Vicar Delegate; Monsignor/Vicar General Springfield).

**Zack roster mine (added):** 72 Holyoke servicemen from Zack's two company rosters (Co D "Holyoke's Own" + one other) loaded into the Research Queue as NAME-ONLY placeholders (era WWI, source "zack-roster-placeholder", empty narrative) — to be researched/narrated later to the Turner/Connor standard. OCR spellings may need correction on research. Queue 345 -> 417; landing count updated to 417. Roll of Honor (the dead) fully cross-checked: only 3 fallen still missing — Ault Arthur J. (3rd Aero Sqn, first Holyoker to pilot in France, KIA air accident 3/7/1918), Wilber Charles I. (126th Inf, KIA 9/2/1918), Gately Edward P. (Co C, died pneumonia 1/2/1918). Note: a handful of OCR-garbled Roll-of-Honor names filtered out — worth a manual second pass.

## HERO STORY LINKS — mechanism (for next Claude)
Long hero stories from Zack's attach as a LINK under a vet's photo via the existing `extraPhotos` field.
- Story pages live in the repo folder **/stories/** (e.g. stories/foote.html), styled dark to match, always crediting: "Source: Charles S. Zack, Holyoke in the Great War (1919)."
- Wire into the vet: `extraPhotos:[{caption:"📜 <Title> (year)", src:"https://markwot-ops.github.io/Veteran-Archives/stories/<name>.html"}]`
- Template renders extraPhotos as a button-link, opens in new tab (target=_blank). Confirmed working.
- Upload story pages to: https://github.com/markwot-ops/Veteran-Archives/upload/main/stories
- FIRST built: stories/foote.html (Lt. Col. Alfred F. Foote, divisional inspector 26th Div — note: he's a senior officer, not a private; his roster placeholder now carries the tribute link). Pending hero stories to build next: Maj. W.P. Ryan (Joinville), "Lost Battalion" (Pvt. Raymond Flynn, Co E 308th), Cpl. Roy MacMenigall (Co D 104th capture story), a Petty Officer Hunter story.

**Zack "Holyoke's Army Officers" chapter (line 3400+ in zack_ocr.txt):** mined the first page. Added 19 officer placeholders (source "zack-officers"). Foote + Ryan already in archive — this chapter has rich enrichment for their eventual narratives (Foote: enlisted Co D 2nd Mass Militia 1896, Span-Am sergeant, YOUNGEST Lt-Col in Pershing's army at 40, acting cmdr 104th at Chateau-Thierry; Ryan: entered 12/18/1916, chief surgeon 1st Div MG Bn, $10k captured drug booty at St Mihiel, Croix de Guerre + rec. DSM). MORE OFFICERS BELOW line ~3560 in the chapter still to mine (chapter continues past Hazen). Queue now 438.

**Zack Army Officers chapter — COMPLETE.** All pages mined; officer placeholders loaded with Zack service records (source "zack-officers"), each "full researched narrative pending." Enrichments done to: Foote, Ryan, Horrigan (era fixed to WWI), Slate, Connor, Heywood, MacDonald (Div Postmaster/3 citations/lost son), Manley (H/B same-man note). Investigate-notes left on: Fitzsimmons (vs Calvary Harold A.), Greaney (vs Calvary William H.), McCarthy John P. (vs queue John F.), Moore Edwin A. (vs Calvary Edwin J.T. MD), Stapleton E.J. (vs Calvary Richard J./Thomas H.). Queue now 532. **NEXT: Navy officers section (follows Army officers in zack_ocr.txt).**

## ============================================================
## TURN-OVER NOTE — for the next Claude (read this first)
## ============================================================

**WHO:** Mark, City of Holyoke (MA) Veterans Graves Officer. Dyslexic; uses voice-to-text (expect typos). He EXECUTES INSTRUCTIONS IN REAL TIME, in the exact order written — so give steps in order, one line each, and NEVER wrap a step in "but first do X" or trailing noise. He can't process that. Bottom-line first, scannable.

**THE PROJECT:** "Veteran Archives" — GitHub Pages site mapping Holyoke's veterans across cemeteries + a research queue. Repo: github.com/markwot-ops/Veteran-Archives (capital V, A). Live: https://markwot-ops.github.io/Veteran-Archives/. Five sites on ONE shared template: /calvary/ (375), /forestdale/ (351, incl. 107 photo placeholders), /elmwood/ (44), /research-queue/ (581 as of this session), + landing.

**ARCHITECTURE:** each site folder = identical index.html (copy of template) + its own data.js (window.VA={site,veterans:[...]}). Fix template once, re-copy to all folders. Working files: /home/claude/va/ (template.html + per-site index.html/data.js). Outputs mirror: /mnt/user-data/outputs/veteran-archives/.

**UPLOAD RULES (he does all uploads by hand, they trip him up):**
- He is signed into GitHub as markwot-ops.
- Give uploads as: DESTINATION URL first, then the file right under it. NO "commit to main" / "drag it" boilerplate — the upload link opens straight to the drop point; that text is meaningless noise to him.
- When two files share a name (data.js x2), ALWAYS say "the Research Queue data.js" / "the Calvary data.js" — never bare "data.js".
- Direct-folder upload links: .../upload/main/<folder>. Root/landing: .../upload/main.
- Use DRAG-AND-DROP, never GitHub's text/new-file editor (it auto-erases text and nests folders — burned us twice).
- Recurring GitHub 400 = stale page → close tab, reopen fresh link.
- Claude CANNOT reach github.io; verify only via raw.githubusercontent.com (cache-bust ?x=RANDOM). Raw lags a few min behind commits — a browser 404 that raw still shows 200 = just cache.
- GitHub API is rate-limited/unusable; use git ls-remote or partial clone instead.
- ALWAYS end a build turn with the stack (upload dests+files, then live links). NON-NEGOTIABLE, he reminds sharply.
- He does NOT preview online and CANNOT open the preview HTML files — SHOW HIM CONTENT (narratives, name lists) IN CHAT, never "see the preview."

**NARRATIVE STANDARD (he is exacting — wasted a whole session getting this wrong):**
- RESEARCH each man first (web: Find A Grave, honorstates.org; his own city graves-registration cards/city clerk/FamilySearch for men who came home). Cross-reference ALL sites BEFORE writing.
- LEAD WITH THE PERSON, never rank: born where/when, school, work, life in Holyoke, drafted vs enlisted — THEN the unit/role with real context (what MM3 meant, what the 104th did/where), THEN the deed, THEN anchor him home (what became of him; honest hedge if unknown).
- Give the unit/role real context. Flag the extraordinary (KIA, Purple Heart, MOH, unusual units). Note family/stone details (wife, buried alongside, shared stones, families who served, multiple stones).
- NO invented birth dates/facts. Honest hedges ("has not yet been traced; that research continues"). Each story individually shaped — no two open alike.
- Exemplars to mirror (on Calvary): Davitt, Cahill, Moore, Felsentreger, Begley. Turner & Connor (in queue) are the WWI-officer exemplars we nailed this session.
- Standard contact close VERBATIM on EVERY entry: "If you have further information about this veteran, please contact the City of Holyoke Veterans Graves Officer at (413) 322-5630 at 310 Appleton Street, 1st Floor, Holyoke, MA 01040."
- SHOW narratives in chat for approval BEFORE building. Bio rules: no birth dates unless sourced; family = "may be related"; never strip prose he wrote.

**HONORS / TEMPLATE FEATURES (all live):** Honors legend box bottom-left (click to filter, gold ring on distinguished pins, dot+markers pulse on click, KIA shows GOLD STAR on pin + legend). DISTINCTION_ORDER: Medal of Honor, DSC, Croix de Guerre, KIA, Purple Heart, DSM, Air Medal, Silver Star, Bronze Star. Era filter chips above the name list (all lit at start; click one to darken it + drop those vets; click again to restore). Era + Honors are mutually exclusive (clicking one clears the other). Cold War era exists (teal, shows only if tagged). Peacetime era REMOVED. Empty narrative => entry shows ITALIC name + green "queue" tag = "needs a real narrative."

**HERO STORY LINKS (mechanism, working):** long Zack stories attach as a link under the vet photo via extraPhotos:[{caption:"📜 Title (year)", src:"https://markwot-ops.github.io/Veteran-Archives/stories/<name>.html"}]. Story pages live in repo /stories/ (dark-styled, credit "Source: Charles S. Zack, Holyoke in the Great War (1919)"). Built so far: foote, macmenigall, lost-battalion (Flynn), ryan-joinville, mackenzie (MOH). Upload story pages by DRAGGING to .../upload/main/stories.

**ZACK'S SOURCE:** full OCR at https://raw.githubusercontent.com/markwot-ops/forestdale-map/main/zack_ocr.txt (167k words). Mined so far: honor pages (all decorated + citation men DONE), Roll of Honor (the dead — 81/84 already in; 3 still to ADD: Ault Arthur J. [3rd Aero Sqn, first Holyoker to pilot in France, KIA air accident 3/7/1918], Wilber Charles I. [126th Inf, KIA 9/2/1918], Gately Edward P. [Co C, died pneumonia 1/2/1918]), 2 company rosters (72 name placeholders), and the ENTIRE OFFICERS CHAPTER (Army + Navy + Allied — all loaded as placeholders WITH Zack service records, source "zack-officers"/"zack-navy-officers", each marked "full researched narrative pending").

**NEXT UP:** the ENLISTED MEN section of Zack's (follows the officers chapter) — Mark will start it later. Same workflow: cross-check all sites → show new names in chat → load as placeholders with Zack service records → stack. Also pending: write real person-first narratives for the ~officer placeholders; the 3 Roll-of-Honor fallen; deep-dig citation men (Leduc/LaFlesh/etc via his city records); OCR-garbled Roll-of-Honor names (manual 2nd pass); "investigate whether same as" flags left on Fitzsimmons, Greaney, McCarthy J.P., Moore Edwin A., Stapleton E.J.

**TONE:** He's a community historian doing sacred work — honoring Holyoke's veterans. Match that seriousness. He runs low on weekly usage; don't waste turns. When he says the standard's finally right, he means it — hold to it.

---

## ============================================================
## SESSION 12 — Zack's ENLISTED chapter, A–L (mined) + sidebar rebuild
## ============================================================

### What happened

**Research Queue went 581 → 1,879.** Two batches of Zack's enlisted men mined and loaded as placeholders:

| Batch | In Zack | Built | Held for Mark | Unreadable |
|---|---|---|---|---|
| **A–F** (Army) | 786 | **734** | 11 exact + 19 doubtful | 18 |
| **G–L** | 588 | **564** | 11 exact + 13 doubtful | 2 |

**Mark's filter rule, established this session — follow it exactly:**
1. Zack man **already on a map (geolocated)** → NO new queue entry. Zack's info becomes an **enhancement** to the existing entry, and **Mark reviews every enhancement before it goes in.**
2. Zack man **already in the Q** → no duplicate; enhance.
3. **Everyone else** → new Q placeholder, Zack basics only, needs geolocation + enhancement.
4. Q placeholders that later get geolocated → move onto the map **as placeholders until final review**.

**Scope is not a problem.** Mark's expectation was always *every* Holyoke man who served — roughly 3,500+ when M–Z lands. Do not push back on queue size; it was always the design. Split data.js by letter/era if the file gets unmanageable.

### Placeholder format (copy exactly — matches the Officers chapter)
```
"narrative": "Service record, from Charles S. Zack, Holyoke in the Great War (1919) —
full researched narrative pending. {First Last} served in the United States Army in the
First World War. Zack's roster records: {Zack's own sentences, OCR-repaired} {CONTACT CLOSE}"
"badges": [], "status": "queue", "source": "zack-enlisted-{A-F|G-L|M-Z}"
"id": "zack_enl_{last}_{first}"
```
No badges on placeholders even where Zack says wounded/gassed/cited — that's unverified. Branch = Army unless the text says Marine.

### OCR is the main hazard — a garbled name is a man nobody can find
Zack's scan is badly corrupted. **~160 names repaired so far.** Signature patterns:
`AV→W` (BOAVE→Bowe, AVILLIAM→William) · `X→N` (DOXOGHUE→Donoghue, DOXOVAX→Donovan) ·
`^→M/R` (M^ILLIAM→William, CON^NOR→Connor) · `3I→M` (JA3IES→James) · `Iv/li→K/L` (BURIvE→Burke) ·
`CROQUETTE→Choquette` · `l()4th→104th` · lost periods on trailing initials (`Herman C`→`Herman C.`).

**Line-break hyphenation** was the worst: 333 broken words ("ser- vice", "En- tered", "Sep- tember",
"Expedi- tionary"). Fix is `re.sub(r'([a-z])- ([a-z])', r'\1\2', text)` — safe, leaves Franklin-Union,
Anti-Aircraft, shell-shocked intact. **Run this on every future batch.** It was caught only after A–F
had already been uploaded, and fixed retroactively.

**Never invent a name to fill a gap.** If a surname can't be repaired honestly, hold it and tell Mark.

### Sidebar rebuild (template)
1,315+ entries made the old sidebar crawl. Fixed:
- **Sort cached once** (`SORTED`) instead of re-sorting all entries on every keystroke
- **Chunked render** — 150 rows, more appended on scroll (`renderMore()`, scroll listener on `#vet-list`)
- **Search debounced** 120ms

### ⚠️ TRAP FOUND: root template.html was STALE
Root `template.html` had never received July's Honors rebuild — no gold rings, no pulse, no legend.
Anyone following "copy template.html to each site" would have **wiped the Honors system.**
Fixed this session: root template.html and research-queue/index.html are now the same corrected shell.
Calvary / Forestdale / Elmwood index.html are identical to each other and still on the **pre-sidebar-fix**
shell — they can take the new one whenever; they're small enough not to need it.

### ⚠️ VERIFICATION: raw.githubusercontent.com LIES
It served stale content through **three hard cache-busted retries** — I twice told Mark an upload had
failed when it had actually succeeded. **Verify by byte size instead:**
`https://api.github.com/repos/markwot-ops/Veteran-Archives/contents/{dir}?ref=main` → compare `size`
to the local file. The API rate-limits often; when it does, retry, and treat a raw mismatch as
unproven rather than as failure. **When Mark says he uploaded it, believe him and verify by size.**

---

## PARKED — held out of the Q, needs Mark's ruling or hand-entry

### A. EXACT matches → Zack could enrich a man already on a map/Q (Mark reviews each before merge)
**A–F (11):** Abelein, George F. (Forestdale) · Aitchison, James G. (Forestdale) · Burnett, David Andrew (Forestdale) · Burnett, Harold C. (Forestdale) · Brown, Henry A. (Q) · Flood, John R. (Q)
*…and 5 with a RANK CONFLICT — in the Q as **officers**, but the enlisted chapter lists them as Private/Corporal/Sergeant. Either Zack listed them twice (enlisted then commissioned) or they're different men. Unresolved:* Burkhardt, Edwin H. · Collingwood, Frank M. · Cunniff, John R. · Dalton, William E. · Eidman, Frank L.

**G–L (11):** Goss, Edwin G. (Q) · Greaney, Howard B. (Calvary) · Horne, Arthur A. (Forestdale) · Horne, John N. (Forestdale) · Howard, David B. (Q) · Hurley, John E. (Forestdale) · Hyde, William W. (Forestdale) · Jenkins, William C. Jr. (Forestdale) · Kelly, John J. (Q) · Kennedy, William T. (Q) · **LaFlesh, John D. (Q)** — deep-dig citation man; Zack has him wounded twice, gassed, taken prisoner, released, cited for bravery

### B. DOUBTFUL matches → NOT merged, Mark's call (classic same-name traps)
**A–F (19):** Baker, Arthur · Baker, John · Blais, Albert · Buckley, Frank E. (vs Q's Frank **L.**) · Burns, James F. (vs James **E.**) · Carey, James R. (vs James **F.**) · Clarke, George · Cleary, James · Conway, William J. · Cowie, William · Curran, Patrick · Desilets, Patrick S. · Dowd, James J. (vs James **E.**) · Doyle, William H. · Fay, Albert · Fitzgerald, James · Flynn, Raymond · Foley, William F. *and* Foley, William K. (both vs William **E.**)

**G–L (13):** Gagnon, Arthur A. (vs Arthur **J.**) · Gerbert, Edward G. (vs Edward **W.** Sr.) · Greaney, George B. (vs George **F.**) · Hall, Harry P. (vs Harry **C.**) · Henderson, William R. · Hooks, William · Hurley, John J. (vs John **E.**) · Joyal, Desire · Kennedy, William · Kureck, John · Lally, Patrick J. (vs Patrick **F.**) · Levenson, Samuel · Lyle, William

### C. HAND-ENTRY — OCR too broken to parse (20 men, transcribe from the page)
**A–F (18):** Bieber, Harry P. · Bonacker, Alexander Jr. · Chevalier, Louis A. · Comeau, Joseph (*cited for bravery*) · Crane, Michael V. · Crepeau, J. Eugene · Crimi, Harry J. · Denardo, Tony · Desmond, Frank M. · Dickinson, Willard · Dillon, Jeremiah J. · Donoghue, Timothy · **Depkahpo, Antonio** (surname unrecoverable) · **Dorhnick, Vincenty** (surname unrecoverable) · +4 more garbled starts
**G–L (2):** **Garabedian, Oscar J.** · **Leahy, John** — OCR ate their commas

### D. NEXT CONTENT
- **M–Z of Zack's enlisted chapter** — Mark supplies the transfer PDF; run the same pipeline
- **Three Roll-of-Honor fallen still not added:** Ault, Arthur J. (3rd Aero Sqdn, first Holyoker to pilot in France, KIA Mar 7 1918) · Wilber, Charles I. (126th Inf, KIA Sep 2 1918) · Gately, Edward P. (Co. C, died of pneumonia Jan 2 1918)
- **Deep-dig citation men** still owed full research: Leduc, LaFlesh, MacDonald, Young, Levenson, Leverault, Comeau
- **"Needs narrative" sidebar filter** — at 1,879 (soon 3,500+) the Q can't be browsed by scrolling; finding unresearched men has to be a filter. Proposed, not built.
- **Calvary photo work** — 70 files still 404; 16 entries need brand-new stone photos; 22 duplicate-name pairs not yet deduplicated. Untouched this session.


## ============================================================
## SESSION 13 — Zack's ENLISTED chapter finished (M–Z), narrative reformat, Q audit
## ============================================================

### Headline
**Research Queue 1,879 → 2,996.** Zack's enlisted chapter is now COMPLETE, A–Z. There is no more of it to mine.

### The transfer PDFs
Mark uploaded `Transfer_M-O.pdf` and `transfer_to_O-Z.pdf`. **The second one is not O–Z — it is the ENTIRE enlisted chapter, A–Z** (2,304 records, ABBOTT → ZWIRBLIO). It supersedes the first. It is the definitive text; if any enlisted question arises, re-mine from it.

### NEW PLACEHOLDER FORMAT (Mark's, approved this session — use for all future placeholders)
Rank-led sentence first, Zack credit small and LAST, contact close after it:

```
name:        "Albert, Fred C."
branchLabel: "U.S. Army – World War I"
narrative:   "Private Fred C. Albert entered service July 3, 1918, serving in the Aviation
              Corps of the United States Army in the First World War."
sourceNote:  "Service record, from Charles S. Zack, Holyoke in the Great War (1919) —
              full researched narrative pending."
```
The contact close is NO LONGER stored in the data for these entries — the template holds it as `CONTACT_CLOSE` and renders it whenever `sourceNote` exists. Do not re-add it to the narrative or it will print twice.

Sentence grammar: `{Rank} {Full name} entered service {date}, serving in {unit} of the United States Army in the First World War.` (no date → "served in"). Then, as separate sentences: AEF service, station, Mexican border service, then ONE deed line ("Zack records him wounded in action.", gassed, shell-shocked, taken prisoner, cited for bravery). Any Zack sentence the composer doesn't recognise is appended verbatim rather than dropped — **never let a Zack sentence vanish.**

Qualifier text appended to `sourceNote`:
- TBD (same-name trap): " TBD — a Holyoke man of this name is already in the archive; whether Zack's man is the same man is not yet settled."
- In-Zack duplicate name: " TBD — Zack's roster lists more than one Holyoke man under this name; the entries are kept separate until each man is identified."
- OCR-damaged name: " The name as printed in Zack's roster is damaged in the scan and awaits transcription from the page."
- Recovered from damaged passage: " This entry was recovered from a damaged passage of Zack's roster; the name awaits confirmation from the printed page."

### Template changes (root template.html + research-queue/index.html)
- New `#psrc` slot: renders `sourceNote` at 0.66rem, dim, italic.
- New `#pcontact` slot: renders the `CONTACT_CLOSE` constant, shown only when `sourceNote` exists.
- Calvary / Forestdale / Elmwood index.html were NOT re-copied — they have no `sourceNote` entries, so nothing changes for them. They remain on the pre-sidebar-fix shell.

### Reformat of existing entries
**1,461 existing Zack entries** rewritten into the new format (734 A–F, 564 G–L, 140 officers, 22 Navy officers, 1 other). The 72 name-only roster placeholders and the 33 hero narratives were left alone.

### ⚠️ THREE PARSING TRAPS — apply to any future OCR mining
1. **Dehyphenation must be `([a-z])-\s+([a-z])`, not `([a-z])-\n([a-z])`.** The break is hyphen + space + newline. The narrower rule leaves `serv- ice` intact. This alone recovered 5 records.
2. **The scan eats the comma after a surname** (`MARIER HENRY J.`, `REILLY^ TERRENCE A.`, `SANSOUCL HECTOR A.`). Those records get swallowed into the man above and disappear silently. The reliable tell: **a second rank word inside one record.** This recovered **56 records**, 34 of them in A–L — meaning session 12's A–F/G–L passes had lost them.
3. **State abbreviations split records.** `Camp Green, N. C. COUNIHAN, ...` — the splitter treats `C. COUNIHAN` as a surname. Fix: the first token of a record may not be a lone initial.

### ⚠️ NEVER blanket-substitute OCR letters
The first M–Z build applied `X→N`, `li→L`, `^→M` across the board and invented men who never existed — "Xliken", "Oounihan", "Pobbs". It was thrown out. **Repairs must come from a curated token dictionary** (`3I`→M, `AV`→W, `]\I`→M, `I)`→D, `>n`/`^n`→Mi, `xl`→A, plus named one-offs). Anything not on the list is HELD, not guessed. `AVILA` is a real given name — do not "repair" it to WILA.

### Queue audit against the maps (all 3,002 vs all 770 located men)
- **6 men removed from the Q — they were already geolocated** and had leaked through session 12's filter: Broderick Walter J. (Calvary) · Collins Parker W. (Calvary) · Courtney Michael D. (Calvary) · Dooley Thomas F. (Calvary) · Dougherty John C. (Calvary) · Humeston Raymond F. (Elmwood). **Their Zack records are below — they belong on the map entries as enrichments, Mark reviews each.**
- **167 first-initial overlaps now carry the TBD qualifier** (95 of them were older entries carrying no warning at all).
- **Franklin, Paul** left in the Q deliberately, pending the Mass Archives check (see §8).

### Zack records owed to the 6 map entries (enrichment, not new entries)
- **Broderick, Walter J.** (Calvary) — Private, Headquarters Company, 31st Field Artillery. Entered service July 9, 1918. Stationed Fort Slocum, N. Y.; transferred to Camp Meade.
- **Collins, Parker W.** (Calvary) — Private, Company K, 73rd Infantry. Entered service June 22, 1918. Camp Devens.
- **Courtney, Michael D.** (Calvary) — Private, Company C, 38th Field Artillery. Entered service July 9, 1918.
- **Dooley, Thomas F.** (Calvary) — Sergeant, Battery B, 11th Regiment, F. A. R. D. Entered service May 31, 1918.
- **Dougherty, John C.** (Calvary) — Private, Medical Corps. Enlisted March 5, 1918.
- **Humeston, Raymond F.** (Elmwood) — Private, United States Army. Entered service August 31, 1918.

### 21 EXACT matches HELD OUT of the Q — Zack enriches a man already in the archive (Mark reviews each)
Calvary: McAllister Bernard R. · Scanlon Michael · Stapleton Thomas H. · Tauscher Otto H. · Thorpe William G. · Vershon Raymond A. · Ward Patrick · Whalen John S.
Queue: McNulty John · MacMenigall Roy · Moriarty Joseph J. · Moynihan Frank J. · Moynihan Patrick J. · Roy Ernest J. · Russell Stewart A. · Stefanik John · Sullivan Jeremiah F. · Tremblay George · Turner Reginald · Wruck William F. · Young Ernest H.
(MacMenigall has a hero story; Turner is the WWI-officer exemplar; Young is a deep-dig citation man.)

### Names too damaged to guess — IN the Q as-is, awaiting transcription from the printed page
Mark's ruling: insert as-is, fix by edit later. Each carries the OCR qualifier in its `sourceNote`.
`Oounihan, Patrick J.` (Counihan?) · `rOURNi:pR, Aime J.` (Fournier?) · `Mevette, KOLAM)` (Roland?) · `Millar, John 15.` (John B.?) · `Perreatjlit, Joseph R.` (Perreault?) · `Presconiia, Edward F.` (Prescott?) · `QUENNEl^LLE, ARMAND.L.` (Quenneville?) · `Racicot, \VILERB]I> A.` (Wilfred?) · `RAI\AU1>, Ulric A.` (Rainault? — a known trap surname) · `Sansouci, E^VOLE`
**`McEwan`** — given name eaten entirely by the scan; never built. Needs hand entry from the page.
Plus 33 of the 129 A–L recovered men have visibly damaged names.

### A–L recovered
**129 men loaded** (source `zack-enlisted-A-L-recovered`) who were in Zack but never made it into the archive — session 12's held/unreadable list plus the newly-recovered swallowed records. 4 more turned out to already be in the Q under the same damaged spelling and were skipped.

### ⚠️ UPLOAD TRAP — two files named index.html
The landing index.html and the research-queue index.html both download as `index.html`; the browser renames the second `index (1).html` and **they go in crossed** — it happened this session and 404'd the site. **Ship them one at a time**, and have Mark clear Downloads between. Sizes are the tell: landing = 8,757 bytes, shell = 26,332 bytes.

### ⚠️ raw.githubusercontent.com LIED AGAIN
It served the stale 8,757 file for research-queue/index.html through repeated cache-busted requests after a successful commit. **Ground truth is the git tree:**
`git clone --depth 1 --filter=blob:none --sparse https://github.com/markwot-ops/Veteran-Archives` then `git ls-tree HEAD --format='%(objectsize) %(path)'`.
The GitHub API is rate-limited to uselessness from this environment. **When Mark says he uploaded it, believe him and check the tree.**

---

## SESSION 13 — NEXT UP

- **Write real person-first narratives** for the ~2,400 Zack placeholders. This is now the whole job — the mining is done. Needs the "needs narrative" filter first (below) or they can't be found.
- **"Needs narrative" sidebar filter** — at 2,996 the Q cannot be browsed by scrolling. Proposed, still not built. This is the blocker on all narrative work.
- **The 6 map enrichments** and **the 21 exact holds** — Mark reviews each.
- **The hand-entry names** — transcribe from the printed page.
- **Three Roll-of-Honor fallen** still not added: Ault, Arthur J. · Wilber, Charles I. · Gately, Edward P.
- ~~Deep-dig citation men~~ — **DONE.** All are in the archive with full narratives and now carry the Cited for Bravery honor. Their citations are transcribed (see Session 13B).
- **Calvary photo work** — 70 files still 404; 16 entries need new stone photos; 22 duplicate-name pairs. Untouched for two sessions.
- **Landing count** is hand-typed text, not calculated. It read 243 for Forestdale (actual 351) and 2,865 for a Q holding 1,879. **Fix it whenever the data changes** — or make it read from the data.


## ============================================================
## SESSION 13B — Honors, citations, story pages, and the source documents
## ============================================================

### ⚠️ THE RULE CHANGED — Mark, this session
**Burial location no longer decides inclusion. Service attributed to Holyoke is the test.** A man whose service is credited to Holyoke belongs in the archive whether or not he is buried here. This supersedes the old "use Harper only to enrich vets already sighted/on maps" rule. It widens the archive considerably — act on it.

### Source documents Mark supplied (all OCR of Holyoke's published histories)
1. **`transfer_to_O-Z.pdf`** — despite the name, the ENTIRE Zack enlisted chapter, A–Z. Definitive. (Session 13)
2. **IDENTIFIED — Wyatt E. Harper, *The Story of Holyoke***, published for the centennial of the City of Holyoke (1973). Harper first wrote it in 1948 for the city's 75th; he chaired the History Department at Holyoke High School for 32 of his 42 years teaching there. **This is the same Harper as `HARPER_VETERANS_COMPLETE.md`.** Every city-history chunk Mark has supplied is from this book. Credit is now correct on the Buckley entry, both Company D pages, and the Parsons page. ⚠️ **IN COPYRIGHT — paraphrase, never quote at length.** (Zack 1919 is public domain and may be quoted freely.)
3. **`WWII_TEST.pdf`** — the WWII casualty list. **USELESS, do not re-mine.** No image layer; the bad OCR is baked into a Pages document. A–D is destroyed (B→R, C→P/T/f, U→I); F–Z reads clean; and the tail comes apart into a block of names followed by a separate block of dates — the Harper two-column trap. Mark is finding another copy. **Never pair those name/date blocks by position.**
4. **The citations document** — the full citation text for every Holyoke honor recipient. Mined in full (below).

### NEW HONOR TYPES (template)
- **`Cited for Bravery`** — ring `#c07a4a`, chip `#7a4a24`. **16 men carry it.**
- **`French Military Medal`** — ring `#5b7f8a`, chip `#2d4a55`. Parsons only.
- **`British Military Medal`** and **`Medal of Honor`** were in use but had no chip color and fell through to the default — both now have one.
`DISTINCTION_ORDER`, `DISTINCTION_COLOR`, and the `fs` chip map at ~line 366 all need an entry for any new honor. Miss one and the badge renders but looks broken.

### Honors applied
- **Cited for Bravery ×16**: MacKenzie, Connor, Turner, Young, LaFlesh, Levenson, MacDonald, Manley, Russell, Brown, Weir, Parsons, Anderson, Leduc, Leverault, Comeau, Donoghue.
- **Croix de Guerre** added to **Stack** and **Ryan** — the record puts them among the men awarded BOTH the DSM and the CdG; only the DSM was on their entries.
- **Parsons** — Croix de Guerre + French Military Medal + Cited for Bravery.
- Everything else in the DSM/CdG honor rolls was **already correct**. The archive was ahead of the document.

### ⚠️ MY BADGE-READING BUG — do not repeat
I dumped the three cemetery data.js files with a script that mapped only `{name,id,era,status}` — **it never read `badges`**. Every cemetery man came back looking bare, and I reported to Mark that Davitt and MacKenzie had no honors. Both were fully badged. Mark caught it. **When dumping for a cross-check, dump the whole object or explicitly include every field you intend to judge.**

### ⚠️ I CREATED 4 DUPLICATES — how, and the lesson
The honor-roll page and the citations page of the same book **spell the same men differently**. I trusted the honor-roll spellings and added four men as "missing" who were already in the archive:
| I wrongly added | Already present |
|---|---|
| Slatery, Robert C. | **Slattery, Robert C.** |
| LeDuc, Ray A. | **Leduc, Kay A.** ("Kay" = OCR of "Ray") |
| Levereault, Arthur V. | **Leverault, Arthur V.** |
| Commeau, Joseph E. | **Comeau, Joseph E.** |
All four removed; the real entries were badged instead. **Leduc, Kay A. was renamed Leduc, Ray A.** with a note explaining the two spellings. **Lesson: cross-check name variants against the archive BEFORE adding, and treat PROJECT.md's own spellings as a tell.**

### ⚠️ THE CITATIONS ADD NOTHING TO THE NARRATIVES — don't re-do this
I wrote all 32 citation deeds into the honored men's entries and had to revert every one: **all 32 already have full researched narratives** from session 12's `zack-heroes` work, and the citations only duplicated them. The archive was already right. **Before enriching, check `source` — `zack-heroes` means a real narrative exists. Do not append to it.**
The citations remain valuable as *verification* — they confirmed the existing narratives are accurate.

### Story pages built (now 9 in /stories)
| Page | Wired to |
|---|---|
| `company-d-104th.html` — "Where Company D Went" | **127 men** (124 Q, 1 Calvary, 2 Forestdale) |
| `company-d-1898.html` — "San Juan and El Caney" | **13 men** — the 11 Spanish-Am dead + Crosier + Slate |
| `ryan-story.html` — Major Ryan's Victory Loan speech | Ryan, William P. (his 2nd link) |
| `parsons-escadrille.html` — "The Holyoke Man Who Flew for France" | Parsons, Edwin C. |

**Company D itinerary** (from the city history): reorganized Camp Bartlett, Hampden Plains, Sept 1917 · Montreal → Halifax → Liverpool Oct 17 · trained at Sartes · Chemin-des-Dames Feb 6–Mar 21, 1918 · Apremont Easter Sunday, then Montsec three months · Belleau Wood · Château-Thierry · St. Mihiel Sept 11–12, took St. Maurice, five miles in thirty hours · north of Verdun, over three times in one day. **Of the original 150 Holyoke men who answered in April 1917, 13 were in the ranks at the Armistice.**

**⚠️ Why a story page and NOT narrative text:** the men joined Company D at different dates — some from the 1916 Mexican border, some spring 1917, some as late replacements. Bolting the company itinerary into 127 narratives would invent service for most of them. The page carries a caution saying so. **Same principle for any future unit-history material.**

### Spanish-American War — Company D, 2nd Mass. Volunteers
Mustered May 3, 1898 under Capt. William J. Crosier (elected by the company — the last American war fought by volunteers, and the last in which units chose their own officers). Landed Cuba June 21 · Siboney · up the mountain in single file beside the Rough Riders · San Juan surrendered · outpost before Santiago June 27 · **El Caney July 1, where most American casualties fell**. Malaria and yellow fever killed more Americans than Spanish bullets. Lieutenants Robert W. Hunter and Francis D. Phillips were Crosier's aids; Cpl. **Edmund J. Slate** later became a general, from Holyoke.
**All 11 Spanish-Am dead were already in the Q** — Train, Collier, Mattice, Bogart, Coit, Chamberlain, Bonneville, Canavan, Dugas, Hazelwood, Mackey.

### Dennis J. Buckley — enriched (Calvary)
Now opens with the boy: boxed as **"Danny Buckley"** in the late thirties, came up through the **Golden Gloves**, fought while still a high school senior, well known throughout New England, then graduated, lost interest in the fight game, and joined the navy. Added: **his mother christened the ship.** All previously verified Navy facts untouched.
**Conflict noted:** the city history says the explosion killed Danny and **eight** shipmates; the verified Navy record says **seven of the fourteen**. The entry follows the Navy record.

### Edwin C. Parsons — Lafayette Escadrille (unresolved, flagged on his page)
Joined **January 24, 1917**, one of 38 American volunteers, months before America entered the war. Later FBI special agent, Hollywood technical director, **Rear Admiral** USN in WWII, died Osprey, Florida, **1968**.
**Open questions, all flagged in a research note on the page:**
- **Score:** his citation (Official Journal, July 2, 1918) says **three** downed; the footnote adds **four more** = **seven**. The honor-roll page says **eight**.
- **Name:** printed as both **Edwin C.** and **Edward C. Parsons**.
- ***Wings*:** the source calls it a book about the Escadrille; it is better known as a 1927 film, and Parsons wrote his own memoir.

### Other men named in the sources, NOT yet in the archive — Mark to rule
- **Howard J. Burnett** — Lt., USN, **1955–58**. Would be the **first man in the Cold War filter**, which is empty. Holyoke native; W&J College president.
- **Richard Murphy** — Transcript reporter, ran the **Fort Devens Digest** in service; City Editor 1945, later Managing Editor.
- **Nathan P. Avery** — Mayor, School Committee, **Holyoke's WWII Draft Board**. Civilian service; probably not an entry.
- **Richard P. Towne** — Plattsburg ROTC, 1918.
- **William S. Loomis** — lieutenant, Holyoke's **Company B, 46th regiment**, North Carolina.

### Possible duplicate pairs surfaced (unresolved)
Boudreau Alexander / Boudreau Alex · Read Harry David / Read Henry D. · Doyle William / Doyle William E. · Twiss Robert R. / Twiss Robert · Ryan William P. / Ryan William · Parsons Edwin C. / Parsons Ernest L. · Blais Albert / Blais Alfred

### Junk sitting in live folders — should be deleted
`calvary/calvary-PREVIEW-standalone.html` (389,985) · `forestdale/forestdale-PREVIEW-standalone.html` (379,359) · `forestdale/forestdale.zip` (52,087). Old scaffolding. Harmless but confusing.

### ⚠️ CARD ORDER MUST MATCH THE STACK
When presenting files, present them in the SAME order as the upload stack, and number them. Mark reads card #1 as stack line #1. I presented ten files "most relevant first" against a stack in a different order and confused him. **Number every card to its destination.**

### Verified state at end of Session 13B (git tree, commit 35f937d)
| Path | Bytes |
|---|---|
| index.html (landing, reads 375/351/44/2,996) | 8,757 |
| template.html | 26,711 |
| research-queue/data.js — **2,996** | 1,905,963 |
| research-queue/index.html | 26,711 |
| calvary/data.js — 375 | 367,057 |
| forestdale/data.js — 351 | 356,555 |
| stories/ | 9 pages |


## ============================================================
## SESSION 13C — Harper identified, multi-era, the Civil War and the Revolution
## ============================================================

### ⚠️ THE SOURCE IS WYATT E. HARPER, *THE STORY OF HOLYOKE* (1973)
Found by search. Centennial edition; first written 1948 for the city's 75th. Author was Holyoke High's history chairman — **and Captain Wyatt E. Harper Jr., USN, in the archive, is his son.** The book is **in copyright**: two long verbatim passages I had put on story pages (the Company D "150 men… 13 in the ranks" line and the El Caney depot-hospital account) were **replaced with paraphrase**. Do not quote Harper at length. Zack (1919) is public domain — Ryan's whole speech is fine.

### ⚠️ RULE: ALL SERVICE PERIODS ARE DENOTED — `era` NOW ACCEPTS AN ARRAY
Mark's ruling. The template was rewritten for it:
- **`normEras(raw)`** — accepts a string OR an array, returns a deduped array sorted by `ERA_ORDER`. **Strings still work; every legacy entry is untouched.**
- **`eraLabel(raw)`** — joins with ` · ` for the sidebar and the branch line.
- **`eraColor(raw)`** — uses the FIRST era for the pin colour.
- **filter** — `normEras(v.era).some(e => activeEras.has(e))`: a man shows if ANY of his periods is lit.
- **counts** — a multi-era man counts once under EACH of his chips.
```
"era": ["World War II","Korean War","Cold War","Vietnam"]   // Harper, Wyatt E., Jr.
```
**Korean War and Cold War now have men in them — both filters were empty before.**

### ⚠️ THE ERA FIELD WAS HIDING 27 MEN'S FATES — FIXED
27 WWII entries had the fate stuffed into `era` as a string: `"World War II · Killed in action"`, `"· Died non-battle"`, `"· Finding of death"`, `"· Died of wounds"`. `normEra` reduced them all to `World War II` and **threw the fate away** — and all 27 carried **no badges at all**. Thirteen of Holyoke's WWII dead had no gold star on them and could not be found by the Honors filter.
Fixed: `era` cleaned to `"World War II"`; **the fate written into the narrative** ("The War Department's casualty list records him as killed in action.") so it can never be silently lost again; badges applied — **13 KIA**, **10 Died in Service**.
**⚠️ 4 STILL NEED MARK'S RULING — no badge applied:**
| Man | Classification |
|---|---|
| Goss, Edwin G. | Finding of death |
| Henderson, John C. | Finding of death |
| Jecker, Joseph E. Jr. | Finding of death |
| Wiercisewski, Carimir | Died of wounds |
*Finding of death* is the legal determination after a man stays missing — not a battle classification. *Died of wounds* is usually counted KIA. **Do not decide these without Mark.**

### TWO NEW CEMETERY SITES — Rock Valley + Smiths Ferry
Built from Harper's list of Revolutionary graves. Both live, both **100% unplotted** — entries have `lat/lng: null`, which the template handles via `hasCoords()` (sidebar row, no pin, no flyTo). Their landing cards read **"Veterans of Record"**, not "Geolocated", for exactly that reason.
**⚠️ THE CENTERS ARE PROVISIONAL — MARK MUST CORRECT THEM.** No coordinates for either cemetery exist online; a places search returns nothing. Currently:
- `rock-valley` — center `[42.2059,-72.6803]`, zoom 16 (Rock Valley Rd, West Holyoke near the Southampton line)
- `smiths-ferry` — center `[42.2584,-72.6143]`, zoom 16 (the Smiths Ferry area, north of the city)

### 76 MEN LOADED FROM HARPER
**All 51 Civil War dead → Research Queue** (`source: harper-civil-war-roll`, era `Civil War Era`). Not one was in the archive. Holyoke sent 400+ soldiers and sailors over four years; more than 50 died. **Only Myron C. Pratt carries a badge (KIA)** — Harper says he was killed at Fair Oaks. For the other 50 Harper gives a name and nothing else, so **no fate was guessed.**
**Pratt's story:** he ran the *Holyoke Mirror*; one day in 1861 he closed the office, went out to lunch, enlisted in the Tenth Massachusetts, and was killed at Fair Oaks.
**25 Revolutionary men → their cemeteries** (`source: harper-revolutionary-graves`, era `Revolutionary War`, `status: located`, no GPS): Elmwood +17, Forestdale +1 (Erastus Morgan), Rock Valley 4, Smiths Ferry 4.
**Sgt. John Walker is now in as a Civil War man** — deliberately separate from Calvary's John Francis Walker, per the standing false-match rule. **The strict cross-check re-confirmed that trap**, plus three more the loose matcher invented.

### ⚠️ NAME MATCHING ACROSS CENTURIES — first-initial fallback is POISON
My first cross-check used a first-initial fallback and produced pure garbage: "John Walker → James J. Walker", "Hiram K. Bean → Bean, Harold F.", "Jedediah Day → Joseph Day", "Jesse Morgan → J. Morgan". **When matching 1770s/1860s rolls against an archive full of WWI/WWII men, require an EXACT first-name match.** Surnames collide across 150 years.

### HARPER IS WRONG TWICE — the archive is right, do not "correct" it to match him
- Harper: **Elisha Chapin** killed at Williamstown *during King Philip's War*. The Elmwood entry says Fort Massachusetts, 1756 — French & Indian War. King Philip's War ended 1676. **Harper is off by eighty years.**
- Harper: **Joseph Morgan** captured at the capitulation of *Fort McHenry*. The entry says Fort William Henry, 1757. Fort McHenry is Baltimore, 1814. **The archive is right.**
Harper is a schoolteacher's popular history, not a primary source. **Treat him as a finding aid, verify against records.**

### Harper material NOT yet used — worth building
- **Elizur Holyoke**, the city's namesake — lieutenant then captain of militia, **died February 5, 1676 commanding troops in King Philip's War.** Not in the archive; no era filter exists for King Philip's War.
- **Eunice Day** — gave her husband Joel and all five sons (Joel, Jedediah, Eli, Edward, Robert) to the Revolution. **The Holyoke DAR chapter is named for her.** A story page waiting to be written; her men are now in Elmwood and Smiths Ferry.
- **Francis C. Heywood** (Croix de Guerre, already in the archive) — Cornell, joined his father at Whitmore Mfg. in 1911, **Mexican border with the National Guard 1916**, France with the AEF 1917. **His father died while he was overseas** and the family interest was sold. Later treasurer of the Marvellum Company. His entry has none of this.
- Edward Day and Robert Day are named on their father Joel's stone at Elmwood **but are not buried there** — Edward at Troy, N.Y.; Robert at Ticonderoga. Harper confirms what the archive already says.

### More Holyoke men named by Harper, NOT in the archive — Mark to rule
- **Donald R. Dwight** — Lt. Governor of Massachusetts; Princeton '53, **U.S. Marine Corps infantry officer two years incl. a tour in Japan**, six years reserves.
- **Maurice A. Donahue** — Senate President; **U.S. Army Air Force 45 months, enlisted a private, discharged a Captain, 1942–46.**
- **John S. Begley** — **naval aviation in World War I, Ensign**; WWII chief of the Springfield Ordnance District; first commander of American Legion Post #25 of Holyoke.
- **Judge John F. Moriarty** — Harvard Naval V-12, Columbia Midshipman's School, **commanding officer USS PGM-19, Pacific**, active duty 1943–46.
- **Judge Gerald D. McClellan** — **U.S. Army Armoured Division, 1st Lieutenant, 1961.**
- **Howard J. Burnett** — Lt., USN 1955–58. (Still open from 13B.)
- **Richard Murphy** — ran the *Fort Devens Digest*. (Still open from 13B.)
⚠️ **Several of these men were living when Harper wrote.** Harper prints home addresses and children's names — **the Harper Jr. entry deliberately omits the family's Alexandria address and the six children.** Do not publish living people's addresses on a public memorial.

### ⚠️ UPLOAD: GitHub CANNOT rename a dragged file
I told Mark to "type the path into the filename box." **You cannot — the upload page won't let you edit a dropped file's name, and macOS won't allow a slash in a filename.** Smiths Ferry silently failed twice because of this.
**What works for a NEW folder: zip the folder, have Mark unzip it, and drag the FOLDER onto the upload page.** GitHub keeps the folder path. That is how `smiths-ferry/` finally landed.
The other route is https://github.com/markwot-ops/Veteran-Archives/new/main — typing `folder/file.ext` there creates the folder.

### ⚠️ NEVER PUT A CAVEAT AFTER THE STACK
I gave Mark a ten-file upload order and put a "note on 6–9, those folders don't exist yet" **underneath it**. He had already uploaded by the time he read it. **Anything he needs to know goes BEFORE the stack. No exceptions.**

### Verified state at end of Session 13C (git tree, 41aac86)
| Path | Bytes | Count |
|---|---|---|
| index.html (landing) | 9,108 | 375 / 352 / 61 / 4 / 4 / 3,047 |
| template.html | 27,152 | multi-era shell |
| research-queue/data.js | 1,954,235 | **3,047** |
| calvary/data.js | 367,057 | 375 |
| forestdale/data.js | 357,490 | 352 |
| elmwood/data.js | 63,807 | 61 |
| rock-valley/data.js | 4,003 | 4 |
| smiths-ferry/data.js | 4,004 | 4 |
| stories/ | — | 9 pages |
**Calvary is still on the OLD shell (24,406)** — it has no `sourceNote` entries so nothing breaks, but it lacks multi-era and the new honors. Re-copy `template.html` to `calvary/index.html` next time Calvary is touched.

### Junk in live folders — still there, should be deleted
`calvary/calvary-PREVIEW-standalone.html` · `forestdale/forestdale-PREVIEW-standalone.html` · `forestdale/forestdale.zip` · `elmwood/elmwood-PREVIEW-standalone.html`

---

## OPEN FOR MARK — top of the pile
1. **Real coordinates** for Rock Valley and Smiths Ferry.
2. **Four rulings**: Goss / Henderson / Jecker (Finding of death), Wiercisewski (Died of wounds).
3. **Rulings on the Harper men above** — Dwight, Donahue, Begley, Moriarty, McClellan, Burnett, Murphy.
4. **A "needs narrative" filter.** At 3,047 the Queue cannot be browsed. Still the blocker on all narrative work.
5. **The WWII casualty list** — Mark is sourcing a better copy.


## ============================================================
## SESSION 13D — the index freewheels, and the Honor Roll
## ============================================================

### ⚠️⚠️ I SHIPPED A BLANK ARCHIVE. READ THIS FIRST.
Every map went blank on all six sites. Cause: I rewrote the sidebar render to a windowed list but **left the old teardown in `buildSidebar()`** — `list.innerHTML = ''` deleted `#pad-top`, `#rows`, `#pad-bot`, so `getElementById('rows')` returned null and nothing ever drew.
**I only found it because I finally RAN the page.** I had "verified" the change by checking that the JavaScript *parsed*. Parsing proves nothing.
**THE RULE: never ship a shell change without running it.** The harness is in the repo — see `reference/tests/`.
Two more real bugs the harness caught in the same hour:
- **Any throw inside the scroll-feel block killed the whole page**, index included (jsdom has no `matchMedia`; a real browser has it, but the lesson stands). That block is now wrapped in try/catch — *feel is a nicety, the index is not.*
- **Scrolling past the end of a filtered list drew zero rows.** Search a name, the old scroll position points beyond the shortened list. Now clamped.

### THE WINDOWED INDEX — how the sidebar works now
`content-visibility` was tried first and **abandoned**: it needs the row-height estimate to be exact, and mine said 34px when rows are 40px — an 18,000px lie across 3,052 rows, so the list grew as you scrolled and the scrollbar fought your hand.
Now: **true windowing. Only visible rows exist.**
```
ROW_H = 40      // MUST equal .vet-item height in the CSS. If these drift, everything drifts.
OVERSCAN = 8    // rows drawn beyond each edge so a fling doesn't flash blank
#vet-list > #pad-top + #rows + #pad-bot
```
- `drawWindow(force)` — computes first/last from `scrollTop`, draws that slice into `#rows`, sets the two pads to the exact height of what isn't drawn. **31 rows in the DOM at 3,052 veterans.** Arithmetic verified exact at top, middle and bottom (122,080px every time).
- `ensureScaffold()` — rebuilds pad/rows/pad if anything wipes them. Self-healing, because that's exactly what bit us.
- **`buildSidebar()` must clear `#rows` ONLY — never `#vet-list`.**
- Clicking a man: his row **may not exist**. Never use `scrollIntoView` for an undrawn row — compute `pos * ROW_H`, scroll there, then `drawWindow(true)`.
- One delegated click handler on `#vet-list` (3,052 per-row listeners is what forced the old chunking).

### SCROLL FEEL
- **Grab-and-fling**: pointerdown/move/up on the list, velocity smoothed, released with friction 0.93. A drag past 4px suppresses the click so a fling never opens a man.
- **Notched wheels** (`deltaMode===1 || |deltaY|>=50`) get weighted momentum. **Trackpads are left alone** — they already coast, and double-pushing them feels awful.
- Touch keeps native momentum. `prefers-reduced-motion` disables all of it.

### THE HOLYOKE VETERANS HONOR ROLL
**`honor-roll/index.html` IS `template.html`** — the ordinary map shell with one line swapped: the single `<script src="data.js">` becomes all six, loaded in order, each followed by a shim that grabs `window.VA` before the next file overwrites it. **No fetch, no async, no eval.** Then a merge script builds `window.VA` from the lot.
- Map centres on the **city** — `center:[42.2043,-72.6162], zoom:13` — because these men are scattered across every ground.
- **Photos need no rewriting**: every `photo` is an absolute `raw.githubusercontent` URL. (This is why the legacy repos' image files must never be deleted.)
- Each man's `branchLabel` gets his ground appended — *"Navy • World War I — Forestdale Cemetery"*, or *"— resting place not yet known"*. **Fall back to `branch + era` first**, or the label alone silently replaces the service line of anyone whose `branchLabel` is empty.
- **`window.INIT_DISTINCTION`** (set from `?honor=`) is read by the shell as the starting `activeDistinction`. It does **NOT** cut the data down — all 198 are always loaded; the URL only arrives with that row lit, exactly as if Mark had clicked it. Harmless on cemetery maps (undefined → null).
- The shell drops `activeDistinction` if no matching legend row exists, rather than show an empty map with nothing lit to explain why.

### ⚠️ TWO LISTS THAT MUST MATCH OR MEN VANISH
`DISTINCTION_ORDER` in the shell, and `ORDER` in the landing page's script. **If an honor is on the landing box but not in the shell's list, clicking it opens to every man with no lit row** — silent nonsense. The honor map's loader has its own hardcoded `HONORS` set for the same reason (it runs before the shell defines anything). **Three places. Change one, change all three.**
**Currently 12 honors.** Mark removed **Died in Service, Female Veteran, Medical Officer** — *"irrelevant now, we can revisit later."* The 22 men holding only those are not carried onto the honor map (nobody sits there unreachable); their badges still show on their own entries and cemetery maps.

### THE HONORS BOX
- **On the landing page** it lives in the grid where its card used to be: title centred — *HOLYOKE VETERANS HONOR ROLL* — twelve honors with rings and counts, footer *"198 honored / See them all →"*. Rows deep-link to `?honor=X`. The card that read "Every decoration in the archive" is gone.
- **On the map**, one click isolates an honor, clicking again clears it. When one is chosen the other eleven drop to **30% opacity** and the chosen row's dot pulses at full strength — before this, everything sat at full brightness and you couldn't see which one you were in.
- **Clicking the word "Honors"** at the top of the box brings all of them back. A *"show all"* hint appears beside it only while something is filtered (`#legend:has(#leg-distinct.filtered)`).

### ⚠️ 199 FORESTDALE MEN HAD NO `id` — FIXED
Over half of Forestdale (199 of 352) had **no `id` field at all**. The maps never cared — they address men by array position — but **everything keyed on id silently collapsed all 199 into one**. My honored count read 209 when the truth was 220. **The bug was hiding eleven honored veterans.**
All now carry generated ids (`fd_surname_first`); existing ids untouched. Every other site was already clean. **Any new entry must have an id.**

### Numbers, and why they differ
- **220** — men holding any badge at all.
- **198** — men holding one of the twelve honors the roll uses. This is what the landing box and the honor map show.
- **30** of those 198 have graves found. Medal of Honor: **1 of 3**. Purple Heart: **14 of 71**. Cited for Bravery: **1 of 17**. That gap is the work.

### Five more Harper men loaded (Queue 3,047 → 3,052)
**Donahue, Maurice A.** (USAAF 45 months, private → captain, 1942–46) · **Begley, John S.** (naval aviation, WWI ensign; WWII Springfield Ordnance District — uniformed or civilian is unclear, flagged) · **Moriarty, John F.** (CO, USS PGM-19, Pacific) · **Dwight, Donald R.** (Marine infantry officer, Japan) · **McClellan, Gerald D.** (Army armour, 1st Lt., 1961).
**Cold War now holds 3 men, Korean War 1** — both filters were empty.
**Harper, Wyatt E., Jr. already had a full researched narrative** — better than the draft I was about to write. He only needed his era converting to an array. **Always read the entry before writing one.**

### `reference/LOCAL-COLOR.md` — the companion for narrative work
Harper's Holyoke condensed to **facts in note form, deliberately not his prose** (the repo is public; Harper is in copyright). The B-17s circling the city, the spotters at Ashley Ponds and Scott Tower, Eunice Day's five sons, Heywood's father dying while he was in France, the mills and who ran them. It ends with rules for use — the important one: **describe the city a man left; never invent what he did.**

### `reference/tests/` — RUN THESE BEFORE SHIPPING A SHELL
`npm install jsdom`, then from a folder holding the shell and the data files:
- `node test_index.js research-queue` — loads the real shell with real data, stubs Leaflet, asserts rows actually render; then filters, searches, scrolls.
- `node test_honormap.js "Medal of Honor" "MacKenzie"` — asserts the honor map merges all six sites, lights the right row, dims the rest, and **flies to the man's real coordinates**.
- `node test_landing.js` — asserts the landing box reads every site and lists only filterable honors.
**These exist because "it parses" let me hand Mark a blank archive.**

### ⚠️ UPLOADING A NEW FOLDER — the only thing that works
**GitHub cannot rename a dragged file, and macOS won't allow a slash in a filename.** Do not tell Mark to "type the path."
**Zip the folders, have him unzip, then drag the folders INSIDE the wrapper.** Dragging the wrapper itself put six shells into a useless `site-shells/` folder — the whole batch missed. The zip is named `DRAG-THESE.zip` and the instruction goes **before** the stack, never after.

### Verified state at end of Session 13D
| Path | Bytes | |
|---|---|---|
| index.html (landing) | ~13.4k | Honors box in the grid |
| template.html | 34,891 | windowed + freewheel + INIT_DISTINCTION |
| */index.html (6 sites) | 34,891 | all six on the same shell |
| honor-roll/index.html | 38,225 | the shell + six data loaders |
| research-queue/data.js | 1,959,651 | **3,052** |
| forestdale/data.js | 372,235 | **359** |
| calvary / elmwood / rock-valley / smiths-ferry | — | 375 / 61 / 4 / 4 |

---

## NEXT SESSION — Mark's two projects, then a pause

### 1. STATE CASUALTY LISTS — Korea, Vietnam, World War II
Mark has state casualty lists broken down **by city**. Every page must be walked to pull the Holyoke men.
**Before mining a single name, re-read these:**
- **§13C name matching** — first-initial fallback across centuries is poison. Require an EXACT first-name match.
- **§13 parsing traps** — dehyphenation is `([a-z])-\s+([a-z])`; the scan eats commas after surnames (a second rank word inside one record is the tell); state abbreviations split records.
- **Never blanket-substitute OCR letters.** Curated token dictionary only. Hold what you can't read; Mark's ruling is *insert as-is, flagged, fix by edit later.*
- **The WWII reconciliation is still open**: 197 confirmed / 212 city memorial / 211 Harper. Harper's own WWII chapter says *"over two hundred"*. The Korea and Vietnam lists are **new ground** — the Queue holds only ~13 Vietnam and ~18 Korea-era men.
- Cross-check every name against **all six sites** before building, and mark same-name traps TBD.

### 2. ~150 FORESTDALE PHOTOS — not yet uploaded
Mark has ~150 cemetery photographs from Forestdale still on his computer.
- **GPS**: PIL `img._getexif().get(34853)`, DMS rational tuples via `float()`, apply hemisphere sign.
- **HEIC → JPEG** conversion, then the *" Medium.jpeg"* filename convention (space, not underscore), URL-encoded, HEAD-checked before use.
- Photos live in the **legacy repos** (`forestdale-map` etc.) and are linked by absolute raw URL. **Never delete the image files in those repos.**
- **Verify every upload with a HEAD request to raw.githubusercontent.com.** Never trust "I uploaded it."
- **raw lies.** Ground truth is the git tree: `git clone --depth 1 --filter=blob:none --sparse …` then `git ls-tree HEAD:<folder>`.

### Still open, older
- **Real coordinates** for Rock Valley and Smiths Ferry — both centres are provisional guesses.
- **Four rulings**: Goss / Henderson / Jecker (*Finding of death*), Wiercisewski (*Died of wounds*).
- **A "needs narrative" filter.** At 3,052 the Queue can't be browsed by eye. Still the blocker on all narrative work.
- **Calvary photo backlog** — 70 files 404, 16 need new stone photos, 22 duplicate-name pairs. Untouched for three sessions.
- **Junk to delete**: `site-shells/`, root `data.js`, root `LOCAL-COLOR.md`, the `*-PREVIEW-standalone.html` files, `forestdale.zip`.
- **Revisit**: Died in Service / Female Veteran / Medical Officer as honors.


## ============================================================
## SESSION 13E — the field photographs, and what the archive actually is
## ============================================================

### THE PHOTO PIPELINE — proven, and the container is NOT ready by default
`pillow_heif` is **not installed** in a fresh container. `pip install pillow_heif --break-system-packages`, then `pillow_heif.register_heif_opener()`. Pillow alone will not open HEIC.
GPS: `img._getexif().get(34853)` → DMS rational tuples → `float()` → apply hemisphere sign (S/W negative). Mark's iPhone JPEGs carry GPS to six decimals and it is **accurate to the plot** — every photo matched its existing entry to 0m.
**Test it against a coordinate you already know before trusting a batch.** I proved the maths against MacKenzie's plot (42.207128, -72.622925) before Mark's photos arrived.
Filename convention on upload: `<stem> Medium.jpeg` — **space, not underscore**, URL-encoded in the `photo` field.
**A photo with no GPS is REPORTED, never guessed at.**

### ⚠️ THE PHOTOS ARE ALREADY IN GITHUB — the job is the MATCH, not the upload
Mark shoots in the field and uploads the images to the legacy `forestdale-map` repo himself. The entries then exist as **surname- or initial-only stubs** (`Phillips`, `Sanders, J.`, `Schimke, D.`) with GPS and photo but **no era and no given name**. What he wants from Claude: **read the stone, name the man, and cross-check him against the Research Queue.**
Match stubs to photos by **GPS (0m) and by the photo filename** — both are reliable.

### ⚠️⚠️ WHAT THE RESEARCH QUEUE ACTUALLY IS — read before cross-checking anything
**The Queue is 92% First World War (2,795 of 3,052) and almost every list feeding it is a list of men who DIED.**
| source | what it is |
|---|---|
| `zack-*` (2,550) | Zack 1919 — men who **served**. WWI only. **Demonstrably incomplete.** |
| `research-queue` (314) | **Harper's honor rolls of the DEAD**: 113 WWI · 177 WWII · 11 Spanish-Am · 12 Vietnam |
| `harper-civil-war-roll` (51) | Harper's Civil War **dead** |
**Consequence: a field find will usually NOT match.** Eight stones photographed, one match. The men in the ground are survivors — Civil War veterans who came home, WWII men who died in 1987, Spanish-Am men who died in 1923. **No list of Holyoke's veterans who survived exists in this archive.** That is the gap the survey is filling. Do not read a non-match as a failure.

### ⚠️ ONLY TWO OF HOLYOKE'S CIVIL WAR DEAD ARE BURIED IN HOLYOKE
From the Forestdale Cemetery tour (holyokecanaltour.org — a genuinely useful source, run by a local historian, with maps, booklets and audio):
- **James William Burr** — died Sept 10, 1861, District of Columbia; buried East Wilbraham ten years; **moved to Forestdale 1871.**
- **Thomas S. Holman** — **wounded at Second Bull Run**, carried to Goshen, died about a month later; buried Forestdale.
Both are now **Forestdale entries** (`fd_burr_james_w`, `fd_holman_thomas_s`, no GPS yet) with their stories, and their Queue entries are cross-noted.
**If the tour is right, the other 49 of Harper's 51 will NEVER be found in Holyoke ground** — they lie where they fell. They belong in the archive as honored dead; **do not send Mark looking for them.**
Also on that page: **Andrew Butler**, a GAR man at Forestdale (not in the data), and a **GAR circle at the front of the cemetery** — a dedicated Grand Army plot. **That circle is where the Civil War veterans are.**

### Session 13E — what went in (Forestdale 352 → 359)
**THE MATCH:** **Schoenfeldt, Louis B. F.** — PFC, Co. B, 1st Machine Gun Battalion, WWI, Apr 10 1895 – Aug 19 1965. **Zack's roster carries him as "Louis F. B." — initials transposed. The STONE WINS**, and the transposition is recorded in his `sourceNote`. A man on the 1919 list, now in known ground.
**Named from their stones:** James B. Sanders (CPL, WWII, 1907–1987) · Donald Schimke (TEC 4, WWII, 1914–1979).
**New men:** **Sanders, Earl J.** — white marble government headstone, *PVT, 305th Infantry*, September 1918, WWI bronze star. **Roberts, John H.** (1842–1919) under a **G.A.R. Post 71 star** — a Union veteran who came home. Riggott · Richard, Edgar · Rowell.
**Forestdale already held 8 located Civil War men** (Friedrich, Jolly, Cowan, Sinclair, Streeter, Ironside, Wood, Unknown Soldier 5) — several found by their GAR stars. **Now 10.**

### ⚠️ WHERE THE STONE DOESN'T SAY, THE ENTRY SAYS SO — do not "resolve" these
Mark's ruling: **load as-is, transcribe the stone, record the marker, state the question honestly.** Never choose between a father and his son.
- **Phillips** — U.S. War Veteran marker over George B. (b. 1887, WWI age) AND Wallace (b. 1916, WWII age). Base cut FATHER/MOTHER/SON. **Unresolved, possibly both.**
- **Riggott** — V.F.W. marker over Stephen J. (b. 1871, Spanish-Am age — the V.F.W. was founded by those men) AND Harold J. (b. 1899, WWI age). Roy died at 17 in 1914.
- **Pickup** — flag + **Elks lodge marker, which is fraternal not military**. A *Herbert B. Pickup* is on Zack's roster; **relationship unknown and NOT assumed.**
- **Rowell** — surname only on the photographed face. Try the reverse.
- **James F. Sanders** (1946–2013) and **Edgar Richard** (1909–1997) — **no service line on either stone.** Carried with "his service is unconfirmed and is not claimed here."
**107 Forestdale plots now sit with no era** — photographed, located, veteran-marked, unnamed. That is the survey's true shape: the stones get you to the plot, the records get you the man.

### Two open threads worth Mark's ten minutes
1. **Earl J. Sanders is on NEITHER Holyoke list** — not Harper's 113 WWI dead, not Zack's roster — yet the Army set a headstone over him with a 1918 date. If he is Holyoke's, **Harper's roll of the dead is incomplete too.**
2. **Two of the three "Roll-of-Honor fallen still to add" may already be in, under variant spellings.** Harper prints **Gatley, Edward P.** and **Wilbur, Charles R.**; PROJECT.md's to-do says "Gately, Edward P." and "Wilber, Charles I." Same men, or the same-name trap. **Only Ault, Arthur J. is genuinely absent.** Check against the memorial itself.

### Not in the repo
`reference/tests/` — the three jsdom harnesses (`test_index.js`, `test_honormap.js`, `test_landing.js`) and their README **never got uploaded**; only LOCAL-COLOR.md is there. They are described in §13D. **Rebuild or re-ship them before touching the shell.**

### Verified live state at end of 13E (git tree, 6c4638e)
| Path | Bytes | |
|---|---|---|
| PROJECT.md | 71,995 → this file | |
| index.html (landing) | 13,262 | Honors box in the grid, 12 honors |
| template.html | 34,891 | windowed index + freewheel + INIT_DISTINCTION |
| honor-roll/index.html | 38,225 | the shell + six data loaders |
| research-queue/data.js | 1,959,651 | **3,052** |
| forestdale/data.js | 372,235 | **359** |
| calvary / elmwood / rock-valley / smiths-ferry | — | 375 / 61 / 4 / 4 |
| reference/LOCAL-COLOR.md | 11,422 | |
**Honors: 12. Died in Service / Female Veteran / Medical Officer removed at Mark's direction — "irrelevant now, revisit later."**

---

## NEXT SESSION
1. **~130 more Forestdale photos.** Mark shoots and uploads; Claude reads the stone, names the man, cross-checks the Queue. Read §13E first — expect few matches, and that is normal.
2. **The state casualty lists — Korea, Vietnam, WWII**, by city. Mark estimates the WWII batch alone at **4,000–7,000 names**, possibly starting from a plain list. Re-read the parsing traps in §13 and the name-matching rule in §13C **before mining a single name.**
3. **Research the unresolved plots** — Phillips, Riggott, Pickup, Rowell, Richard, and the 107 no-era plots. Sources: the city's graves-registration cards, the city clerk, the GAR Post 71 rolls, Find A Grave, FamilySearch.
4. Still open: real coordinates for Rock Valley and Smiths Ferry · the four rulings (Goss/Henderson/Jecker "Finding of death", Wiercisewski "Died of wounds") · a **"needs narrative" filter** (the blocker on all narrative work at 3,052) · the Calvary photo backlog, untouched for four sessions.

## ============================================================
## SESSION 13F — the index freewheel (solved), and Zack's Roll of Honor from the page
## ============================================================

### ⚠️ THE FREEWHEEL WAS NEVER THE WHEEL — it was Chrome's scroll anchoring
Five rewrites of the wheel code changed NOTHING, because none of it was the cause. The windowed
index changes `#pad-top`'s height on every redraw; Chrome reads that as content shifting above the
viewport and moves `scrollTop` to compensate, which forces another redraw, which moves the pad
again. That feedback loop is the "free run." It fired hardest on a CHANGE OF DIRECTION — which is
the clue Mark gave that finally solved it.
**The fix is one line of CSS:** `#vet-list, #pad-top, #rows, #pad-bot, .vet-item { overflow-anchor:none; }`
**Any virtualised list MUST have `overflow-anchor:none`.** Scrolling is otherwise the browser's own —
there is no custom wheel code in the shell and there must not be.

### ⚠️ WHAT I WASTED MARK'S MORNING ON — read before touching scroll feel again
I shipped four fixes without measuring: friction, then a velocity cap, then 1:1, then a rate cap.
All four were tuned to ceilings a hand never reaches (I capped at 160 and 44 px/frame; Mark scrolls
~18). **`reference/wheel-check.html` measures what the browser really sends** — it reported 19
events/sec, deltaY 57, deltaMode 0, and NO coast at all. Momentum never existed. **Measure first.**

### THE A–Z RAIL (new, in the shell)
At 3,056 the Queue cannot be browsed by scrolling — PROJECT.md had said so twice before I listened.
`#az-rail` sits on the RIGHT of `#vet-list` (Mark's preference — it was tried on the left and moved back).
- `buildRail()` maps letter -> first row in FILTERED, rebuilt on every filter/search; letters with
  nobody under them go `.dead`.
- `jumpTo(L)` computes `pos * ROW_H` — **never `scrollIntoView`, the row may not be drawn.**
- `litLetter()` lights the letter you are looking at and follows the list as it moves. It is called
  from `drawWindow()` AND from the end of `buildRail()` (the rail is built after the first draw, so
  without the second call nothing lights at load).
- `RAIL_LIT` caches the lit letter so the DOM is only touched on change.

### ⚠️ "AULT, ARTHUR J." NEVER EXISTED — he is PERRAULT, ARTHUR J.
Mark supplied clean page scans of Zack's Roll of Honor. The OCR had eaten the first four letters of
**PERRAULT**. Every detail matches the man PROJECT.md listed as missing: 3rd Aero Squadron, first
Holyoker to pilot a machine in France, killed in an aeroplane accident March 7, 1918.
**All three long-standing "Roll-of-Honor fallen still to add" are now IN, corrected from the page:**
| PROJECT.md had | the printed page says |
|---|---|
| Ault, Arthur J. | **Perrault, Arthur J.** |
| Wilber, Charles I., KIA Sept 2 | **Wilber, Charles R., KIA Sept 29** |
| Gately, Edward P., *Co. C* | **Gately, Edward P., *Aviation Corps*** (Fort Omaha balloon school) |
**And a fourth nobody knew about: Conaoghiris, Nicholas** (Camp Upton, died of disease in France
Sept 12, 1918). His surname is as printed and unconfirmed — flagged in his entry.

### The nine pages, checked against all six sites (3,855 entries)
122 men on the pages. **114 already in.** 4 added (above). 4 near-misses were the SAME man spelled
differently — Davitt (`Rev. William F.` = `William Francis, Rev.`), Pappas (`Theodor` = `Theodore`),
Finlayson (`R. Murray` = `Murray R.`). **1 was NOT the same man**: Thomson, **Raymond B.** (KIA
St. Mihiel) vs Forestdale's Thomson, **Alexander S.** The exact-first-name rule caught it.
**Pages held so far: 42, 43, 46, 49, 52, 55, 58, 60. The rest of the Roll of Honor is still to come.**

### ⚠️ MY OWN TRANSCRIPTION ERROR — check the fate word, not the word "killed"
I tagged Kingsland and Serrurier KIA. Zack says a **flying accident** and a **motorcycle accident**.
The archive already had them right. **"Killed in a ... accident" is not killed in action.**
Only Guertin, Herve and Hebert, Albert genuinely needed the KIA badge; both applied.

### COBURN, JAMES M. — Calvary entry was wrong, corrected
It carried a **KIA badge** and called him a memorial for "a soldier who gave everything for his
country" whose "body remained overseas." Zack: **killed in a motor truck accident in France,
November 16, 1918 — after the close of the war.** Badge removed, narrative rewritten to the record.

### ⚠️ OPEN FOR MARK — the archive contradicts itself on DIED OF WOUNDS
14 Roll-of-Honor men died of wounds. **8 carry a KIA badge; 6 carry nothing.** Same fate, two
answers. This is the same question as the four rulings still open from §13C (Goss / Henderson /
Jecker "Finding of death", Wiercisewski "Died of wounds"). **Do not resolve without Mark.**
Related: **41 Roll-of-Honor dead carry NO badge at all** (disease, accident, died in service). They
cannot be found by the Honors filter because **Died in Service was removed from the roll in §13D.**
Making them findable means Mark reinstating it. His call.

### Three OCR names still sorting ABOVE the A's in the Queue — Mark's ruling wanted
`3IcELWAIN, Thomas` · `3IALCOLM, John` · `3IARTIN, Daniel A.` — all `3I` -> **M**, a repair already
in the curated dictionary (§13). They sort under "3" so the rail cannot reach them and nobody will
ever find them. Not touched without Mark's word.

### State at end of 13F
| Path | |
|---|---|
| research-queue/data.js | **3,056** (was 3,052) |
| calvary/data.js | 375 (Coburn corrected) |
| index.html (landing) | count updated 3,052 -> 3,056 |
| template.html + 6 site shells + honor-roll | A-Z rail, lit letter, `overflow-anchor:none`, no wheel code |
| reference/wheel-check.html | the measuring tool — keep it |
