# Proto-Disput im ChatGPT-Browser

Aktuelle Version: **0.1.6**. Die Versionsnummer wird oben im Scanner-Panel angezeigt.

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
6. **Automatisch starten / fortsetzen** drücken. Nach einer fertig erkannten Antwort werden die Ergebnisse gespeichert und die Dateien des nächsten Schritts hochgeladen. Die OK-Antwort aus Schritt 1 muss nicht angeklickt oder zusätzlich bestätigt werden.
7. Tab und Browser geöffnet lassen, Ruhezustand vermeiden. Währenddessen nicht in andere Chats navigieren oder selbst weitere Nachrichten senden. Bei einem erkannten Fehler hält der Ablauf mit erhaltenem Fortschritt an.
8. Abschließend **Ergebnisse als ZIP** herunterladen. Der Download erfolgt über diesen Knopf, damit der Browser ihn nicht als unerwünschten automatischen Download blockiert.

Die Konfiguration bleibt lokal gespeichert. Die Quelldateien werden nur für die laufende Seite im Arbeitsspeicher gehalten: Nach einem Neuladen müssen dieselben Dateien erneut ausgewählt werden. SHA-256-Prüfsummen verhindern das unbemerkte Fortsetzen mit anderen Quellinhalten. Für andere Gesprächsprotokolle und Vorlagen die Dateizuordnung aktualisieren und einen neuen Lauf anlegen.

**Diagnose und manuelle Reparatur** ist ein eingeklappter Bereich für Ausnahmefälle. Dort liegt auch **Nächsten Schritt testen**: Dieser ausdrücklich gewählte Testmodus pausiert nach einem Schritt. Er gehört nicht zum automatischen Standardablauf.

## Automatisch von der OK-Antwort zu Schritt 2

Version **0.1.4** verwendet die fertige OK-Antwort als Abschluss des ersten Schritts. Bei der üblichen Zuordnung des eigenen Prompts ist kein zusätzlicher Klick nötig. Falls die Markierung des Nutzerprompts in der Oberfläche nicht erkannt wird, kann die Erweiterung die eindeutige Quellenbestätigung des ersten Schritts automatisch erkennen, beispielsweise:

> OK. Alle sechs Dateien sind vollständig zugänglich und lesbar. Zielperson für den folgenden Ablauf: Günter.

Bei dieser ausführlichen Bestätigung wird der Name mit der ausgewählten Zielperson verglichen. Version **0.1.6** akzeptiert außerdem das im Prompt ausdrücklich verlangte bloße **„OK“**. Es muss eine neue, dem offenen ersten Schritt zuordenbare Antwort sein; ein altes „OK“ wird durch die gespeicherte Ausgangslage ausgeschlossen. Bei alten offenen Läufen ohne diese Ausgangslage ist eine bloße OK-Antwort nur als eindeutige erste Antwort zulässig. Die Erkennung wartet weiterhin auf das Ende der Generierung und ein erkanntes Abschluss-Bedienelement. Die Antwort wird gespeichert und **Schritt 2 startet automatisch**, ohne Freigabedialog. Das bestätigt die Meldung des LLMs, nicht unabhängig dessen tatsächliches vollständiges Lesen.

Vor dem Senden merkt sich die Erweiterung bereits vorhandene Antworten, damit eine alte OK-Antwort nicht für einen neuen Scan verwendet wird. Ein angehaltener erster Schritt aus einer älteren Version kann ohne erneutes Senden fortgesetzt werden, wenn eine eindeutige passende erste Bestätigung im ursprünglichen Chat vorhanden ist. Dazu nach dem Update im selben Erweiterungsordner und dem Neuladen des Tabs dieselben Dateien auswählen und **Automatisch starten / fortsetzen** drücken. Gespeicherte Standardabläufe werden berücksichtigt; die bestehenden Prompts werden nicht umgeschrieben. Bei dieser zusätzlichen Erkennung wird mit widersprüchlichen oder mehrdeutigen Bestätigungen nicht ungeprüft weitergeschaltet.

## Version 0.1.5: Fehlalarm beim Adresswechsel und null Nachrichtenkennungen

Eine reale Diagnose aus Version 0.1.4 zeigte `currentPageKind: conversation`, `savedPageKind: new-chat` und `sameConversation: true`, zugleich aber null Nutzer-, Assistenten- und Gesprächs-Turn-Kennungen. Der nachträglich zulässige Adressvergleich erklärt nicht den vorherigen Abbruch; ein kurzzeitiger anderer Adresszustand während der Generierung bleibt möglich. Die Diagnose belegt außerdem, dass die bisher abgefragten Nachrichtenkennungen auf dieser Oberfläche fehlen.

