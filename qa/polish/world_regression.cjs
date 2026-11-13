/* Node's built-in test harness; no browser and no player storage. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../../game/source/chapter-03/world_polish.js'),'utf8');
const paint=[],events=[];
const scene={areas:{},npc:()=>{},G:{c3:{}},T:24,current:{w:28,h:20,tiles:[]},
  rect:(...a)=>paint.push(a),drawTile:()=>events.push('fallback'),drawProp:()=>events.push('prop-fallback'),
  talk:(lines,end)=>{events.push({lines,end})},save:()=>events.push('save'),updateHUD:()=>{},toast:()=>{},
  C3:{applyWorld:()=>{},scene:(id,end)=>events.push({id,end}),vega:()=>events.push('vega'),objective:()=>({name:'original'})}};
vm.createContext(scene);vm.runInContext(source,scene);
const run=code=>vm.runInContext(code,scene);
const grid=Array.from({length:3},()=>Array(3).fill('c3_cloud'));
scene.current.tiles=grid;
assert.equal(run('Object.values(WorldPolish.cloudEdges(current.tiles,1,1)).some(Boolean)'),false);
assert.equal(run('WorldPolish.cloudEdges(current.tiles,0,0).top'),true);
assert.equal(run('WorldPolish.cloudEdges(current.tiles,0,0).left'),true);
grid[1][2]='c3_sky';assert.equal(run('WorldPolish.cloudEdges(current.tiles,1,1).right'),true);
for(const type of ['c3_asphalt','c3_street','c3_cloud','c3_platform','c3_clubfloor']){
 paint.length=0;events.length=0;scene.drawTile(type,0,0,1,1);
 assert(paint.length>0,type+' rendered');assert(!events.includes('fallback'),type+' must not reuse illustrated material panels');
 assert(paint.every(a=>a.slice(0,4).every(Number.isFinite)),type+' finite coordinates');
}
for(const type of ['c3_stage','c3_bar','c3_speakers','c3_table']){
 paint.length=0;events.length=0;scene.drawProp({type,x:3,y:3},0,0);assert(paint.length>=8,type+' detail');assert(!events.includes('prop-fallback'));
}
events.length=0;const end=()=>{};scene.C3.scene('C3_001',end);
assert.equal(events[0].end,end);assert(events[0].lines.some(l=>l.who==='narrator'&&/rádio/.test(l.t)));
assert(!events[0].lines.some(l=>l.who==='belga'),'Belga is not physically present at terminal');
scene.G.c3={usinaDone:true,canalDone:false};assert.equal(scene.C3.objective().name,'original');
scene.G.c3.canalDone=true;assert.equal(scene.C3.objective().area,'contratempo');
events.length=0;scene.C3.vega();assert.equal(scene.G.c3.windFlute,undefined);
events[0].end();assert.equal(events[1].id,'C3_011');events[1].end();
assert.equal(scene.G.c3.windFlute,true);assert(events.includes('save'));assert(events.includes('vega'));
events.length=0;scene.C3.vega();assert.deepEqual(events,['vega'],'delivery cannot repeat');
console.log('World regression: surfaces, edge topology, props, radio continuity and idempotent reunion passed');
