(() => {
  if(document.getElementById('proto-disput-extension'))return;
  const ns=globalThis.ProtoScanner,api=globalThis.browser||globalThis.chrome;
  const host=document.createElement('div');host.id='proto-disput-extension';
  const shadow=host.attachShadow({mode:'open'});
  shadow.innerHTML=`<style>
    :host{all:initial;color-scheme:light;font:14px/1.45 system-ui,sans-serif;color:#172d32}
    *{box-sizing:border-box}button,input,textarea,select{font:inherit}button{cursor:pointer;border:1px solid #bbccc9;border-radius:7px;background:#fff;color:#163f3c;padding:8px 11px}button:hover{background:#edf5f2}button:disabled{opacity:.5;cursor:default}button.primary{background:#176459;color:white;border-color:#176459}input,textarea,select{width:100%;padding:8px;border:1px solid #bbccc9;border-radius:6px;background:#fff;color:#172d32}textarea{min-height:160px;font:12px/1.5 ui-monospace,monospace;resize:vertical}label{display:block;margin:12px 0 5px;font-weight:600}small,.muted{color:#4f6668;font-size:12px}p{margin:8px 0}h2{font-size:18px;margin:0}h3{font-size:14px;margin:14px 0 6px}.row{display:flex;gap:7px;flex-wrap:wrap;margin:9px 0}.row>*{flex:1}details{margin:12px 0}summary{cursor:pointer;font-weight:600}ol{padding-left:25px}li{margin:5px 0}.notice{background:#fff2d7;border-radius:6px;padding:10px}.error{color:#8a2525;white-space:pre-wrap;overflow-wrap:anywhere}.status{padding:9px;background:#e9f4ee;border-radius:6px;white-space:pre-wrap}#toggle{position:fixed;right:16px;bottom:16px;z-index:2147483647;box-shadow:0 2px 12px #0003;background:#176459;color:white}#panel{position:fixed;right:12px;top:12px;bottom:70px;width:min(450px,calc(100vw - 24px));background:#fbfdfc;border:1px solid #aac6bf;border-radius:12px;box-shadow:0 6px 32px #0004;z-index:2147483647;overflow-y:auto;padding:18px}#panel[hidden]{display:none}.head{display:flex;align-items:center;justify-content:space-between;gap:12px}#files{font-size:12px;max-height:130px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere}#resultFiles{font-size:12px}a{color:#176459}
  </style>
  <button id="toggle" type="button" aria-expanded="false" aria-controls="panel">Scanner-Ablauf</button>
  <section id="panel" hidden aria-label="Proto-Disput Automatisierung">
    <div class="head"><h2>Proto-Disput · Browserablauf <small id="version"></small></h2><button id="close" type="button" aria-label="Panel schließen">×</button></div>
    <p class="notice">Lokale Testversion. Dateien auswählen, Zielperson eintragen und „Automatisch starten / fortsetzen“ drücken. Fertige Antworten werden gespeichert; der nächste Schritt beginnt ohne zusätzliche Bestätigung.</p>
    <label for="person">Zielperson</label><input id="person" placeholder="z. B. Manuel" autocomplete="off">
    <label for="sources">Quelldateien einmal auswählen</label><input id="sources" type="file" multiple>
    <details><summary>Stattdessen einen Ordner auswählen</summary><input id="folder" type="file" multiple webkitdirectory><p class="muted">Nur die ausgewählten Dateien werden verfügbar. Beim Neuladen müssen sie erneut ausgewählt werden.</p></details>
    <div id="files" class="muted">Noch keine Quelldateien ausgewählt.</div>
    <button id="check" type="button">Dateien prüfen</button>
    <div class="row"><button id="start" class="primary" type="button">Automatisch starten / fortsetzen</button><button id="pause" type="button" disabled>Pause</button></div>
    <details id="manualTools"><summary>Diagnose und manuelle Reparatur</summary>
    <p class="muted">Der folgende Testmodus pausiert nach einem Schritt. Für den vollständigen Ablauf den automatischen Start verwenden.</p>
    <button id="next" type="button">Nächsten Schritt testen</button>
    <div class="row"><button id="pickComposer" type="button">Chat-Eingabefeld auswählen</button><button id="diagnose" type="button">Oberfläche prüfen</button></div>
    <button id="adoptAnswer" type="button" disabled>Vorhandene Antwort übernehmen</button>
    <section id="answerRecovery" hidden>
      <h3>Fertige Antwort übernehmen</h3>
      <p id="recoveryHelp" class="muted"></p><div id="recoveryChoices"></div>
      <details><summary>Keine passende Vorschau?</summary><p class="muted">Mit dem folgenden Knopf blendet sich dieses Panel aus. Klicke dann direkt auf die fertige Nachricht von ChatGPT im Gespräch, z. B. auf „OK. Alle sechs …“. Du musst dabei nichts eingeben.</p><button id="pickAnswerPage" type="button">Antwort direkt im Chat auswählen</button></details>
      <button id="cancelRecovery" type="button">Abbrechen</button>
    </section>
    <div id="diagnostics" hidden><p class="muted">Diese Diagnose enthält Feldkennungen und Zustände, keine Gesprächsinhalte oder Dateinamen. Bei Problemen kannst du den Text kopieren und weitergeben.</p><textarea id="diagnosticText" readonly aria-label="Diagnose ohne Gesprächsinhalte"></textarea></div>
    </details>
    <p class="muted">ChatGPT kann während einer Pause weiterarbeiten. Während des Ablaufs im selben Chat bleiben und keine zusätzlichen Nachrichten senden. Dateien, Prompts und Folgeanfragen werden über dein Konto an ChatGPT gesendet.</p>
    <div id="status" class="status" role="status" aria-live="polite">Bereit zur Einrichtung.</div>
    <p id="error" class="error" role="alert"></p>
    <ol id="steps"></ol>
    <div class="row"><button id="export" type="button">Ergebnisse als ZIP</button><button id="new" type="button">Neuer Lauf</button></div>
    <details><summary>Ergebnisdateien ergänzen</summary>
      <p class="muted">Falls ein sichtbarer Download nicht automatisch gelesen werden kann: über ChatGPT herunterladen und hier für den richtigen Schritt auswählen. Damit bestätigst du die Zuordnung. Nach einem Neuladen fehlen Binärdateien im Arbeitsspeicher ebenfalls.</p>
      <label for="assetStep">Schritt</label><select id="assetStep"></select>
      <input id="assets" type="file" multiple><div id="resultFiles"></div>
    </details>
    <details><summary>Dateizuordnung und Prompts bearbeiten</summary>
      <p class="muted">Dateinamen müssen exakt passen. {{person}} wird ersetzt. reuse enthält IDs früherer Ergebnisse, die als Markdown und vorhandene Ergebnisdateien wieder angehängt werden. requireAsset verlangt eine Grafik/Datei. Änderungen gelten für neue Läufe.</p>
      <label for="workflow">Ablaufkonfiguration (JSON)</label><textarea id="workflow" spellcheck="false"></textarea>
      <div class="row"><button id="saveConfig" type="button">Konfiguration speichern</button><button id="exportConfig" type="button">JSON herunterladen</button></div>
      <label for="importConfig">Konfiguration importieren</label><input id="importConfig" type="file" accept=".json,application/json">
    </details>
    <details><summary>Oberflächenadapter</summary>
      <p class="muted">Selektoren müssen bei Änderungen der ChatGPT-Oberfläche angepasst werden. Ein nicht erkannter Abschluss führt zum Anhalten, nicht zum nächsten Schritt. Der Browser-Tab muss geöffnet bleiben.</p>
      <textarea id="selectors" spellcheck="false" aria-label="CSS-Selektoren"></textarea>
      <button id="saveSelectors" type="button">Selektoren speichern</button>
    </details>
    <p class="muted">Nicht an einem angemeldeten ChatGPT-Konto geprüft. Der gesamte Verlauf ist nicht automatisch vollständig im aktiven Modellkontext. Quellinhalte werden nicht separat dauerhaft von der Erweiterung gespeichert. Berichte, Konfiguration und Fortschritt liegen lokal im Erweiterungsspeicher. Binärdateien bleiben bis zum Neuladen im Arbeitsspeicher. ZIP-Sicherungen bitte selbst herunterladen.</p>
  </section>`;
  document.documentElement.append(host);
  const $=id=>shadow.getElementById(id);
  let files=[],assets={},run=null,runner=null,picking=false,cancelPick=null,selectors=structuredClone(ns.defaultSelectors);
  $('version').textContent='v'+ns.version;
  const storage={
    async get(){return api?.storage?api.storage.local.get(['latestRun','workflow','selectors']):{};},
    async set(value){if(api?.storage)await api.storage.local.set(value);}
  };
  const error=e=>{$('error').textContent=e?.message||String(e);};
  const guard=fn=>async(...args)=>{try{$('error').textContent='';await fn(...args);}catch(e){error(e);}};
  const config=()=>ns.validateWorkflow(JSON.parse($('workflow').value));
  function paint(){
    const busy=!!runner?.running || picking;
    for(const id of ['person','sources','folder','check','start','next','new','workflow','saveConfig','importConfig','saveSelectors','selectors','assets','pickComposer'])$(id).disabled=busy;
    $('diagnose').disabled=picking;
    $('adoptAnswer').disabled=busy || !run?.pending;
    $('pickAnswerPage').disabled=busy || !run?.pending;
    for(const button of $('recoveryChoices').querySelectorAll('button'))button.disabled=busy;
    if(!run?.pending)$('answerRecovery').hidden=true;
    $('person').disabled=busy || !!run;
    $('pause').disabled=!runner?.running;
    if(run){
      $('person').value=run.person;
      $('status').textContent=`${run.status} · ${run.results.length}/${run.flow.steps.length} abgeschlossen${run.pending?' · offener Schritt '+run.pending.step:''}`;
      $('error').textContent=run.error||'';
    }
    const flow=run?.flow||(()=>{try{return config();}catch{return ns.defaultWorkflow;}})();
    $('steps').replaceChildren();$('assetStep').replaceChildren();
    for(const step of flow.steps){
      const li=document.createElement('li');
      const result=run?.results.find(r=>r.step===step.id);
      li.textContent=`${result?'✓':run?.pending?.step===step.id?'…':'○'} ${step.title}${result?.manuallyAdopted?' · manuell übernommen':''}${result?.assetNames?.length?' · '+result.assetNames.length+' Datei(en)':''}`;
      $('steps').append(li);
      if(result || run?.pending?.step===step.id){const option=document.createElement('option');option.value=step.id;option.textContent=`${step.id}: ${step.title}`;$('assetStep').append(option);}
    }
    if(run?.pending)$('assetStep').value=run.pending.step;
    $('resultFiles').textContent=`${Object.keys(assets).length} Ergebnisdatei(en) im Arbeitsspeicher.`;
  }
  function choose(event){
    files=[...event.target.files];
    $('files').textContent=`${files.length} Datei(en) ausgewählt:\n`+files.map(f=>f.webkitRelativePath||f.name).join('\n');
  }
  $('sources').addEventListener('change',choose);$('folder').addEventListener('change',choose);
  const toggle=open=>{$('panel').hidden=!open;$('toggle').setAttribute('aria-expanded',String(open));};
  $('toggle').onclick=()=>{if(cancelPick)cancelPick();else toggle($('panel').hidden);};$('close').onclick=()=>toggle(false);
  $('diagnose').onclick=()=>{
    try{
      const adapter=new ns.DOMAdapter(selectors),report=adapter.diagnose(run?.pending?.marker,run?.chatUrl,run?.lastNavigationFailure||null);
      $('diagnostics').hidden=false;$('diagnosticText').value=JSON.stringify(report,null,2);
    }catch(e){error(e);}
  };
  function pickFromPage(instruction,match,accept){
    picking=true;paint();toggle(false);
    $('toggle').textContent=instruction+' · Esc zum Abbrechen';
    let timer;
    const cleanup=()=>{
      document.removeEventListener('click',pick,true);document.removeEventListener('keydown',key,true);
      clearTimeout(timer);picking=false;cancelPick=null;$('toggle').textContent='Scanner-Ablauf';toggle(true);paint();
    };
    const key=event=>{if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();cleanup();$('status').textContent='Feldauswahl abgebrochen.';}};
    const pick=async event=>{
      if(event.composedPath().includes(host))return;
      event.preventDefault();event.stopImmediatePropagation();
      const target=event.composedPath()[0];
      try{
        const el=target instanceof Element?match(target):null;
        if(!el){$('toggle').textContent=instruction+' · Esc zum Abbrechen';return;}
        document.removeEventListener('click',pick,true);
        clearTimeout(timer);document.removeEventListener('keydown',key,true);cancelPick=null;
        const message=await accept(el);
        cleanup();$('error').textContent='';if(message)$('status').textContent=message;
      }catch(e){cleanup();error(e);}
    };
    cancelPick=cleanup;
    document.addEventListener('click',pick,true);document.addEventListener('keydown',key,true);
    timer=setTimeout(()=>{cleanup();$('status').textContent='Feldauswahl nach 60 Sekunden beendet. Du kannst sie erneut starten.';},60000);
  }
  $('pickComposer').onclick=guard(async()=>{
    if(runner?.running)return;
    new ns.DOMAdapter(selectors).assertChatPage();
    pickFromPage('Jetzt ins Nachrichtenfeld klicken',target=>target.closest('textarea, [contenteditable="true"], [contenteditable="plaintext-only"]'),async el=>{
      const selector=ns.composerSelector(el);
      selectors={...selectors,composer:selector};ns.selectedComposer=el;
      await storage.set({selectors});$('selectors').value=JSON.stringify(selectors,null,2);
      return 'Nachrichtenfeld zugeordnet. Du kannst den automatischen Ablauf starten.';
    });
  });
  async function adoptElement(adapter,el){
    adapter.selectedAnswer(el);
    if(!run?.pending)throw Error('Es gibt keinen offenen Schritt.');
    if(!confirm(`Diese fertige Antwort für Schritt ${run.pending.step} (${run.person}) übernehmen? Der offene Prompt wird nicht erneut gesendet. Bitte Zuordnung und Vollständigkeit der Antwort prüfen.`))return 'Übernahme abgebrochen. Der offene Schritt bleibt erhalten.';
    runner=new ns.Runner(adapter,async value=>storage.set({latestRun:JSON.parse(JSON.stringify(value))}),paint);
    await runner.adoptAnswer(run,el,assets);
    return `Antwort übernommen · ${run.results.length}/${run.flow.steps.length} abgeschlossen. Mit „Automatisch starten / fortsetzen“ geht es beim nächsten Schritt weiter.`;
  }
  $('adoptAnswer').onclick=guard(async()=>{
    if(runner?.running || !run?.pending)return;
    const adapter=new ns.DOMAdapter(selectors);
    adapter.assertChatPage();
    if(adapter.one('stop'))throw Error('ChatGPT arbeitet noch. Bitte auf die fertige Antwort warten.');
    const candidates=adapter.answerCandidates().slice(-3).reverse();
    $('recoveryChoices').replaceChildren();$('answerRecovery').hidden=false;
    $('recoveryHelp').textContent=candidates.length?`Offener Schritt ${run.pending.step} für ${run.person}. Prüfe die passende Antwortvorschau und klicke darunter auf „Diese Antwort übernehmen“. Gespeichert wird der vollständige Antworttext.`:'Keine Antwortvorschau erkannt. Unter „Keine passende Vorschau?“ kannst du die fertige Antwort direkt im Chat auswählen.';
    for(const el of candidates){
      const card=document.createElement('div'),preview=document.createElement('p'),button=document.createElement('button');
      card.className='status';card.style.marginBottom='10px';preview.style.whiteSpace='pre-wrap';
      const text=adapter.text(el);preview.textContent=text?text.slice(0,600)+(text.length>600?' …':''):'[Bildantwort ohne Begleittext]';
      button.type='button';button.textContent='Diese Antwort übernehmen';button.onclick=guard(async()=>{$('status').textContent=await adoptElement(adapter,el);});
      card.append(preview,button);$('recoveryChoices').append(card);
    }
    $('answerRecovery').scrollIntoView({block:'nearest'});
  });
  $('cancelRecovery').onclick=()=>{$('answerRecovery').hidden=true;};
  $('pickAnswerPage').onclick=guard(async()=>{
    if(runner?.running || !run?.pending)return;
    const adapter=new ns.DOMAdapter(selectors);adapter.assertChatPage();
    if(adapter.one('stop'))throw Error('ChatGPT arbeitet noch. Bitte auf die fertige Antwort warten.');
    pickFromPage('Klicke direkt auf die fertige ChatGPT-Antwort – keine Eingabe nötig',target=>adapter.answerAt(target),el=>adoptElement(adapter,el));
  });
  $('check').onclick=guard(async()=>{
    const errors=ns.preflight(run?.flow||config(),files);
    if(errors.length)throw Error(errors.join('\n'));
    $('status').textContent='Alle vorgesehenen Quelldateien sind eindeutig vorhanden. Lesbarkeit und Uploadfähigkeit werden erst in ChatGPT geprüft.';
  });
  async function execute(singleStep){
    if(runner?.running)return;
    if(!run){
      const flow=config(),problems=ns.preflight(flow,files);
      if(problems.length)throw Error(problems.join('\n'));
      run=ns.newRun($('person').value,flow,location.href);
    }
    if(run.status==='fertig')throw Error('Dieser Lauf ist abgeschlossen. Für eine andere Person „Neuer Lauf“ wählen.');
    const adapter=new ns.DOMAdapter(selectors,{notify:text=>{$('status').textContent=text;}});
    runner=new ns.Runner(adapter,async value=>storage.set({latestRun:JSON.parse(JSON.stringify(value))}),paint);
    const execution=runner.execute(run,files,assets,{singleStep});paint();await execution;paint();
  }
  $('start').onclick=guard(()=>execute(false));$('next').onclick=guard(()=>execute(true));$('pause').onclick=()=>runner?.pause();
  function download(blob,name){
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;shadow.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
  $('export').onclick=guard(async()=>{
    if(!run)throw Error('Es gibt noch keinen Lauf zum Exportieren.');
    const entries=[{name:'lauf.json',blob:new Blob([JSON.stringify(run,null,2)],{type:'application/json'})}],missing=[];
    for(const result of run.results){
      const md=ns.outputFile(run,result);entries.push({name:md.name,blob:md});
      for(const name of result.assetNames||[]){const file=assets[`${result.step}/${name}`];if(file)entries.push({name:`Schritt_${ns.safeName(result.step)}/${ns.safeName(name)}`,blob:file});else missing.push(`Schritt ${result.step}: ${name}`);}
    }
    if(missing.length)entries.push({name:'FEHLENDE_DATEIEN.txt',blob:new Blob(['Diese Dateien sind nicht im ZIP enthalten. Bitte im Chat erneut herunterladen:\n'+missing.join('\n')])});
    download(await ns.zip(entries),`${ns.safeName(run.person)}_Proto_Disput.zip`);
    if(missing.length)$('error').textContent='Das ZIP enthält Textberichte und einen Hinweis auf fehlende Binärdateien. '+missing.join('; ');
  });
  $('new').onclick=guard(async()=>{
    if(run && !confirm('Einen neuen Lauf vorbereiten? Der lokale Fortschritt dieses Laufs wird ersetzt. Lade vorher die ZIP-Sicherung herunter. Der Chat bleibt unverändert.'))return;
    await storage.set({latestRun:null});run=null;assets={};$('status').textContent='Neuer Lauf. Öffne dafür einen neuen Chat und prüfe die Quelldateien.';paint();
  });
  $('assets').onchange=guard(async event=>{
    const id=$('assetStep').value;if(!run||!id)throw Error('Es gibt keinen Schritt für die Zuordnung.');
    const added=[...event.target.files];
    if(!added.length)return;
    if(!confirm(`${added.length} Datei(en) verbindlich Schritt ${id} zuordnen? Bei einem blockierten Download ersetzt dies die automatische Übernahme.`))return;
    const result=run.results.find(r=>r.step===id);
    for(const file of added){assets[`${id}/${file.name}`]=file;if(result)result.assetNames=[...new Set([...(result.assetNames||[]),file.name])];}
    if(result)result.manuallySupplied=true;
    await storage.set({latestRun:run});paint();
  });
  $('saveConfig').onclick=guard(async()=>{await storage.set({workflow:config()});$('status').textContent='Ablaufkonfiguration lokal gespeichert. Sie gilt für neue Läufe.';paint();});
  $('exportConfig').onclick=guard(async()=>download(new Blob([JSON.stringify(config(),null,2)],{type:'application/json'}),'proto-disput-ablauf.json'));
  $('importConfig').onchange=guard(async event=>{const f=event.target.files[0];if(f){const flow=ns.validateWorkflow(JSON.parse(await f.text()));$('workflow').value=JSON.stringify(flow,null,2);await storage.set({workflow:flow});paint();}});
  $('saveSelectors').onclick=guard(async()=>{
    const updated=JSON.parse($('selectors').value);
    for(const key of Object.keys(ns.defaultSelectors)){
      if(typeof updated[key]!=='string'||!updated[key].trim())throw Error(`Selektor fehlt: ${key}`);
      document.querySelector(updated[key]);
    }
    selectors=ns.migrateSelectors(updated);ns.selectedComposer=null;await storage.set({selectors});$('selectors').value=JSON.stringify(selectors,null,2);$('status').textContent='Oberflächenadapter lokal gespeichert.';
  });
  guard(async()=>{
    const saved=await storage.get();
    $('workflow').value=JSON.stringify(saved.workflow||ns.defaultWorkflow,null,2);
    selectors=ns.migrateSelectors(saved.selectors);$('selectors').value=JSON.stringify(selectors,null,2);
    if(saved.latestRun){run=saved.latestRun;run.status=run.status==='läuft'?'pausiert':run.status;run.error=run.error||'Gespeicherter Lauf geladen. Bitte dieselben Quelldateien erneut auswählen. Ein offener Schritt wird nicht erneut gesendet.';}
    paint();
  })();
})();
