/* Alpha 1.3.0: presentation follows device, actor and game state.
 * Pointer ownership remains exclusively in input_mobile_combat.js. */
const ToriiUI130={
  version:'1.3.0',key:'torii_hutukara_ui_v1',device:'keyboard',lastMode:null,
  options:{scale:100,opacity:72,leftHanded:false,largeText:false},
  presets:{scale:[85,100,115],opacity:[45,72,95]},
  kits:{
    franco:['Grave e proteção','Golpes amplos abrem espaço. Pulso grave afasta; Acorde interrompe. Coração grave protege a formação.'],
    ryuchi:['Agilidade e pressão','Combos curtos e rápidos. Notas triplas mantêm pressão; Passo sônico atravessa uma abertura.'],
    alt:['Precisão e distância','Flechas recompensam alinhamento. Perfurante atravessa; Rajada cobre o campo.'],
    katana:['Timing e risco','Cortes direcionais, Iai e Aparo: leia o inimigo antes de se comprometer.'],
    synth:['Preparação e território','Oscilador prolonga os Pads Harmônicos. Filtro de Corte consome campos, atrai inimigos e limpa projéteis.'],
    percussion:['Impacto e resposta','Três batidas, Contratempo para responder ao impacto e Quebra-pulso em ondas.']
  },
  text(el,value){if(el&&el.textContent!==value)el.textContent=value},
  load(){try{const o=JSON.parse(localStorage.getItem(this.key)||'null');if(o){this.options.scale=this.presets.scale.includes(o.scale)?o.scale:100;this.options.opacity=this.presets.opacity.includes(o.opacity)?o.opacity:72;this.options.leftHanded=o.leftHanded===true;this.options.largeText=o.largeText===true}}catch(_){}},
  persist(){try{localStorage.setItem(this.key,JSON.stringify(this.options))}catch(_){}this.applyOptions()},
  applyOptions(){const root=document.documentElement;root.style.setProperty('--touch-scale130',String(this.options.scale/100));root.style.setProperty('--touch-opacity130',String(this.options.opacity/100));root.classList.toggle('left-handed130',this.options.leftHanded);root.classList.toggle('large-text130',this.options.largeText)},
  source(){return this.device==='gamepad'?'gamepad':Input121.mobile&&this.device!=='keyboard'?'touch':'keyboard'},
  cooldown(action){if(!G)return 0;return Math.max(0,Number(({attack:act.cool,dodge:act.dashCD,skill:act.skill,advanced:act.skillX,signature:act.duo})[action])||0)},
  sync(){
    const root=document.documentElement,menu=['title','overlay','rhythm'].includes(mode),source=this.source();
    root.classList.toggle('ui-menu130',menu);root.classList.toggle('ui-dialogue130',mode==='dialogue');
    root.dataset.inputSource=source;
    this.text(document.querySelector('#start .version'),'ALPHA '+this.version+' · MOBILE & CO-OP');
    const bar=document.querySelector('.brandbar .build');if(bar&&bar.dataset.version130!==this.version){bar.innerHTML='TORII & HUTUKARA<br>ALPHA '+this.version+' · MOBILE & CO-OP';bar.dataset.version130=this.version}
    // A legacy HUD writer can replace the bar even after our first pass.
    if(bar&&bar.textContent.includes('1.0 ·')){bar.innerHTML='TORII & HUTUKARA<br>ALPHA '+this.version+' · MOBILE & CO-OP'}
    this.text($('bMenu'),source==='touch'?'MENU':source==='gamepad'?'MENU · OPTIONS':'MENU · ESC');
    const prompt=$('prompt')?.querySelector('b');this.text(prompt,source==='touch'?'AÇÃO':source==='gamepad'?'✕':'E');
    this.text(document.querySelector('#dialogue .continue'),source==='touch'?'▼ TOQUE PARA CONTINUAR':source==='gamepad'?'▼ CONTINUAR · ✕':'▼ CONTINUAR · ESPAÇO / ENTER');
    if(Input121.mobile){
      const id=G?.active,names=skillNames10[id]||['ATACAR','TÉCNICA','TÉCNICA II'];
      const labels={attack:names[0],dodge:'ROLAR',skill:names[1],advanced:names[2],signature:SIGNATURE11[id]?.name||'ESPECIAL',interact:mode==='dialogue'?'CONTINUAR':'AÇÃO',switch:'TROCAR PERSONAGEM'};
      for(const button of document.querySelectorAll('#mobileDeck121 [data-mobile-action]')){
        const action=button.dataset.mobileAction;if(!labels[action])continue;
        const left=this.cooldown(action),unfunded=action==='signature'&&G&&G.resonance<40,blocked=!activeModes10()&&action!=='interact';
        const value=labels[action]+(left>0?'\n'+left.toFixed(1)+'s':unfunded?'\n40 ♫':'');
        const presentation=value+'|'+String(blocked);if(button.dataset.presentation130===presentation)continue;button.dataset.presentation130=presentation;
        this.text(button,value);button.classList.toggle('unavailable130',left>0||unfunded||blocked);
        button.setAttribute('aria-label',labels[action]+(left>0?', recarga '+left.toFixed(1)+' segundos':unfunded?', requer 40 de ressonância':''));
        button.setAttribute('aria-disabled',String(left>0||unfunded||blocked));
      }
    }
    if(this.lastMode!==mode){this.lastMode=mode;if(menu)releaseTouch121()}
  },
  controls(){
    const o=this.options;enterMenu10(pauseHeader10('Controles e leitura','CONFORTO')+`<p>Ajustes deste aparelho. O jogo permanece pausado.</p><div class="menu-grid10"><button class="menu-entry10" id="uiSize130"><b>Tamanho dos controles</b><small>${o.scale}% · toque para alternar</small></button><button class="menu-entry10" id="uiOpacity130"><b>Opacidade na horizontal</b><small>${o.opacity}% · toque para alternar</small></button><button class="menu-entry10" id="uiHand130"><b>Posição do analógico</b><small>${o.leftHanded?'Direita':'Esquerda'}</small></button><button class="menu-entry10" id="uiText130"><b>Texto dos diálogos</b><small>${o.largeText?'Ampliado':'Normal'}</small></button></div><p>Na vertical os botões ficam abaixo da cena. Na horizontal ficam sobre ela, respeitando as áreas seguras.</p><div class="row"><button class="action strong" id="uiBack130">VOLTAR</button></div>`,'comfort');
    const cycle=(key)=>{const list=this.presets[key];o[key]=list[(list.indexOf(o[key])+1)%list.length];this.persist();this.controls()};
    $('uiSize130').onclick=()=>cycle('scale');$('uiOpacity130').onclick=()=>cycle('opacity');$('uiHand130').onclick=()=>{o.leftHanded=!o.leftHanded;this.persist();this.controls()};$('uiText130').onclick=()=>{o.largeText=!o.largeText;this.persist();this.controls()};$('uiBack130').onclick=()=>G?openSettings10():openTitleOptions10();this.sync();
  },
  addComfort(){if($('uiComfort130'))return;const row=document.createElement('div');row.className='row';const b=document.createElement('button');b.id='uiComfort130';b.className='action';b.textContent='CONTROLES E LEITURA';b.onclick=()=>this.controls();row.appendChild(b);$('overlayInner')?.appendChild(row)}
};
const uiHeaderBefore130=pauseHeader10;
pauseHeader10=function(title,tag='TORII & HUTUKARA'){return uiHeaderBefore130(title,tag).replace(/1\.0 · PRÉ-ALPHA/g,'ALPHA '+ToriiUI130.version)};
const uiSettingsBefore130=openSettings10;
openSettings10=function(){uiSettingsBefore130();ToriiUI130.addComfort();ToriiUI130.sync()};
const uiTitleOptionsBefore130=openTitleOptions10;
openTitleOptions10=function(){uiTitleOptionsBefore130();ToriiUI130.addComfort();ToriiUI130.sync()};
openHelp=function(){
  const source=ToriiUI130.source(),move=source==='touch'?'Analógico: mover; borda: correr':source==='gamepad'?'Analógico / direcional; L2: correr':'WASD / setas; Shift: correr',actions=source==='touch'?'ATACAR · ROLAR · AÇÃO · técnicas identificadas nos botões':source==='gamepad'?'□ atacar · ○ rolar · ✕ agir · L1/R1 técnicas · R2 especial · △ trocar':'J ou Espaço atacar · Q rolar · E agir · Z/X técnicas · K especial · 1–3 trocar';
  enterMenu10(pauseHeader10('Sinta o ritmo','COMO JOGAR')+`<p>${move}.</p><p>${actions}.</p><p>Esquive durante exploração ou combate. A preparação e a recuperação dos golpes variam com o instrumento. Especiais usam 40 de ressonância compartilhada.</p>${Object.entries(ToriiUI130.kits).map(([id,kit])=>`<div class="kit130"><b>${labels10[id]||id} · ${kit[0]}</b><p>${kit[1]}</p></div>`).join('')}<p>Coop local: conecte dois controles. P2 assume outro integrante vivo da formação, interage a partir da própria posição e troca com △. A câmera é compartilhada; aproximem-se quando chegar ao limite da área.</p><p>Mapa e memórias ficam em Menu → Jornada. Equipe mostra formação e técnicas. Sistema permite salvar, exportar e ajustar controles e leitura.</p><div class="row"><button class="action strong" id="helpBack10">VOLTAR</button></div>`,'help');
  $('helpBack10').onclick=()=>{if(G&&menuOrigin10!=='title')openJourney10();else{closeOverlay();if(!G)mode='title'}ToriiUI130.sync()};ToriiUI130.sync();
};
const uiUpdateBefore130=update;
update=function(dt){const result=uiUpdateBefore130(dt);ToriiUI130.sync();return result};
const uiHudBefore130=updateHUD;
updateHUD=function(){const result=uiHudBefore130();const bar=document.querySelector('.brandbar .build');if(bar)bar.dataset.version130='';ToriiUI130.sync();return result};
const uiPadBefore130=C3.handlePrimaryPad;
C3.handlePrimaryPad=function(pad){if(pad&&(pad.buttons.some(b=>b.pressed)||Math.hypot(...C3.padDirection(pad))>.1))ToriiUI130.device='gamepad';return uiPadBefore130(pad)};
const uiInitBefore130=init;
init=function(){
  uiInitBefore130();ToriiUI130.load();ToriiUI130.device=Input121.mobile?'touch':'keyboard';ToriiUI130.applyOptions();
  const style=document.createElement('style');style.textContent=UI_CSS130;document.head.appendChild(style);
  document.title='Torii & Hutukara · Alpha '+ToriiUI130.version+' · Mobile & Co-op';
  window.addEventListener('keydown',()=>{ToriiUI130.device='keyboard'},{capture:true});
  $('mobileDeck121')?.addEventListener('pointerdown',()=>{ToriiUI130.device='touch'},{capture:true});
  const footer=document.querySelector('.footer');if(footer)footer.textContent='WASD / SETAS mover · E agir · J atacar · Q rolar · Z / X técnicas · K especial · MENU: mapa, memórias e equipe';
  ToriiUI130.sync();
};
const UI_CSS130=`
.kit130{border-top:1px solid #bba28955;padding:12px 0}.kit130 p{margin:5px 0;font-size:14px}
.mobile121.ui-menu130 #mobileDeck121,.mobile121.ui-menu130 #showTouch121{display:none!important}
.mobile121.ui-menu130 #app{grid-template-rows:minmax(0,1fr)}
.mobile121.ui-dialogue130 #mobileDeck121 [data-mobile-action]:not([data-mobile-action="interact"]):not([data-mobile-action="full"]){pointer-events:none;opacity:.35}
.mobile121 #mobileDeck121 .unavailable130{filter:saturate(.2);border-style:dashed;white-space:pre-line}
.mobile121 #mobileDeck121 button{white-space:pre-line;line-height:1.2;font-size:10px;overflow-wrap:anywhere}
.mobile121 #mobileReadout121{font-size:12px}.mobile121 #mobileGoal121{font-size:11px;line-height:1.35;max-height:44px}
.mobile121 #mobileLeft121 small{display:none}.mobile121 #vitals092{font-size:10px;width:144px}.mobile121 #vitals092 .reserve{font-size:9px}
.mobile121 .prompt{font-size:12px;background:#171421ed}.mobile121 #bMenu{font-size:11px;min-height:36px}
.mobile121 #mobileStick121{width:calc(118px * var(--touch-scale130,1));height:calc(118px * var(--touch-scale130,1));max-width:100%}
.mobile121:not(.landscape121) #mobileDeck121{grid-template-columns:42% minmax(0,1fr);gap:6px}
.mobile121:not(.landscape121) .mobileActions121{gap:5px}.mobile121:not(.landscape121) .mobileActions121 button{height:calc(49px * var(--touch-scale130,1));min-height:44px}
.mobile121:not(.landscape121) .mobileActions121 .switch121{height:40px!important}
.mobile121.landscape121 #mobileStick121,.mobile121.landscape121 #mobileDeck121 button{opacity:var(--touch-opacity130,.72)}
.mobile121.landscape121 #mobileRight121{width:calc(190px * var(--touch-scale130,1))}
.mobile121.landscape121 .mobileActions121 button{height:calc(48px * var(--touch-scale130,1));min-height:44px}
.mobile121.landscape121 #mobileLeft121{width:calc(130px * var(--touch-scale130,1))}
.mobile121.left-handed130.landscape121 #mobileLeft121{left:auto;right:max(12px,env(safe-area-inset-right))}
.mobile121.left-handed130.landscape121 #mobileRight121{right:auto;left:max(12px,env(safe-area-inset-left))}
.mobile121.left-handed130:not(.landscape121) #mobileDeck121{grid-template-columns:minmax(0,1fr) 42%}
.mobile121.left-handed130:not(.landscape121) #mobileLeft121{grid-column:2;grid-row:1}
.mobile121.left-handed130:not(.landscape121) #mobileRight121{grid-column:1;grid-row:1}
.large-text130 #dialogue .words{font-size:19px;line-height:1.5}.large-text130 #dialogue{overflow:auto;max-height:75%}
.mobile121.large-text130:not(.landscape121) #dialogue{max-height:52%}
@media(max-width:360px){.mobile121 #mobileDeck121 button{font-size:9px}.mobile121 #mobileGoal121{font-size:10px}}
`;
