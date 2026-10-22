# Proto-Disput im ChatGPT-Browser

Lokale Browser-Erweiterung für Windows 10, Firefox und Chrome. Sie bedient deinen bestehenden ChatGPT-Chat, verwendet dein angemeldetes Konto und **keine API**. Keine eigene Serverinstallation, keine Bibliotheken von fremden Servern, keine zusätzliche API-Abrechnung. Die normalen Beschränkungen deines ChatGPT-Tarifs bleiben bestehen.

**Stand: Prototyp, nicht an einem echten angemeldeten ChatGPT-Konto getestet.** Automatische Uploads und Downloads sind von der aktuellen Oberfläche abhängig. Ein vollständig unbeaufsichtigter Lauf wird noch nicht als verifiziert zugesichert. An einer simulierten Chatoberfläche werden Uploads, Antwortabschluss, Übergaben, Pausen und ZIP-Export getestet. Ergebnisse und Testumfang stehen in `TESTERGEBNISSE.md`.

## Installation unter Firefox (Testversion)

1. `dist/proto-disput-firefox.zip` herunterladen und in einen eigenen Ordner entpacken.
2. Firefox öffnen, `about:debugging#/runtime/this-firefox` in die Adresszeile eingeben.
3. **Temporäres Add-on laden** wählen und die entpackte `manifest.json` auswählen.
4. Einen normalen Chat auf `https://chatgpt.com` öffnen oder die Seite neu laden. Falls Firefox nach dem Zugriff auf diese Website fragt, diesen für die Erweiterung zulassen.
5. Unten rechts erscheint **Scanner-Ablauf**.

Ein temporäres Firefox-Add-on wird beim Beenden des Browsers entfernt. Danach muss es erneut geladen werden. Für eine dauerhafte reguläre Installation wäre eine Mozilla-Signierung erforderlich; diese Version ist nicht signiert. Vor dem Beenden Ergebnisse als ZIP sichern. Chrome bietet für diese lokale Testphase eine beständigere Installation.

## Installation unter Chrome

1. `dist/proto-disput-chrome.zip` herunterladen und entpacken.
2. `chrome://extensions` öffnen und **Entwicklermodus** einschalten.
3. **Entpackte Erweiterung laden** wählen und den Ordner mit der `manifest.json` auswählen.
4. ChatGPT öffnen oder neu laden. Unten rechts auf **Scanner-Ablauf** klicken.

## Einmal vorbereiten, dann eine Person wählen

1. Alle Quellen, Beispielbilder und Vorlagen lokal bereitlegen. Sie müssen jetzt nur auswählbar sein: Der Upload an ChatGPT erfolgt erst beim zugehörigen Schritt. Der Standardablauf enthält die **elf Schritte** aus deiner Prozessdatei.
2. Einen **neuen Chat** für diese Person und Auswertung öffnen. Das gewünschte Modell und gegebenenfalls dessen Denkmodus selbst in ChatGPT wählen. Eine vorhandene Auswertung nie parallel von zwei Tabs steuern.
3. Über **Quelldateien einmal auswählen** alle benötigten Dateien auswählen; alternativ einen Ordner auswählen. Bei Ordnerwahl keine unnötigen Dateien einbeziehen. Die Liste wird angezeigt.
4. **Dateien prüfen** anklicken. Die Standardkonfiguration verlangt die Originaldateinamen aus der Prozessbeschreibung. Abweichende Namen unter **Dateizuordnung und Prompts bearbeiten** anpassen. Doppelte Basenamen benötigen eindeutige relative Pfade inklusive ausgewähltem Hauptordner.
5. Zielperson eintragen. Die früher fest eingetragenen Zielnamen Marlies und Manuel werden in den Arbeitsaufträgen durch diese Person ersetzt. Namen in Beispiel-Dateinamen bleiben erhalten.
6. Beim ersten Einsatz **Nächsten Schritt testen** wählen. Prüfen, ob alle Anhänge angekommen sind, der Prompt genau einmal gesendet wurde und die Antwort vollständig ist. Upload bedeutet nicht, dass das LLM die Quelle vollständig verarbeitet hat.
7. Anschließend **Ablauf starten / fortsetzen**. Die Erweiterung arbeitet die verbleibenden Schritte ab, solange sie die Oberfläche und die Ergebnisse eindeutig erkennen kann. Tab und Browser geöffnet lassen, Ruhezustand vermeiden. Währenddessen nicht in andere Chats navigieren oder selbst weitere Nachrichten senden.
8. Abschließend **Ergebnisse als ZIP** herunterladen. Der Download erfolgt über diesen Knopf, damit der Browser ihn nicht als unerwünschten automatischen Download blockiert.

Die Konfiguration bleibt lokal gespeichert. Die Quelldateien werden nur für die laufende Seite im Arbeitsspeicher gehalten: Nach einem Neuladen müssen dieselben Dateien erneut ausgewählt werden. SHA-256-Prüfsummen verhindern das unbemerkte Fortsetzen mit anderen Quellinhalten. Für andere Gesprächsprotokolle und Vorlagen die Dateizuordnung aktualisieren und einen neuen Lauf anlegen.

## Übergabe und Wiederverwendung von Ergebnissen

