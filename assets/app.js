/* ============================================================
   VETERAN ARCHIVES — canonical template.
   Identical for every site. All per-site content lives in data.js
   as window.VA = { site:{...}, veterans:[...] }.
   ============================================================ */
const SITE = (window.VA && window.VA.site) || {};
const veterans = (window.VA && window.VA.veterans) || [];
const IS_QUEUE = SITE.kind === 'queue';

const CONTACT_CLOSE = 'If you have further information about this veteran, please contact the City of Holyoke Veterans Graves Officer at (413) 322-5630 at 310 Appleton Street, 1st Floor, Holyoke, MA 01040.';
const QUEUE_TEXT = 'This veteran has been identified but is still in the research queue — a narrative has not yet been written. The entry is held here until research and grave location are complete.';

(function(){
  var _raw = SITE.title || SITE.name || 'Veteran Archives';
  var _base = _raw.replace(/\s*Veterans?\s+Memorial\s*$/i, '').trim() || _raw;
  window.SITE_BASE = _base;
  var _h1 = document.getElementById('site-title');
  _h1.textContent = _base;
  if (_base !== _raw) {                       // only cemeteries carried "Veterans Memorial"
    var _m = document.createElement('span');
    _m.className = 'mode-label';
    _m.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/><line x1="12" y1="1.5" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22.5"/><line x1="1.5" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22.5" y2="12"/></svg><span>Veteran Locator</span>';
    var _nav = document.getElementById('site-nav');
    if (_nav && _nav.parentNode) _nav.parentNode.insertBefore(_m, _nav); else _h1.appendChild(_m);                      // hidden on desktop, shown on phones via CSS
  }
})();
document.getElementById('site-sub').textContent = SITE.address || '';
document.title = (SITE.title || 'Veteran Archives') + ' — Holyoke, MA';

const ERA_COLORS = {
  'Civil War Era':'#8B4513',
  'Spanish-American War':'#CD853F',
  'World War I':'#4682B4',
  'World War II':'#2E8B57',
  'Korean War':'#9370DB',
  'Vietnam':'#DC143C',
  'Cold War':'#5f9ea0',
  'Unknown Era':'#666',
};
const ERA_ORDER = ['Civil War Era','Spanish-American War','World War I','World War II','Korean War','Vietnam','Cold War','Unknown Era'];

function normEra(raw) {
  if (!raw) return 'Unknown Era';
  const s = raw.trim();
  if (s.includes('Civil')) return 'Civil War Era';
  if (s.includes('Spanish')) return 'Spanish-American War';
  if (s.includes('Vietnam')) return 'Vietnam';
  if (s.includes('World War II')) return 'World War II';
  if (s.includes('World War I')) return 'World War I';
  if (s.includes('Korean')) return 'Korean War';
  if (s.includes('Cold War')) return 'Cold War';
  return 'Unknown Era';
}
function normEras(raw) {
  if (Array.isArray(raw)) {
    const seen = [];
    raw.forEach(r => { const e = normEra(r); if (!seen.includes(e)) seen.push(e); });
    const out = seen.filter(e => e !== 'Unknown Era');
    return out.length ? out.sort((a,b)=>ERA_ORDER.indexOf(a)-ERA_ORDER.indexOf(b)) : ['Unknown Era'];
  }
  return [normEra(raw)];
}
function eraLabel(raw) { return normEras(raw).join(' · '); }
function eraColor(raw) { return ERA_COLORS[normEras(raw)[0]] || '#666'; }

function branchSym(branch) {
  if (!branch) return '✦';
  const b = branch.toUpperCase();
  if (b.includes('NAVY')) return '⚓';
  if (b.includes('MARINE') || b.includes('USMC')) return '🦅';
  if (b.includes('AIR') || b.includes('USAF')) return '✈';
  if (b.includes('COAST')) return '⚑';
  if (b.includes('ARMY')) return '★';
  return '✦';
}

const map = L.map('map', {preferCanvas:true, minZoom:13, maxZoom:20})
  .setView(SITE.center || [42.2043,-72.6162], SITE.zoom || 15);

const satellite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {attribution:'© Esri', maxNativeZoom:19, maxZoom:20}
);
const street = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  {attribution:'© CARTO', subdomains:'abcd', maxNativeZoom:19, maxZoom:20}
);
const terrain = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  {attribution:'© Esri', maxNativeZoom:19, maxZoom:20}
);
satellite.addTo(map);
L.control.layers({'Satellite':satellite,'Street':street,'Terrain':terrain},{},{position:'topleft'}).addTo(map);

let activeEras = new Set(ERA_ORDER);
let activeDistinction = (typeof window.INIT_DISTINCTION === 'string' && window.INIT_DISTINCTION) || null;
let markerMap = {};
let activeIdx = null;
let searchTerm = '';
let activeMarker = null;

// --- sidebar render state: sort once, render the whole index, let the browser skip what's offscreen ---
let SORTED = null;          // cached sorted index — built once, never re-sorted
let FILTERED = [];          // current filter/search result set
let searchTimer = null;     // debounce handle

