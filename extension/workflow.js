/* No remote scripts, API calls or account credentials. */
(() => {
  const ns = globalThis.ProtoScanner = globalThis.ProtoScanner || {};
  ns.version = '0.1.13';
  const read = 'Lies die beigefügten Unterlagen vollständig. Wenn eine Datei nicht lesbar oder nicht vollständig verfügbar ist, benenne das ausdrücklich. Behaupte keine ungeprüfte Vollständigkeit. ';
  ns.defaultWorkflow = {
    version: 1,
    title: 'Proto-Disput · 11 Schritte',
    steps: [
      {id:'1', title:'Grundlagen einlesen', files:[
        'zoom_29_sep_26 (3)(7)(3).md', 'zoom_29_9_global(1)(2).md', 'zoom_29_9_scanner(1)(2).md',
        'gruppe_PROTO_DISPUT_SCANNER_GRUPPEN_MASTER_PROMPT_V1.5.4_FINAL(20261015-130612).md',
        'manual_PROTO_DISPUT_SCANNER_CODIER_KALIBRIERUNGSMANUAL_V1.5.4_FINAL(20261015-130615).md',
        'sonamatische_kommunikation_v1.1.pdf'
      ], reuse:[], acknowledgement:{type:'sources-readable',fileCount:6}, prompt:read+'Bestätige anschließend mit OK, sofern alle sechs Dateien vollständig lesbar waren. Die Zielperson für den folgenden Ablauf ist {{person}}.'},
      {id:'2', title:'Individuelles Dojo', files:[
        '01_Kanonische_Dojo_Paedagogik_V1.5.4_Prinzipien_operationalisiert(3).md',
        '02_Individuelles_Dojo_V1.5.4_Prinzipien_operationalisiert(3).md'
      ], reuse:[], prompt:read+'Erstelle anhand der Grundlagen dieses Chats das individuelle Dojo für {{person}}.'},
      {id:'3', title:'Individualbericht', files:[
        'Sonamatischer_Scanner_INDIVIDUALBERICHT_Prompt_V1.5.4_FINAL(20261015-130601).md'
      ], reuse:['2'], prompt:read+'Erstelle den Individualbericht für {{person}}. Nutze die Quellen und bisherigen Ergebnisse dieses Chats.'},
      {id:'4', title:'Synopsis · 5.000 Zeichen', files:['individuell_5000_zeichen_synopsis_gruppe(5).md'], reuse:['2','3'],
        prompt:read+'Erstelle nach der Vorlage die individuelle Synopsis mit 5.000 Zeichen für {{person}}.'},
      {id:'5', title:'Individuelle Infografik', files:['individuell_infographik_gruppe(1).md','manuel.png'], reuse:['2','3','4'], requireAsset:true,
        prompt:read+'Erstelle die individuelle Infografik für {{person}}. Die beigefügte Beispielgrafik dient ausschließlich als gestalterische Inspiration, nicht als Quelle über die Zielperson.'},
      {id:'6', title:'Fachliches Dojo-Dossier', files:['03_Kanonisches_Fachdossier_V1.5.4_NACHGESCHAERFT(2).md'], reuse:['2','3','4'],
        prompt:read+'Erstelle das fachliche Dojo-Dossier für {{person}}.'},
      {id:'7', title:'Dojo-Rezeptkarte · Infografik', files:['04_Visuelles_Dossier_V1.5.4_NACHGESCHAERFT(1).md'], reuse:['6'], requireAsset:true,
        prompt:read+'Erstelle die Infografik der Dojo-Rezeptkarte für {{person}}. Die frühere Beispielgrafik dient ausschließlich als gestalterische Inspiration.'},
      {id:'8', title:'Persönlicher Abschlussbericht', files:[
        'Marlies_Finale_Zusammenfassung_MIT_6_ZONEN_2026-10-14(1).md',
        'Synopsis_Personenbezogene_Sonamatische_Abschlusszusammenfassung_V1.5.4(1).md'
      ], reuse:['2','3','4','5','6','7'],
        prompt:read+'Erstelle nach der Synopsis den persönlichen Abschlussbericht für {{person}}. Verwende alle relevanten Quellen dieses Chats. Der Beispielbericht von Marlies dient ausschließlich als Inspiration, nicht als Quelle über {{person}}.'},
      {id:'9', title:'Podcast-Dossier', files:[], reuse:['8'],
        prompt:'Erstelle auf Grundlage des persönlichen Abschlussberichts und der relevanten Quellen dieses Chats das Podcast-Dossier für {{person}}. Für diesen Schritt ist in der ursprünglichen Prozessbeschreibung keine eigene Vorlagendatei angegeben.'},
      {id:'10', title:'Podcast-Rezeptkarte', files:['meta_prompt_1_v3(20261019-175849).md'], reuse:['9'],
        prompt:read+'Erstelle mit dem Podcast-Dossier die Podcast-Rezeptkarte für {{person}}.'},
      {id:'11', title:'Podcast-Prompt', files:['meta_prompt_3_v3(20261019-202645).md'], reuse:['9','10'],
        prompt:read+'Erstelle anhand der bisherigen Ergebnisse den Podcast-Prompt für {{person}}.'}
    ]
  };
  ns.defaultSelectors = {
    composer:[
      '#prompt-textarea', '[data-testid="composer-text-input"]', '.ProseMirror[contenteditable="true"]',
      '[data-lexical-editor="true"][contenteditable="true"]', '[role="textbox"][contenteditable="true"]',
      '[role="textbox"][contenteditable="plaintext-only"]', '[data-testid="composer"] [contenteditable="true"]',
      '[data-type="unified-composer"] [contenteditable="true"]', '#composer-background [contenteditable="true"]',
      'form textarea:not([readonly]):not([disabled])'
    ].join(', '),
    send:'[data-testid="send-button"], button[aria-label="Send prompt"], button[aria-label="Send message"], button[aria-label="Nachricht senden"], button[aria-label="Prompt senden"], button[aria-label="Senden"]',
    stop:'[data-testid="stop-button"], button[aria-label="Stop streaming"], button[aria-label="Stop generating"], button[aria-label="Stop"], button[aria-label="Antwort stoppen"], button[aria-label="Generierung stoppen"], button[aria-label="Generierung abbrechen"]',
    assistant:'[data-message-author-role="assistant"], [data-turn="assistant"], [data-testid="assistant-message"], [data-testid="assistant-turn"]',
    user:'[data-message-author-role="user"], [data-turn="user"], [data-testid="user-message"], [data-testid="user-turn"]',
    uploadBusy:'[role="progressbar"], progress, [aria-busy="true"], [data-state="uploading"]',
    responseBusy:'[role="progressbar"], progress, [aria-busy="true"], [data-state="loading"]',
    completion:'button[data-testid="copy-turn-action-button"], button[data-testid="good-response-turn-action-button"], button[data-testid="bad-response-turn-action-button"], button[aria-label="Copy"], button[aria-label="Copy response"], button[aria-label="Kopieren"], button[aria-label="Antwort kopieren"], button[aria-label="Read aloud"], button[aria-label="Vorlesen"]',
    imageCompletion:'button[aria-label="Bild kopieren"]',
    error:'[data-testid="conversation-turn-error"], [data-testid="error-message"]'
  };
  ns.migrateSelectors = saved => {
    const selectors={...ns.defaultSelectors,...saved};
    // Upgrade the shipped 0.1.0 defaults without dropping custom selectors.
    if(selectors.composer==='#prompt-textarea')selectors.composer=ns.defaultSelectors.composer;
    if(selectors.send==='[data-testid="send-button"], button[aria-label="Send prompt"], button[aria-label="Nachricht senden"]')selectors.send=ns.defaultSelectors.send;
    for(const role of ['user','assistant'])if(selectors[role]===`[data-message-author-role="${role}"]`)selectors[role]=ns.defaultSelectors[role];
    if(selectors.stop==='[data-testid="stop-button"], button[aria-label="Stop streaming"], button[aria-label="Antwort stoppen"]')selectors.stop=ns.defaultSelectors.stop;
    return selectors;
  };
})();