- Jede abgeschlossene Antwort wird als **Textabschrift in einer Markdown-Datei** gesichert. Die Abschrift ist keine originalgetreue Übernahme komplexer Formatierung und enthält keine verborgenen Gedankengänge. Sie ist nicht identisch mit einer möglicherweise zusätzlich vom LLM erzeugten PDF-/Word-Datei.
- `reuse` legt fest, welche früheren Textabschriften und gespeicherten Original-Ergebnisdateien erneut als Anhänge übergeben werden. Ein Download auf die Festplatte mit anschließendem Upload ist dafür nicht nötig. Der Chatverlauf bleibt zusätzlich im selben Chat erhalten.
- Sichtbare Grafiken und direkt lesbare Dateilinks innerhalb der Antwort versucht die Erweiterung als Originaldateien zu übernehmen. Es werden nur sichtbare URLs gelesen; keine internen API-Endpunkte geraten, keine Zugangsdaten extrahiert und keine Downloads in beliebigen Windows-Ordnern überwacht.
- **Grenze:** Manche ChatGPT-Dateilinks, insbesondere `sandbox:`-Links, können nur durch die Oberfläche aufgelöst werden. Bilddateien können ebenfalls durch Zugriffsbeschränkungen unlesbar sein. In diesem Fall pausiert der Ablauf. Datei regulär aus ChatGPT herunterladen, im Panel unter **Ergebnisdateien ergänzen** dem offenen Schritt zuordnen und fortsetzen. Diese manuelle Ersatz-Zuordnung wird im Laufprotokoll festgehalten.
- Die Infografik-Schritte 5 und 7 gelten erst mit einer erkannten oder ausdrücklich ergänzten Datei als abgeschlossen. Die Prüfung bestätigt das Vorhandensein einer Datei, nicht ihre fachliche oder grafische Qualität.
- Für Schritt 9 war keine separate Vorlage angegeben. Der entsprechende Prompt ist als Bearbeitungsvorschlag enthalten; ergänze eine Vorlage in `files`, wenn du eine hast.
- Das ZIP enthält die Textberichte, verfügbare Original-Ergebnisdateien und `lauf.json`. **Nicht enthalten:** die ursprünglichen Quelldateien. Fehlen nach einem Neuladen Binärdateien, werden sie im ZIP ausdrücklich als fehlend aufgelistet.

## Wann beginnt der nächste Schritt?

Es gibt keinen festen Timer für einen Scan. Die Erweiterung verlangt einen sichtbaren eigenen Nutzerprompt, eine nachfolgende Assistentenantwort, ein erkanntes Abschluss-Bedienelement, keinen erkannten laufenden Generierungszustand und einen kurzzeitig stabilen Antwortinhalt. Für Bilder wird zusätzlich deren Ladezustand geprüft. Nach zwei Stunden ohne erkannten Abschluss wird angehalten; dies ist eine Sicherheitsgrenze, kein Auslöser für den nächsten Schritt. Uploads haben eine separate Grenze von drei Minuten. Solche Oberflächensignale ersetzen keine offizielle Fertigstellungs-Schnittstelle und müssen im echten Chat erprobt werden.

Bei Pause kann ChatGPT weiterarbeiten; nur die Ablaufsteuerung wird unterbrochen. Beim Fortsetzen eines bereits gesendeten Schritts wird dessen Antwort gesucht, **nicht erneut gesendet**. Ist das Senden unklar, wird angehalten. Nicht ungeprüft einen neuen Lauf starten. Schlägt die Vorbereitung vor dem Senden fehl, müssen eventuell liegen gebliebene Anhänge und der vorbereitete Prompt zuerst aus dem Eingabefeld entfernt werden.

## Kontext und Dateien

**Ein einzelner Chat garantiert nicht, dass zwölf beziehungsweise elf lange Arbeitsschritte gleichzeitig vollständig im Modellkontext liegen.** Kontextgrenzen, Dateiverarbeitung und Komprimierung hängen von Modell, Tarif und ChatGPT ab. Die Erweiterung kann diese Grenzen nicht messen, vergrößern oder umgehen. Erneutes Anhängen wichtiger Ergebnisse macht die Übergaben explizit, garantiert aber ebenfalls kein vollständiges Einlesen. Sie prüft keine Behauptung des LLMs, es habe „100 % gelesen“, und prüft nicht automatisch die Einhaltung sämtlicher Fachvorlagen oder der 5.000-Zeichen-Vorgabe.

## Lokale Daten und Berechtigungen

Die Erweiterung läuft nur auf `https://chatgpt.com/*`. Sie speichert Fortschritt, Antworttexte und Konfiguration im lokalen Erweiterungsspeicher. Original-Quellinhalte und binäre Ergebnisdateien bleiben im Arbeitsspeicher bis zum Neuladen. Beim Ausführen gehen die gewählten Anhänge und Prompts an ChatGPT, entsprechend der dortigen Kontoeinstellungen. Es gibt keine zusätzlichen Analyse- oder Telemetriedienste. Lokal gespeicherte Berichte können personenbezogene Inhalte enthalten; ZIP-Dateien entsprechend aufbewahren. „Neuer Lauf“ ersetzt den zuletzt gespeicherten Lauf, ohne den Chat zu löschen. Die Deinstallation löscht den lokalen Erweiterungsspeicher.

## Entwicklung und Prüfen

Keine Paketinstallation zum Bauen nötig:

```sh
python tools/package.py
```

Für die isolierten Browserprüfungen werden Python, Playwright und Chromium benötigt. Das verändert den ChatGPT-Account nicht:

```sh
python tests/test_browser.py
```

Die Browsererweiterung enthält keine Hintergrundprozesse und keine Geheimnisse. `extension/manifest.json` ist für Firefox; der Paketbau erzeugt zusätzlich eine Chrome-Version ohne Firefox-spezifische Manifestfelder.