// Major distinctions, most prestigious first. Each cemetery builds chips from whichever it actually has.
const DISTINCTION_ORDER = ['Medal of Honor','Distinguished Service Cross','Croix de Guerre','KIA','Purple Heart','Distinguished Service Medal','Cited for Bravery','Air Medal','Silver Star','Bronze Star','French Military Medal','British Military Medal'];
const DISTINCTION_COLORS = {
  'Medal of Honor':'#e6c14a','Distinguished Service Cross':'#9b7ede','Distinguished Service Medal':'#7c6fb0',
  'Silver Star':'#b9c0c7','Bronze Star':'#c99a3a','Air Medal':'#4a9be0','Purple Heart':'#a24bb3',
  'Croix de Guerre':'#4e8f63','KIA':'#c0392b','Cited for Bravery':'#c07a4a','British Military Medal':'#8a7d5b','French Military Medal':'#5b7f8a'
};
const DISTINCTION_SHORT = {};  // spell every distinction out in full
function canonBadge(b){ const low=(b||'').toLowerCase(); for(const n of DISTINCTION_ORDER){ if(n.toLowerCase()===low) return n; } return null; }
function vetDistinctions(v){ return (v.badges||[]).map(canonBadge).filter(Boolean); }
function isDistinguished(v){ return vetDistinctions(v).length>0; }
function passesFilters(v){ return normEras(v.era).some(e => activeEras.has(e)) && (!activeDistinction || vetDistinctions(v).includes(activeDistinction)); }

function hasCoords(v){ return v && v.lat!=null && v.lng!=null && !isNaN(v.lat) && !isNaN(v.lng); }

function buildMarkers() {
  Object.values(markerMap).forEach(m => map.removeLayer(m));
  markerMap = {};
  veterans.forEach((v, idx) => {
    if (!passesFilters(v)) return;
    if (!hasCoords(v)) return;
    const color = eraColor(v.era);
    const sym = branchSym(v.branch);
    const dist = isDistinguished(v);
    const isKIA = (v.badges||[]).some(b => (b||'').toLowerCase()==='kia');
    const rim = dist
      ? 'border:2px solid #ffd757;box-shadow:0 0 7px 1px rgba(255,205,70,0.85);'
      : 'border:2px solid rgba(255,255,255,0.65);box-shadow:0 1px 5px rgba(0,0,0,0.8);';
    const pulseCls = activeDistinction ? 'hpulse' : '';
    const star = isKIA ? '<div style="position:absolute;top:-9px;right:-7px;font-size:13px;color:#ffd54a;line-height:1;text-shadow:0 0 3px #000,0 0 6px rgba(255,210,70,0.9);pointer-events:none;">★</div>' : '';
    const icon = L.divIcon({
      className:'',
      html:`<div style="position:relative;width:26px;height:26px;">${star}<div class="${pulseCls}" style="width:26px;height:26px;border-radius:50%;background:${color};${rim}display:flex;align-items:center;justify-content:center;font-size:11px;cursor:pointer;">${sym}</div></div>`,
      iconSize:[26,26], iconAnchor:[13,13]
    });
    const m = L.marker([v.lat, v.lng], {icon});
    m.on('click', () => selectVet(v, idx));
    m.addTo(map);
    markerMap[idx] = m;
  });
}

