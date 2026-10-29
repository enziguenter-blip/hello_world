(() => {
  const ns = globalThis.ProtoScanner = globalThis.ProtoScanner || {};
  const normalize = value => String(value).normalize('NFC');
  const safeName = value => normalize(value).replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_').replace(/[. ]+$/g,'').slice(0,100) || 'Ergebnis';
  function validateWorkflow(flow) {
    if (!flow || flow.version !== 1 || !Array.isArray(flow.steps) || !flow.steps.length) throw Error('Die Konfiguration benötigt version: 1 und mindestens einen Schritt.');
    const previous = new Set();
    for (const step of flow.steps) {
      if (!step.id || typeof step.id !== 'string' || previous.has(step.id)) throw Error('Jeder Schritt benötigt eine eindeutige Text-ID.');
      if (typeof step.title !== 'string' || typeof step.prompt !== 'string' || !step.prompt.trim()) throw Error(`Titel oder Prompt fehlt in Schritt ${step.id}.`);
      if (!Array.isArray(step.files) || step.files.some(f => typeof f !== 'string' || !f)) throw Error(`Ungültige Dateiliste in Schritt ${step.id}.`);
      if (!Array.isArray(step.reuse) || step.reuse.some(id => !previous.has(id))) throw Error(`Schritt ${step.id} darf nur frühere Ergebnisse referenzieren.`);
      if (step.requireAsset !== undefined && typeof step.requireAsset !== 'boolean') throw Error('requireAsset muss true oder false sein.');
      if(step.acknowledgement && (previous.size!==0 || step.acknowledgement.type!=='sources-readable' || !Number.isInteger(step.acknowledgement.fileCount) || step.acknowledgement.fileCount!==step.files.length || step.reuse.length))throw Error('Eine Quellenbestätigung ist nur im ersten Schritt mit passender Dateianzahl zulässig.');
      previous.add(step.id);
    }
    return flow;
  }
  function resolveFiles(names, selected) {
    return names.map(name => {
      const matches = selected.filter(f => normalize(f.webkitRelativePath || f.name) === normalize(name) || normalize(f.name) === normalize(name));
      if (matches.length !== 1) throw Error(matches.length ? `Dateiname ist mehrdeutig: ${name}. Verwende einen vollständigen relativen Pfad in der Konfiguration.` : `Datei fehlt: ${name}`);
      return matches[0];
    });
  }
  function preflight(flow, files) {
    validateWorkflow(flow);
    const errors=[];
    for (const step of flow.steps) {
      for (const name of step.files) {
        try { resolveFiles([name],files); } catch(e) { errors.push(`Schritt ${step.id}: ${e.message}`); }
      }
    }
    return errors;
  }
  const markerFor = (run, step) => `[Proto-Disput ${run.id} / Schritt ${step.id}]`;
  function acknowledgementFor(run,step){
    if(run.results.length || run.flow.steps[0]?.id!==step.id)return null;
    if(step.acknowledgement)return step.acknowledgement;
    // Preserve already saved workflows from 0.1.0–0.1.3 without rewriting them.
    const original=ns.defaultWorkflow.steps[0];
    if(step.title===original.title && step.prompt===original.prompt && step.files.length===6 && !step.reuse.length)return {type:'sources-readable',fileCount:6};
    return null;
  }
  function promptFor(run,step) {
    return `${step.prompt.replaceAll('{{person}}',run.person)}\n\n${markerFor(run,step)}`;
  }
  function newRun(person,flow,url) {
    if (!person.trim()) throw Error('Bitte eine Zielperson eintragen.');
    validateWorkflow(flow);
    return {version:1,id:crypto.randomUUID(),person:person.trim(),flow:structuredClone(flow),chatUrl:url,status:'bereit',results:[],pending:null,createdAt:new Date().toISOString()};
  }
  function outputFile(run,result) {
    return new File([`# ${result.title}\n\nPerson: ${run.person}\nSchritt: ${result.step}\n\n${result.text}\n`],`${safeName(run.person)}_Schritt_${safeName(result.step)}.md`,{type:'text/markdown'});
  }
  async function sha256(file) {
    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await file.arrayBuffer())), b=>b.toString(16).padStart(2,'0')).join('');
  }
  async function fileManifest(files) {
    return (await Promise.all(files.map(async f=>({name:f.webkitRelativePath || f.name,size:f.size,sha256:await sha256(f)})))).sort((a,b)=>a.name.localeCompare(b.name));
  }
  function conversationPath(url) {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  }
  function conversationLocation(url){
    const u=new URL(url),match=u.pathname.match(/^\/(?:g\/[^/]+\/)?c\/([^/]+)\/?$/);
    return {origin:u.origin,path:u.pathname,id:match?.[1]||null,kind:match?'conversation':/^\/$|^\/g\/[^/]+(?:\/project)?\/?$/.test(u.pathname)?'new-chat':'other'};
  }
  function sameConversation(from,to,allowCreation=false){
    const a=conversationLocation(from),b=conversationLocation(to);
    if(a.origin!==b.origin)return false;
    if(a.path===b.path)return true;
    if(a.id&&b.id)return a.id===b.id;
    // The first send creates /c/<id>. This can happen after the first answer.
    // Only a previously attempted/completed step permits this initial binding.
    return allowCreation && a.kind==='new-chat' && b.kind==='conversation';
  }
  function routeSummary(url){
    const u=new URL(url),route=conversationLocation(url),known=new Set(['c','g','project','projects','chat','chats','codex','auth','settings','u']);
    return {kind:route.kind,shape:'/'+u.pathname.split('/').filter(Boolean).map(part=>known.has(part)?part:'<segment>').join('/'),hasQuery:!!u.search,hasHash:!!u.hash};
  }
  function navigationFailure(from,to,phase){
    const a=conversationLocation(from),b=conversationLocation(to),error=new Error('Die Gesprächsadresse konnte während der Verarbeitung nicht zugeordnet werden. Der offene Prompt bleibt erhalten. Bitte „Oberfläche prüfen“ verwenden.');
    error.navigationFailure={phase,from:routeSummary(from),to:routeSummary(to),sameOrigin:a.origin===b.origin,sameConversationId:a.id&&b.id?a.id===b.id:null,observedAt:new Date().toISOString()};
    return error;
  }
  class Runner {
    constructor(adapter,save,onChange) { this.adapter=adapter; this.save=save; this.onChange=onChange; this.running=false; this.controller=null; }
    pause() { this.controller?.abort(); }
    async persist(run) { await this.save(run); this.onChange(run); }
    async recordResult(run,step,result,assets,signal,manual=false){
      const creating=run.pending&&!run.results.length&&conversationLocation(run.chatUrl).kind==='new-chat';
      const chat=creating?run.chatUrl:conversationPath(this.adapter.url());
      const supplied=Object.entries(assets).filter(([key])=>key.startsWith(`${step.id}/`)).map(([,file])=>file);
      const captured=await this.adapter.collectAssets(result.assetElement||result.element,signal);
      if(captured.errors.length && !supplied.length)throw Error('Ergebnisdatei nicht automatisch zugänglich: '+captured.errors.join('; ')+'. Die Datei kann manuell ergänzt werden.');
      if(step.requireAsset && !captured.files.length && !supplied.length)throw Error('Dieser Schritt erwartet eine Grafik oder Ergebnisdatei. Bitte die Datei prüfen und gegebenenfalls über „Ergebnisdateien ergänzen“ zuordnen.');
      const unique=[...new Map([...supplied,...captured.files].map(file=>[file.name,file])).values()];
      if(signal.aborted)throw new DOMException('Pausiert','AbortError');
      if(!sameConversation(chat,this.adapter.url(),!!run.pending||!!run.results.length))throw navigationFailure(chat,this.adapter.url(),'capture');
      for(const file of unique)assets[`${step.id}/${file.name}`]=file;
      run.results.push({step:step.id,title:step.title,text:result.text,assetNames:unique.map(f=>f.name),manuallySupplied:!!supplied.length,manuallyAdopted:manual,recognition:manual?'manual':result.recognition||'marker',assetWarnings:captured.errors,completedAt:new Date().toISOString()});
      run.pending=null;run.chatUrl=this.adapter.url();delete run.error;
    }
    async adoptAnswer(run,element,assets={}){
      if(this.running)throw Error('Bitte den Ablauf zuerst pausieren.');
      const step=run.flow.steps[run.results.length];
      if(!run.pending || !step || run.pending.step!==step.id)throw Error('Es gibt keinen passenden offenen Schritt. Es wurde nichts geändert.');
      const result=this.adapter.selectedAnswer(element),next=structuredClone(run);
      this.running=true;this.controller=new AbortController();this.onChange(run);
      try{
        // Explicitly selected and confirmed by the user. No send or user-marker wait.
        await this.recordResult(next,step,result,assets,this.controller.signal,true);
        next.status=next.results.length===next.flow.steps.length?'fertig':'pausiert';
        await this.save(next);
        for(const key of Object.keys(run))delete run[key];Object.assign(run,next);
        this.onChange(run);
      }finally{this.running=false;this.onChange(run);}
      return run;
    }
    async execute(run,selectedFiles,assets={},options={}) {
      if (this.running) throw Error('Der Ablauf läuft bereits.');
      const errors=preflight(run.flow,selectedFiles);
      if (errors.length) throw Error(errors.join('\n'));
      this.running=true;
      this.controller=new AbortController();
      const signal=this.controller.signal;
      try {
        const manifest=await fileManifest(selectedFiles);
        if (run.sourceManifest && JSON.stringify(run.sourceManifest)!==JSON.stringify(manifest)) throw Error('Die ausgewählten Quelldateien unterscheiden sich vom begonnenen Lauf (Inhalt, Reihenfolge oder Dateiname). Bitte dieselben Dateien wählen oder einen neuen Lauf anlegen.');
        run.sourceManifest=manifest;
        run.status='läuft'; delete run.error;
        await this.persist(run);
        this.adapter.bindRun?.(run);
        for (let i=run.results.length; i<run.flow.steps.length; i++) {
          const step=run.flow.steps[i];
          if (signal.aborted) throw new DOMException('Pausiert','AbortError');
          if(!sameConversation(run.chatUrl,this.adapter.url(),!!run.pending||!!run.results.length))throw navigationFailure(run.chatUrl,this.adapter.url(),'resume');
          const creating=run.pending&&!run.results.length&&conversationLocation(run.chatUrl).kind==='new-chat';
          if(!creating && conversationPath(run.chatUrl)!==conversationPath(this.adapter.url())){run.chatUrl=this.adapter.url();await this.persist(run);}
          let result;
          if (run.pending) {
            if (run.pending.step!==step.id) throw Error('Der offene Schritt stimmt nicht mit dem Fortschritt überein.');
            // Never resubmit an uncertain send after interruption/reload.
            result=await this.adapter.waitForReply(run.pending.marker,signal,{person:run.person,acknowledgement:acknowledgementFor(run,step),pending:run.pending,chatUrl:run.chatUrl,requireAsset:!!step.requireAsset,assetSupplied:Object.keys(assets).some(key=>key.startsWith(`${step.id}/`))});
          } else {
            const files=resolveFiles(step.files,selectedFiles);
            for (const id of step.reuse) {
              const previous=run.results.find(r=>r.step===id);
              if (!previous) throw Error(`Ergebnis aus Schritt ${id} fehlt.`);
              files.push(outputFile(run,previous));
              if (previous.assetNames?.length) {
                for (const name of previous.assetNames) {
                  const asset=assets[`${id}/${name}`];
                  if (!asset) throw Error(`Ergebnisdatei aus Schritt ${id} fehlt im Arbeitsspeicher: ${name}. Über „Ergebnisdateien ergänzen“ erneut auswählen.`);
                  files.push(new File([asset],`${safeName(run.person)}_Schritt_${safeName(id)}_${asset.name}`,{type:asset.type}));
                }
              }
            }
            await this.adapter.prepare(files,promptFor(run,step),signal);
            run.pending={step:step.id,marker:markerFor(run,step),preparedAt:new Date().toISOString(),beforeReply:this.adapter.snapshotConversation?.()||null};
            await this.persist(run);
            await this.adapter.send(signal);
            result=await this.adapter.waitForReply(run.pending.marker,signal,{person:run.person,acknowledgement:acknowledgementFor(run,step),pending:run.pending,chatUrl:run.chatUrl,requireAsset:!!step.requireAsset,assetSupplied:Object.keys(assets).some(key=>key.startsWith(`${step.id}/`))});
          }
          await this.recordResult(run,step,result,assets,signal);
          await this.persist(run);
          if(options.singleStep && run.results.length<run.flow.steps.length){run.status='pausiert';await this.persist(run);return run;}
        }
        run.status='fertig'; await this.persist(run);
      } catch(e) {
        run.status=signal.aborted?'pausiert':'angehalten'; run.error=e.message;
        if(e.navigationFailure)run.lastNavigationFailure=e.navigationFailure;
        try { await this.persist(run); } catch(storageError) { this.onChange({...run,error:`${e.message}\nLokale Sicherung fehlgeschlagen: ${storageError.message}`}); }
      } finally { this.running=false; this.onChange(run); }
      return run;
    }
  }
  // Minimal ZIP writer (STORE): no external library, network dependency or eval.
  async function zip(entries) {
    const enc=new TextEncoder(),parts=[],directory=[];
    let offset=0;
    const crc32=bytes=>{let c=0xffffffff; for(const byte of bytes){c^=byte;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;};
    const record=(size,values)=>{const bytes=new Uint8Array(size),v=new DataView(bytes.buffer);for(const [at,value,width]of values)width===2?v.setUint16(at,value,true):v.setUint32(at,value,true);return bytes;};
    for(const entry of entries){
      const name=enc.encode(entry.name),data=new Uint8Array(await entry.blob.arrayBuffer()),crc=crc32(data);
      if(data.length>0xffffffff || offset>0xffffffff)throw Error('ZIP-Datei zu groß.');
      const local=record(30,[[0,0x04034b50,4],[4,20,2],[6,0x800,2],[14,crc,4],[18,data.length,4],[22,data.length,4],[26,name.length,2]]);
      const central=record(46,[[0,0x02014b50,4],[4,20,2],[6,20,2],[8,0x800,2],[16,crc,4],[20,data.length,4],[24,data.length,4],[28,name.length,2],[42,offset,4]]);
      parts.push(local,name,data);directory.push(central,name);offset+=30+name.length+data.length;
    }
    const directorySize=directory.reduce((n,b)=>n+b.length,0);
    const end=record(22,[[0,0x06054b50,4],[8,entries.length,2],[10,entries.length,2],[12,directorySize,4],[16,offset,4]]);
    return new Blob([...parts,...directory,end],{type:'application/zip'});
  }
  Object.assign(ns,{safeName,validateWorkflow,resolveFiles,preflight,markerFor,promptFor,acknowledgementFor,newRun,outputFile,fileManifest,conversationPath,conversationLocation,sameConversation,routeSummary,navigationFailure,Runner,zip});
})();
