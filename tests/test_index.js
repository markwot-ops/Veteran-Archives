const fs = require('fs');
const { JSDOM } = require('jsdom');

const SITE = process.argv[2] || 'research-queue';
const DATA = {
  'research-queue': 'research-queue_data_new.js',
  'calvary': 'calvary_data_new.js',
  'forestdale': 'forestdale_data_new.js',
  'elmwood': 'elmwood_data_new.js',
  'rock-valley': 'rock-valley_data_new.js',
  'smiths-ferry': 'smiths-ferry_data_new.js',
}[SITE];

let html = fs.readFileSync('template.html', 'utf8');
// stub Leaflet — we're testing the index, not the map
const stub = `<script>
  window.matchMedia = window.matchMedia || function(){ return { matches:false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} }; };
  window.L = {
    map: () => ({ setView(){return this;}, on(){return this;}, addLayer(){}, removeLayer(){},
                  flyTo(){}, panTo(){}, getZoom:()=>18, getSize:()=>({x:900,y:600}),
                  project:()=>({x:0,y:0}), unproject:()=>({lat:0,lng:0}), getCenter:()=>({lat:0,lng:0}),
                  invalidateSize(){}, fitBounds(){}, getContainer:()=>document.createElement('div') }),
    tileLayer: () => ({ addTo(){return this;} }),
    marker: () => ({ addTo(){return this;}, on(){return this;}, setIcon(){}, getElement:()=>null, remove(){} }),
    divIcon: () => ({}), layerGroup: () => ({ addTo(){return this;}, clearLayers(){}, addLayer(){} }),
    latLngBounds: () => ({ extend(){}, isValid:()=>false }), Icon: { Default: { mergeOptions(){} } },
    control: { layers: () => ({ addTo(){} }) }
  };
</script>`;
html = html.replace('</head>', stub + '</head>');
html = html.replace(/<script src="[^"]*leaflet[^"]*"><\/script>/gi, '');
html = html.replace(/<link[^>]*leaflet[^>]*>/gi, '');
// inline the data where the page expects it
html = html.replace(/<script src="data\.js"><\/script>/, '<script>' + fs.readFileSync(DATA, 'utf8') + '</script>');

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true });
const { window } = dom;
const doc = window.document;

// jsdom has no layout: give the list a real viewport height
Object.defineProperty(window.HTMLElement.prototype, 'clientHeight', { configurable: true, get(){ return this.id === 'vet-list' ? 600 : 0; } });

setTimeout(() => {
  const errs = [];
  window.addEventListener('error', e => errs.push(e.message));
  const list = doc.getElementById('vet-list');
  const rows = doc.getElementById('rows');
  const drawn = doc.querySelectorAll('.vet-item').length;
  const padTop = doc.getElementById('pad-top');
  const padBot = doc.getElementById('pad-bot');
  const total = window.VA.veterans.length;

  console.log('SITE            :', SITE, '(' + total + ' veterans)');
  console.log('scaffold intact :', !!(list && rows && padTop && padBot));
  console.log('rows drawn      :', drawn);
  console.log('pad-bot height  :', padBot && padBot.style.height);
  const ok = drawn > 0;
  console.log(ok ? '\n✅ THE INDEX RENDERS' : '\n❌ INDEX IS BLANK — the bug is still here');

  if (ok) {
    // does filtering survive? (this is exactly what wiped it before)
    const era = doc.querySelector('.era-chip');
    if (era) { era.dispatchEvent(new window.Event('click', {bubbles:true}));
               console.log('after era chip click, rows drawn:', doc.querySelectorAll('.vet-item').length); }
    const search = doc.getElementById('search');
    if (search) {
      search.value = 'sullivan';
      search.dispatchEvent(new window.Event('input', {bubbles:true}));
      setTimeout(() => {
        console.log('after search "sullivan", rows drawn:', doc.querySelectorAll('.vet-item').length);
        // and scrolling
        list.scrollTop = 4000;
        list.dispatchEvent(new window.Event('scroll'));
        setTimeout(() => {
          console.log('after scroll to 4000, rows drawn:', doc.querySelectorAll('.vet-item').length,
                      '| pad-top:', doc.getElementById('pad-top').style.height);
          console.log('js errors:', errs.length ? errs : 'none');
          process.exit(drawn > 0 ? 0 : 1);
        }, 60);
      }, 200);
    }
  } else process.exit(1);
}, 300);