function openPopup(v, idx) {
  if (activeMarker) activeMarker.getElement()?.classList.remove('marker-pulse');
  const queued = !((v.narrative||'').trim());
  document.getElementById('pname').textContent = titleName(v.name);
  document.getElementById('pservice').textContent = serviceLine(v);
  const storyEl = document.getElementById('pstory');
  storyEl.textContent = queued ? QUEUE_TEXT : v.narrative;
  storyEl.classList.toggle('queued', queued);

  const srcEl = document.getElementById('psrc');
  srcEl.textContent = v.sourceNote || '';
  srcEl.style.display = v.sourceNote ? 'block' : 'none';

  const conEl = document.getElementById('pcontact');
  const showContact = !!v.sourceNote;              // legacy entries carry the close inside narrative
  conEl.textContent = showContact ? CONTACT_CLOSE : '';
  conEl.style.display = showContact ? 'block' : 'none';

  const photo = document.getElementById('pphoto');
  const ph = document.getElementById('pphoto-ph');
  if (v.photo) { photo.src = v.photo; photo.style.display = 'block'; ph.classList.remove('show'); }
  else if (!hasCoords(v)) { photo.style.display = 'none'; ph.classList.add('show'); }   // queue: pending geo-location
  else { photo.style.display = 'none'; ph.classList.remove('show'); }

  const extEl = document.getElementById('pextra');
  extEl.innerHTML = '';
  (v.extraPhotos||[]).forEach(ep => {
    const link = document.createElement('a');
    link.href = ep.src; link.target = '_blank';
    link.style.cssText = 'display:block;margin-bottom:10px;color:#c8b97a;font-size:0.82rem;text-decoration:none;border:1px solid #444;border-radius:6px;padding:8px 12px;background:#1a1a1a;';
    link.textContent = ep.caption || 'View document';
    extEl.appendChild(link);
  });

  const flagsEl = document.getElementById('pflags');
  flagsEl.innerHTML = '';
  const fs = {'KIA':['#8B0000','#fff'],'Purple Heart':['#7B2D8B','#fff'],'Bronze Star':['#B8860B','#fff'],'Air Medal':['#1a6abf','#fff'],'Female Veteran':['#C71585','#fff'],'Silver Star':['#71797E','#fff'],'Distinguished Service Cross':['#2c1b4d','#fff'],'Croix de Guerre':['#2d5a3d','#fff'],'Died in Service':['#5a3d2d','#fff'],'Medical Officer':['#2d5a5a','#fff'],'Retake Needed':['#333','#c99'],'Cited for Bravery':['#7a4a24','#fff'],'French Military Medal':['#2d4a55','#fff'],'British Military Medal':['#4a442d','#fff'],'Medal of Honor':['#8a6d16','#fff'],'Distinguished Service Medal':['#3d356b','#fff']};
  (v.badges||[]).forEach(f => {
    const [bg,fg] = fs[f]||['#444','#fff'];
    const b = document.createElement('span');
    b.className='fbadge'; b.style.background=bg; b.style.color=fg; b.textContent=f;
    if (f === 'KIA') {
      const st = document.createElement('span');
      st.className = 'kia-badge-star'; st.textContent = '\u2605';
      flagsEl.appendChild(st);            // outside the red chip, on the panel background
    }
    flagsEl.appendChild(b);
  });

  // Window always sits left of the sidebar, so the index stays clear and scrollable.
  if (hasCoords(v)) {
    const clickedMarker = markerMap[idx];
    if (clickedMarker) { clickedMarker.getElement()?.classList.add('marker-pulse'); activeMarker = clickedMarker; }
    if (!isMobile()) {
      const mapW = map.getContainer().offsetWidth;
      const popupLeft = mapW - 275 - 310;
      const graveTargetX = popupLeft * 0.45;
      const currentCenter = map.project(map.getCenter(), map.getZoom());
      const gravePoint = map.project([v.lat, v.lng], map.getZoom());
      const currentGraveX = gravePoint.x - currentCenter.x + mapW / 2;
      const shiftX = currentGraveX - graveTargetX;
      const newCenter = map.unproject([currentCenter.x + shiftX, currentCenter.y], map.getZoom());
      map.panTo(newCenter, {animate:true, duration:0.7});
    }
  }
  // else: queue / not-yet-located — no pin to pan to; the window still opens in place.

  document.querySelectorAll('.vet-item').forEach(el => el.classList.remove('active'));
  activeIdx = idx;
  // Under a windowed list the row may not exist yet — compute where it lives and
  // scroll there, then draw. Never rely on scrollIntoView for an undrawn row.
  const pos = FILTERED.findIndex(f => f.i === idx);
  if (pos >= 0) {
    const list = document.getElementById('vet-list');
    const top = pos * ROW_H, bot = top + ROW_H;
    if (top < list.scrollTop || bot > list.scrollTop + list.clientHeight) {
      list.scrollTop = Math.max(0, top - list.clientHeight / 2 + ROW_H / 2);
    }
    drawWindow(true);
  }
  document.getElementById('popup').classList.add('show');
  if (window.matchMedia && window.matchMedia('(max-width:640px)').matches) document.body.classList.remove('sheet-open');
}

function closePopup() {
  document.getElementById('popup').classList.remove('show');
  if (activeMarker) { activeMarker.getElement()?.classList.remove('marker-pulse'); activeMarker = null; }
  document.querySelectorAll('.vet-item').forEach(el => el.classList.remove('active'));
  activeIdx = null;
}
map.on('click', () => {
  if (document.getElementById('popup').classList.contains('show')) closePopup();
});

const SUF = /^(Sr|Jr|II|III|IV|MD)\.?$/i;
function sortKey(n){
  if(/^unknown/i.test(n)) return n;   // "Unknown Soldier N" -> sorts under U, in order
  return n.includes(',') ? n.split(',')[0].trim()
    : (() => { const w=n.split(' '); return SUF.test(w[w.length-1])?(w[w.length-2]||w[0]):w[w.length-1]; })();
}
function displayName(n){
  if(/^unknown/i.test(n)) return n;   // show as-is, don't reformat to "N, Unknown Soldier"
  return n.includes(',') ? n
    : (() => { const p=n.trim().split(/\s+/); return p.length>1 ? p[p.length-1]+', '+p.slice(0,-1).join(' ') : n; })();
}

/* --- label normalization: consistent titles + service line across every site --- */
// Military ranks stripped from titles; clergy/civil honorifics (Rev., Fr., Dr., Msgr.) are preserved.
var _RANKS = ['Pvt','Private','Pfc','Cpl','Corporal','Sgt','Sergeant','SSgt','TSgt','MSgt',
  'Lt','Lieut','Lieutenant','Capt','Captain','Maj','Major','Col','Colonel','LtCol',
  'BrigGen','MajGen','Gen','General','Cmdr','Commander','LtCmdr','Ens','Ensign',
  'Adm','Admiral','RAdm','Chief','CPO','SCPO','MCPO','PO1','PO2','PO3','Seaman','SN',
  'Cadet','WO','Sp1','Sp2','Sp3','Sp4','Sp5','Tec4','Tec5'];
