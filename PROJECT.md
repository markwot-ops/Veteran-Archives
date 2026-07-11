# VETERAN ARCHIVES — Project Brief

**Purpose of this file:** the single source of truth for the Veteran Archives project. In a new chat, point Claude here to re-sync completely. Read this first, then read the actual repo files before making any change.

**Owner:** Mark — Veterans Graves Officer, City of Holyoke, MA.
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
| Landing | — | live |
| Calvary | 375 | live |
| Forestdale | 244 | live |
| Elmwood | 44 | live |
| Research Queue | 314 | live |

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
