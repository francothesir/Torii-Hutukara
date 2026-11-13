/* Shared authored actions. All geometry receives an actor; no borrowed leader coordinates.
 * Input and roll simulation remain owned by input_mobile_combat.js.
 */
const CombatPolish = {
  actors: [null, null], fields: [], scheduled: [], game: null, area: null,
  names: {
    franco:['Grave','Pulso','Acorde','Coração grave'],
    ryuchi:['Estocada','Notas','Passo sônico','Corrente de vozes'],
    alt:['Flecha','Perfurante','Três horizontes','Chuva de flechas'],
    katana:['Katana','Iai','Aparo','Corte do horizonte'],
    synth:['Oscilador','Pad harmônico','Filtro','Camadas vivas'],
    percussion:['Batida','Contratempo','Quebra-pulso','Pulso comum']
  },
  actor(player=0) {
    if(!G||player&&!C3.coopActive())return null;
    if(this.game!==G||this.area!==G.area){this.clear();this.game=G;this.area=G.area}
    const id=player?C3.coopMember():G.active, body=player?C3.coop:G;
    if(!id||!(G.hp[id]>0))return null;
    let actor=this.actors[player];
    if(!actor||actor.id!==id||actor.game!==G){
      actor={player,id,body,game:G,guard:0,guardDir:[0,1],combo:0,lastAttack:-10,iai:null};
      this.actors[player]=actor;
    }
    actor.body=body;
    return actor;
  },
  direction(a){return a.player?C3.coopVector():combatDirection10()},
  cooldown(a,key,value){
    const target=a.player?C3.coop:act;
    const mapped=a.player?({skillX:'advanced',duo:'signature'}[key]||key):key;
    if(value!==undefined)target[mapped]=value;
    return target[mapped]||0;
  },
  fx(a,kind,size=1,life=.25,dir=this.direction(a)){
    const color=a.id==='synth'?'#61e7ed':a.id==='percussion'?'#ff82d2':'#ffe0a0';
    effect10(kind,a.body.x,a.body.y,dir,life,size,color);
  },
  targets(a,range,cosine=-1){
    const d=this.direction(a),b=a.body;
    return meleeCandidates().filter(e=>{const dx=e.x-b.x,dy=e.y-b.y,n=Math.hypot(dx,dy);return n<=range&&(dx*d[0]+dy*d[1])/Math.max(.001,n)>=cosine});
  },
  damage(a,e,amount,stun=.2,knock=0){
    hitEnemy(e,amount,stun,0);
    if(knock&&e.hp>0&&e.id!=='voice_boss'){
      const dx=e.x-a.body.x,dy=e.y-a.body.y,n=Math.max(.01,Math.hypot(dx,dy)),x=e.x+dx/n*knock,y=e.y+dy/n*knock;
      if(tileWalkable(current,x,y)){e.x=x;e.y=y}
    }
  },
  hit(a,range,cosine,damage,stun=.2,knock=.08){
    const list=this.targets(a,range,cosine);for(const e of list)this.damage(a,e,damage,stun,knock);return list.length;
  },
  shot(a,damage,speed=11.5,life=1.2,hits=1,spread=0){
    const d=this.direction(a),angle=Math.atan2(d[1],d[0])+spread,b=a.body;
    projectiles.push({x:b.x+Math.cos(angle)*.4,y:b.y+Math.sin(angle)*.4,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,time:life,damage,hit:[],arrow:a.id==='alt',hitsLeft:hits,piercing:hits>1,source:a.id});
  },
  pulse(a,radius,damage,stun=.55){
    this.hit(a,radius,-1,damage,stun,.18);
    hostileShots=hostileShots.filter(p=>Math.hypot(p.x-a.body.x,p.y-a.body.y)>radius);
    this.fx(a,'drumBreak',radius/3,.34);
  },
  heal(amount){for(const id of partyMembers())if(G.hp[id]>0)G.hp[id]=Math.min(G.maxhp[id],G.hp[id]+amount)},
  field(a,kind,x,y,options={}){
    this.fields.push({player:a.player,id:a.id,kind,x,y,area:G.area,left:5.2,next:0,...options});
  },
  delay(a,seconds,callback){this.scheduled.push({actor:a,area:G.area,left:seconds,callback})},
  ready(a,kind){
    if(!a||!activeModes10()||!combatAreas10.has(G.area)||a.guard>0||a.iai)return false;
    if((a.player?C3.coop.dash:Combat10.dashTime)>0)return false;
    const key=['cool','skill','skillX','duo'][kind];
    if(this.cooldown(a,key)>0)return false;
    if(kind===2&&['franco','ryuchi'].includes(a.id)&&(G.levels[a.id]||1)<3){toast('TÉCNICA II · DESBLOQUEIA NO NÍVEL 3');return false}
    if(kind===3&&(!G.flags.bass||G.resonance<40)){toast('ESPECIAL · REQUER BAIXO E 40 DE RESSONÂNCIA');return false}
    return true;
  },
  use(player,kind){
    const a=this.actor(player);if(!this.ready(a,kind))return false;
    if(mode==='walk')engage();
    const id=a.id,b=a.body,d=this.direction(a),level=G.levels[id]||1;
    if(kind===0){
      a.combo=tick-a.lastAttack<(id==='percussion'?.58:.72)?a.combo%3+1:1;a.lastAttack=tick;
      const combo=a.combo;
      let cool=feel121(id).recovery,fx='slash',range=2.35,cosine=.1,damage=16+(combo===3?7:0),stun=.36;
      if(id==='alt'){this.shot(a,TUNING10.archer.damage,TUNING10.archer.speed);cool=TUNING10.archer.cooldown;fx='bow'}
      else if(id==='synth'){
        const ranges=[0,2.7,3.3,3.9],widths=[0,.52,.76,1.02],damages=[0,10,12,18];
        for(const e of meleeCandidates()){const x=e.x-b.x,y=e.y-b.y;if(x*d[0]+y*d[1]>.15&&x*d[0]+y*d[1]<ranges[combo]&&Math.abs(x*d[1]-y*d[0])<widths[combo])this.damage(a,e,damages[combo],combo===3?.5:.2,.08)}
        if(combo===3)for(const f of this.fields)if(f.kind==='pad'&&f.player===player){f.left=Math.min(6,f.left+.8);f.next=0}
        cool=[0,.22,.27,.4][combo];fx='synthWave';if(!player)C3.synthWave=combo;
      }else{
        if(id==='ryuchi'){range=2.65;cosine=.43;damage=8+combo*2;stun=.13;cool=level>=2?.15:.19;fx='thrust'}
        if(id==='franco')damage=Math.round(damage*(level>=4?1.22:1));
        if(id==='katana'){range=TUNING10.katana.comboRange[combo-1];cosine=TUNING10.katana.comboCosine[combo-1];damage=TUNING10.katana.comboDamage[combo-1];cool=TUNING10.katana.comboCooldown[combo-1];fx=combo===3?'thrust':combo===1?'katanaA':'katanaB'}
        if(id==='percussion'){range=2.35+(combo===3?.45:0);cosine=-.08;damage=[0,12,14,18][combo];cool=combo===3?.34:.24;fx=combo===3?'drumFinish':'drumBeat'}
        this.hit(a,range,cosine,damage,stun,id==='franco'?.25:.08);
        if(id==='percussion'&&combo===3)this.hit(a,2.35,-1,10,.55,.2);
      }
      this.cooldown(a,'cool',cool);this.fx(a,fx,id==='franco'?1.4:combo===3?1.45:1);
      G.resonance=Math.min(100,G.resonance+5);
    }else if(kind===1){
      let cooldown=4.8;
      if(id==='franco'){this.hit(a,level>=2?4.5:3.75,-1,level>=2?30:24,1.25,.62);this.fx(a,'pulse',3.75);this.cooldown(a,'invuln',Math.max(this.cooldown(a,'invuln'),.22))}
      if(id==='ryuchi'){for(let i=-1;i<=1;i++)this.shot(a,14,9,.85,1,i*.2);cooldown=3.2;this.fx(a,'thrust',2.2)}
      if(id==='alt'){this.shot(a,TUNING10.archer.pierceDamage,TUNING10.archer.pierceSpeed,1.25,TUNING10.archer.pierceTargets);this.fx(a,'bow',1.4);cooldown=TUNING10.archer.pierceCooldown}
      if(id==='katana'){a.iai={left:TUNING10.katana.iaiDuration,d:[...d],hits:new Set()};this.fx(a,'iai');cooldown=TUNING10.katana.iaiCooldown}
      if(id==='synth'){
        let x=b.x+d[0]*2.8,y=b.y+d[1]*2.8;if(!canBody121(x,y)){x=b.x+d[0]*1.35;y=b.y+d[1]*1.35}if(!canBody121(x,y)){x=b.x;y=b.y}
        const own=this.fields.filter(f=>f.kind==='pad'&&f.player===player);if(own.length>=2)this.fields.splice(this.fields.indexOf(own[0]),1);
        this.field(a,'pad',x,y);this.fx(a,'synthPad',1.35);cooldown=3.8;
      }
      if(id==='percussion'){a.guard=.72;a.guardDir=d;this.fx(a,'drumCounter',1.05,.72);cooldown=3.2}
      this.cooldown(a,'skill',cooldown);this.cooldown(a,'cool',Math.max(this.cooldown(a,'cool'),.32));
    }else if(kind===2){
      let cooldown=6.2;
      if(id==='franco'){this.hit(a,5.3,-1,35,1.6,.65);this.fx(a,'pulse',5.3);cooldown=6.7}
      if(id==='ryuchi'){
        const hit=new Set();for(let i=0;i<17;i++){if(!moveActor121(b,d[0],d[1],.28))break;for(const e of meleeCandidates())if(!hit.has(e)&&Math.hypot(e.x-b.x,e.y-b.y)<1.25){hit.add(e);this.damage(a,e,29,.65,.2)}}this.fx(a,'thrust',2.5);cooldown=5.1;
      }
      if(id==='alt'){this.shot(a,TUNING10.archer.volleyDamage,TUNING10.archer.speed+1,1.18);for(let i=1;i<=2;i++)this.delay(a,i*TUNING10.archer.volleyInterval,()=>this.shot(a,TUNING10.archer.volleyDamage,TUNING10.archer.speed+1,1.18));cooldown=TUNING10.archer.volleyCooldown;this.fx(a,'bow',1.3)}
      if(id==='katana'){a.guard=TUNING10.katana.parryWindow;a.guardDir=[...d];this.fx(a,'guard',1,a.guard);cooldown=TUNING10.katana.parryCooldown}
      if(id==='synth'){
        const pads=this.fields.filter(f=>f.player===player&&f.kind==='pad');if(!pads.length)pads.push({x:b.x,y:b.y});
        for(const z of pads){for(const e of meleeCandidates())if(Math.hypot(e.x-z.x,e.y-z.y)<3.35){this.damage(a,e,24,.72,.16);const dx=z.x-e.x,dy=z.y-e.y,n=Math.max(.01,Math.hypot(dx,dy)),nx=e.x+dx/n*.28,ny=e.y+dy/n*.28;if(tileWalkable(current,nx,ny)){e.x=nx;e.y=ny}}hostileShots=hostileShots.filter(p=>Math.hypot(p.x-z.x,p.y-z.y)>3.35);effect10('synthFilter',z.x,z.y,[0,1],.48,2.2,'#f06de5')}
        this.fields=this.fields.filter(f=>f.player!==player||f.kind!=='pad');
      }
      if(id==='percussion'){for(let i=0;i<3;i++)this.delay(a,i*.145,()=>this.pulse(a,2.4+i*1.25,12+i*5,.45+i*.16))}
      this.cooldown(a,'skillX',cooldown);this.cooldown(a,'cool',Math.max(this.cooldown(a,'cool'),.36));
      if(id!=='katana')this.cooldown(a,'invuln',Math.max(this.cooldown(a,'invuln'),.4));
    }else{
      G.resonance-=40;this.cooldown(a,'duo',7);this.cooldown(a,'cool',Math.max(this.cooldown(a,'cool'),.32));this.cooldown(a,'invuln',Math.max(this.cooldown(a,'invuln'),.7));
      if(id==='franco'){this.hit(a,3.6,-1,32,.7,1);this.heal(8);traceSpecial11('heart',b.x,b.y,3.6,0,'#edc391')}
      if(id==='ryuchi'){let x=b.x,y=b.y;const list=meleeCandidates().slice();for(let i=0;i<3;i++){list.sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y));const e=list.shift();if(!e||Math.hypot(e.x-x,e.y-y)>5)break;traceSpecial11('chain',x,y,e.x,e.y,'#9bdcd9');x=e.x;y=e.y;this.damage(a,e,40,1,.05)}hostileShots=hostileShots.filter(p=>Math.hypot(p.x-b.x,p.y-b.y)>3)}
      if(id==='alt'){let x=b.x,y=b.y;for(let r=.25;r<=4.5;r+=.25){const nx=b.x+d[0]*r,ny=b.y+d[1]*r;if(!tileWalkable(current,nx,ny))break;x=nx;y=ny}this.field(a,'rain',x,y,{left:2,next:.65,pulses:3});traceSpecial11('mark',x,y,2.1,0,'#c8d49a',1.9)}
      if(id==='katana'){for(const e of meleeCandidates()){const dx=e.x-b.x,dy=e.y-b.y,along=dx*d[0]+dy*d[1],across=Math.abs(dx*d[1]-dy*d[0]);if(along>=0&&along<=5.4&&across<=.65)this.damage(a,e,60+Math.round(30*(1-e.hp/Math.max(1,e.max||e.maxhp||e.hp))),.3,.05)}traceSpecial11('cut',b.x,b.y,b.x+d[0]*5.4,b.y+d[1]*5.4,'#ded1ec')}
      if(id==='synth'){for(const e of meleeCandidates()){this.damage(a,e,32,.65,.12);traceSpecial11('chain',b.x,b.y,e.x,e.y,'#59eff1')}this.heal(5)}
      if(id==='percussion'){this.pulse(a,5.5,36,1.4);hostileShots=[];this.heal(8)}
    }
    // Keep the existing animation/HUD conventions, with state owned by the actor.
    if(player){Object.assign(C3.coop,{attackHero:id,attackDir:[...d],attackUntil:tick+.24,recovery:feel121(id).recovery})}
    else{act.combo=a.combo;act.comboTime=tick;act.slash=.2;act.slashMax=.2;act.slashHero=id;act.slashDir=G.dir;Input121.recovery=feel121(id).recovery;if(id==='percussion')C3.setPercussionMotion(kind===0?'strike':kind===1?'counter':'break',kind===1?.72:.3)}
    playTone(id==='percussion'?147:id==='synth'?330:kind===3?440:220,.1,'triangle',.05);
    if(kind>0)toast((player?'P2 · ':'')+this.names[id][kind].toUpperCase());
    updateActionHUD();return true;
  },
  counter(player,from){
    const a=this.actor(player);if(!a||a.guard<=0)return false;
    if(a.id==='katana'){
      if(!from||from.type==='boss'||from.kind==='boss')return false;
      const x=from.x-a.body.x,y=from.y-a.body.y,n=Math.max(.001,Math.hypot(x,y));if((x*a.guardDir[0]+y*a.guardDir[1])/n<.2)return false;
      this.hit(a,TUNING10.katana.counterRange,.25,TUNING10.katana.counterDamage,.65,.2);this.fx(a,'counter',1.4,.3,a.guardDir);
    }else if(a.id==='percussion'){this.pulse(a,3.8,30,1.1);this.fx(a,'drumCounter',1.8)}else return false;
    a.guard=0;this.cooldown(a,'invuln',.65);G.resonance=Math.min(100,G.resonance+12);toast((player?'P2 · ':'')+'CONTRA-ATAQUE PERFEITO · +12');return true;
  },
  clear(){this.actors=[null,null];this.fields=[];this.scheduled=[]},
  tick(dt){
    if(this.game!==G||this.area!==G?.area){this.clear();this.game=G;this.area=G?.area}
    if(!G||!activeModes10())return;
    dt=Math.max(0,Math.min(.06,dt));
    for(let player=0;player<2;player++){
      if(player&&!C3.coopActive())continue;const a=this.actor(player);if(!a)continue;
      a.guard=Math.max(0,a.guard-dt);
      if(a.iai){const q=a.iai,step=Math.min(dt,q.left),steps=Math.max(1,Math.ceil(TUNING10.katana.iaiSpeed*step/.075));for(let i=0;i<steps;i++){const moved=moveActor121(a.body,q.d[0],q.d[1],TUNING10.katana.iaiSpeed*step/steps);for(const e of meleeCandidates())if(!q.hits.has(e)&&Math.hypot(e.x-a.body.x,e.y-a.body.y)<TUNING10.katana.iaiRadius){q.hits.add(e);this.damage(a,e,TUNING10.katana.iaiDamage,.32,.08)}if(!moved)break}q.left-=dt;if(q.left<=0)a.iai=null}
    }
    for(const item of this.scheduled){if(item.area!==G.area||this.actors[item.actor.player]!==item.actor||(item.actor.player&&!C3.coopActive())){item.left=-1;continue}item.left-=dt;if(item.left<=0)item.callback()}
    this.scheduled=this.scheduled.filter(item=>item.left>0);
    for(const f of this.fields){f.left-=dt;f.next-=dt;if(f.area!==G.area){f.left=0;continue}if(f.next<=0){f.next=f.kind==='rain'?.32:.68;for(const e of meleeCandidates())if(Math.hypot(e.x-f.x,e.y-f.y)<(f.kind==='rain'?2.1:2.05))hitEnemy(e,f.kind==='rain'?18:7,.16,.04);effect10(f.kind==='rain'?'pulse':'synthPad',f.x,f.y,[0,1],.3,1.1,f.kind==='rain'?'#e7c78e':'#68ecea');if(f.kind==='rain'&&--f.pulses<=0)f.left=0}}
    this.fields=this.fields.filter(f=>f.left>0);
  }
};
attackAction=()=>CombatPolish.use(0,0);
skillAction=()=>CombatPolish.use(0,1);
advancedSkill=()=>CombatPolish.use(0,2);
duoAction=()=>CombatPolish.use(0,3);
C3.coopAttack=()=>CombatPolish.use(1,0);
C3.coopSkill=()=>CombatPolish.use(1,1);
C3.coopAdvanced=()=>CombatPolish.use(1,2);
C3.coopSignature=()=>CombatPolish.use(1,3);
const polishDamageHero=damageHero;
damageHero=function(amount,from){if(mode==='action'&&act.invuln<=0&&CombatPolish.counter(0,from))return false;return polishDamageHero(amount,from)};
const polishDamageCoop=C3.damageCoop;
C3.damageCoop=function(amount,from){if(mode==='action'&&C3.coop.invuln<=0&&CombatPolish.counter(1,from))return false;return polishDamageCoop(amount,from)};
// Resolve against the actual source; guard direction never guesses an attacker.
C3.updateCoopCombat=function(dt){
  const c=C3.coop;if(!C3.coopActive()||!activeModes10())return;
  for(const key of ['cool','skill','advanced','signature','dash','dashCD','invuln','hit','contact'])c[key]=Math.max(0,(c[key]||0)-dt);
  if(mode!=='action')return;
  for(let i=hostileShots.length-1;i>=0;i--)if(Math.hypot(hostileShots[i].x-c.x,hostileShots[i].y-c.y)<.68){const shot=hostileShots[i];hostileShots.splice(i,1);C3.damageCoop(shot.damage||8,shot)}
  if(c.contact<=0){const foe=meleeCandidates().find(e=>e.hp>0&&Math.hypot(e.x-c.x,e.y-c.y)<.82);if(foe){C3.damageCoop(Math.max(5,Math.round((foe.power||8)*.65)),foe);c.contact=.72}}
};
const polishCombatMove=moveG;
moveG=function(...args){if(CombatPolish.actor(0)?.iai)return false;return polishCombatMove(...args)};
const polishCombatCoopMove=C3.coopMove;
C3.coopMove=function(...args){if(CombatPolish.actor(1)?.iai){C3.coop.moving=false;return}return polishCombatCoopMove(...args)};
const polishCombatRoll=dodgeAction;
dodgeAction=function(...args){const a=CombatPolish.actor(0);if(a?.iai)return false;const result=polishCombatRoll(...args);if(result&&a)a.guard=0;return result};
const polishCombatCoopRoll=C3.coopDodge;
C3.coopDodge=function(...args){const a=CombatPolish.actor(1);if(a?.iai)return false;const result=polishCombatCoopRoll(...args);if(result&&a)a.guard=0;return result};
const polishCombatUpdate=update;
update=function(dt){CombatPolish.tick(dt);return polishCombatUpdate(dt)};
const polishCombatArea=setArea;
setArea=function(...args){CombatPolish.clear();return polishCombatArea(...args)};
const polishCombatRestore=restoreCheckpoint;
restoreCheckpoint=function(...args){CombatPolish.clear();return polishCombatRestore(...args)};
const polishCombatDraw=drawCombatLayer;
drawCombatLayer=function(){
  polishCombatDraw();ctx.save();ctx.lineWidth=2;
  for(const f of CombatPolish.fields){if(f.area!==G?.area)continue;ctx.globalAlpha=.65;ctx.strokeStyle=f.player?'#ffbd79':'#73e6f2';ctx.beginPath();ctx.ellipse(f.x*T-cam.x,f.y*T-cam.y-10,44,22,0,0,Math.PI*2);ctx.stroke();ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillStyle=ctx.strokeStyle;ctx.fillText((f.player?'P2':'P1')+' · '+f.left.toFixed(1)+'s',f.x*T-cam.x,f.y*T-cam.y-37)}
  for(const a of CombatPolish.actors){if(!a||a.guard<=0)continue;ctx.globalAlpha=.75;ctx.strokeStyle='#ffe0a0';ctx.beginPath();ctx.arc(a.body.x*T-cam.x,a.body.y*T-cam.y-20,26,0,Math.PI*2);ctx.stroke()}
  ctx.restore();
};