function stripRank(n){
  if(!n) return n;
  var s = n.trim();
  s = s.replace(new RegExp(',\\s*(?:'+_RANKS.join('|')+')\\.?\\s*$','i'), '');   // "Last, First, Capt"
  s = s.replace(new RegExp('^(?:'+_RANKS.join('|')+')\\.?\\s+','i'), '');          // "Capt First Last"
  return s.trim();
}
// Canonical branch in Mark's "U.S. Army" style. '' means omit (Military/Unknown/blank).
function normBranch(b){
  if(!b) return '';
  var s = b.trim(); if(!s) return '';
  var core = s.replace(/^U\.?\s?S\.?\s+/i,'').trim();
  if(/^(unknown|military|n\/?a|unknown branch)$/i.test(core) || /^(unknown|military)$/i.test(s)) return '';
  if(/^U\.?\s?S\.?\s+/i.test(s)) return s.replace(/^U\.?\s?S\.?\s+/i,'U.S. ');   // already canonical
  var u = core.toUpperCase();
  if(/^(USNRF|USNR)$|NAVAL RESERVE/.test(u)) return 'U.S. Naval Reserve';
  if(/COAST GUARD RESERVE/.test(u)) return 'U.S. Coast Guard Reserve';
  if(/^USCG$|COAST GUARD/.test(u)) return 'U.S. Coast Guard';
  if(/^USMC$|MARINE/.test(u)) return 'U.S. Marine Corps';
  if(/USAAF|USAAC|ARMY AIR|AIR CORPS|^AAF$/.test(u)) return 'U.S. Army Air Forces';
  if(/^USAF$|AIR FORCE/.test(u)) return 'U.S. Air Force';
  if(/^USN$|^NAVY$/.test(u)) return 'U.S. Navy';
  if(/^ARMY$/.test(u)) return 'U.S. Army';
  if(/MASSACHUSETTS|^MA INFANTRY$|^MA /.test(u)) return core.replace(/^MA\b/i,'Massachusetts');
  return core;   // specialized unit (Ordnance Company, Field Artillery, etc.) — leave as written
}
// Prefer clean `branch`; else the branch portion of a freeform branchLabel (before · or •).
function branchSource(v){
  if(v.branch && v.branch.trim()) return v.branch;
  return (v.branchLabel||'').split(/[·•]/)[0].trim();
}
// The one true service line: "U.S. Army • World War I" (spaced bullet, full era from the era field).
function serviceLine(v){
  return [normBranch(branchSource(v)), eraLabel(v.era)].filter(Boolean).join(' • ');
}
// Title: rank stripped, "Last, First" — identical to the index.
function titleName(n){ return displayName(stripRank(n)); }


function sortedList() {
  if (!SORTED) SORTED = veterans.map((v,i)=>({v,i})).sort((a,b)=>
    sortKey(a.v.name).localeCompare(sortKey(b.v.name)) || a.v.name.localeCompare(b.v.name));
  return SORTED;
}

function makeRow(v, idx) {
  const queued = !((v.narrative||'').trim());
  const el = document.createElement('div');
  el.className = 'vet-item' + (idx===activeIdx?' active':'') + (queued?' queued':'');
  el.dataset.i = idx;
  const q = queued ? `<div class="v-badge-q">\u25d4 queue</div>` : '';
  el.innerHTML = `<div class="v-sym" style="color:${eraColor(v.era)}">${branchSym(v.branch)}</div><div style="flex:1;min-width:0"><div class="v-name">${titleName(v.name)}</div><div class="v-era">${eraLabel(v.era)}</div></div>${q}`;
  el.dataset.idx = idx;
  return el;
}

// ---- windowed list -------------------------------------------------------
// Only the rows you can see exist. Above and below them sit two spacers holding
// the exact height of everything not drawn, so the scrollbar is honest and the
// cost of scrolling is the same at 40 names or 40,000.
const ROW_H = 40;            // MUST match .vet-item height in the CSS
const OVERSCAN = 8;          // rows drawn beyond each edge, so a fling doesn't flash blank
let winStart = -1, winEnd = -1, winQueued = false;

function ensureScaffold() {
  const list = document.getElementById('vet-list');
  if (document.getElementById('rows')) return list;
  list.replaceChildren();
  ['pad-top','rows','pad-bot'].forEach(id => {
    const d = document.createElement('div'); d.id = id; list.appendChild(d);
  });
  return list;
}

function drawWindow(force) {
  const list = ensureScaffold();
  const rows = document.getElementById('rows');
  const total = FILTERED.length;
  const visible = Math.ceil(list.clientHeight / ROW_H) + OVERSCAN * 2;
  let first = Math.max(0, Math.floor(list.scrollTop / ROW_H) - OVERSCAN);
  // If the list shortened under us (a filter, a search) the old scroll position can
  // point past the end. Never let that draw an empty window.
  if (first > Math.max(0, total - 1)) first = Math.max(0, total - visible);
  const last = Math.min(total, first + visible);
  if (!force && first === winStart && last === winEnd) return;
  winStart = first; winEnd = last;

  const frag = document.createDocumentFragment();
  for (let n = first; n < last; n++) frag.appendChild(makeRow(FILTERED[n].v, FILTERED[n].i));
  rows.replaceChildren(frag);
  document.getElementById('pad-top').style.height = (first * ROW_H) + 'px';
  document.getElementById('pad-bot').style.height = Math.max(0, (total - last) * ROW_H) + 'px';
  if (activeIdx !== null) {
    const el = rows.querySelector(`.vet-item[data-i="${activeIdx}"]`);
    if (el) el.classList.add('active');
  }
  litLetter();
}

// The rail lights the letter you are actually looking at, and follows the list as it moves.
function litLetter() {
  const rail = document.getElementById('az-rail');
  if (!rail || !rail.children.length || !FILTERED.length) return;
  const list = document.getElementById('vet-list');
  const top = Math.min(FILTERED.length - 1, Math.max(0, Math.round(list.scrollTop / ROW_H)));
  const L = sortKey(FILTERED[top].v.name).trim().charAt(0).toUpperCase();
  if (L === RAIL_LIT) return;
  RAIL_LIT = L;
  rail.querySelectorAll('.az-l').forEach(el => el.classList.toggle('on', el.dataset.l === L));
}

