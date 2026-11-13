/* World polish: authored pixel surfaces, explicit cloud edges and a single reunion.
 * No map coordinates, collision masks or persistent IDs are changed. */
'use strict';
const WorldPolish = {
  noise(x,y){return ((Math.imul(x+31,73856093)^Math.imul(y+17,19349663))>>>0)/4294967296},
  cloudEdges(tiles,x,y){const at=(a,b)=>tiles?.[b]?.[a]==='c3_cloud';return {top:!at(x,y-1),bottom:!at(x,y+1),left:!at(x-1,y),right:!at(x+1,y)}},
  // Broad, world-anchored clusters continue across tile boundaries.
  cloudValue(x,y){
    const size=72,gx=Math.floor(x/size),gy=Math.floor(y/size),fx=x/size-gx,fy=y/size-gy,
      u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),n=(a,b)=>this.noise(a*37,b*43),
      top=n(gx,gy)*(1-u)+n(gx+1,gy)*u,bottom=n(gx,gy+1)*(1-u)+n(gx+1,gy+1)*u;
    return top*(1-v)+bottom*v;
  },
  powered(){return !!(G?.c3?.usinaDone)},
  joined(){return !!(G?.c3?.usinaDone&&G.c3.canalDone)}
};
const worldTileBase=drawTile;
drawTile=function(type,x,y,xx,yy){
  const n=WorldPolish.noise(xx,yy);
  if(type==='c3_asphalt'||type==='c3_street'){
    const road=type==='c3_street',tileAt=(dx,dy)=>current?.tiles?.[yy+dy]?.[xx+dx];
    rect(x,y,T,T,road?'#303041':'#272936');
    // Scattered aggregate is smaller and quieter than characters and props.
    for(let i=0;i<3;i++){const v=WorldPolish.noise(xx*7+i,yy*11+i);rect(x+Math.floor(v*21),y+Math.floor(WorldPolish.noise(yy+i,xx+19)*22),1,1,n>.5?'#343544':'#20232f')}
    if(road){
      if(tileAt(-1,0)!==type){rect(x,y,2,T,'#55505d');rect(x+2,y,1,T,'#191d2b')}
      if(tileAt(1,0)!==type){rect(x+T-2,y,2,T,'#55505d');rect(x+T-3,y,1,T,'#191d2b')}
      if(tileAt(0,-1)!==type){rect(x,y,T,2,'#69606b');rect(x,y+2,T,1,'#191d2b')}
      if(tileAt(0,1)!==type){rect(x,y+T-2,T,2,'#484552')}
      if((xx+yy*3)%13===0){rect(x+5,y+13,9,2,'#393a4a');rect(x+5,y+13,5,1,WorldPolish.powered()?'#526977':'#424552')}
    }else if(xx%3===0&&yy%3===0){rect(x+T-1,y+5,1,13,'#303240')}
    return;
  }
  if(type==='c3_platform'||type==='c3_metal'){
    rect(x,y,T,T,'#30364b');rect(x,y,T,1,'#535a70');rect(x,y,1,T,'#414c64');rect(x,y+T-1,T,1,'#222737');rect(x+T-1,y,1,T,'#222737');
    rect(x+3,y+3,2,2,'#7d7784');rect(x+T-5,y+T-5,2,2,'#202433');
    if(xx%5===0&&yy%3===0){rect(x+7,y+9,10,5,'#202938');for(let i=0;i<3;i++)rect(x+8+i*3,y+10,1,3,'#526071')}
    return;
  }
  if(type==='c3_clubfloor'){
    const seam=(yy+(xx%2)*2)%4===0;
    rect(x,y,T,T,['#352a39','#392d3b','#322a36'][Math.floor(n*3)]);
    rect(x,y+T-1,T,1,'#241e2c');if(seam)rect(x,y,1,T,'#201d28');
    rect(x+3,y+8,11,1,'#42323f');rect(x+9,y+18,10,1,'#2d2532');
    if(xx===1||yy===1||xx===current.w-2||yy===current.h-2){rect(x,y,T,6,'#262334');rect(x,y+4,T,2,'#77516f')}
    if(G?.c3?.clubPhraseDone&&(xx+yy)%9===0)rect(x+5,y+4,8,1,'#674061');
    return;
  }
  if(type==='c3_cloud'){
    const e=WorldPolish.cloudEdges(current?.tiles,xx,yy);
    const shades=['#c4b3d0','#d4c4da','#e5d8e4','#f1e6e7','#f8eeea'];
    for(let py=0;py<T;py+=6)for(let px=0;px<T;px+=6){
      const value=WorldPolish.cloudValue(xx*T+px,yy*T+py);
      rect(x+px,y+py,Math.min(6,T-px),Math.min(6,T-py),shades[Math.min(4,Math.floor(value*5))]);
    }
    if(e.top){rect(x,y,T,3,'#777292');rect(x+3,y+2,T-6,3,'#c9b7d4');rect(x+5,y+4,T-10,2,'#fff1e9')}
    if(e.bottom){rect(x,y+T-7,T,3,'#b7a5c9');rect(x+2,y+T-4,T-4,2,'#9285ad');rect(x+5,y+T-2,T-10,2,'#6f6b90')}
    if(e.left){rect(x,y,2,T,'#85809f');rect(x+2,y+4,2,T-8,'#c5b5d0')}
    if(e.right){rect(x+T-2,y,2,T,'#85809f');rect(x+T-4,y+4,2,T-8,'#d8c8de')}
    return;
  }
  if(type==='c3_voidfloor'||type==='c3_sanctuary'){
    const shade=WorldPolish.cloudValue(xx*T,yy*T);
    rect(x,y,T,T,type==='c3_voidfloor'?(shade>.5?'#272139':'#211e31'):'#393247');
    if(type==='c3_sanctuary'){rect(x,y+T-1,T,1,'#262237');if((xx+yy)%3===0)rect(x,y,1,T,'#51435d')}
    else if(n>.91)rect(x+8,y+12,3,1,'#645477');
    return;
  }
  if(type==='c3_sky'){

    rect(x,y,T,T,'#34354f');
    // Distant haze belongs below the walkable silhouette, not in the floor art.
    if((yy+3)%7===0)rect(x,y+8,T,3,'#49445f');
    if(n>.985)rect(x+9,y+4,1,1,'#b3a0c8');
    return;
  }
  return worldTileBase(type,x,y,xx,yy);
};

