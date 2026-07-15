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
| Landing | — | live (shows 375 / 351 / 44 / 2,996) |
| Calvary | 375 | live |
| Forestdale | 351 | live |
| Elmwood | 44 | live |
| Research Queue | **2,996** | live |

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
- **Deep-dig citation men**: Leduc, LaFlesh, MacDonald, Young, Levenson, Leverault, Comeau.
- **Calvary photo work** — 70 files still 404; 16 entries need new stone photos; 22 duplicate-name pairs. Untouched for two sessions.
- **Landing count** is hand-typed text, not calculated. It read 243 for Forestdale (actual 351) and 2,865 for a Q holding 1,879. **Fix it whenever the data changes** — or make it read from the data.
