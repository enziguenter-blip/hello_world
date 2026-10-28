"""Build both browser packages without external dependencies."""
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'extension'
DIST = ROOT / 'dist'


def main():
    DIST.mkdir(exist_ok=True)
    base = json.loads((SOURCE / 'manifest.json').read_text())
    for browser in ('firefox', 'chrome'):
        manifest = dict(base)
        if browser == 'chrome':
            manifest.pop('browser_specific_settings', None)
        with ZipFile(DIST / f'proto-disput-{browser}.zip', 'w', ZIP_DEFLATED) as archive:
            archive.writestr('manifest.json', json.dumps(manifest, ensure_ascii=False, indent=2))
            for path in sorted(SOURCE.glob('*.js')):
                archive.write(path, path.name)
            archive.write(ROOT / 'README.md', 'ANLEITUNG.md')
            archive.write(ROOT / 'TESTERGEBNISSE.md', 'TESTERGEBNISSE.md')
            install = (
                'Firefox: about:debugging#/runtime/this-firefox öffnen, '
                'Temporäres Add-on laden, dann manifest.json auswählen. '
                'Nach jedem Browserneustart erneut laden.'
                if browser == 'firefox' else
                'Chrome: chrome://extensions öffnen, Entwicklermodus einschalten, '
                'Entpackte Erweiterung laden und diesen Ordner auswählen.'
            )
            archive.writestr('START_HIER.txt', (
                f'PROTO-DISPUT - LOKALE TESTVERSION {manifest["version"]}\r\n\r\n'
                'VERSION 0.1.8 - Antworttext und Abschlussknöpfe werden bei gemeinsamem Prompt-/Antwortcontainer getrennt zugeordnet.\r\n'
                'Bei einem offenen Schritt 1 nach dem Update dieselben Quellen auswählen und Automatisch starten / fortsetzen drücken. Der erste Prompt wird nicht erneut gesendet.\r\n'
                'Oberfläche prüfen ist ein Knopf unter Diagnose und manuelle Reparatur im Scanner, kein Auftrag an ChatGPT.\r\n\r\n'
                '1. Dieses ZIP vollständig in einen eigenen Ordner entpacken.\r\n'
                f'2. {install}\r\n'
                '3. https://chatgpt.com öffnen oder neu laden. Unten rechts Scanner-Ablauf anklicken.\r\n'
                '4. Quelldateien einmal auswählen, Dateinamen prüfen, Zielperson eintragen.\r\n'
                '5. Automatisch starten / fortsetzen drücken. Nach der fertigen OK-Antwort beginnt Schritt 2 ohne weitere Bestätigung.\r\n'
                '6. Browser und Tab geöffnet lassen. Am Ende Ergebnisse als ZIP sichern.\r\n\r\n'
                'UPDATE: Dateien im bisherigen Erweiterungsordner ersetzen, Erweiterung unter chrome://extensions neu laden, danach den ChatGPT-Tab mit F5 neu laden.\r\n'
                'Eingabefeld nicht erkannt? Im Scanner Chat-Eingabefeld auswählen anklicken, dann direkt in das ChatGPT-Nachrichtenfeld klicken.\r\n\r\n'
                'Erster Prompt schon gesendet und passende OK-Antwort fertig? Automatisch starten / fortsetzen liest die eindeutige Bestätigung und beginnt Schritt 2. Der alte Prompt wird nicht erneut gesendet.\r\n'
                'Einzelschritt-Tests und manuelle Reparatur sind im gleichnamigen Diagnosebereich eingeklappt; sie gehören nicht zum normalen automatischen Ablauf.\r\n\r\n'
                'Nutzt dein bestehendes ChatGPT-Konto, keine separat berechnete API.\r\n'
                'Noch nicht am echten ChatGPT-Konto geprüft. Manche Ergebnisdownloads benötigen eine manuelle Übergabe.\r\n'
                'Anleitung und Grenzen: ANLEITUNG.md (bei Bedarf mit einem Texteditor öffnen).\r\n'
                'Prüfumfang: TESTERGEBNISSE.md.\r\n'
            ))
    print('Firefox- und Chrome-Pakete erstellt in', DIST)


if __name__ == '__main__':
    main()