function worldBox(x,y,w,h){rect(x,y,w,h,'#191c2b');rect(x+2,y+2,w-4,h-4,'#333448');rect(x+3,y+2,w-6,1,'#767080')}
function worldSpeaker(x,y){worldBox(x-17,y-51,34,52);for(const cy of [y-35,y-14]){rect(x-11,cy-9,22,18,'#141b28');rect(x-8,cy-11,16,22,'#141b28');rect(x-7,cy-7,14,14,'#5c4568');rect(x-5,cy-5,10,10,'#242a3d');rect(x-2,cy-2,4,4,'#a7759f')}rect(x-12,y-46,4,2,WorldPolish.powered()?'#8ce0d2':'#69485e')}
function worldTable(x,y){rect(x-26,y-2,52,8,'#181c2b99');rect(x-19,y-7,4,19,'#25212c');rect(x+15,y-7,4,19,'#25212c');rect(x-25,y-17,50,12,'#3b2937');rect(x-25,y-17,50,3,'#a07372');rect(x-22,y-14,44,5,'#76515a');rect(x-17,y-13,12,1,'#aa7b75');rect(x+10,y-23,6,7,'#c0aa96');rect(x+11,y-24,4,2,'#574155');rect(x-8,y-20,10,5,'#b39ba0')}
const worldPropBase=drawProp;
drawProp=function(p,cx,cy){
  const x=Math.round((p.x+.5)*T-cx),y=Math.round((p.y+.65)*T-cy);
  if(p.type==='c3_speakers'){worldSpeaker(x,y);return}
  if(p.type==='c3_table'){worldTable(x,y);return}
  if(p.type==='c3_bar'){
    worldBox(x-58,y-38,116,40);rect(x-61,y-42,122,9,'#a87a74');rect(x-58,y-40,116,3,'#cfb097');
    for(let i=0;i<4;i++){rect(x-49+i*26,y-28,21,25,'#473241');rect(x-47+i*26,y-26,17,1,'#765363')}
    for(let i=0;i<6;i++){const px=x-42+i*16;rect(px,y-53,5,10,i%2?'#688e8b':'#947c9d');rect(px+1,y-56,3,4,'#bda88c')}
    rect(x+31,y-48,17,6,'#222739');rect(x+34,y-46,3,2,WorldPolish.powered()?'#86dbbc':'#665365');return;
  }
  if(p.type==='c3_stage'){
    rect(x-88,y-15,176,17,'#191c2b');rect(x-88,y-35,176,22,'#54314b');rect(x-85,y-34,170,3,'#a16b85');
    for(let i=0;i<11;i++){rect(x-82+i*15,y-30,13,14,'#664054');rect(x-82+i*15,y-17,13,1,'#a66c7c')}
    const lit=G?.c3?.clubPhraseDone;
    rect(x-70,y-23,140,2,lit?'#d2af8b':'#745267');
    // Synthesizer and stand, bass amp, drum kit and microphone share the map scale.
    worldBox(x-57,y-59,29,25);rect(x-53,y-55,21,12,'#252b3b');rect(x-52,y-54,19,2,'#a998ab');
    rect(x+30,y-62,43,12,'#292d40');rect(x+32,y-55,39,4,'#ded1c1');for(let i=0;i<8;i++)rect(x+33+i*5,y-55,2,3,'#343044');rect(x+35,y-49,2,15,'#8f7b8c');rect(x+65,y-49,2,15,'#8f7b8c');
    rect(x-10,y-48,22,20,'#773b63');rect(x-8,y-47,18,3,'#d6b5b3');rect(x-6,y-44,14,14,'#2c2c42');rect(x-2,y-40,6,6,'#b797a6');
    for(const dx of [-18,15]){rect(x+dx,y-55,13,9,'#794a71');rect(x+dx,y-56,13,3,'#ddc6be');rect(x+dx+5,y-46,2,12,'#9c8da3')}
    rect(x-28,y-63,24,2,'#cba879');rect(x-17,y-61,1,23,'#98879d');rect(x+16,y-67,24,2,'#cba879');rect(x+27,y-65,1,20,'#98879d');
    rect(x-39,y-56,2,28,'#a99aa7');rect(x-44,y-29,12,2,'#898195');rect(x-41,y-59,8,4,'#c9bcc4');
    for(let i=0;i<5;i++){worldBox(x-70+i*34,y-86,12,8);rect(x-67+i*34,y-78,6,3,lit?['#76d6d1','#e9afcc','#d9b681'][i%3]:'#735472')}
    return;
  }
  return worldPropBase(p,cx,cy);
};