Version **0.1.5** legt die Identität des ersten Gesprächs deshalb erst mit der fertig erkannten Antwort fest. Während die erste Antwort entsteht, bleibt die ursprüngliche Startseitenadresse der Bezugspunkt; vorläufige Gesprächs-ID → Startseite → endgültige Gesprächs-ID führt nicht mehr zum vorzeitigen Festlegen auf eine Zwischenadresse. Das gilt auch beim Fortsetzen eines gespeicherten offenen ersten Schritts. Ein Wechsel zwischen bereits festgelegten bestehenden Gesprächen wird weiterhin angehalten.

Für Oberflächen ohne die bekannten Nachrichtenattribute werden zusätzlich die eindeutige eigene Schrittmarkierung im Text und Antwortbereiche mit erkannten Abschlussaktionen (etwa „Copy response“/„Antwort kopieren“) verwendet. Eingabefelder, Navigationsbereiche, Skripte, Code-Kopierknöpfe und die eigene Erweiterung werden dabei ausgeschlossen. Schreibgeschützte Nachrichten mit `contenteditable="false"` bleiben lesbar. Die automatische Erkennung verlangt weiterhin eine zuordenbare Antwort und ein Abschluss-Signal; reines Verstreichen einer Zeit löst keinen Folgeschritt aus.

**Oberfläche prüfen** zeigt zusätzlich erkannte Antwortbereiche und Abschlussaktionen. Ein zukünftiger abgewiesener Adresswechsel wird mit Phase und anonymisiertem Adressmuster (z. B. `/c/<segment>`) gespeichert. Gesprächs-IDs, Projektnamen, Abfragewerte und Textinhalte werden dafür nicht ausgegeben. Diese neuen Diagnosefelder ersetzen nicht den noch ausstehenden Test im angemeldeten Benutzerkonto.

## Version 0.1.6: „OK“ sichtbar, Scanner wartet weiter

Die reale Diagnose dazu zeigte eine erkannte Schrittmarkierung, keine aktive Generierung und zwei Abschlussaktionen, aber null erkannte Antwortbereiche. Die Antwortsuche hatte eine reine Kurzantwort ohne Absatz-/Markdown-Struktur nicht erfasst. Außerdem war die ergänzende Suche unnötig davon abhängig, dass Kopierknöpfe sichtbar waren; solche Knöpfe können erst beim Darüberfahren erscheinen.

Version **0.1.6** lässt das kurze „OK“ als Antworttext zu und berücksichtigt vorhandene Abschlussaktionen auch bei ausgeblendeten Knöpfen. Der Antworttext selbst muss weiterhin zu einem dargestellten Antwortbereich gehören. Eine laufende Generierung verhindert nach wie vor das Fortschalten; ohne erkanntes Abschluss-Signal wird nicht aufgrund eines Timers weitergeschaltet.

Mit „Antwortbereich“ ist nur das Element auf der Webseite gemeint, aus dem die Erweiterung den Antworttext ausliest und dem aktuellen Schritt zuordnet. Das ist keine zusätzliche Prüfung oder Freigabe durch den Nutzer. Für längere Berichte wird diese Zuordnung auch gebraucht, um Ergebnisse zu speichern und später erneut zu verwenden.

**Oberfläche prüfen** kann jetzt während des laufenden Ablaufs benutzt werden. Der Knopf pausiert den Lauf nicht und verändert auch nicht dessen Fortschrittsanzeige. Die Diagnose unterscheidet zusätzlich zwischen vorhandenen und tatsächlich sichtbaren Abschlussaktionen.

## Aktualisierung von 0.1.0 / Eingabefeld nicht gefunden

Version 0.1.0 suchte ausschließlich nach `#prompt-textarea`. Meldet sie „ChatGPT-Eingabefeld nicht gefunden“, obwohl du einen normalen Chat geöffnet hast, kann die Feldkennung oder die gerenderte Editorvariante abweichen. Das ist kein Beleg, dass du auf der falschen Seite bist.

1. Das neue ZIP für deinen Browser von GitHub herunterladen und entpacken. Falls Chrome beim Download `(1)` an den ZIP-Dateinamen anhängt, ist das unproblematisch.
2. Die entpackten Erweiterungsdateien im **bisher verwendeten Erweiterungsordner** ersetzen. Nicht eine zweite Kopie der Erweiterung parallel installieren.
3. In Chrome `chrome://extensions` öffnen und auf der Karte **Proto-Disput · Browserablauf** den kreisförmigen **Neu laden**-Pfeil anklicken. Bei Firefox über `about:debugging#/runtime/this-firefox` das temporäre Add-on neu laden.
4. Den ursprünglichen ChatGPT-Tab mit F5 neu laden. Im Scanner-Panel muss **v0.1.6** stehen. Die Quelldateien erneut auswählen; der gespeicherte Lauf bleibt bei derselben Erweiterungsinstallation erhalten.
5. **Oberfläche prüfen** erkennt das Nachrichtenfeld, ohne etwas hochzuladen oder zu senden. Erkennt die Automatik es nicht eindeutig, **Chat-Eingabefeld auswählen** drücken und direkt in das normale Nachrichtenfeld von ChatGPT klicken. Das Scanner-Panel blendet sich während der Auswahl aus. Mit Esc lässt sich abbrechen. Die Zuordnung wird lokal gespeichert.
6. **Automatisch starten / fortsetzen** anklicken. Ein bereits gesendeter offener Schritt wird nicht erneut gesendet. Es ist kein neuer Lauf nötig, solange Person und Quellen dieselben sind.

