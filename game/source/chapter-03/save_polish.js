/* Alpha 1.3.0: test sessions never write the player's normal autosave. */
const SavePolish = {
  preview:false, initializing:false,
  testKey:KEY+'_preview', backupKey:KEY+'_recovery',
  backup(){try{const raw=localStorage.getItem(KEY);if(raw)localStorage.setItem(this.backupKey,raw)}catch(_){toast('BACKUP INDISPONÍVEL · EXPORTE SEU PROGRESSO')}},
  resumeTest(){try{const data=normalizeSave(JSON.parse(localStorage.getItem(this.testKey)));if(!data)return toast('NENHUM TESTE SALVO');this.preview=true;G=data;buildMaps();$('start').classList.add('hidden');$('hud').style.display='block';closeOverlay();setArea(G.area,G.x,G.y,false);enableAudio();toast('SESSÃO DE TESTE · JORNADA PRINCIPAL PRESERVADA')}catch(_){toast('TESTE INVÁLIDO · JORNADA PRINCIPAL PRESERVADA')}},
  recover(){try{const raw=localStorage.getItem(this.backupKey),data=raw&&normalizeSave(JSON.parse(raw));if(!data)return toast('NENHUM BACKUP DISPONÍVEL');this.backup();localStorage.setItem(KEY,JSON.stringify(data));this.preview=false;continueGame()}catch(_){toast('NÃO FOI POSSÍVEL RECUPERAR O BACKUP')}}
};
const saveBeforePolish=save;
save=function(silent=false){
  if(!SavePolish.preview)return saveBeforePolish(silent);
  if(!G)return;
  try{const state=((battle||(mode==='overlay'&&!savedFormationAlive10(G)))&&G.checkpoint?.snapshot)?{...copy(G.checkpoint.snapshot),checkpoint:copy(G.checkpoint)}:G;localStorage.setItem(SavePolish.testKey,JSON.stringify(state));if(!silent)toast('TESTE SALVO · JORNADA PRINCIPAL PRESERVADA')}
  catch(_){if(!silent)toast('EXPORTE O TESTE PARA GUARDAR')}
};
const checkpointBeforePolish=setCheckpoint;
setCheckpoint=function(...args){if(SavePolish.initializing&&G){const normalized=normalizeSave(G);if(normalized)G=normalized;C3.ensureProgression(G);for(const id of Object.keys(G.maxhp))G.hp[id]=G.maxhp[id]}const result=checkpointBeforePolish(...args);if(SavePolish.initializing&&G&&current)updateHUD();return result};
const previewC3BeforePolish=C3.start;
C3.start=function(preview=false){if(preview){SavePolish.preview=true;SavePolish.initializing=true}try{return previewC3BeforePolish(preview)}finally{SavePolish.initializing=false}};
const previewC2BeforePolish=startChapterTwoPreview;
startChapterTwoPreview=function(){SavePolish.preview=true;SavePolish.initializing=true;try{return previewC2BeforePolish()}finally{SavePolish.initializing=false}};
const newBeforePolish=newGame;
newGame=function(...args){SavePolish.backup();SavePolish.preview=false;return newBeforePolish(...args)};
const continueBeforePolish=continueGame;
continueGame=function(...args){SavePolish.preview=false;return continueBeforePolish(...args)};
const importBeforePolish=importSave;
importSave=function(file){if(!file)return;SavePolish.backup();SavePolish.preview=false;return importBeforePolish(file)};
const titleOptionsBeforePolish=openTitleOptions10;
openTitleOptions10=function(){titleOptionsBeforePolish();const box=$('overlayInner'),row=document.createElement('div');row.className='row';
  row.innerHTML='<button class="action" id="resumeTest130">RETOMAR TESTE</button><button class="action" id="recoverSave130">RECUPERAR JORNADA ANTERIOR</button><p>Capítulos de teste têm salvamento separado. CONTINUAR retoma sua jornada principal.</p>';
  box.appendChild(row);$('resumeTest130').onclick=()=>SavePolish.resumeTest();$('recoverSave130').onclick=()=>SavePolish.recover();
};
const qaBeforeSavePolish=C3.qaState;
C3.qaState=function(...args){SavePolish.preview=true;return qaBeforeSavePolish(...args)};
