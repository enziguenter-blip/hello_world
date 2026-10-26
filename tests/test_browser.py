"""Offline functional tests. No real ChatGPT session, model request or account."""
import base64
import io
import json
from pathlib import Path
import tempfile
import unittest
from zipfile import ZipFile

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = 'https://chatgpt.com/c/offline-test'
FIXTURE = '''<!doctype html><html><head><meta charset="utf-8"><style>#prompt-textarea{min-height:40px;border:1px solid gray}</style></head><body>
<main id="messages"></main>
<form onsubmit="return false">
 <div id="previews"></div><input type="file" multiple hidden>
 <div id="prompt-textarea" contenteditable="true" role="textbox"></div>
 <button type="button" data-testid="send-button">Senden</button>
</form><script>
window.sent=[]; window.finished=[];window.fixtureComposer=document.querySelector('#prompt-textarea');
const input=document.querySelector('input'), previews=document.querySelector('#previews');
input.onchange=()=>{previews.replaceChildren();for(const f of input.files){const span=document.createElement('span');span.textContent=f.name;previews.append(span);}};
document.querySelector('[data-testid="send-button"]').onclick=async()=>{
 const composer=window.fixtureComposer;
 const record={prompt:'value' in composer?composer.value:composer.innerText,names:[...input.files].map(f=>f.name),text:await Promise.all([...input.files].map(f=>f.text())),at:Date.now()};
 window.sent.push(record);const n=window.sent.length;
 const user=document.createElement('div');if(!window.semanticFree)user.dataset.messageAuthorRole='user';else user.contentEditable='false';user.textContent=record.prompt;document.querySelector('#messages').append(user);
 if(window.omitFirstUserRole && n===1)user.removeAttribute('data-message-author-role');
 if(window.omitFirstUserMarker && n===1)user.textContent=record.prompt.split('[Proto-Disput')[0];
 if('value' in composer)composer.value='';else composer.textContent='';previews.replaceChildren();input.value='';
 const stop=document.createElement('button');if(!window.semanticFree)stop.dataset.testid='stop-button';else stop.setAttribute('aria-label','Stop generating');stop.textContent='Stop';document.body.append(stop);
 const article=document.createElement(window.semanticFree?'section':'article');const assistant=document.createElement('div');if(!window.semanticFree)assistant.dataset.messageAuthorRole='assistant';else assistant.contentEditable='false';
 const markdown=document.createElement(window.semanticFree?'p':'div');if(!window.semanticFree)markdown.className='markdown';markdown.textContent='Zwischenstand '+n;assistant.append(markdown);article.append(assistant);document.querySelector('#messages').append(article);
 setTimeout(()=>{
   if(!window.omitCompletion){const copy=document.createElement('button');if(!window.semanticFree)copy.dataset.testid='copy-turn-action-button';else copy.setAttribute('aria-label',window.copyLabel||'Copy response');copy.textContent='Kopieren';article.append(copy);}
 },80);
 setTimeout(()=>{markdown.textContent=window.answerTextByTurn?.[n]||'Endfassung '+n;
   if(window.makeAsset || window.assetSteps?.includes(n)){const svg=new Blob(['<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="green"/></svg>'],{type:'image/svg+xml'});const img=document.createElement('img');img.src=URL.createObjectURL(svg);assistant.append(img);}
   if(window.sandboxLink){const a=document.createElement('a');a.href='sandbox:/mnt/data/bericht.pdf';a.textContent='bericht.pdf';assistant.append(a);}
 },140);
 setTimeout(()=>{stop.remove();window.finished.push(Date.now());if(window.failResponse){const e=document.createElement('div');e.dataset.testid='error-message';e.textContent='Testfehler';document.body.append(e);}},240);
};
</script></body></html>'''


class BrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()

    def setUp(self):
        self.context = self.browser.new_context()
        self.context.route('https://chatgpt.com/**', lambda route: route.fulfill(status=200, content_type='text/html', body=FIXTURE))
        self.page = self.context.new_page()
        self.page.goto(URL)
        for name in ['workflow.js', 'core.js', 'adapter.js']:
            self.page.add_script_tag(path=ROOT / 'extension' / name)

    def tearDown(self):
        self.context.close()

    def bootstrap(self, steps=2, **flags):
        self.page.evaluate('''({steps,flags})=>{
          Object.assign(window,flags);
          window.files=[new File(['Originalquelle'],'quelle.md',{type:'text/markdown'})];
          window.flow={version:1,steps:Array.from({length:steps},(_,i)=>({id:String(i+1),title:'Schritt '+(i+1),files:['quelle.md'],reuse:i?[String(i)]:[],prompt:'Bericht für {{person}}'}))};
          window.run=ProtoScanner.newRun('Testperson',flow,location.href);window.assets={};window.saves=[];
          window.adapter=new ProtoScanner.DOMAdapter(undefined,{pollMs:10,stableMs:80,uploadTimeout:1500,replyTimeout:2000,composerTimeout:1000,userTimeout:60});
          window.runner=new ProtoScanner.Runner(adapter,async r=>saves.push(structuredClone(r)),()=>{});
        }''', {'steps': steps, 'flags': flags})

    def execute(self):
        return self.page.evaluate('async()=>{await runner.execute(run,files,assets);return {run,sent,finished,saves};}')

    def test_01_upload_completion_and_result_handoff(self):
        self.bootstrap(steps=3, makeAsset=True)
        result = self.execute()
        self.assertEqual(result['run']['status'], 'fertig')
        self.assertEqual(len(result['run']['results']), 3)
        self.assertEqual(len(result['sent']), 3)
        self.assertEqual(result['sent'][0]['names'], ['quelle.md'])
        self.assertIn('Testperson_Schritt_1.md', result['sent'][1]['names'])
        self.assertIn('Endfassung 1', '\n'.join(result['sent'][1]['text']))
        self.assertTrue(any(name.endswith('.svg') for name in result['sent'][1]['names']))
        for n in range(1, 3):
            self.assertGreaterEqual(result['sent'][n]['at'], result['finished'][n-1])
        self.assertTrue(all(r['text'] == f'Endfassung {i+1}' for i, r in enumerate(result['run']['results'])))
        self.assertTrue(any(s['pending'] and not s['results'] for s in result['saves']))

    def test_02_no_completion_control_never_advances(self):
        self.bootstrap(omitCompletion=True)
        self.page.evaluate('adapter.replyTimeout=500')
        result = self.execute()
        self.assertEqual(result['run']['status'], 'angehalten')
        self.assertEqual(len(result['sent']), 1)
        self.assertEqual(result['run']['results'], [])
        self.assertIsNotNone(result['run']['pending'])

    def test_03_pause_resume_does_not_resubmit(self):
        self.bootstrap(steps=1)
        result = self.page.evaluate('''async()=>{
          const execution=runner.execute(run,files,assets);
          for(let attempt=0;!sent.length;attempt++){if(attempt>600)throw Error('Kein Prompt gesendet');await new Promise(r=>setTimeout(r,5));}
          runner.pause();await execution;
          const paused=structuredClone(run);
          await runner.execute(run,files,assets);return {paused,run,sent};
        }''')
        self.assertEqual(result['paused']['status'], 'pausiert')
        self.assertEqual(result['run']['status'], 'fertig')
        self.assertEqual(len(result['sent']), 1)

    def test_04_missing_required_asset_and_manual_resume(self):
        self.bootstrap(steps=1, sandboxLink=True)
        self.page.evaluate('flow.steps[0].requireAsset=true;run.flow=structuredClone(flow)')
        first = self.execute()
        self.assertEqual(first['run']['status'], 'angehalten')
        self.assertEqual(first['run']['results'], [])
        self.page.evaluate("assets['1/bericht.pdf']=new File(['manual replacement'],'bericht.pdf',{type:'application/pdf'})")
        result = self.execute()
        self.assertEqual(result['run']['status'], 'fertig')
        self.assertTrue(result['run']['results'][0]['manuallySupplied'])
        self.assertEqual(len(result['sent']), 1)

    def test_05_changed_sources_do_not_send_again(self):
        self.bootstrap(steps=2)
        first = self.page.evaluate('async()=>{await runner.execute(run,files,assets,{singleStep:true});return run}')
        self.assertEqual(len(first['results']), 1)
        self.page.evaluate("files=[new File(['Changed'],'quelle.md')]")
        result = self.execute()
        self.assertEqual(result['run']['status'], 'angehalten')
        self.assertIn('unterscheiden', result['run']['error'])
        self.assertEqual(len(result['sent']), 1)

    def test_06_chat_change_and_manual_interference_stop(self):
        self.bootstrap(steps=2)
        result = self.page.evaluate('''async()=>{
          const execution=runner.execute(run,files,assets);
          for(let attempt=0;!sent.length;attempt++){if(attempt>600)throw Error('Kein Prompt gesendet');await new Promise(r=>setTimeout(r,5));}
          const user=document.createElement('div');user.dataset.messageAuthorRole='user';user.textContent='Manuell';document.querySelector('#messages').append(user);
          await execution;return {run,sent};
        }''')
        self.assertEqual(result['run']['status'], 'angehalten')
        self.assertEqual(len(result['sent']), 1)
        self.assertIn('weitere Nachricht', result['run']['error'])

    def test_07_missing_files_and_duplicate_basenames(self):
        result = self.page.evaluate('''()=>{
          const flow=structuredClone(ProtoScanner.defaultWorkflow);
          const missing=ProtoScanner.preflight(flow,[]);
          let duplicate='';try{ProtoScanner.resolveFiles(['a.md'],[new File(['a'],'a.md'),new File(['b'],'a.md')]);}catch(e){duplicate=e.message;}
          return {missing,duplicate,steps:flow.steps.length};
        }''')
        self.assertEqual(result['steps'], 11)
        self.assertGreater(len(result['missing']), 10)
        self.assertIn('mehrdeutig', result['duplicate'])

    def test_08_zip_has_unicode_text_and_binary(self):
        data = self.page.evaluate('''async()=>{
          const zip=await ProtoScanner.zip([{name:'Müller_Bericht.md',blob:new Blob(['Fachlicher Bericht ✓'])},{name:'Schritt_5/grafik.bin',blob:new Blob([new Uint8Array([0,1,2,255])])}]);
          const bytes=new Uint8Array(await zip.arrayBuffer());return btoa(String.fromCharCode(...bytes));
        }''')
        with ZipFile(io.BytesIO(base64.b64decode(data))) as archive:
            self.assertIsNone(archive.testzip())
            self.assertEqual(archive.read('Müller_Bericht.md').decode(), 'Fachlicher Bericht ✓')
            self.assertEqual(archive.read('Schritt_5/grafik.bin'), bytes([0, 1, 2, 255]))

    def test_09_chatgpt_error_stops(self):
        self.bootstrap(failResponse=True)
        result = self.execute()
        self.assertEqual(result['run']['status'], 'angehalten')
        self.assertIn('Testfehler', result['run']['error'])
        self.assertEqual(len(result['sent']), 1)

    def exercise_panel(self, page):
        page.locator('#proto-disput-extension').wait_for(state='attached')
        if not page.locator('#panel').is_visible():
            page.get_by_role('button', name='Scanner-Ablauf', exact=True).click()
        flow = {'version': 1, 'steps': [{'id': '1', 'title': 'Test', 'files': ['quelle.md'], 'reuse': [], 'prompt': 'Bericht für {{person}}'}]}
        page.get_by_text('Dateizuordnung und Prompts bearbeiten', exact=True).click()
        page.locator('#workflow').fill(json.dumps(flow))
        page.locator('#person').fill('Testperson')
        page.locator('#sources').set_input_files({'name': 'quelle.md', 'mimeType': 'text/markdown', 'buffer': b'Originalquelle'})
        page.get_by_role('button', name='Dateien prüfen', exact=True).click()
        self.assertIn('eindeutig vorhanden', page.locator('#status').inner_text())
        if not page.locator('#manualTools').evaluate('el=>el.open'):
            page.get_by_text('Diagnose und manuelle Reparatur', exact=True).click()
        page.get_by_role('button', name='Nächsten Schritt testen', exact=True).click()
        page.wait_for_function("document.querySelector('#proto-disput-extension').shadowRoot.querySelector('#status').textContent.includes('fertig')")
        self.assertEqual(page.evaluate('sent.length'), 1)
        with page.expect_download() as info:
            page.get_by_role('button', name='Ergebnisse als ZIP', exact=True).click()
        path = info.value.path()
        with ZipFile(path) as archive:
            report = archive.read('Testperson_Schritt_1.md').decode()
            self.assertIn('Endfassung 1', report)
            self.assertEqual(json.loads(archive.read('lauf.json'))['status'], 'fertig')

    def test_10_panel_workflow_and_download(self):
        self.page.add_script_tag(path=ROOT / 'extension' / 'panel.js')
        self.exercise_panel(self.page)

    def test_11_loaded_chrome_extension_if_administrator_allows(self):
        with tempfile.TemporaryDirectory(prefix='proto-extension-') as tmp:
            extension = Path(tmp) / 'extension'
            with ZipFile(ROOT / 'dist' / 'proto-disput-chrome.zip') as archive:
                archive.extractall(extension)
            context = self.pw.chromium.launch_persistent_context(
                str(Path(tmp) / 'profile'), executable_path='/usr/bin/chromium', headless=True,
                ignore_default_args=['--disable-extensions'],
                args=['--no-sandbox', '--enable-unsafe-extension-debugging'],
            )
            try:
                try:
                    context.browser.new_browser_cdp_session().send('Extensions.loadUnpacked', {'path': str(extension)})
                except Exception as exc:
                    if 'disabled by the administrator' in str(exc):
                        self.skipTest('Administratorenrichtlinie dieser Cloud verbietet das Laden entpackter Erweiterungen.')
                    raise
                context.route('https://chatgpt.com/**', lambda route: route.fulfill(status=200, content_type='text/html', body=FIXTURE))
                page = context.new_page()
                page.goto(URL)
                self.exercise_panel(page)
            finally:
                context.close()

    def test_12_eleven_configured_steps_with_staged_files(self):
        self.bootstrap(steps=1, assetSteps=[5, 7])
        self.page.evaluate('''()=>{
          flow=structuredClone(ProtoScanner.defaultWorkflow);
          files=[...new Set(flow.steps.flatMap(step=>step.files))].map(name=>new File(['Testquelle '+name],name));
          run=ProtoScanner.newRun('Testperson',flow,location.href);
        }''')
        result = self.execute()
        self.assertEqual(result['run']['status'], 'fertig', result['run'].get('error'))
        self.assertEqual(len(result['run']['results']), 11)
        self.assertEqual(len(result['sent']), 11)
        self.assertEqual(len(result['sent'][0]['names']), 6)
        self.assertIn('manuel.png', result['sent'][4]['names'])
        self.assertNotIn('manuel.png', result['sent'][0]['names'])
        self.assertEqual(len(result['sent'][7]['names']), 10)
        self.assertTrue(all('Testperson' in item['prompt'] for item in result['sent']))

    def test_13_editor_variants_and_hidden_legacy_field(self):
        for variant in ['textarea', 'prosemirror', 'wrapper', 'lexical', 'plain-textarea']:
            with self.subTest(variant=variant):
                self.page.goto(URL)
                for name in ['workflow.js', 'core.js', 'adapter.js']:
                    self.page.add_script_tag(path=ROOT / 'extension' / name)
                self.bootstrap(steps=1)
                self.page.evaluate('''variant=>{
                  const old=fixtureComposer;
                  const el=document.createElement(variant.includes('textarea')?'textarea':'div');
                  el.style.minHeight='40px';
                  if(el.tagName!=='TEXTAREA')el.contentEditable='true';
                  if(variant==='textarea')el.dataset.testid='composer-text-input';
                  if(variant==='prosemirror'){
                    el.className='ProseMirror';
                    const hidden=document.createElement('textarea');hidden.id='prompt-textarea';hidden.hidden=true;old.before(hidden);old.removeAttribute('id');
                  }
                  if(variant==='lexical')el.dataset.lexicalEditor='true';
                  if(variant==='wrapper'){
                    old.removeAttribute('id');const wrapper=document.createElement('div');wrapper.id='prompt-textarea';old.replaceWith(wrapper);wrapper.append(el);
                  }else old.replaceWith(el);
                  fixtureComposer=el;
                }''', variant)
                result = self.execute()
                self.assertEqual(result['run']['status'], 'fertig', result['run'].get('error'))
                self.assertEqual(len(result['sent']), 1)
                self.assertIn('Testperson', result['sent'][0]['prompt'])

    def test_14_waits_for_editor_to_mount(self):
        self.bootstrap(steps=1)
        self.page.evaluate('''()=>{const el=fixtureComposer,parent=el.parentElement;el.remove();setTimeout(()=>parent.append(el),200);}''')
        result = self.execute()
        self.assertEqual(result['run']['status'], 'fertig', result['run'].get('error'))
        self.assertEqual(len(result['sent']), 1)

    def test_15_ambiguous_editors_do_not_upload_or_send(self):
        self.bootstrap(steps=1)
        self.page.evaluate('''()=>{
          fixtureComposer.removeAttribute('id');fixtureComposer.className='ProseMirror';
          const other=fixtureComposer.cloneNode();fixtureComposer.after(other);
        }''')
        result = self.execute()
        self.assertEqual(result['run']['status'], 'angehalten')
        self.assertIn('Mehrere', result['run']['error'])
        self.assertEqual(result['sent'], [])
        self.assertIsNone(result['run']['pending'])
        self.assertEqual(self.page.locator('#previews').inner_text(), '')

    def test_16_pick_editor_then_run_from_panel(self):
        self.page.evaluate('''()=>{
          fixtureComposer.removeAttribute('id');fixtureComposer.className='ProseMirror';
          const other=fixtureComposer.cloneNode();fixtureComposer.after(other);
        }''')
        self.page.add_script_tag(path=ROOT / 'extension' / 'panel.js')
        self.page.get_by_role('button', name='Scanner-Ablauf', exact=True).click()
        self.page.get_by_text('Diagnose und manuelle Reparatur', exact=True).click()
        self.page.get_by_role('button', name='Chat-Eingabefeld auswählen', exact=True).click()
        self.page.locator('form .ProseMirror').first.click()
        self.page.wait_for_function("document.querySelector('#proto-disput-extension').shadowRoot.querySelector('#status').textContent.includes('zugeordnet')")
        self.exercise_panel(self.page)

    def test_17_saved_legacy_defaults_migrate_and_custom_selector_is_retained(self):
        self.bootstrap(steps=1)
        self.page.evaluate('''()=>{
          fixtureComposer.removeAttribute('id');fixtureComposer.className='ProseMirror';
          adapter.selectors=ProtoScanner.migrateSelectors({composer:'#prompt-textarea'});
        }''')
        result = self.execute()
        self.assertEqual(result['run']['status'], 'fertig', result['run'].get('error'))
        custom = self.page.evaluate("ProtoScanner.migrateSelectors({composer:'textarea#custom'}).composer")
        self.assertEqual(custom, 'textarea#custom')

    def test_18_no_form_and_send_button_only_after_typing(self):
        self.bootstrap(steps=1)
        self.page.evaluate('''()=>{
          const form=document.querySelector('form'),container=document.createElement('div');container.dataset.testid='composer';
          while(form.firstChild)container.append(form.firstChild);form.replaceWith(container);
          const send=document.querySelector('[data-testid="send-button"]');send.hidden=true;
          fixtureComposer.addEventListener('input',()=>send.hidden=false);
        }''')
        result = self.execute()
        self.assertEqual(result['run']['status'], 'fertig', result['run'].get('error'))
        self.assertEqual(len(result['sent']), 1)

    def test_19_diagnostics_exclude_conversation_and_file_contents(self):
        self.page.evaluate('''()=>{
          fixtureComposer.textContent='PRIVATE_CONVERSATION';document.querySelector('#previews').textContent='PRIVATE_FILENAME.pdf';
        }''')
        report = self.page.evaluate('new ProtoScanner.DOMAdapter().diagnose()')
        self.assertIsNotNone(report['selected'])
        self.assertNotIn('PRIVATE_', json.dumps(report))
        self.assertNotIn('offline-test', json.dumps(report))

    def test_20_codex_page_does_not_upload_or_send(self):
        self.bootstrap(steps=1)
        self.page.evaluate("history.pushState({},'', '/codex/test');run.chatUrl=location.href")
        result = self.execute()
        self.assertEqual(result['run']['status'], 'angehalten')
        self.assertIn('kein ChatGPT-Gespräch', result['run']['error'])
        self.assertEqual(result['sent'], [])

    def test_21_missing_editor_explains_selection_without_sending(self):
        self.bootstrap(steps=1)
        self.page.evaluate('fixtureComposer.remove();adapter.composerTimeout=100')
        result = self.execute()
        self.assertEqual(result['run']['status'], 'angehalten')
        self.assertIn('Chat-Eingabefeld auswählen', result['run']['error'])
        self.assertEqual(result['sent'], [])
        self.assertIsNone(result['run']['pending'])

    def test_22_editor_replaced_after_upload(self):
        self.bootstrap(steps=1)
        self.page.evaluate('''()=>{
          const input=document.querySelector('input[type="file"]'),original=input.onchange;
          input.onchange=()=>{original();const replacement=fixtureComposer.cloneNode();fixtureComposer.replaceWith(replacement);fixtureComposer=replacement;};
        }''')
        result = self.execute()
        self.assertEqual(result['run']['status'], 'fertig', result['run'].get('error'))
        self.assertEqual(len(result['sent']), 1)

    def test_23_modified_prompt_is_not_submitted(self):
        self.bootstrap(steps=1)
        self.page.evaluate('''()=>{
          runner.save=async value=>{if(value.pending)fixtureComposer.textContent='MANUAL_EDIT';};
        }''')
        result = self.execute()
        self.assertEqual(result['run']['status'], 'angehalten')
        self.assertIn('verändert', result['run']['error'])
        self.assertEqual(result['sent'], [])
        self.assertEqual(self.page.locator('#prompt-textarea').inner_text(), 'MANUAL_EDIT')

    def test_24_editor_in_an_old_message_is_ignored(self):
        self.bootstrap(steps=1)
        self.page.evaluate('''()=>{
          const message=document.createElement('article');message.dataset.messageAuthorRole='assistant';
          const editor=fixtureComposer.cloneNode();message.append(editor);document.querySelector('#messages').append(message);
        }''')
        result = self.execute()
        self.assertEqual(result['run']['status'], 'fertig', result['run'].get('error'))
        self.assertEqual(len(result['sent']), 1)

    def test_25_message_roles_hidden_marker_and_duplicate_wrappers(self):
        for variant in ['turn-roles', 'hidden-marker', 'nested-roles']:
            with self.subTest(variant=variant):
                self.page.goto(URL)
                for name in ['workflow.js', 'core.js', 'adapter.js']:
                    self.page.add_script_tag(path=ROOT / 'extension' / name)
                self.bootstrap(steps=2)
                self.page.evaluate(r'''variant=>{
                  new MutationObserver(records=>{
                    for(const record of records)for(const node of record.addedNodes){
                      if(!(node instanceof Element))continue;
                      for(const role of ['user','assistant']){
                        const message=node.matches(`[data-message-author-role="${role}"]`)?node:node.querySelector(`[data-message-author-role="${role}"]`);
                        if(!message)continue;
                        if(variant==='turn-roles'){
                          const turn=message.closest('article')||message;turn.dataset.turn=role;message.removeAttribute('data-message-author-role');
                        }
                        if(variant==='nested-roles'){
                          let turn=message.closest('article');
                          if(!turn){turn=document.createElement('article');message.replaceWith(turn);turn.append(message);}
                          turn.dataset.turn=role;
                        }
                        if(variant==='hidden-marker' && role==='user' && !message.dataset.reformatted){
                          message.dataset.reformatted='true';const split=message.textContent.lastIndexOf('[Proto-Disput');
                          const marker=message.textContent.slice(split).replaceAll('-', '\u2011').replaceAll(' / ', '\n / \n');
                          const hidden=document.createElement('span');hidden.hidden=true;hidden.textContent=marker;
                          message.replaceChildren(document.createTextNode(message.textContent.slice(0,split)),hidden);
                        }
                      }
                    }
                  }).observe(document.querySelector('#messages'),{childList:true});
                }''', variant)
                result = self.execute()
                self.assertEqual(result['run']['status'], 'fertig', result['run'].get('error'))
                self.assertEqual(len(result['sent']), 2)
                self.assertEqual(self.page.evaluate('adapter.messages("user").length'), 2)

    def test_26_active_generation_extends_user_detection_window(self):
        self.bootstrap(steps=1)
        result = self.page.evaluate('''async()=>{
          adapter.userTimeout=30;
          const execution=runner.execute(run,files,assets);
          while(!sent.length)await new Promise(r=>setTimeout(r,5));
          const user=document.querySelector('[data-message-author-role="user"]'),original=user.textContent;user.removeAttribute('data-message-author-role');user.textContent='Prompt wird verarbeitet';
          setTimeout(()=>{user.dataset.turn='user';user.textContent=original;},150);
          await execution;return {run,sent};
        }''')
        self.assertEqual(result['run']['status'], 'fertig', result['run'].get('error'))
        self.assertEqual(len(result['sent']), 1)

    def test_27_reacquires_user_node_after_rerender(self):
        self.bootstrap(steps=1)
        result = self.page.evaluate('''async()=>{
          const execution=runner.execute(run,files,assets);
          while(!sent.length)await new Promise(r=>setTimeout(r,5));
          setTimeout(()=>{const user=document.querySelector('[data-message-author-role="user"]');user.replaceWith(user.cloneNode(true));},100);
          await execution;return {run,sent};
        }''')
        self.assertEqual(result['run']['status'], 'fertig', result['run'].get('error'))
        self.assertEqual(len(result['sent']), 1)

    def seed_pending_answer(self):
        self.page.evaluate('''()=>{
          run.pending={step:'1',marker:ProtoScanner.markerFor(run,flow.steps[0]),preparedAt:new Date().toISOString()};run.status='angehalten';
          const user=document.createElement('div');user.dataset.messageAuthorRole='user';user.textContent=run.pending.marker;
          const article=document.createElement('article');article.dataset.testid='conversation-turn-1';
          const answer=document.createElement('div');answer.dataset.messageAuthorRole='assistant';
          const markdown=document.createElement('div');markdown.className='markdown';markdown.textContent='OK. Alle sechs Dateien sind zugänglich. Zielperson Testperson.';
          answer.append(markdown);article.append(answer);const copy=document.createElement('button');copy.dataset.testid='copy-turn-action-button';article.append(copy);
          document.querySelector('#messages').append(user,article);window.existingAnswer=answer;
        }''')

    def test_28_resume_legacy_root_url_uses_existing_message(self):
        self.bootstrap(steps=1)
        self.seed_pending_answer()
        self.page.evaluate("run.chatUrl='https://chatgpt.com/'")
        result = self.execute()
        self.assertEqual(result['run']['status'], 'fertig', result['run'].get('error'))
        self.assertEqual(result['sent'], [])
        self.assertEqual(len(result['run']['results']), 1)

    def test_29_manual_adoption_then_next_step_without_resend(self):
        self.bootstrap(steps=2)
        self.seed_pending_answer()
        result = self.page.evaluate('''async()=>{
          document.querySelector('[data-message-author-role="user"]').removeAttribute('data-message-author-role');
          run.chatUrl='https://chatgpt.com/';
          await runner.adoptAnswer(run,existingAnswer,assets);const adopted=structuredClone(run);
          await runner.execute(run,files,assets);return {adopted,run,sent};
        }''')
        self.assertEqual(result['adopted']['status'], 'pausiert')
        self.assertTrue(result['adopted']['results'][0]['manuallyAdopted'])
        self.assertEqual(result['run']['status'], 'fertig', result['run'].get('error'))
        self.assertEqual(len(result['sent']), 1)
        self.assertIn('Schritt 2]', result['sent'][0]['prompt'])
        self.assertIn('Alle sechs Dateien', '\n'.join(result['sent'][0]['text']))

    def test_30_adoption_preserves_pending_on_busy_or_storage_failure(self):
        self.bootstrap(steps=1)
        self.seed_pending_answer()
        result = self.page.evaluate('''async()=>{
          const busy=document.createElement('button');busy.dataset.testid='stop-button';busy.textContent='Stop';document.body.append(busy);
          let busyError='';try{await runner.adoptAnswer(run,existingAnswer,assets);}catch(e){busyError=e.message;}
          busy.remove();runner.save=async()=>{throw Error('Quota');};
          let saveError='';try{await runner.adoptAnswer(run,existingAnswer,assets);}catch(e){saveError=e.message;}
          return {run,busyError,saveError,sent};
        }''')
        self.assertIn('arbeitet noch', result['busyError'])
        self.assertEqual(result['saveError'], 'Quota')
        self.assertEqual(result['run']['results'], [])
        self.assertIsNotNone(result['run']['pending'])
        self.assertEqual(result['sent'], [])

    def test_31_panel_adopts_existing_answer_without_upload_or_send(self):
        self.bootstrap(steps=2)
        self.seed_pending_answer()
        self.page.evaluate('''()=>{
          document.querySelector('[data-message-author-role="user"]').removeAttribute('data-message-author-role');
          existingAnswer.removeAttribute('data-message-author-role');
          window.browser={storage:{local:{get:async()=>({latestRun:structuredClone(run)}),set:async value=>{window.savedByPanel=value;}}}};
        }''')
        self.page.add_script_tag(path=ROOT / 'extension' / 'panel.js')
        self.page.get_by_role('button', name='Scanner-Ablauf', exact=True).click()
        self.page.get_by_text('Diagnose und manuelle Reparatur', exact=True).click()
        self.page.get_by_role('button', name='Vorhandene Antwort übernehmen', exact=True).click()
        self.page.get_by_text('Keine passende Vorschau?', exact=True).click()
        self.page.get_by_role('button', name='Antwort direkt im Chat auswählen', exact=True).click()
        self.page.once('dialog', lambda dialog: dialog.accept())
        self.page.locator('#messages .markdown').click()
        self.page.wait_for_function("document.querySelector('#proto-disput-extension').shadowRoot.querySelector('#status').textContent.includes('1/2 abgeschlossen')")
        self.assertEqual(self.page.evaluate('sent.length'), 0)
        self.assertTrue(self.page.evaluate('savedByPanel.latestRun.results[0].manuallyAdopted'))
        self.assertEqual(self.page.evaluate('savedByPanel.latestRun.pending'), None)

    def test_32_marker_precision_and_no_guessing_missing_user(self):
        self.bootstrap(steps=1)
        self.seed_pending_answer()
        result = self.page.evaluate('''async()=>{
          const user=document.querySelector('[data-message-author-role="user"]');user.textContent=ProtoScanner.markerFor(run,{id:'11'});
          const wrongStepMatched=!!adapter.user(run.pending.marker);adapter.replyTimeout=200;
          await runner.execute(run,files,assets);
          return {run,sent,wrongStepMatched,report:adapter.diagnose(run.pending.marker)};
        }''')
        self.assertFalse(result['wrongStepMatched'])
        self.assertEqual(result['run']['status'], 'angehalten')
        self.assertEqual(result['run']['results'], [])
        self.assertEqual(result['sent'], [])
        self.assertFalse(result['report']['messages']['openPromptRecognized'])
        self.assertNotIn(result['run']['id'], json.dumps(result['report']))

    def test_33_conversation_identity_and_expected_creation(self):
        checks = self.page.evaluate('''()=>{
          const same=ProtoScanner.sameConversation;
          return [same('https://chatgpt.com/','https://chatgpt.com/c/new',true),
            !same('https://chatgpt.com/','https://chatgpt.com/c/new',false),
            !same('https://chatgpt.com/c/a','https://chatgpt.com/c/b',true),
            same('https://chatgpt.com/c/a','https://chatgpt.com/g/g-custom/c/a',true),
            same('https://chatgpt.com/g/g-custom','https://chatgpt.com/g/g-custom/c/new',true),
            !same('https://chatgpt.com/','https://other.example/c/new',true),
            !same('https://chatgpt.com/settings','https://chatgpt.com/c/new',true)];
        }''')
        self.assertTrue(all(checks))

    def test_34_initial_conversation_url_changes_while_llm_is_working(self):
        self.bootstrap(steps=2)
        result = self.page.evaluate('''async()=>{
          history.pushState({},'', '/');run.chatUrl=location.href;
          const execution=runner.execute(run,files,assets);
          while(!sent.length)await new Promise(r=>setTimeout(r,5));
          setTimeout(()=>history.pushState({},'', '/c/created-after-send'),100);
          await execution;return {run,sent};
        }''')
        self.assertEqual(result['run']['status'], 'fertig', result['run'].get('error'))
        self.assertEqual(len(result['sent']), 2)
        self.assertTrue(result['run']['chatUrl'].endswith('/c/created-after-send'))

    def test_35_initial_url_changes_after_first_result_was_saved(self):
        self.bootstrap(steps=2)
        result = self.page.evaluate('''async()=>{
          history.pushState({},'', '/');run.chatUrl=location.href;let changed=false;
          runner.save=async value=>{if(!changed && value.results.length===1 && !value.pending){changed=true;history.pushState({},'', '/c/late-created');}};
          await runner.execute(run,files,assets);return {run,sent};
        }''')
        self.assertEqual(result['run']['status'], 'fertig', result['run'].get('error'))
        self.assertEqual(len(result['sent']), 2)
        self.assertTrue(result['run']['chatUrl'].endswith('/c/late-created'))

    def test_36_switch_between_existing_conversations_still_stops(self):
        self.bootstrap(steps=2)
        result = self.page.evaluate('''async()=>{
          const execution=runner.execute(run,files,assets);
          while(!sent.length)await new Promise(r=>setTimeout(r,5));
          setTimeout(()=>history.pushState({},'', '/c/unrelated-chat'),100);
          await execution;return {run,sent};
        }''')
        self.assertEqual(result['run']['status'], 'angehalten')
        self.assertEqual(result['run']['lastNavigationFailure']['phase'], 'reply')
        self.assertFalse(result['run']['lastNavigationFailure']['sameConversationId'])
        self.assertEqual(len(result['sent']), 1)
        self.assertEqual(result['run']['results'], [])
        self.assertIsNotNone(result['run']['pending'])

    def test_37_answer_preview_can_be_confirmed_inside_panel(self):
        self.bootstrap(steps=2)
        self.seed_pending_answer()
        self.page.evaluate('''()=>{
          window.browser={storage:{local:{get:async()=>({latestRun:structuredClone(run)}),set:async value=>{window.savedByPanel=value;}}}};
        }''')
        self.page.add_script_tag(path=ROOT / 'extension' / 'panel.js')
        self.page.get_by_role('button', name='Scanner-Ablauf', exact=True).click()
        self.page.get_by_text('Diagnose und manuelle Reparatur', exact=True).click()
        self.page.get_by_role('button', name='Vorhandene Antwort übernehmen', exact=True).click()
        self.assertIn('Alle sechs Dateien', self.page.locator('#recoveryChoices').inner_text())
        self.page.once('dialog', lambda dialog: dialog.accept())
        self.page.get_by_role('button', name='Diese Antwort übernehmen', exact=True).click()
        self.page.wait_for_function("document.querySelector('#proto-disput-extension').shadowRoot.querySelector('#status').textContent.includes('1/2 abgeschlossen')")
        self.assertEqual(self.page.evaluate('sent.length'), 0)
        self.assertTrue(self.page.evaluate('savedByPanel.latestRun.results[0].manuallyAdopted'))
        self.assertIsNone(self.page.evaluate('savedByPanel.latestRun.pending'))

    def test_38_resume_saved_first_result_with_delayed_creation_address(self):
        self.bootstrap(steps=2)
        self.seed_pending_answer()
        self.page.evaluate('''()=>{
          run.results=[{step:'1',title:flow.steps[0].title,text:'OK. Bereits gespeicherte Antwort.',assetNames:[]}];
          run.pending=null;run.chatUrl='https://chatgpt.com/';
          document.querySelector('[data-message-author-role="user"]').remove();
        }''')
        result = self.execute()
        self.assertEqual(result['run']['status'], 'fertig', result['run'].get('error'))
        self.assertEqual(len(result['sent']), 1)
        self.assertIn('Schritt 2]', result['sent'][0]['prompt'])
        self.assertEqual(len(result['run']['results']), 2)

    ACK = 'OK. Alle sechs Dateien sind vollständig zugänglich und lesbar. Zielperson für den folgenden Ablauf: Günter.'

    def bootstrap_acknowledgement(self):
        self.bootstrap(steps=2)
        self.page.evaluate('''ack=>{
          flow.steps[0]=structuredClone(ProtoScanner.defaultWorkflow.steps[0]);
          flow.steps[0].files=['quelle.md','zwei.md','drei.md','vier.md','fuenf.md','sechs.md'];
          files=flow.steps[0].files.map(name=>new File(['Quelle '+name],name,{type:'text/markdown'}));
          run=ProtoScanner.newRun('Günter',flow,location.href);
          window.omitFirstUserRole=true;window.omitFirstUserMarker=true;window.answerTextByTurn={1:ack};
        }''', self.ACK)

    def test_39_exact_customer_acknowledgement_starts_step_two_automatically(self):
        self.bootstrap_acknowledgement()
        result = self.execute()
        self.assertEqual(result['run']['status'], 'fertig', result['run'].get('error'))
        self.assertEqual(len(result['sent']), 2)
        self.assertEqual(len(result['sent'][0]['names']), 6)
        self.assertEqual(result['run']['results'][0]['recognition'], 'sources-acknowledgement')
        self.assertFalse(result['run']['results'][0]['manuallyAdopted'])
        self.assertEqual(result['run']['results'][0]['text'], self.ACK)
        self.assertGreaterEqual(result['sent'][1]['at'], result['finished'][0])

    def test_40_incomplete_or_wrong_acknowledgement_never_advances(self):
        for answer in [self.ACK.replace('Günter', 'Manuel'), self.ACK.replace('sechs', 'fünf'), self.ACK.replace('vollständig', 'nicht vollständig'), 'OK.']:
            with self.subTest(answer=answer):
                self.page.goto(URL)
                for name in ['workflow.js', 'core.js', 'adapter.js']:
                    self.page.add_script_tag(path=ROOT / 'extension' / name)
                self.bootstrap_acknowledgement()
                self.page.evaluate('answer=>{answerTextByTurn[1]=answer;adapter.replyTimeout=450;}', answer)
                result = self.execute()
                self.assertEqual(result['run']['status'], 'angehalten')
                self.assertEqual(result['run']['results'], [])
                self.assertEqual(len(result['sent']), 1)
                self.assertIsNotNone(result['run']['pending'])

    def test_41_old_pending_first_step_resumes_from_ack_without_confirmation(self):
        self.bootstrap_acknowledgement()
        self.seed_pending_answer()
        self.page.evaluate('''ack=>{
          delete run.flow.steps[0].acknowledgement;
          existingAnswer.querySelector('.markdown').textContent=ack;
          document.querySelector('[data-message-author-role="user"]').removeAttribute('data-message-author-role');
          document.querySelector('#messages > div').textContent='Früherer Prompt ohne sichtbare Markierung';
          run.chatUrl='https://chatgpt.com/';window.omitFirstUserRole=false;window.omitFirstUserMarker=false;
        }''', self.ACK)
        result = self.execute()
        self.assertEqual(result['run']['status'], 'fertig', result['run'].get('error'))
        self.assertEqual(len(result['sent']), 1)
        self.assertIn('Schritt 2]', result['sent'][0]['prompt'])
        self.assertEqual(result['run']['results'][0]['recognition'], 'sources-acknowledgement')
        self.assertFalse(result['run']['results'][0]['manuallyAdopted'])

    def test_42_preexisting_ack_is_not_accepted_for_a_new_send(self):
        self.bootstrap_acknowledgement()
        self.seed_pending_answer()
        self.page.evaluate('''ack=>{
          run.pending=null;existingAnswer.querySelector('.markdown').textContent=ack;
          document.querySelector('[data-message-author-role="user"]').textContent='Vorherige fremde Anfrage';
          window.answerTextByTurn={1:'Die Verarbeitung ist fehlgeschlagen.'};adapter.replyTimeout=450;
        }''', self.ACK)
        result = self.execute()
        self.assertEqual(result['run']['status'], 'angehalten')
        self.assertEqual(result['run']['results'], [])
        self.assertEqual(len(result['sent']), 1)
        self.assertEqual(len(result['run']['pending']['beforeReply']['assistants']), 1)

    def test_43_ambiguous_legacy_acknowledgements_are_not_silently_selected(self):
        self.bootstrap_acknowledgement()
        self.seed_pending_answer()
        self.page.evaluate('''ack=>{
          existingAnswer.querySelector('.markdown').textContent=ack;
          const another=existingAnswer.parentElement.cloneNode(true);another.dataset.testid='conversation-turn-3';existingAnswer.parentElement.after(another);
          document.querySelector('[data-message-author-role="user"]').removeAttribute('data-message-author-role');
          document.querySelector('#messages > div').textContent='Frühere nicht eindeutig zugeordnete Anfrage';
          adapter.replyTimeout=300;
        }''', self.ACK)
        result = self.execute()
        self.assertEqual(result['run']['status'], 'angehalten')
        self.assertEqual(result['run']['results'], [])
        self.assertEqual(result['sent'], [])

    def test_44_default_ui_runs_both_steps_without_dialogs_or_manual_tools(self):
        self.bootstrap_acknowledgement()
        flow = self.page.evaluate('flow')
        names = self.page.evaluate('files.map(file=>file.name)')
        self.page.add_script_tag(path=ROOT / 'extension' / 'panel.js')
        self.page.get_by_role('button', name='Scanner-Ablauf', exact=True).click()
        self.page.get_by_text('Dateizuordnung und Prompts bearbeiten', exact=True).click()
        self.page.locator('#workflow').fill(json.dumps(flow))
        self.page.locator('#person').fill('Günter')
        self.page.locator('#sources').set_input_files([{'name': name, 'mimeType': 'text/markdown', 'buffer': b'Quelle'} for name in names])
        dialogs = []
        self.page.on('dialog', lambda dialog: (dialogs.append(dialog.message), dialog.dismiss()))
        self.page.get_by_role('button', name='Automatisch starten / fortsetzen', exact=True).click()
        self.page.wait_for_function("document.querySelector('#proto-disput-extension').shadowRoot.querySelector('#status').textContent.includes('fertig')")
        self.assertEqual(self.page.evaluate('sent.length'), 2)
        self.assertEqual(dialogs, [])
        self.assertFalse(self.page.locator('#manualTools').evaluate('el=>el.open'))
        self.assertIn('2/2 abgeschlossen', self.page.locator('#status').inner_text())

    def semantic_free_editor(self):
        self.page.evaluate('''()=>{
          window.semanticFree=true;window.omitFirstUserRole=false;
          fixtureComposer.removeAttribute('id');fixtureComposer.style.minHeight='40px';
          const hidden=fixtureComposer.cloneNode();hidden.hidden=true;fixtureComposer.before(hidden);
        }''')

    def test_45_zero_message_attributes_and_provisional_urls_run_both_steps(self):
        self.bootstrap_acknowledgement()
        self.semantic_free_editor()
        result = self.page.evaluate('''async()=>{
          window.omitFirstUserMarker=false;history.pushState({},'', '/');run.chatUrl=location.href;
          const execution=runner.execute(run,files,assets);
          while(!sent.length)await new Promise(r=>setTimeout(r,5));
          setTimeout(()=>history.pushState({},'', '/c/provisional-private-id'),30);
          setTimeout(()=>history.pushState({},'', '/'),80);
          setTimeout(()=>history.pushState({},'', '/c/final-private-id'),130);
          await execution;return {run,sent,report:adapter.diagnose(null,run.chatUrl)};
        }''')
        self.assertEqual(result['run']['status'], 'fertig', result['run'].get('error'))
        self.assertEqual(len(result['sent']), 2)
        self.assertEqual(result['run']['chatUrl'], 'https://chatgpt.com/c/final-private-id')
        self.assertEqual(result['report']['messages']['users'], 0)
        self.assertEqual(result['report']['messages']['assistants'], 0)
        self.assertEqual(result['report']['messages']['conversationTurns'], 0)
        self.assertEqual(result['report']['messages']['recognizedReplies'], 2)
        self.assertNotIn('private-id', json.dumps(result['report']))

    def test_46_strong_ack_and_readonly_messages_without_any_old_attributes(self):
        self.bootstrap_acknowledgement()
        self.semantic_free_editor()
        self.page.evaluate("window.copyLabel='Antwort kopieren'")
        result = self.execute()
        self.assertEqual(result['run']['status'], 'fertig', result['run'].get('error'))
        self.assertEqual(len(result['sent']), 2)
        self.assertEqual(result['run']['results'][0]['recognition'], 'sources-acknowledgement')
        self.assertEqual(result['run']['results'][0]['text'], self.ACK)
        self.assertEqual(result['run']['results'][1]['text'], 'Endfassung 2')

    def test_47_navigation_trace_redacts_ids_names_and_query_values(self):
        report = self.page.evaluate('''()=>{
          const failure=ProtoScanner.navigationFailure('https://chatgpt.com/c/SECRET_FIRST_ID?token=SECRET_TOKEN','https://chatgpt.com/g/PRIVATE_PROJECT/c/SECRET_SECOND_ID#PRIVATE_HASH','reply');
          return new ProtoScanner.DOMAdapter().diagnose(null,'https://chatgpt.com/',failure.navigationFailure);
        }''')
        serialized=json.dumps(report)
        self.assertNotIn('SECRET_',serialized)
        self.assertNotIn('PRIVATE_',serialized)
        self.assertFalse(report['routing']['lastRejectedTransition']['sameConversationId'])
        self.assertEqual(report['routing']['lastRejectedTransition']['to']['shape'],'/g/<segment>/c/<segment>')

    def test_48_resume_pending_first_step_keeps_original_creation_anchor(self):
        self.bootstrap_acknowledgement()
        self.seed_pending_answer()
        self.page.evaluate('''ack=>{
          existingAnswer.querySelector('.markdown').textContent=ack;
          run.chatUrl='https://chatgpt.com/';window.omitFirstUserRole=false;window.omitFirstUserMarker=false;
          setTimeout(()=>history.pushState({},'', '/'),20);
          setTimeout(()=>history.pushState({},'', '/c/final-resumed-id'),50);
        }''',self.ACK)
        result = self.execute()
        self.assertEqual(result['run']['status'], 'fertig', result['run'].get('error'))
        self.assertEqual(len(result['sent']), 1)
        self.assertIn('Schritt 2]',result['sent'][0]['prompt'])


if __name__ == '__main__':
    unittest.main(verbosity=2)
