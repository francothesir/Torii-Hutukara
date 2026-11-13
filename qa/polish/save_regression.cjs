const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const data=new Map([['normal','original']]);let normalWrites=0;
const c={KEY:'normal',localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},G:{hp:{franco:40},maxhp:{franco:40}},battle:null,mode:'walk',current:{},normalizeSave:x=>x,copy:x=>JSON.parse(JSON.stringify(x)),savedFormationAlive10:()=>true,toast:()=>{},save:()=>normalWrites++,setCheckpoint:()=>{},C3:{qaState:()=>{},start:()=>{},ensureProgression:g=>{g.maxhp.franco=65}},startChapterTwoPreview:()=>{},newGame:()=>{},continueGame:()=>{},importSave:()=>{},openTitleOptions10:()=>{},updateHUD:()=>{}};
vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../../game/source/chapter-03/save_polish.js'),'utf8'),c);
vm.runInContext('SavePolish.preview=true;save(true)',c);assert.equal(data.get('normal'),'original');assert(data.get('normal_preview'));assert.equal(normalWrites,0);
vm.runInContext('SavePolish.initializing=true;setCheckpoint()',c);assert.equal(c.G.hp.franco,65);
vm.runInContext('SavePolish.backup();SavePolish.preview=false;save(true)',c);assert.equal(data.get('normal_recovery'),'original');assert.equal(normalWrites,1);
vm.runInContext('SavePolish.preview=true;continueGame()',c);assert.equal(vm.runInContext('SavePolish.preview',c),false);
console.log('Save regression: isolated preview, normalized checkpoint HP, backup and normal resume passed');
