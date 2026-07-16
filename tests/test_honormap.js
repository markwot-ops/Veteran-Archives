const fs=require('fs'); const {JSDOM}=require('jsdom');
const FILE={'../calvary/data.js':'calvary_data_new.js','../forestdale/data.js':'forestdale_data_new.js',
'../elmwood/data.js':'elmwood_data_new.js','../rock-valley/data.js':'rock-valley_data_new.js',
'../smiths-ferry/data.js':'smiths-ferry_data_new.js','../research-queue/data.js':'research-queue_data_new.js'};
const honor=process.argv[2];
let html=fs.readFileSync('honor-roll-map.html','utf8');
// inline the six data files where their script tags are, and stub Leaflet
Object.entries(FILE).forEach(([src,f])=>{
  html=html.replace('<script src="'+src+'"></script>','<script>'+fs.readFileSync(f,'utf8')+'</script>');
});
html=html.replace(/<script src="https:\/\/unpkg[^"]*"><\/script>/,'');
html=html.replace(/<link[^>]*leaflet[^>]*>/gi,'');
const flew=[];
const stub=`<script>
window.matchMedia=window.matchMedia||function(){return{matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}};};
window.__flew=[];
window.L={map:()=>({setView(){return this;},on(){return this;},addLayer(){},removeLayer(){},
  flyTo(ll,z){window.__flew.push(ll);},panTo(){},getZoom:()=>18,getSize:()=>({x:900,y:600}),
  project:()=>({x:0,y:0}),unproject:()=>({lat:0,lng:0}),getCenter:()=>({lat:0,lng:0}),
  invalidateSize(){},fitBounds(){},getContainer:()=>document.createElement('div')}),
 tileLayer:()=>({addTo(){return this;}}),
 marker:(ll)=>({addTo(){return this;},on(){return this;},setIcon(){},getElement:()=>null,remove(){},_ll:ll}),
 divIcon:()=>({}),layerGroup:()=>({addTo(){return this;},clearLayers(){},addLayer(){}}),
 latLngBounds:()=>({extend(){},isValid:()=>false}),Icon:{Default:{mergeOptions(){}}},control:{layers:()=>({addTo(){}})}};
</script>`;
html=html.replace('</head>',stub+'</head>');
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,
  url:'https://x/honor-roll/'+(honor?'?honor='+encodeURIComponent(honor):'')});
const w=dom.window;
Object.defineProperty(w.HTMLElement.prototype,'clientHeight',{configurable:true,get(){return this.id==='vet-list'?600:0;}});
setTimeout(()=>{
  const d=w.document;
  console.log('honor        :',honor||'(all honored)');
  console.log('site title   :',d.getElementById('site-title').textContent);
  console.log('site sub     :',d.getElementById('site-sub').textContent);
  console.log('map center   :',JSON.stringify(w.VA.site.center),'zoom',w.VA.site.zoom);
  console.log('veterans     :',w.VA.veterans.length);
  console.log('with coords  :',w.VA.veterans.filter(v=>typeof v.lat==='number').length);
  console.log('rows drawn   :',d.querySelectorAll('.vet-item').length);
  const rowsL=[...d.querySelectorAll('#leg-distinct .leg-row')];
  console.log('legend rows  :',rowsL.length);
  console.log('lit on load  :',rowsL.filter(r=>r.classList.contains('on')).map(r=>r.dataset.dist).join(',')||'(none — all shown)');
  console.log('others dimmed:',d.getElementById('leg-distinct').classList.contains('filtered'));
  const head=d.getElementById('leg-head');
  console.log('Honors clickable:', !!head, '| hint:', head?head.textContent:'');
  if(head && process.argv[2]){
    head.dispatchEvent(new w.Event('click',{bubbles:true}));
    setTimeout(()=>{
      console.log('after clicking Honors -> lit:',[...d.querySelectorAll('#leg-distinct .leg-row.on')].length,
                  '| dimmed class:',d.getElementById('leg-distinct').classList.contains('filtered'),
                  '| rows:',d.querySelectorAll('.vet-item').length);
    },80);
  }
  console.log('sidebar count:',d.getElementById('count')?d.getElementById('count').textContent:'');
  const want=process.argv[3];
  const rows=[...d.querySelectorAll('.vet-item')];
  const first=want ? rows.find(r=>r.textContent.includes(want)) : rows[0];
  if(first){ first.dispatchEvent(new w.Event('click',{bubbles:true}));
    setTimeout(()=>{
      console.log('\nclicked first name:');
      console.log('  popup      :', d.getElementById('popup').classList.contains('show')?'OPENS':'FAILED');
      console.log('  name       :', d.getElementById('pname').textContent);
      console.log('  service    :', d.getElementById('pservice').textContent);
      console.log('  flew to    :', JSON.stringify(w.__flew[0]||null));
      console.log('  photo      :', (d.getElementById('pphoto').src||'(none)').slice(0,70));
      process.exit(0);
    },450);
  } else { console.log('NO ROWS'); process.exit(1); }
},400);
