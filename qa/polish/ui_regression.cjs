/* Pure state/presentation contract tests; no browser or player save involved. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const elements=new Map();
function el(id){if(!elements.has(id))elements.set(id,{textContent:'',dataset:{},style:{},classList:{toggle(){}},setAttribute(k,v){this[k]=v},querySelector(s){return s==='b'?el(id+':b'):null}});return elements.get(id)}
const root={classList:{toggle(){}},dataset:{},style:{setProperty(){}}};
const store=new Map();
const sandbox={document:{documentElement:root,querySelector:s=>el(s),querySelectorAll:()=>[]},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},Input121:{mobile:true},G:{active:'synth',resonance:20},act:{cool:0,skill:2.5,skillX:0,duo:0,dashCD:0},mode:'walk',skillNames10:{synth:['Oscilador','Pad','Filtro']},SIGNATURE11:{synth:{name:'Camadas vivas'}},$:id=>el(id),activeModes10:()=>sandbox.mode==='walk'||sandbox.mode==='action',releaseTouch121(){},pauseHeader10:()=>'<small>1.0 · PRÉ-ALPHA</small>',openSettings10(){},openTitleOptions10(){sandbox.previousOptionsCalled=true},openHelp(){},update(){},updateHUD(){},init(){},C3:{handlePrimaryPad(){},padDirection:()=>[0,0]},labels10:{},console};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'../../game/source/chapter-03/ui_polish.js'),'utf8'),sandbox);
function run(s){return vm.runInContext(s,sandbox)}
let passed=0;
function check(name,fn){fn();passed++;console.log('OK · '+name)}
check('Touch and gamepad labels follow last real input, not controller connection',()=>{assert.equal(run("ToriiUI130.device='touch';ToriiUI130.source()"),'touch');assert.equal(run("ToriiUI130.device='keyboard';ToriiUI130.source()"),'keyboard');assert.equal(run("ToriiUI130.device='gamepad';ToriiUI130.source()"),'gamepad')});
check('Recarga is finite and nonnegative',()=>{assert.equal(run("ToriiUI130.cooldown('skill')"),2.5);sandbox.act.skill=-4;assert.equal(run("ToriiUI130.cooldown('skill')"),0);sandbox.act.skill=NaN;assert.equal(run("ToriiUI130.cooldown('skill')"),0)});
check('Invalid or corrupted stored UI options cannot break controls',()=>{store.set('torii_hutukara_ui_v1','{"scale":900,"opacity":0,"leftHanded":"false"}');run('ToriiUI130.load()');assert.equal(run('ToriiUI130.options.scale'),100);assert.equal(run('ToriiUI130.options.opacity'),72);assert.equal(run('ToriiUI130.options.leftHanded'),false);store.set('torii_hutukara_ui_v1','{bad');assert.doesNotThrow(()=>run('ToriiUI130.load()'))});
check('Valid preferences persist separately from game progress',()=>{run('ToriiUI130.options.scale=115;ToriiUI130.options.leftHanded=true;ToriiUI130.persist()');const o=JSON.parse(store.get('torii_hutukara_ui_v1'));assert.equal(o.scale,115);assert.equal(o.leftHanded,true);assert.equal(store.size,1)});
check('Mobile prompt and menu replace keyboard instructions',()=>{run("ToriiUI130.device='touch';ToriiUI130.sync()");assert.equal(el('bMenu').textContent,'MENU');assert.equal(el('prompt:b').textContent,'AÇÃO');assert.equal(el('#dialogue .continue').textContent,'▼ TOQUE PARA CONTINUAR');assert.equal(root.dataset.inputSource,'touch')});
check('Header version and all six help kits remain available',()=>{assert(run("pauseHeader10('x')").includes('ALPHA 1.3.0'));assert.equal(run('Object.keys(ToriiUI130.kits).length'),6)});
console.log(JSON.stringify({passed,method:'Node vm state/presentation contracts; physical-device layout pending'}));
module.exports={passed,method:'Node vm state/presentation contracts; physical-device layout pending'};