function renderMore() { winStart = winEnd = -1; drawWindow(true); }

// scroll drives the window, coalesced to one draw per frame
document.getElementById('vet-list').addEventListener('scroll', () => {
  if (winQueued) return;
  winQueued = true;
  requestAnimationFrame(() => { winQueued = false; drawWindow(false); });
}, {passive:true});
window.addEventListener('resize', () => drawWindow(true));

function buildSidebar() {
  const list = document.getElementById('vet-list');
  const none = document.getElementById('no-results');
  const term = searchTerm.toLowerCase();
  FILTERED = sortedList().filter(({v}) =>
    passesFilters(v) &&
    (!term || v.name.toLowerCase().includes(term) || (v.branch||'').toLowerCase().includes(term)));
  // Clear the drawn rows ONLY. Wiping #vet-list would destroy pad-top/rows/pad-bot
  // and the windowed list would never draw again.
  document.getElementById('rows').replaceChildren();
  list.scrollTop = 0;
  renderMore();
  buildRail();
  none.style.display = FILTERED.length===0 ? 'block' : 'none';
}

// --- one click handler for the whole index ---
document.getElementById('vet-list').addEventListener('click', e => {
  const row = e.target.closest('.vet-item');
  if (!row) return;
  const idx = +row.dataset.idx;
  const v = veterans[idx];
  if (!v) return;
  selectVet(v, idx);
});

// --- the A-Z rail: the Queue is 3,052 names. Scrolling cannot land on a man; this can. ---
const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
let AZ_POS = {};
let RAIL_LIT = null;   // the letter currently lit, so we only touch the DOM when it changes
let RAIL_JUMP = 0;     // when the rail last moved the list on purpose
let LETTER_PX = [];    // px position of every letter boundary, rebuilt with the rail   // letter -> first row index in FILTERED, rebuilt on every filter/search

function buildRail() {
  const rail = document.getElementById('az-rail');
  if (!rail) return;
  if (!rail.children.length) {
    const frag = document.createDocumentFragment();
    AZ.forEach(L => {
      const d = document.createElement('div');
      d.className = 'az-l'; d.textContent = L; d.dataset.l = L;
      frag.appendChild(d);
    });
    rail.appendChild(frag);
    const b = document.createElement('div');
    b.id = 'az-bubble'; document.getElementById('sidebar').appendChild(b);
  }
  AZ_POS = {}; RAIL_LIT = null;
  for (let n = 0; n < FILTERED.length; n++) {
    const L = sortKey(FILTERED[n].v.name).trim().charAt(0).toUpperCase();
    if (AZ_POS[L] === undefined) AZ_POS[L] = n;
  }
  rail.querySelectorAll('.az-l').forEach(el => {
    el.classList.toggle('dead', AZ_POS[el.dataset.l] === undefined);
  });
  LETTER_PX = Object.values(AZ_POS).map(p => p * ROW_H).sort((a,b) => a - b);
  litLetter();   // the rail is built after the first draw, so light it now or nothing lights at load
}

// Scrolling is the browser's own, as it was before the sidebar rebuild. No wheel code,
// no momentum, no letter-stop. The A-Z rail is what gives precision on a long list.

function jumpTo(L) {
  const pos = AZ_POS[L];
  if (pos === undefined) return false;
  const list = document.getElementById('vet-list');
  // A row for this man may not exist yet — never scrollIntoView an undrawn row.
  RAIL_JUMP = performance.now();   // tell the letter-stop this move was deliberate
  list.scrollTop = pos * ROW_H;
  drawWindow(true);   // drawWindow lights the letter via litLetter()
  return true;
}

(function railControl(){
  const rail = document.getElementById('az-rail');
  if (!rail) return;
  const bubble = () => document.getElementById('az-bubble');
  let down = false;

  function letterAt(y) {
    const el = document.elementFromPoint(rail.getBoundingClientRect().left + 8, y);
    return (el && el.classList && el.classList.contains('az-l')) ? el : null;
  }
  function go(y) {
    const el = letterAt(y);
    if (!el || el.classList.contains('dead')) return;
    if (jumpTo(el.dataset.l)) {
      const b = bubble();
      if (b) {
        b.textContent = el.dataset.l;
        b.style.display = 'block';
        b.style.top = (el.getBoundingClientRect().top - rail.getBoundingClientRect().top + 3) + 'px';
      }
    }
  }
  rail.addEventListener('pointerdown', e => {
    down = true; rail.setPointerCapture(e.pointerId); go(e.clientY); e.preventDefault();
  });
  rail.addEventListener('pointermove', e => { if (down) go(e.clientY); });
  function up(){ down = false; const b = bubble(); if (b) b.style.display = 'none'; }
  rail.addEventListener('pointerup', up);
  rail.addEventListener('pointercancel', up);
})();

function updateCount() {
  const showing = veterans.filter(passesFilters).length;
  const total = veterans.length;
  const label = IS_QUEUE ? 'In the Research Queue' : 'Documented Veterans';
  document.getElementById('vet-count').textContent =
    showing === total ? `${total} ${label}` : `${showing} of ${total}`;
}

const eraCounts = {};
veterans.forEach(v => { normEras(v.era).forEach(e => { eraCounts[e]=(eraCounts[e]||0)+1; }); });