Seit Version 0.1.1 werden sichtbare Textareas, ProseMirror-/Lexical-Editoren, Nachrichtenfelder in bekannten Composer-Containern und verzögertes Laden unterstützt. Verborgene alte Felder und Editoren innerhalb vergangener Nachrichten werden ausgeschlossen. Bei mehreren gleichwertigen Kandidaten hält die Erweiterung an. Gespeicherte Standardselektoren aus 0.1.0 werden aktualisiert; eigene angepasste Selektoren bleiben erhalten.

Falls das Problem bleibt: **Oberfläche prüfen** anklicken und den angezeigten Diagnosetext kopieren. Er enthält Feldkennungen und Zustände, keine Nachrichten, Quelldateinamen oder Datei-/Gesprächsinhalte. Ein Screenshot oder der Gesprächsverlauf ist dafür nicht erforderlich. Die Erkennung ist weiterhin nicht gegen ein angemeldetes ChatGPT-Konto in dieser Cloud verifiziert.

## Prompt gesendet, aber nicht erkannt / fertige Antwort übernehmen

Die Meldung „Die gesendete Nachricht wurde nicht im Chat erkannt“ bedeutet nicht, dass ChatGPT die Arbeit abgebrochen hat. Die bisherige Minute betraf die Zuordnung des eigenen Nutzerprompts im sichtbaren Verlauf. Ein Scan von beispielsweise fünf Minuten darf weiterlaufen. Einen bereits gesendeten Prompt nicht manuell wiederholen und keinen neuen Lauf anlegen, nur weil die Erweiterung ihn nicht erkennt.

Seit Version 0.1.2 werden weitere Nachrichtenkennungen erkannt; die eindeutige Schrittmarkierung berücksichtigt auch ausgeblendeten Text, andere Zeilenumbrüche und Trennzeichen. Solange ein aktiver Generierungszustand erkannt wird, endet die Nachrichtensuche nicht wegen der bisherigen Minute. Bleibt die Zuordnung nach Ende der Generierung unmöglich, hält sie weiterhin an. Es werden keine Ergebnisse nach ihrer Position allein angenommen.

Version **0.1.3** behandelt das Anlegen einer Gesprächsadresse nach dem ersten Senden gesondert: Der Übergang von der Startseite oder einem neuen GPT-Chat zu `/c/…` darf erfolgen, wenn ein Schritt bereits versucht oder abgeschlossen wurde. Das gilt auch, wenn ChatGPT die Adresse erst während der Antwort oder nach deren Speicherung setzt. Diese Adressbindung allein bestätigt keine Antwort; dafür ist weiterhin eine eindeutige automatische Zuordnung oder die ausdrückliche Bestätigung des Nutzers erforderlich. Ein Wechsel zwischen zwei verschiedenen bestehenden Gesprächs-IDs bleibt ein Grund zum Anhalten. Die Diagnose zeigt die Adresstypen, aber keine URLs oder Gesprächs-IDs.

Manuelle Reparatur für Ausnahmefälle, in denen eine Antwort weiterhin nicht automatisch zugeordnet werden kann:

1. Im ursprünglichen Chat bleiben und die fertige Antwort abwarten.
2. Im Bereich **Diagnose und manuelle Reparatur** zuerst die Diagnose prüfen. Diese Reparatur ist keine zusätzliche Freigabe im normalen Prozess.
3. Falls ausdrücklich eine manuelle Zuordnung gewünscht ist, **Vorhandene Antwort übernehmen** anklicken. Im Panel erscheinen Vorschauen der zuletzt erkannten Antworten. Unter der passenden fertigen Antwort **Diese Antwort übernehmen** anklicken. Die angezeigte Zuordnung zu Person und Schritt prüfen und bestätigen. Gespeichert wird der vollständige Antworttext, nicht nur der Vorschauauszug.
4. Der Zähler steigt z. B. von **0/11 auf 1/11**. Der Bericht wird mit `manuallyAdopted: true` im Laufprotokoll gespeichert; dabei wird kein Prompt gesendet und kein Quelldokument erneut hochgeladen. Diese ausdrückliche Bestätigung ersetzt die automatische Nachrichtenzuordnung, nicht die fachliche Prüfung der Antwort. Erforderliche Original-Ergebnisdateien werden weiterhin geprüft.
5. **Automatisch starten / fortsetzen** beginnt beim nächsten Schritt. Alternativ lässt der ausdrücklich gewählte Testmodus **Nächsten Schritt testen** nur den nächsten Schritt laufen.

