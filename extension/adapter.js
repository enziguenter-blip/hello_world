(() => {
  const ns=globalThis.ProtoScanner;
  const visible=el=>!!el && el.isConnected && el.getClientRects().length>0 && getComputedStyle(el).visibility!=='hidden' && getComputedStyle(el).display!=='none';
  const enabled=el=>visible(el) && !el.disabled && el.getAttribute('aria-disabled')!=='true';
  const delay=(ms,signal)=>new Promise((resolve,reject)=>{
    if(signal?.aborted)return reject(new DOMException('Pausiert','AbortError'));
    const done=()=>{signal?.removeEventListener('abort',abort);resolve();};
    const timer=setTimeout(done,ms);
    const abort=()=>{clearTimeout(timer);reject(new DOMException('Pausiert','AbortError'));};
    signal?.addEventListener('abort',abort,{once:true});
  });
  class DOMAdapter {
    constructor(selectors=ns.defaultSelectors,options={}) {
      this.selectors={...ns.defaultSelectors,...selectors};
      this.pollMs=options.pollMs??500;
      this.stableMs=options.stableMs??1800;
      this.uploadTimeout=options.uploadTimeout??180000;
      this.replyTimeout=options.replyTimeout??7200000;
      this.notify=options.notify||(()=>{});
    }
    url(){return location.href;}
    query(key,root=document){return [...root.querySelectorAll(this.selectors[key])];}
    one(key,root=document){return this.query(key,root).find(visible);}
    async until(check,timeout,description,signal){
      const end=Date.now()+timeout;
      while(Date.now()<end){
        if(signal.aborted)throw new DOMException('Pausiert','AbortError');
        const error=this.one('error');
        if(error)throw Error(`ChatGPT meldet einen Fehler: ${error.innerText.slice(0,500)}`);
        const value=check();if(value)return value;
        await delay(this.pollMs,signal);
      }
      throw Error(description);
    }
    scope(composer){
      // Restrict file-preview checks to the composer, never to prior messages.
      const form=composer.closest('form');
      if(form)return form;
      let parent=composer.parentElement;
      while(parent && parent!==document.body){
        if(parent.querySelector(this.selectors.send) && !parent.querySelector('[data-message-author-role]'))return parent;
        parent=parent.parentElement;
      }
      throw Error('Der Eingabebereich konnte nicht eindeutig erkannt werden. Die Oberfläche muss angepasst werden.');
    }
    composerText(el){return ('value' in el?el.value:el.innerText).trim();}
    setText(el,text){
      el.focus();
      if(el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement){
        Object.getOwnPropertyDescriptor(el instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(el,text);
        el.dispatchEvent(new Event('input',{bubbles:true}));
      }else if(el.isContentEditable){
        // Use browser editing to notify rich-text editors; do not replace their DOM.
        const selection=window.getSelection(),range=document.createRange();
        range.selectNodeContents(el);selection.removeAllRanges();selection.addRange(range);
        if(!document.execCommand('insertText',false,text))throw Error('Der Browser konnte den Prompt nicht in das Eingabefeld einfügen.');
        el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:text}));
      }else throw Error('Nicht unterstütztes Eingabefeld.');
    }
    attachmentText(scope){
      return [scope.innerText,...[...scope.querySelectorAll('[title], [aria-label]')].map(el=>`${el.getAttribute('title')||''} ${el.getAttribute('aria-label')||''}`)].join('\n').normalize('NFC');
    }
    async prepare(files,prompt,signal){
      if(this.one('stop'))throw Error('ChatGPT verarbeitet bereits eine Antwort. Bitte zuerst abwarten.');
      const composer=this.one('composer');
      if(!composer)throw Error('ChatGPT-Eingabefeld nicht gefunden. Öffne einen normalen Chat.');
      if(this.composerText(composer))throw Error('Im Chat-Eingabefeld liegt bereits Text. Bitte zuerst sichern und leeren.');
      const scope=this.scope(composer);
      if(scope.querySelector('[data-testid*="attachment"], [data-testid*="file-thumbnail"], button[aria-label*="Remove file"], button[aria-label*="Datei entfernen"]'))throw Error('Im Eingabefeld liegen bereits Anhänge. Bitte zuerst entfernen.');
      if(files.length){
        const candidates=[...document.querySelectorAll('input[type="file"]')].filter(el=>!el.accept || !/^(audio|video)\//.test(el.accept));
        const input=candidates.find(el=>scope.contains(el) && (el.multiple || files.length===1)) || candidates.find(el=>el.multiple || files.length===1);
        if(!input)throw Error('Kein passendes Datei-Uploadfeld gefunden. Öffne einmal das Anhang-Menü. Falls das nicht hilft, muss der Oberflächenadapter angepasst werden.');
        const names=files.map(f=>f.name.normalize('NFC'));
        if(new Set(names).size!==names.length)throw Error('Dieser Schritt würde Dateien mit identischen Namen hochladen. Bitte die Konfiguration oder Quellen eindeutig benennen.');
        const transfer=new DataTransfer();for(const file of files)transfer.items.add(file);
        input.files=transfer.files;
        input.dispatchEvent(new Event('change',{bubbles:true}));
        this.notify(`Upload: ${files.length} Dateien; warte auf sichtbare Anhänge …`);
        await this.until(()=>{
          const text=this.attachmentText(scope);
          return names.every(name=>text.includes(name));
        },this.uploadTimeout,'Nicht alle Dateinamen wurden als Anhänge erkannt. Es wurde kein Prompt gesendet. Prüfe Uploadlimits und die sichtbaren Anhänge.',signal);
      }
      this.setText(composer,prompt);
      let readySince=0;
      await this.until(()=>{
        const compact=value=>value.replace(/\s+/gu,' ').trim();
        const ready=enabled(this.one('send')) && !this.query('uploadBusy',scope).some(visible) && compact(this.composerText(composer))===compact(prompt);
        if(!ready){readySince=0;return false;}
        readySince=readySince||Date.now();return Date.now()-readySince>=this.stableMs;
      },this.uploadTimeout,'Der Upload oder das Eingabefeld wurde nicht sendebereit. Es wurde kein Prompt gesendet.',signal);
    }
    async send(signal){
      if(signal.aborted)throw new DOMException('Pausiert','AbortError');
      const button=this.one('send');
      if(!enabled(button) || this.one('stop'))throw Error('Die Senden-Schaltfläche ist nicht verfügbar. Nicht automatisch erneut senden.');
      button.click();
    }
    user(marker){return this.query('user').find(el=>el.innerText.includes(marker));}
    async waitForUser(marker,signal){
      return this.until(()=>this.user(marker),60000,'Die gesendete Nachricht wurde nicht im Chat erkannt. Der offene Schritt wird aus Sicherheitsgründen nicht erneut gesendet.',signal);
    }
    turn(el){return el.closest('article, [data-testid^="conversation-turn-"]')||el.parentElement;}
    text(el){
      const blocks=[...el.querySelectorAll('.markdown')];
      return (blocks.length?blocks.map(b=>b.innerText).join('\n\n'):el.innerText).trim();
    }
    async waitForReply(marker,signal){
      const user=await this.waitForUser(marker,signal);
      const chat=ns.conversationPath(location.href);
      let previous='',stableSince=0;
      this.notify('Warte auf die vollständige Antwort von ChatGPT …');
      return this.until(()=>{
        if(ns.conversationPath(location.href)!==chat)throw Error('Während der Verarbeitung wurde der Chat gewechselt.');
        const following=el=>!!(user.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING);
        if(this.query('user').some(el=>el!==user && following(el)))throw Error('Nach dem automatischen Prompt wurde eine weitere Nachricht gesendet. Bitte den Verlauf prüfen; die Erweiterung setzt nicht automatisch fort.');
        const reply=this.query('assistant').filter(following).at(-1);
        if(!reply || this.one('stop')){stableSince=0;return false;}
        const turn=this.turn(reply);
        const busy=this.query('responseBusy',turn).some(visible);
        const images=[...reply.querySelectorAll('img')].filter(visible);
        if(busy || images.some(img=>!img.complete || !img.naturalWidth) || !this.query('completion',turn).length){stableSince=0;return false;}
        const text=this.text(reply);
        const signature=text+'\n'+images.map(img=>img.currentSrc||img.src).join('\n');
        if(!text && !images.length)return false;
        if(signature!==previous){previous=signature;stableSince=Date.now();return false;}
        return Date.now()-stableSince>=this.stableMs ? {element:reply,text:text||'[Bildantwort ohne Begleittext]'} : false;
      },this.replyTimeout,'Die Antwort wurde nicht als vollständig erkannt. Der Lauf bleibt beim offenen Schritt. Prüfe den Chat und gegebenenfalls die Abschluss-Selektoren.',signal);
    }
    async collectAssets(reply,signal){
      const files=[],errors=[],seen=new Set();
      const nodes=[...reply.querySelectorAll('a[href]')].filter(a=>{
        const href=a.getAttribute('href');
        return a.hasAttribute('download') || /^sandbox:/i.test(href) || /\.(pdf|docx?|xlsx?|pptx?|zip|md|txt|csv|png|jpe?g|webp|svg)(?:[?#]|$)/i.test(href) || /\/files\/|estuary\/content/.test(href);
      }).map(a=>({url:a.getAttribute('href'),name:a.getAttribute('download')||a.textContent.trim(),image:false}));
      for(const img of reply.querySelectorAll('img')){
        if(visible(img) && img.naturalWidth>=128 && img.naturalHeight>=128)nodes.push({url:img.currentSrc||img.src,name:'',image:true});
      }
      for(const item of nodes){
        if(signal.aborted)throw new DOMException('Pausiert','AbortError');
        if(seen.has(item.url))continue;seen.add(item.url);
        try {
          const url=new URL(item.url,location.href);
          if(!['http:','https:','blob:','data:'].includes(url.protocol))throw Error('Der sichtbare Downloadlink ist kein direkt lesbarer Dateilink');
          // Only fetch URLs displayed in this response. No private endpoint discovery,
          // token extraction, or cross-origin credentials.
          const controller=new AbortController();
          const forward=()=>controller.abort();signal.addEventListener('abort',forward,{once:true});
          const timer=setTimeout(()=>controller.abort(),60000);
          let response,blob;
          try {
            response=await fetch(url.href,{credentials:url.origin===location.origin?'same-origin':'omit',signal:controller.signal,redirect:'error'});
            if(!response.ok)throw Error(`HTTP ${response.status}`);
            blob=await response.blob();
          }
          finally{clearTimeout(timer);signal.removeEventListener('abort',forward);}
          if(!blob.size || /text\/html/.test(blob.type))throw Error('Keine verwertbare Ergebnisdatei erhalten');
          if(item.image && !blob.type.startsWith('image/'))throw Error('Die sichtbare Bildquelle lieferte kein Bild');
          const ext=({'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/svg+xml':'svg','application/pdf':'pdf','text/markdown':'md','text/plain':'txt','application/zip':'zip'})[blob.type.split(';')[0]]||'bin';
          const name=item.name && /\.[a-z0-9]{2,5}$/i.test(item.name)?ns.safeName(item.name):`Ergebnis_${files.length+1}.${ext}`;
          files.push(new File([blob],name,{type:blob.type}));
        }catch(e){if(signal.aborted)throw e;errors.push(`${item.name||'Grafik'}: ${e.message}`);}
      }
      return {files,errors};
    }
  }
  ns.DOMAdapter=DOMAdapter;
})();
