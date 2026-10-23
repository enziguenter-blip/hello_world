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
 const user=document.createElement('div');user.dataset.messageAuthorRole='user';user.textContent=record.prompt;document.querySelector('#messages').append(user);
 if('value' in composer)composer.value='';else composer.textContent='';previews.replaceChildren();input.value='';
 const stop=document.createElement('button');stop.dataset.testid='stop-button';stop.textContent='Stop';document.body.append(stop);
 const article=document.createElement('article');const assistant=document.createElement('div');assistant.dataset.messageAuthorRole='assistant';
 const markdown=document.createElement('div');markdown.className='markdown';markdown.textContent='Zwischenstand '+n;assistant.append(markdown);article.append(assistant);document.querySelector('#messages').append(article);
 setTimeout(()=>{
   if(!window.omitCompletion){const copy=document.createElement('button');copy.dataset.testid='copy-turn-action-button';copy.textContent='Kopieren';article.append(copy);}
 },80);
 setTimeout(()=>{markdown.textContent='Endfassung '+n;
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
          window.adapter=new ProtoScanner.DOMAdapter(undefined,{pollMs:10,stableMs:80,uploadTimeout:1500,replyTimeout:2000,composerTimeout:1000});
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


if __name__ == '__main__':
    unittest.main(verbosity=2)