// Era filters (with counts) live above the names in the sidebar.
const filterDiv = document.getElementById('era-filters');
ERA_ORDER.forEach(era => {
  if (!eraCounts[era]) return;
  const short = era.replace(' Era','').replace('World War ','WW').replace('Korean War','Korea');
  const btn = document.createElement('button');
  btn.className='era-btn selected'; btn.style.background=ERA_COLORS[era]; btn.dataset.era=era;
  btn.innerHTML=`${short} <span class="eb-n">${eraCounts[era]}</span>`;
  btn.addEventListener('click', () => {
    if (activeDistinction) { activeDistinction = null; document.querySelectorAll('.leg-row.dist').forEach(r => r.classList.remove('on')); }
    if (btn.classList.contains('selected')) {
      btn.classList.remove('selected'); activeEras.delete(era);   // darken → those vets fall off
    } else {
      btn.classList.add('selected'); activeEras.add(era);          // re-light → they come back
    }
    buildMarkers(); buildSidebar(); updateCount();
  });
  filterDiv.appendChild(btn);
});

// Distinctions — fill the bottom-left box; hide it entirely if this site has none.
const distCounts = {};
veterans.forEach(v => vetDistinctions(v).forEach(d => distCounts[d] = (distCounts[d]||0)+1));
const legDistinct = document.getElementById('leg-distinct');
if (!Object.keys(distCounts).length) {
  document.getElementById('legend').style.display = 'none';
} else {
  DISTINCTION_ORDER.forEach(d => {
    if (!distCounts[d]) return;
    const row = document.createElement('div');
    row.className = 'leg-row dist'; row.dataset.dist = d;
    row.style.setProperty('--dc', DISTINCTION_COLORS[d] || '#888');
    const dotHtml = (d==='KIA')
      ? `<div class="leg-sym kia-star">★</div>`
      : `<div class="leg-sym" style="color:${DISTINCTION_COLORS[d]||'#888'};font-size:0.55rem">●</div>`;
    row.innerHTML = `${dotHtml}<div class="leg-label">${DISTINCTION_SHORT[d]||d}</div><div class="leg-count">${distCounts[d]}</div>`;
    row.addEventListener('click', () => {
      if (activeDistinction === d) { activeDistinction = null; row.classList.remove('on'); }
      else {
        activeDistinction = d;
        document.querySelectorAll('.leg-row.dist').forEach(r => r.classList.remove('on'));
        row.classList.add('on');
        activeEras = new Set(ERA_ORDER);
        document.querySelectorAll('.era-btn').forEach(b => b.classList.add('selected'));
      }
      legDistinct.classList.toggle('filtered', !!activeDistinction);
      buildMarkers(); buildSidebar(); updateCount();
    });
    legDistinct.appendChild(row);
  });
  // arrived with an honor already chosen? light it. If it isn't in this box, drop it
  // rather than show an empty map with no lit row to explain why.
  if (activeDistinction) {
    let found = null;
    legDistinct.querySelectorAll('.leg-row.dist').forEach(r => { if (r.dataset.dist === activeDistinction) found = r; });
    if (found) found.classList.add('on'); else activeDistinction = null;
    legDistinct.classList.toggle('filtered', !!activeDistinction);
  }
  // the word Honors is the way back to all of them
  const head = document.getElementById('leg-head');
  if (head) head.addEventListener('click', () => {
    activeDistinction = null;
    legDistinct.querySelectorAll('.leg-row.dist').forEach(r => r.classList.remove('on'));
    legDistinct.classList.remove('filtered');
    buildMarkers(); buildSidebar(); updateCount();
  });
}

document.getElementById('search').addEventListener('input', e => {
  searchTerm = e.target.value;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(buildSidebar, 120);
});
document.getElementById('search').addEventListener('keydown', e => {
  if (e.key==='Enter') {
    const term = e.target.value.toLowerCase();
    const idx = veterans.findIndex(v => v.name.toLowerCase().includes(term));
    if (idx>=0) {
      const match = veterans[idx];
      selectVet(match, idx);
    }
  }
});

updateCount();
buildMarkers();
buildSidebar();

// Deep-link: ?v=<id> opens that veteran on load — same detail/pulse/highlight as an index click.
(function(){
  var vid = new URLSearchParams(location.search).get('v');
  if(!vid) return;
  var idx = veterans.findIndex(function(v){ return v.id === vid; });
  if(idx < 0) return;
  var match = veterans[idx];
  setTimeout(function(){
    selectVet(match, idx);
  }, 80);
})();

// ===== Field mode behaviour (guards make it a no-op on desktop) =====
(function(){
  var handle = document.getElementById('sheet-handle');
  if (handle) handle.addEventListener('click', function(){ document.body.classList.toggle('sheet-open'); });
  var search = document.getElementById('search');
  if (search) search.addEventListener('focus', function(){ document.body.classList.add('sheet-open'); });
  var popup = document.getElementById('popup');
  if (popup) popup.addEventListener('click', function(e){ if (e.target === popup) closePopup(); });
})();