Die manuelle Übernahme ist nur bei einem offenen Schritt verfügbar. Während ChatGPT noch generiert, wird sie abgewiesen. **Automatisch starten / fortsetzen** versucht zunächst, den offenen Schritt automatisch wiederzuerkennen; er sendet ihn nicht erneut. **Oberfläche prüfen** enthält Nachrichtenzähler und die Information, ob der offene Prompt erkannt wurde, ohne die Markierung oder die Nachrichtentexte auszugeben.

Falls die passende Antwort nicht als Vorschau erscheint: **Keine passende Vorschau?** öffnen und **Antwort direkt im Chat auswählen** wählen. Erst dann blendet sich das Panel aus. Direkt auf den fertigen Antworttext von ChatGPT im Gespräch klicken, nicht auf das Texteingabefeld oder den eigenen Prompt. Die Aufforderung „Jetzt … anklicken“ ist eine Klickanweisung; es muss dort nichts eingegeben werden. Mit Esc kann man abbrechen.

## Übergabe und Wiederverwendung von Ergebnissen

- Jede abgeschlossene Antwort wird als **Textabschrift in einer Markdown-Datei** gesichert. Die Abschrift ist keine originalgetreue Übernahme komplexer Formatierung und enthält keine verborgenen Gedankengänge. Sie ist nicht identisch mit einer möglicherweise zusätzlich vom LLM erzeugten PDF-/Word-Datei.
- `reuse` legt fest, welche früheren Textabschriften und gespeicherten Original-Ergebnisdateien erneut als Anhänge übergeben werden. Ein Download auf die Festplatte mit anschließendem Upload ist dafür nicht nötig. Der Chatverlauf bleibt zusätzlich im selben Chat erhalten.
- Sichtbare Grafiken und direkt lesbare Dateilinks innerhalb der Antwort versucht die Erweiterung als Originaldateien zu übernehmen. Es werden nur sichtbare URLs gelesen; keine internen API-Endpunkte geraten, keine Zugangsdaten extrahiert und keine Downloads in beliebigen Windows-Ordnern überwacht.
- **Grenze:** Manche ChatGPT-Dateilinks, insbesondere `sandbox:`-Links, können nur durch die Oberfläche aufgelöst werden. Bilddateien können ebenfalls durch Zugriffsbeschränkungen unlesbar sein. In diesem Fall pausiert der Ablauf. Datei regulär aus ChatGPT herunterladen, im Panel unter **Ergebnisdateien ergänzen** dem offenen Schritt zuordnen und fortsetzen. Diese manuelle Ersatz-Zuordnung wird im Laufprotokoll festgehalten.
- Die Infografik-Schritte 5 und 7 gelten erst mit einer erkannten oder ausdrücklich ergänzten Datei als abgeschlossen. Die Prüfung bestätigt das Vorhandensein einer Datei, nicht ihre fachliche oder grafische Qualität.
- Für Schritt 9 war keine separate Vorlage angegeben. Der entsprechende Prompt ist als Bearbeitungsvorschlag enthalten; ergänze eine Vorlage in `files`, wenn du eine hast.
- Das ZIP enthält die Textberichte, verfügbare Original-Ergebnisdateien und `lauf.json`. **Nicht enthalten:** die ursprünglichen Quelldateien. Fehlen nach einem Neuladen Binärdateien, werden sie im ZIP ausdrücklich als fehlend aufgelistet.

## Wann beginnt der nächste Schritt?

Es gibt keinen festen Timer für einen Scan. Die automatische Erkennung verlangt einen eindeutig markierten eigenen Nutzerprompt im Seiteninhalt, eine nachfolgende Assistentenantwort, ein erkanntes Abschluss-Bedienelement, keinen erkannten laufenden Generierungszustand und einen kurzzeitig stabilen Antwortinhalt. Für Bilder wird zusätzlich deren Ladezustand geprüft. Nachrichtensuche und Antwortprüfung haben jeweils eine Höchstgrenze von zwei Stunden. Diese Grenzen lösen keinen Folgeschritt aus. Uploads haben eine separate Grenze von drei Minuten. Bei ausdrücklich manuell übernommener Antwort bestätigt der Nutzer die Fertigstellung. Solche Oberflächensignale ersetzen keine offizielle Fertigstellungs-Schnittstelle und müssen im echten Chat erprobt werden.

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
