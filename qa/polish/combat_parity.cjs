/* Deterministic actor-action verification; run node qa/polish/combat_parity.cjs. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ids=['franco','ryuchi','alt','katana','synth','percussion'];
function arena(id,player=0){
 const b={x:player?20:10,y:10},foe={id:'target',x:b.x+1,y:10,hp:500,max:500,power:10};
 const noop=()=>{},cool={cool:0,skill:0,advanced:0,signature:0,dash:0,invuln:0};
 const c={console,Set,Math,Number,Map,G:{area:'forest',active:player?'franco':id,x:10,y:10,dir:'right',flags:{bass:true},hp:Object.fromEntries(ids.map(x=>[x,100])),maxhp:Object.fromEntries(ids.map(x=>[x,100])),levels:Object.fromEntries(ids.map(x=>[x,5])),resonance:100},mode:'action',tick:0,act:{},Combat10:{dashTime:0},Input121:{},C3:{coop:{...cool,x:20,y:10,dir:'right'},coopMember:()=>id,coopActive:()=>true,coopVector:()=>[1,0],coopMove:noop,coopDodge:noop,damageCoop:noop,setPercussionMotion:noop},current:{},combatAreas10:new Set(['forest']),activeModes10:()=>c.mode==='walk'||c.mode==='action',combatDirection10:()=>[1,0],feel121:()=>({recovery:.3}),meleeCandidates:()=>[foe],hitEnemy:(e,damage)=>{e.hp-=damage},effect10:noop,addCombatFX:noop,traceSpecial11:noop,playTone:noop,toast:noop,updateActionHUD:noop,engage:()=>{c.mode='action'},partyMembers:()=>ids,projectiles:[],hostileShots:[],tileWalkable:()=>true,canBody121:()=>true,moveActor121:(body,dx,dy,dist)=>{body.x+=dx*dist;body.y+=dy*dist;return true},damageHero:noop,update:noop,setArea:noop,restoreCheckpoint:noop,drawCombatLayer:noop,moveG:noop,dodgeAction:()=>true,TUNING10:{archer:{damage:23,cooldown:.36,speed:11.5,pierceDamage:39,pierceSpeed:15,pierceTargets:4,pierceCooldown:4.8,volleyDamage:24,volleyInterval:.11,volleyCooldown:6.4},katana:{comboDamage:[12,14,23],comboCooldown:[.23,.25,.4],comboRange:[2.2,2.35,2.85],comboCosine:[.6,.43,.84],iaiDuration:.18,iaiSpeed:17,iaiDamage:34,iaiRadius:.85,iaiCooldown:4.2,parryWindow:.42,parryCooldown:6,counterDamage:40,counterRange:3.2}}};
 vm.createContext(c);vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../../game/source/chapter-03/combat_polish.js'),'utf8'),c);c.api=vm.runInContext('CombatPolish',c);c.foe=foe;return c;
}
let count=0;
for(const id of ids)for(let kind=0;kind<4;kind++){
 const results=[];
 for(let player=0;player<2;player++){
  const c=arena(id,player),base=player?20:10;
  assert.equal(c.api.use(player,kind),true);
  // One second of simulation resolves Iai, volley and percussion pulses.
  for(let i=0;i<60;i++){c.tick+=1/60;c.api.tick(1/60)}
  const a=c.api.actor(player);
  results.push({damage:500-c.foe.hp,shots:c.projectiles.map(p=>({x:Number((p.x-base).toFixed(4)),y:p.y,damage:p.damage,hits:p.hitsLeft,vx:p.vx,vy:p.vy})),fields:c.api.fields.map(f=>({kind:f.kind,x:Number((f.x-base).toFixed(4)),left:Number(f.left.toFixed(4))})),resonance:c.G.resonance,cool:c.api.cooldown(a,['cool','skill','skillX','duo'][kind]),guard:a.guard});
 }
 assert.deepEqual(JSON.parse(JSON.stringify(results[0])),JSON.parse(JSON.stringify(results[1])),id+' action '+kind+' must be identical for P1/P2');count++;
}
{
 const c=arena('synth',1);c.api.use(1,1);assert.equal(c.api.fields.length,1);assert.equal(c.G.x,10);assert.equal(c.G.active,'franco');assert.equal(c.act.skill,undefined);assert(c.C3.coop.skill>0);count++;
 c.mode='overlay';const left=c.api.fields[0].left;c.api.tick(.05);assert.equal(c.api.fields[0].left,left);count++;
 c.mode='action';c.G.area='ruins';c.api.tick(.01);assert.equal(c.api.fields.length,0);count++;
}
{
 const c=arena('alt',1);c.api.use(1,2);c.api.clear();c.api.tick(.06);assert.equal(c.projectiles.length,1,'canceled actor must not emit queued arrows');count++;
}
{
 const c=arena('percussion',1);c.api.use(1,1);assert(c.api.counter(1,c.foe));assert.equal(c.G.resonance,100);assert(c.C3.coop.invuln>0);assert.equal(c.api.actor(0).guard,0);count++;
}
{
 const c=arena('katana',1);c.api.use(1,2);assert.equal(c.api.counter(1,{x:19,y:10}),false);assert.equal(c.api.counter(1,{x:21,y:10}),true);count++;
}
{
 const c=arena('ryuchi',1);c.G.levels.ryuchi=1;assert.equal(c.api.use(1,2),false);assert.equal(c.C3.coop.advanced,0);count++;
 c.G.resonance=39;assert.equal(c.api.use(1,3),false);assert.equal(c.G.resonance,39);count++;
}
console.log('Combat parity: '+count+' checks passed');

module.exports={checks:count};