// The first contact is a broadcast. Belga is met physically only at the club.
const worldSceneBase=C3.scene;
C3.scene=function(id,end){
  if(id==='C3_001')return talk([
    {who:'ryuchi',t:'A máscara puxou a gente antes daquele Silêncio desaparecer. Ele veio parar aqui.'},
    {who:'franco',t:'E a cidade inteira está repetindo o último segundo, como se tivesse medo de terminar.'},
    {who:'narrator',t:'O rádio do terminal acende. Uma voz atravessa a estática: “Aqui é Belga, do Contratempo. Ainda temos uma porta aberta.”'},
    {who:'ryuchi',t:'Contratempo. Vamos encontrar quem ainda está transmitindo.'}
  ],end);
  return worldSceneBase(id,end);
};

// A meaningful reunion replaces the workshop confirmation trip. Old workshop
// acquisition and its save flag remain valid, so existing journeys do not lose progress.
const worldVegaBase=C3.vega;
C3.vega=function(){
  if(WorldPolish.joined()&&!G.c3.windFlute){
    return talk([{who:'narrator',t:'Colli e Mazza chegam ao Contratempo. Um traz o mapa das correntes; o outro, a flauta que terminou enquanto vocês recuperavam a Usina.'}],()=>{
      C3.scene('C3_011',()=>{G.c3.windFlute=true;save(true);updateHUD();toast('FLAUTA DOS VENTOS · A BANDA ESTÁ REUNIDA');worldVegaBase()});
    });
  }
  return worldVegaBase();
};
const worldObjectiveBase=C3.objective;
C3.objective=function(){
  if(WorldPolish.joined()&&!G.c3.windFlute)return {text:'Reúna a banda no Contratempo.',hint:'Colli e Mazza levam a Flauta ao clube. Encontre Dney junto ao palco.',area:'contratempo',x:18,y:8,name:'Dney · Reunião da banda'};
  return worldObjectiveBase();
};

// Reunion participants are present on the map, not only mentioned in dialogue.
const worldApplyBase130=C3.applyWorld;
C3.applyWorld=function(){worldApplyBase130();const club=areas.contratempo;if(!club||!WorldPolish.joined())return;
 if(!club.npcs.some(n=>n.id==='c3_nara'))npc(club,'c3_nara',20,10,'Colli · Cartógrafo Sonoro',()=>talk([{who:'colli',t:'Trouxe o mapa das correntes. Vamos reunir a banda com Dney junto ao palco.'}]),'citizen');
 if(!club.npcs.some(n=>n.id==='c3_ciro'))npc(club,'c3_ciro',22,10,'Mazza · Oficina de Frequências',()=>talk([{who:'mazza',t:'A flauta está pronta. O mapa do Colli e a música de vocês vão dar caminho ao ar.'}]),'citizen');
};
