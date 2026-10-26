(() => {
  const ns=globalThis.ProtoScanner;
  const historySelector=ns.defaultSelectors.user+', '+ns.defaultSelectors.assistant;
  const visible=el=>!!el && el.isConnected && el.getClientRects().length>0 && getComputedStyle(el).visibility!=='hidden' && getComputedStyle(el).display!=='none';
  const enabled=el=>visible(el) && !el.disabled && el.getAttribute('aria-disabled')!=='true';
  const editable=el=>enabled(el) && !el.readOnly && (el instanceof HTMLTextAreaElement || el.isContentEditable) && !el.closest(historySelector+', [role="dialog"], dialog, [role="search"], [inert]');
  const expand=el=>[el,...el.querySelectorAll('textarea, [contenteditable="true"], [contenteditable="plaintext-only"]')].filter(editable);
  ns.isBareAcknowledgement=text=>/^ok[.!]?$/iu.test(String(text).normalize('NFKC').trim());
  ns.matchesSourcesAcknowledgement=(text,person,count)=>{
    const value=String(text).normalize('NFKC').toLocaleLowerCase('de').replace(/\s+/gu,' ').trim();
    const target=String(person||'').normalize('NFKC').toLocaleLowerCase('de').replace(/\s+/gu,' ').trim();
    if(!target || !/^ok[\s.!,:;]/u.test(value) || /\b(?:nicht|unvollständig|teilweise|fehlt|fehlen|unlesbar)\b/u.test(value))return false;
    const words={1:'eine',2:'zwei',3:'drei',4:'vier',5:'fünf',6:'sechs',7:'sieben',8:'acht',9:'neun',10:'zehn'};
    if(!new RegExp(`\\balle (?:${count}|${words[count]||count}) (?:(?:bereitgestellten|hochgeladenen) )?dateien\\b`,'u').test(value))return false;
    if(!value.includes('vollständig') || !value.includes('zugänglich') || !value.includes('lesbar'))return false;
    const escaped=target.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return new RegExp(`\\bzielperson(?: für (?:den|diesen) (?:folgenden )?ablauf)?\\s*(?::|ist|=|-)?\\s*${escaped}(?![\\p{L}\\p{N}])`,'u').test(value);
  };
  ns.composerSelector = el => {
    if(!editable(el))throw Error('Bitte das beschreibbare Chat-Eingabefeld auswählen.');
    const kind=el instanceof HTMLTextAreaElement?'textarea':el.tagName.toLowerCase()+'[contenteditable]';
    const choices=[];
    if(el.id)choices.push(kind+'#'+CSS.escape(el.id));
    if(el.dataset.testid)choices.push(kind+'[data-testid="'+CSS.escape(el.dataset.testid)+'"]');
    if(el.classList.contains('ProseMirror'))choices.push('.ProseMirror[contenteditable="true"]');
    const unique=selector=>{
      const matches=[...document.querySelectorAll(selector)].filter(editable);
      return matches.length===1 && matches[0]===el;
    };
    for(const selector of choices)if(unique(selector))return selector;
    // Positional fallback records structure only, never placeholder/message text.
    const parts=[];
    for(let node=el;node&&node!==document.documentElement;node=node.parentElement){
      const index=[...node.parentElement.children].filter(other=>other.tagName===node.tagName).indexOf(node)+1;
      parts.unshift(node.tagName.toLowerCase()+`:nth-of-type(${index})`);
    }
    const selector='html > '+parts.join(' > ');
    if(!unique(selector))throw Error('Das Feld lässt sich nicht eindeutig zuordnen. Bitte einen normalen Chat im Hauptfenster verwenden.');
    return selector;
  };
  const delay=(ms,signal)=>new Promise((resolve,reject)=>{
    if(signal?.aborted)return reject(new DOMException('Pausiert','AbortError'));
    const done=()=>{signal?.removeEventListener('abort',abort);resolve();};
    const timer=setTimeout(done,ms);
    const abort=()=>{clearTimeout(timer);reject(new DOMException('Pausiert','AbortError'));};
    signal?.addEventListener('abort',abort,{once:true});
  });
  class DOMAdapter {
    constructor(selectors=ns.defaultSelectors,options={}) {
      this.selectors=ns.migrateSelectors(selectors);
      this.pollMs=options.pollMs??500;
      this.stableMs=options.stableMs??1800;
      this.uploadTimeout=options.uploadTimeout??180000;
      this.replyTimeout=options.replyTimeout??7200000;
      this.composerTimeout=options.composerTimeout??12000;
      this.userTimeout=options.userTimeout??60000;
      this.markerNodes=new Map();this.genericReplyRoots=new WeakSet();this.genericActionRoots=new WeakMap();
      this.notify=options.notify||(()=>{});
    }
    url(){return location.href;}
    query(key,root=document){return [...root.querySelectorAll(this.selectors[key])];}
    one(key,root=document){return this.query(key,root).find(visible);}
    assertChatPage(){
      if(/^\/(codex|auth|settings)(\/|$)/.test(location.pathname))throw Error('Diese Seite ist kein ChatGPT-Gespräch. Öffne einen Chat auf chatgpt.com und starte die Erweiterung dort.');
      if([...document.querySelectorAll('[role="dialog"][aria-modal="true"], dialog[open]')].some(visible))throw Error('Bitte zuerst den geöffneten Dialog in ChatGPT schließen.');
    }
    findComposer(){
      if(editable(ns.selectedComposer))return ns.selectedComposer;
      const select=selector=>[...new Set([...document.querySelectorAll(selector)].flatMap(expand))];
      const choose=candidates=>{
        if(candidates.length>1)throw Error('Mehrere mögliche Eingabefelder gefunden. Bitte „Chat-Eingabefeld auswählen“ anklicken und das richtige Feld markieren.');
        return candidates[0]||null;
      };
      if(this.selectors.composer!==ns.defaultSelectors.composer){
        const custom=select(this.selectors.composer);
        if(custom.length)return choose(custom);
      }
      const candidates=select(ns.defaultSelectors.composer);
      const known=candidates.filter(el=>el.id==='prompt-textarea' || el.dataset.testid==='composer-text-input' || el.closest('#prompt-textarea, [data-testid="composer"], [data-testid="composer-container"], #composer-background'));
      return choose(known.length?known:candidates);
    }
    diagnose(marker=null,savedUrl=null,lastNavigationFailure=null){
      const pageType=/^\/codex(\/|$)/.test(location.pathname)?'Codex':/^\/g\//.test(location.pathname)?'GPT/Projekt':'Chat/sonstige Seite';
      let selected=null,problem=null;
      const describe=el=>({tag:el.tagName.toLowerCase(),id:el.id||null,testId:el.dataset.testid||null,role:el.getAttribute('role'),editable:!!el.isContentEditable,visible:visible(el),disabled:!!el.disabled});
      try{this.assertChatPage();const el=this.findComposer();if(el)selected=describe(el);}catch(e){problem=e.message;}
      const actions=this.completionActions(document);
      return {version:ns.version,pageType,selected,problem,candidates:[...document.querySelectorAll('textarea, [contenteditable="true"], [contenteditable="plaintext-only"]')].slice(0,25).map(describe),sendButtons:this.query('send').map(describe),messages:{users:this.messages('user').length,assistants:this.messages('assistant').length,recognizedReplies:this.answerCandidates().length,completionActions:actions.length,visibleCompletionActions:actions.filter(visible).length,openPromptRecognized:marker?!!this.user(marker):null,activeGeneration:!!this.one('stop'),conversationTurns:document.querySelectorAll('[data-testid^="conversation-turn-"]').length},routing:{current:ns.routeSummary(location.href),saved:savedUrl?ns.routeSummary(savedUrl):null,sameConversation:savedUrl?ns.sameConversation(savedUrl,location.href,true):null,lastRejectedTransition:lastNavigationFailure}};
    }
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
      const known=composer.closest('[data-testid="composer"], [data-testid="composer-container"], [data-type="unified-composer"], #composer-background, #chat-composer');
      if(known && !known.querySelector(historySelector))return known;
      let parent=composer.parentElement;
      while(parent && parent!==document.body){
        if(parent.querySelector(this.selectors.send+', input[type="file"]') && !parent.querySelector(historySelector))return parent;
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
      this.prepared=null;
      this.assertChatPage();
      const chat=ns.conversationPath(location.href);
      const assertSameChat=()=>{if(ns.conversationPath(location.href)!==chat)throw Error('Während der Vorbereitung wurde der Chat gewechselt. Es wurde nichts gesendet.');};
      if(this.one('stop'))throw Error('ChatGPT verarbeitet bereits eine Antwort. Bitte zuerst abwarten.');
      this.notify('Suche das ChatGPT-Eingabefeld …');
      let composer=await this.until(()=>{assertSameChat();return this.findComposer();},this.composerTimeout,'ChatGPT-Eingabefeld nicht erkannt. Klicke im Scanner auf „Chat-Eingabefeld auswählen“ und dann in das Nachrichtenfeld. Mit „Oberfläche prüfen“ lässt sich die Erkennung ohne Senden testen.',signal);
      if(this.composerText(composer))throw Error('Im Chat-Eingabefeld liegt bereits Text. Bitte zuerst sichern und leeren.');
      let scope=this.scope(composer);
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
          assertSameChat();
          const current=this.findComposer();if(!current)return false;
          const text=this.attachmentText(this.scope(current));
          return names.every(name=>text.includes(name));
        },this.uploadTimeout,'Nicht alle Dateinamen wurden als Anhänge erkannt. Es wurde kein Prompt gesendet. Prüfe Uploadlimits und die sichtbaren Anhänge.',signal);
      }
      assertSameChat();
      composer=this.findComposer();
      if(!composer)throw Error('Das Nachrichtenfeld wurde während des Uploads ausgeblendet. Bitte die ChatGPT-Seite prüfen.');
      if(this.composerText(composer))throw Error('Während des Uploads wurde Text in das Eingabefeld geschrieben. Es wurde nichts gesendet. Bitte prüfen und leeren.');
      this.setText(composer,prompt);
      let readySince=0;
      await this.until(()=>{
        assertSameChat();
        composer=this.findComposer();if(!composer){readySince=0;return false;}
        scope=this.scope(composer);
        const compact=value=>value.replace(/\s+/gu,' ').trim();
        const ready=enabled(this.one('send',scope)) && !this.query('uploadBusy',scope).some(visible) && compact(this.composerText(composer))===compact(prompt);
        if(!ready){readySince=0;return false;}
        readySince=readySince||Date.now();return Date.now()-readySince>=this.stableMs;
      },this.uploadTimeout,'Der Upload oder das Eingabefeld wurde nicht sendebereit. Es wurde kein Prompt gesendet.',signal);
      this.prepared={prompt,url:chat};
    }
    async send(signal){
      if(signal.aborted)throw new DOMException('Pausiert','AbortError');
      this.assertChatPage();
      const composer=this.findComposer();
      const compact=value=>value.replace(/\s+/gu,' ').trim();
      if(!this.prepared || this.prepared.url!==ns.conversationPath(location.href) || !composer || compact(this.composerText(composer))!==compact(this.prepared.prompt))throw Error('Chat oder vorbereiteter Prompt wurde verändert. Es wurde nichts gesendet.');
      const button=this.one('send',this.scope(composer));
      if(!enabled(button) || this.one('stop'))throw Error('Die Senden-Schaltfläche ist nicht verfügbar. Nicht automatisch erneut senden.');
      this.prepared=null;
      button.click();
    }
    messages(role){
      // A turn may contain a more specific message node. Do not count both.
      const nodes=[...new Set([...this.query(role),...document.querySelectorAll(ns.defaultSelectors[role])])];
      return nodes.filter(node=>!nodes.some(other=>other!==node && node.contains(other)));
    }
    bodyText(el){
      const clone=el.cloneNode(true);
      clone.querySelectorAll('button, [role="button"], [role="toolbar"], input, textarea, [contenteditable="true"], [contenteditable="plaintext-only"], script, style, svg, [hidden], [aria-hidden="true"], .sr-only').forEach(node=>node.remove());
      clone.querySelectorAll('br').forEach(node=>node.replaceWith(document.createTextNode('\n')));
      clone.querySelectorAll('p,div,pre,li,tr,section,h1,h2,h3,h4,blockquote').forEach(node=>node.append(document.createTextNode('\n')));
      return (clone.textContent||'').trim();
    }
    completionActions(root){
      return [...new Set([...this.query('completion',root),...root.querySelectorAll(ns.defaultSelectors.completion)])].filter(el=>!el.closest('pre, code, form, [contenteditable="true"], [contenteditable="plaintext-only"], #proto-disput-extension'));
    }
    genericReplies(){
      const found=[];
      // Response actions can be hidden until hover. Their message body must
      // still be rendered; active generation is checked separately below.
      for(const action of this.completionActions(document)){
        if(action.closest('nav, aside, header, dialog, [role="dialog"]'))continue;
        const cached=this.genericActionRoots.get(action);
        if(cached?.isConnected&&cached.contains(action)&&!cached.querySelector('textarea,[contenteditable="true"],[contenteditable="plaintext-only"]')){found.push(cached);continue;}
        let parent=action.parentElement;
        for(let depth=0;parent&&depth<12;depth++,parent=parent.parentElement){
          if(parent.matches('body,main,[role="main"],html') || parent.querySelector('textarea, [contenteditable="true"], [contenteditable="plaintext-only"]'))break;
          const text=this.bodyText(parent);
          if(!text)continue;
          // Ignore the user's own copied prompt and choose the smallest text
          // container associated with a response action, never the whole page.
          if(/proto.disput[\s\S]{0,8}[0-9a-f]{8}-[0-9a-f-]{27}/iu.test(text))break;
          if(parent.querySelector('p,pre,blockquote,[data-lexical-text],.markdown') || text.length>40 || ns.isBareAcknowledgement(text)){found.push(parent);this.genericReplyRoots.add(parent);this.genericActionRoots.set(action,parent);break;}
        }
      }
      return [...new Set(found)];
    }
    messageStamp(el){
      const source=el.closest('[data-message-id]')||el.querySelector('[data-message-id]');
      const id=source?.getAttribute('data-message-id')||el.closest('[data-testid^="conversation-turn-"]')?.getAttribute('data-testid')||null;
      const text=this.text(el);let hash=2166136261;
      for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619);
      return {id,fingerprint:`${text.length}:${(hash>>>0).toString(16)}`};
    }
    snapshotConversation(){return {assistants:this.answerCandidates().map(el=>this.messageStamp(el)),users:this.messages('user').length};}
    acknowledgementAnswer(context){
      if(context?.acknowledgement?.type!=='sources-readable')return null;
      const candidates=this.answerCandidates();
      const isProtocolReply=el=>ns.isBareAcknowledgement(this.text(el))||ns.matchesSourcesAcknowledgement(this.text(el),context.person,context.acknowledgement.fileCount);
      const protocolMatches=candidates.filter(isProtocolReply);
      const matching=candidates.filter(el=>{
        if(!isProtocolReply(el))return false;
        const before=context.pending?.beforeReply;
        if(before?.assistants){
          const current=this.messageStamp(el);
          return !before.assistants.some(old=>current.id&&old.id?current.id===old.id:current.fingerprint===old.fingerprint);
        }
        // Old pending runs have no baseline. Only an unambiguous first exchange
        // with this exact acknowledgement is eligible for automatic recovery.
        return protocolMatches.length===1 && this.messages('user').length<=1 && candidates.at(-1)===el && (!ns.isBareAcknowledgement(this.text(el))||candidates.length===1);
      });
      return matching.length===1?matching[0]:null;
    }
    user(marker){
      // Rich-text rendering may split lines, hide a suffix or change punctuation.
      // UUID and step remain mandatory; no positional/last-message guessing.
      const compact=value=>String(value||'').normalize('NFKC').replace(/[\u00ad\u200b-\u200d\ufeff]/gu,'').replace(/[^\p{L}\p{N}\]]/gu,'').toLowerCase();
      const expected=compact(marker);
      if(!expected)return null;
      const matches=el=>{
        const content=compact(el.textContent);
        return content.includes(expected) || (expected.endsWith(']') && content.endsWith(expected.slice(0,-1)));
      };
      const known=this.messages('user').find(matches);if(known)return known;
      const cached=this.markerNodes.get(marker);if(cached?.isConnected&&matches(cached))return cached;
      const fragment=marker.match(/[0-9a-f]{8}-[0-9a-f-]{27}/iu)?.[0]?.slice(0,8);
      if(!fragment)return null;
      const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
      for(let node=walker.nextNode();node;node=walker.nextNode()){
        if(!node.textContent.toLowerCase().includes(fragment.toLowerCase()))continue;
        if(node.parentElement?.closest('script,style,template,noscript,textarea,[contenteditable="true"],[contenteditable="plaintext-only"],#proto-disput-extension'))continue;
        let parent=node.parentElement;
        for(let depth=0;parent&&depth<10;depth++,parent=parent.parentElement){
          if(parent.matches('body,main,html,[role="main"]') || parent.querySelector('textarea,[contenteditable="true"],[contenteditable="plaintext-only"]'))break;
          if(matches(parent)){this.markerNodes.set(marker,parent);return parent;}
        }
      }
      return null;
    }
    turn(el){return this.genericReplyRoots.has(el)?el:el.closest('article, [data-testid^="conversation-turn-"]')||el.parentElement;}
    text(el){
      const blocks=[...el.querySelectorAll('.markdown')];
      return (blocks.length?blocks.map(b=>b.innerText).join('\n\n'):this.bodyText(el)).trim();
    }
    async waitForReply(marker,signal,context=null){
      const chat=context?.chatUrl||ns.conversationPath(location.href);
      let previous='',stableSince=0,idleSince=Date.now();
      this.notify('Warte auf die vollständige Antwort von ChatGPT …');
      return this.until(()=>{
        if(!ns.sameConversation(chat,location.href,true))throw ns.navigationFailure(chat,location.href,'reply');
        const user=this.user(marker);
        let reply=null,recognition='marker';
        if(user){
          const following=el=>!!(user.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING);
          if(this.messages('user').some(el=>el!==user && following(el)))throw Error('Nach dem automatischen Prompt wurde eine weitere Nachricht gesendet. Bitte den Verlauf prüfen; die Erweiterung setzt nicht automatisch fort.');
          reply=this.answerCandidates().filter(following).at(-1);
        }
        if(!reply){reply=this.acknowledgementAnswer(context);if(reply)recognition='sources-acknowledgement';}
        if(!user && !reply && !context?.acknowledgement){
          if(this.one('stop'))idleSince=Date.now();
          else if(Date.now()-idleSince>=this.userTimeout)throw Error('Die Antwort konnte dem offenen Prompt nicht zugeordnet werden. Bitte „Oberfläche prüfen“ verwenden. Der Prompt wird nicht erneut gesendet.');
        }
        if(!reply || this.one('stop')){stableSince=0;return false;}
        const turn=this.turn(reply);
        const busy=this.query('responseBusy',turn).some(visible);
        const images=[...reply.querySelectorAll('img')].filter(visible);
        if(busy || images.some(img=>!img.complete || !img.naturalWidth) || !this.completionActions(turn).length){stableSince=0;return false;}
        const text=this.text(reply);
        const signature=text+'\n'+images.map(img=>img.currentSrc||img.src).join('\n');
        if(!text && !images.length)return false;
        if(signature!==previous){previous=signature;stableSince=Date.now();return false;}
        return Date.now()-stableSince>=this.stableMs ? {element:reply,text:text||'[Bildantwort ohne Begleittext]',recognition} : false;
      },this.replyTimeout,'Die Antwort wurde nicht als vollständig erkannt. Der Lauf bleibt beim offenen Schritt. Prüfe den Chat und gegebenenfalls die Abschluss-Selektoren.',signal);
    }
    answerAt(target){
      if(!(target instanceof Element) || target.closest('form, [contenteditable="true"], [contenteditable="plaintext-only"], textarea, #proto-disput-extension'))return null;
      if(this.messages('user').some(el=>el===target || el.contains(target)))return null;
      const specific=this.messages('assistant').find(el=>el===target || el.contains(target));
      if(specific)return specific;
      const article=target.closest('article[data-testid^="conversation-turn-"], article[data-turn="assistant"]');
      if(article && !article.querySelector('[data-turn="user"], [data-message-author-role="user"]'))return article;
      return null;
    }
    answerCandidates(){
      const known=this.messages('assistant');
      const fallback=[...document.querySelectorAll('article[data-testid^="conversation-turn-"]')].filter(el=>el.querySelector('.markdown') && this.answerAt(el)===el);
      const nodes=[...new Set([...known,...fallback,...this.genericReplies()])];
      const rendered=nodes.filter(el=>visible(el)||[...el.children].some(visible));
      return rendered.filter(el=>!rendered.some(other=>other!==el && el.contains(other))).sort((a,b)=>a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1);
    }
    selectedAnswer(element){
      this.assertChatPage();
      if(this.one('stop'))throw Error('ChatGPT arbeitet noch. Bitte die fertige Antwort abwarten und danach erneut auswählen.');
      if(!element?.isConnected || this.answerAt(element)!==element)throw Error('Die ausgewählte Antwort ist nicht eindeutig verfügbar. Bitte direkt den fertigen Antworttext anklicken.');
      const text=this.text(element);
      if(!text && !element.querySelector('img'))throw Error('Die ausgewählte Antwort ist leer.');
      return {element,text:text||'[Bildantwort ohne Begleittext]'};
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