var _youMarker=null, _youCircle=null, _youCentered=false;
function locateMe(){
  var btn = document.getElementById('locate-me');
  if (!navigator.geolocation){ alert('Location is not available on this device.'); return; }
  if (_watchId !== null){                         // second tap = turn tracking off
    try { navigator.geolocation.clearWatch(_watchId); } catch(e){}
    _watchId = null; _youCentered = false;
    if (_youMarker){ map.removeLayer(_youMarker); _youMarker = null; }
    if (_youCircle){ map.removeLayer(_youCircle); _youCircle = null; }
    if (_guideLine){ map.removeLayer(_guideLine); _guideLine = null; }
    var _db = document.getElementById('dirBar'); if (_db) _db.classList.remove('show');
    if (btn) btn.classList.remove('locating','on');
    return;
  }
  if (btn) btn.classList.add('locating');
  _watchId = navigator.geolocation.watchPosition(function(p){
    var la=p.coords.latitude, lo=p.coords.longitude, ac=p.coords.accuracy;
    if (!_youMarker){
      _youMarker = L.marker([la,lo], {icon:L.divIcon({className:'', html:'<div class="you-dot"></div>', iconSize:[16,16], iconAnchor:[8,8]}), zIndexOffset:1000}).addTo(map);
      _youCircle = L.circle([la,lo], {radius:ac, color:'#4a9be0', weight:1, fillColor:'#4a9be0', fillOpacity:0.12}).addTo(map);
    } else { _youMarker.setLatLng([la,lo]); _youCircle.setLatLng([la,lo]).setRadius(ac); }
    if (btn) { btn.classList.remove('locating'); btn.classList.add('on'); }
    updateDirections();
    if (!_youCentered){
      if (FOCUS) { map.fitBounds(L.latLngBounds([[la,lo],[FOCUS.match.lat, FOCUS.match.lng]]), {maxZoom:19, padding:[70,70]}); }
      else { map.setView([la,lo], Math.max(map.getZoom(), 18)); }
      _youCentered = true;
    }
  }, function(){
    if (btn) btn.classList.remove('locating');
    alert('Could not get your location. Make sure location access is allowed for this site.');
  }, {enableHighAccuracy:true, maximumAge:4000, timeout:15000});
}
(function(){ var b=document.getElementById('locate-me'); if(b) b.addEventListener('click', locateMe); })();

// ===== Field find: focus a grave + live walking directions =====
function isMobile(){ return !!(window.matchMedia && window.matchMedia('(max-width:640px)').matches); }
var FOCUS = null, _guideLine = null, _targetHalo = null, _watchId = null;
var COMPASS = ['N','NE','E','SE','S','SW','W','NW'];
var ARROWS  = ['\u2191','\u2197','\u2192','\u2198','\u2193','\u2199','\u2190','\u2196'];
function bearingDeg(la1,lo1,la2,lo2){
  var toR=function(x){return x*Math.PI/180;}, toD=function(x){return x*180/Math.PI;};
  var y=Math.sin(toR(lo2-lo1))*Math.cos(toR(la2));
  var x=Math.cos(toR(la1))*Math.sin(toR(la2))-Math.sin(toR(la1))*Math.cos(toR(la2))*Math.cos(toR(lo2-lo1));
  return (toD(Math.atan2(y,x))+360)%360;
}
function focusGrave(match, idx){
  FOCUS = {match:match, idx:idx};
  if (_targetHalo){ map.removeLayer(_targetHalo); _targetHalo=null; }
  _targetHalo = L.marker([match.lat, match.lng], {
    icon: L.divIcon({className:'', html:'<div class="target-halo"></div>', iconSize:[54,54], iconAnchor:[27,27]}),
    interactive:true, keyboard:false, zIndexOffset:2000
  }).addTo(map);
  _targetHalo.on('click', function(e){ if(e&&e.originalEvent){e.originalEvent.stopPropagation();} locateMe(); });
  map.setView([match.lat, match.lng], 19, {animate:true, duration:0.8});
  document.getElementById('fb-name').textContent = titleName(match.name);
  document.getElementById('fb-service').textContent =
    serviceLine(match) + (window.SITE_BASE ? ' \u00b7 ' + window.SITE_BASE : '');
  document.getElementById('findBanner').classList.add('show');
  document.getElementById('dirBar').classList.remove('show');
  document.body.classList.remove('sheet-open');
  document.body.classList.add('grave-focused');
  setTimeout(function(){ try { map.invalidateSize(); } catch(e){} }, 80);
  if (_youMarker) updateDirections();
}
// On mobile, selecting a veteran (marker tap, index row, in-page search) enters find mode
// instead of the desktop narrative; desktop keeps the narrative.
function selectVet(v, idx){
  if (isMobile() && hasCoords(v)) { focusGrave(v, idx); return; }
  if (hasCoords(v)) { map.flyTo([v.lat, v.lng], 19, {duration:1.0}); setTimeout(function(){ openPopup(v, idx); }, 350); }
  else { openPopup(v, idx); }
}
function clearFocus(){
  FOCUS = null;
  document.getElementById('findBanner').classList.remove('show');
  document.body.classList.remove('grave-focused');
  setTimeout(function(){ try { map.invalidateSize(); } catch(e){} }, 80);
  if (_targetHalo){ map.removeLayer(_targetHalo); _targetHalo=null; }
  if (_guideLine){ map.removeLayer(_guideLine); _guideLine=null; }
}
function updateDirections(){
  var bar = document.getElementById('dirBar');
  if (!bar) return;
  if (!FOCUS || !_youMarker){ bar.classList.remove('show'); return; }
  var you = _youMarker.getLatLng(), g = L.latLng(FOCUS.match.lat, FOCUS.match.lng);
  var feet = Math.round(you.distanceTo(g) * 3.28084);
  if (feet <= 15){ bar.textContent = 'You\u2019re here \u2014 look around you'; }
  else if (feet > 2000) {                     // too far to walk a bearing - offer road directions
    bar.textContent = (feet/5280).toFixed(1) + ' miles away \u2014 tap Drive there';
  }
  else { var i = Math.round(bearingDeg(you.lat, you.lng, g.lat, g.lng)/45) % 8;
         bar.textContent = ARROWS[i] + '  head ' + COMPASS[i] + ' \u00b7 about ' + feet + ' ft'; }
  var _dv = document.getElementById('fb-drive');
  if (_dv) _dv.style.display = (feet > 2000) ? 'block' : 'none';
  bar.classList.add('show');
  if (!_guideLine){ _guideLine = L.polyline([you, g], {color:'#ffd757', weight:3, opacity:0.85, dashArray:'6,7'}).addTo(map); }
  else _guideLine.setLatLngs([you, g]);
}
(function(){
  var g=document.getElementById('fb-guide');   if(g) g.addEventListener('click', locateMe);
  var d=document.getElementById('fb-details'); if(d) d.addEventListener('click', function(){ if(FOCUS) openPopup(FOCUS.match, FOCUS.idx); });
  var c=document.getElementById('fb-close');   if(c) c.addEventListener('click', clearFocus);
})();

