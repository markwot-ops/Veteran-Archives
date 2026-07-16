const fs=require('fs'); const {JSDOM}=require('jsdom');
const FILE={calvary:'calvary_data_new.js',forestdale:'forestdale_data_new.js',elmwood:'elmwood_data_new.js',
'rock-valley':'rock-valley_data_new.js','smiths-ferry':'smiths-ferry_data_new.js','research-queue':'research-queue_data_new.js'};
const html=fs.readFileSync('landing_index.html','utf8');
const dom=new JSDOM(html,{runScripts:'outside-only',pretendToBeVisual:true,url:'https://x/'});
const w=dom.window;
w.fetch=async u=>{const s=u.replace('./','').replace('/data.js','');
  return FILE[s]?{ok:true,text:async()=>fs.readFileSync(FILE[s],'utf8')}:{ok:false};};
const src=[...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
w.eval(src);
setTimeout(()=>{
  const d=w.document;
  const rows=d.querySelectorAll('.hr-row');
  console.log('card count :', d.getElementById('hr-count').textContent);
  const t=d.querySelector('.hr-title'); console.log('box title  :', t?t.textContent.trim():'MISSING');
  console.log('legend rows:', rows.length);
  console.log('');
  rows.forEach(r=>console.log('  ' + r.querySelector('.hr-name').textContent.padEnd(30) +
    r.querySelector('.hr-n').textContent.padStart(4) + '   -> ' + r.getAttribute('href')));
  process.exit(rows.length?0:1);
},400);