// Site-to-site navigation: "Next Site" link + swipe on the header bar.
// Swipe is bound to the header only — binding it to the map would break map panning.
(function(){
  var CHAIN = ['calvary','elmwood','forestdale','rock-valley','smiths-ferry','research-queue','honor-roll'];
  var parts = location.pathname.replace(/\/index\.html$/,'').split('/').filter(Boolean);
  var cur = parts[parts.length-1] || '';
  var i = CHAIN.indexOf(cur);
  var next = CHAIN[(i + 1) % CHAIN.length];
  var prev = (i > 0) ? CHAIN[i-1] : null;
  var nx = document.getElementById('nav-next');
  if (nx) nx.href = '../' + next + '/index.html';

  var hdr = document.getElementById('header'), x0=null, y0=null;
  function isPhone(){ return !!(window.matchMedia && window.matchMedia('(max-width:640px)').matches); }
  if (hdr) {
    hdr.addEventListener('touchstart', function(e){
      if (!isPhone() || e.touches.length !== 1) { x0=null; return; }
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, {passive:true});
    hdr.addEventListener('touchend', function(e){
      if (x0 === null) return;
      var t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
      x0 = null;
      if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) * 0.7) return;
      if (dx < 0) location.href = '../' + next + '/index.html';
      else if (prev) location.href = '../' + prev + '/index.html';
      else location.href = '../index.html';
    }, {passive:true});
  }
})();

// Sun Mode: high-contrast daylight view. Manual toggle (Safari blocks light-sensor access).
(function(){
  var btn = document.getElementById('sun-toggle'); if(!btn) return;
  var wl = null;
  function lock(){ try { if ('wakeLock' in navigator) navigator.wakeLock.request('screen').then(function(s){ wl=s; }).catch(function(){}); } catch(e){} }
  function unlock(){ try { if (wl) { wl.release(); wl=null; } } catch(e){} }
  function set(on){
    document.body.classList.toggle('sun', on);
    try { sessionStorage.setItem('va-sun', on ? '1' : '0'); } catch(e){}
    if (on) lock(); else unlock();
  }
  try { if (sessionStorage.getItem('va-sun') === '1') set(true); } catch(e){}
  btn.addEventListener('click', function(){ set(!document.body.classList.contains('sun')); });
  document.addEventListener('visibilitychange', function(){
    if (!document.hidden && document.body.classList.contains('sun')) lock();
  });
})();

// Keep the map buttons clear of the bottom sheet no matter how tall it gets.
function syncFieldButtons(){
  var sb = document.getElementById('sidebar'), h = 0;
  if (sb && !document.body.classList.contains('grave-focused')
         && !document.body.classList.contains('sheet-open')) h = sb.offsetHeight || 0;
  document.documentElement.style.setProperty('--sheet-h', h + 'px');
}
(function(){
  syncFieldButtons();
  window.addEventListener('resize', syncFieldButtons);
  window.addEventListener('load', syncFieldButtons);
  var hd = document.getElementById('sheet-handle');
  if (hd) hd.addEventListener('click', function(){ setTimeout(syncFieldButtons, 60); });
  setTimeout(syncFieldButtons, 400);
})();

// Beyond walking range, hand off to the phone's own maps app for turn-by-turn road directions.
(function(){
  var acts = document.querySelector('.fb-actions'); if (!acts) return;
  var d = document.createElement('button');
  d.id = 'fb-drive'; d.type = 'button'; d.textContent = 'Drive there';
  d.style.display = 'none';
  d.addEventListener('click', function(){
    if (!FOCUS || !FOCUS.match) return;
    var la = FOCUS.match.lat, lo = FOCUS.match.lng;
    if (la == null || lo == null) return;
    var ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    var url = ios
      ? 'https://maps.apple.com/?daddr=' + la + ',' + lo + '&dirflg=d'
      : 'https://www.google.com/maps/dir/?api=1&destination=' + la + ',' + lo + '&travelmode=driving';
    window.open(url, '_blank');
  });
  acts.appendChild(d);
})();
