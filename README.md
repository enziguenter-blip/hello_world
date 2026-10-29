# Proto-Disput im ChatGPT-Browser

Aktuelle Version: **0.1.14**. Die Versionsnummer wird oben im Scanner-Panel angezeigt.

Lokale Browser-Erweiterung für Windows 10, Firefox und Chrome. Sie bedient deinen bestehenden ChatGPT-Chat, verwendet dein angemeldetes Konto und **keine API**. Keine eigene Serverinstallation, keine Bibliotheken von fremden Servern, keine zusätzliche API-Abrechnung. Die normalen Beschränkungen deines ChatGPT-Tarifs bleiben bestehen.

**Stand: Prototyp mit einem vom Nutzer bestätigten vollständigen Live-Durchlauf der Version 0.1.13.** Der bereitgestellte Chat-Export enthält alle elf Schritte. Die fachliche Richtigkeit, Vollständigkeit der Originaldateien und die Auswahl beider korrigierter PNGs lassen sich aus diesem Export allein nicht vollständig verifizieren. Die Änderung aus 0.1.14 wurde gegen eine simulierte Oberfläche geprüft; ihr Live-Test steht aus. Ergebnisse und Testumfang stehen in `TESTERGEBNISSE.md`.

## Version 0.1.14: Auf Originalergebnisse im Chat verweisen

Folgeprompts verweisen jetzt ausdrücklich auf die vollständigen, zuvor im selben Chat erstellten Original-Ergebnisdateien. Die benötigten Schritte werden mit Nummer und Titel genannt. Die Erweiterung hängt ihre Textabschriften und gespeicherten Grafiken nicht erneut an. Neu benötigte Anleitungen und Vorlagen werden weiterhin gemäß `files` hochgeladen. Bei Grafiken gilt die endgültige korrigierte Fassung; fehlender Zugriff muss im Antworttext konkret benannt werden.

Damit dienen die teilweise kurzen Textabschriften der Erweiterung nicht länger als neue Quellen für Folgeprompts. Antworten und zugängliche Originaldateien werden weiterhin für die ZIP-Sicherung erfasst. Fehlende Binärdateien im Arbeitsspeicher nach F5 verhindern den Verweis auf ein früheres Ergebnis nicht; im ZIP bleiben sie als fehlend ausgewiesen.

`resultTransfer: "reference"` ist der Standard, auch bei gespeicherten Konfigurationen und Läufen ohne diese Angabe. Für ausdrücklich gewünschte erneute Anhänge kann `resultTransfer: "attachments"` gesetzt werden. Bereits offene Prompts werden unverändert fortgesetzt und nicht erneut gesendet. Abgeschlossene Läufe bleiben abgeschlossen.

**Anleitung für Schritt 9 ergänzt:** `META_PROMPT_0S_FINAL_V1.5.4_Druckkontext_Fiktives_Dojo_Gruppenfeld_Zonenlogik.md` muss bei den Quelldateien mit ausgewählt werden. Sie wird ausschließlich in Schritt 9 hochgeladen. Der Prompt verlangt das Podcast-Dossier gemäß dieser Anleitung statt des bisherigen allgemeinen Auftrags ohne Vorlage. Die alte ausgelieferte Schritt-9-Konfiguration wird für neue Läufe automatisch angepasst, auch wenn die Dateinamen anderer Schritte bereits bearbeitet wurden. Eigene Schritt-9-Prompts oder Dateizuordnungen werden erhalten. Bereits begonnene Läufe behalten ihre gespeicherte Quellenkonfiguration; die neue Anleitung gilt für neue Läufe.

## Version 0.1.13: Den bestätigten Abschlussknopf „Bild kopieren“ erkennen

Das nun vollständig bereitgestellte Bildelement der Schaltfläche enthält `aria-label="Bild kopieren"`. Dieser Wert war nicht in den bisherigen Text-Abschlussselektoren enthalten. Die Diagnose aus 0.1.12 zeigte entsprechend keine erkannten Abschlussaktionen im aktuellen Bildantwortbereich. Die frühere pauschale Sperre von Knöpfen innerhalb eines Bildwidgets hätte außerdem auch diesen bestätigten Bild-Abschlussknopf ausgeschlossen.

Version **0.1.13** führt deshalb eine eigene Kennung für diesen Bildknopf (`imageCompletion`) ein. Sie zählt nur bei einer geladenen Bildantwort, nach deren letzter Grafik, außerhalb des Nutzerprompts und bei aktivem Knopf. Der konkret bestätigte Bildknopf darf innerhalb des Bildbereichs liegen; gewöhnliche Kopierknöpfe innerhalb einer Vorschau geben weiterhin keinen Abschluss frei. Generierungs-, Lade- und Stabilitätsprüfungen sowie die ausschließliche Übernahme der letzten korrigierten Grafik bleiben erhalten.

Die Erkennung verwendet die zugängliche Beschriftung der Schaltfläche. SVG-Pfade, Symbol-Fingerabdrücke und wechselnde CSS-Klassen werden dafür nicht benutzt. Die bereitgestellte SVG ist nur als Testfixture enthalten. Alte gespeicherte Selektoren erhalten den neuen Standard automatisch. Die Strukturdiagnose zählt Bild-Abschlussaktionen separat und zeigt ihre Strukturpfade, ohne Bilddaten, SVG-Pfade oder Bildadressen auszugeben.

**Offenen Schritt 5 fortsetzen:** Dateien im bisherigen Erweiterungsordner ersetzen, Erweiterung unter `chrome://extensions` neu laden und den ursprünglichen Chat mit F5 neu laden. Im Scanner muss 0.1.13 stehen. Dieselben Quelldateien auswählen und **Automatisch starten / fortsetzen** drücken. Der offene Prompt wird nicht erneut gesendet; die vorhandene fertige Bildantwort soll übernommen werden. Eine bereits früher falsch gespeicherte Grafik kann weiterhin wie unten beschrieben ausdrücklich ersetzt werden.

Der konkrete Knopf wurde mit seinem bereitgestellten SVG, ohne zusätzliche Text-Abschlussknöpfe, sowohl unter der Bildantwort als auch innerhalb eines Bildwidgets simuliert. Auch die verspätete Korrektur, ein deaktivierter Knopf und das Fortsetzen mit neuem Adapter werden geprüft. Der Praxistest im angemeldeten Chat steht aus.

## Version 0.1.12: Nach Bildkorrekturen auf den Antwortabschluss warten

Die Freigabe aus 0.1.10/0.1.11 allein aufgrund eines geladenen Bildes war falsch: ChatGPT konnte das erste Bild anschließend noch korrigieren, während der Scanner bereits den nächsten Prompt schickte. Ein geladenes Bild, ein Vergrößerungsknopf oder ein Kopierknopf innerhalb der Bildvorschau gilt deshalb jetzt ausdrücklich nicht als Antwortabschluss.

Version **0.1.12** wartet auch bei Grafikschritten auf einen sichtbaren, aktiven Abschlussknopf nach der Bildantwort. Der Knopf muss zum Antwortbereich dieses Scannerprompts gehören; Prompt-Kopierknöpfe und Bedienelemente innerhalb eines Bildwidgets werden ausgeschlossen. Die neue Diagnose zeigt einen bereits vom Adapter erkannten Abschlussknopf außerhalb der Bildzweige; das ergänzend bereitgestellte SVG zeigt ein Kopiersymbol. Es wird kein SVG-Pfad als Selektor verwendet. Generierungs-, Lade- und Stabilitätsprüfungen bleiben zusätzlich erforderlich. Eine feste zusätzliche Wartezeit ersetzt diese Abschlussbedingung nicht.

Erstellt ChatGPT innerhalb derselben Antwort zunächst ein Bild und danach eine Korrektur in einem weiteren Zweig, werden diese nur mit einem gemeinsamen zugeordneten Antwortabschluss zusammengeführt. Für die beiden Grafikschritte wird die letzte Grafik der abgeschlossenen Antwort als Ergebnisdatei übernommen. Die erste fehlerhafte Grafik wird nicht zusätzlich an spätere Schritte angehängt. Fehlen zuordenbare Abschlussaktionen, bleibt der Schritt offen.

**Update:** Dateien im bisherigen Erweiterungsordner ersetzen, Erweiterung unter `chrome://extensions` neu laden und den ursprünglichen Chat mit F5 neu laden. Im Scanner muss 0.1.12 stehen. Dieselben Quelldateien wählen und den vorhandenen Lauf fortsetzen; offene Prompts werden nicht erneut gesendet.

**Bereits zu früh übernommene Grafik von Schritt 5 korrigieren:** Die endgültige korrigierte Grafik aus ChatGPT herunterladen. Im Scanner „Ergebnisdateien ergänzen“ öffnen, Schritt 5 wählen und „Bisherige Ergebnisdateien dieses Schritts ersetzen“ aktivieren. Die korrigierte Datei auswählen und die Zuordnung bestätigen. Das ersetzt auch eine frühere Datei mit anderem Namen und erhält den übrigen Fortschritt sowie einen eventuell bereits gesendeten Schritt 6. Danach den vorhandenen Lauf fortsetzen. Diese einmalige Reparatur gehört nicht zum normalen automatischen Ablauf.

Die Korrektur wurde mit verzögerten Abschlussaktionen, einem zweiten Bild, nur einer endgültig gespeicherten Grafik sowie dem Ersatz einer bereits gespeicherten Datei simuliert. Die Bestätigung im angemeldeten Chat steht weiterhin aus.

## Version 0.1.11: Bildantwort mit normaler Bildadresse und ohne `data-loaded`

Die neue Diagnose aus 0.1.10 zeigt eine geladene Grafik mit 1536 × 1024 Pixeln in einer Bildschaltfläche, ohne Inline-PNG-Quelle und ohne `data-loaded`. Die große Inline-PNG im Promptbereich trägt dieses Attribut ebenfalls nicht. Die bisherige zusätzliche Bildsuche ließ deshalb die fertige Grafik aus. Zugleich konnte ihre Suche nach einem Prompt-Kopierknopf bis in den gemeinsamen Verlauf mit älteren Dokumenteditoren reichen und die Bildantwort als Teil des Prompts ausschließen.

Version **0.1.11** berücksichtigt neben den zuvor unterstützten Bildern mit `data-loaded` auch geladene Bilder in einer Schaltfläche mit Testkennung. Die zusätzliche Zuordnung hängt dabei nicht mehr vom Bildformat oder einer Inline-PNG-Adresse ab. Sie prüft weiterhin den eigenen offenen Prompt, die Trennung vom Nutzerbereich und bereits vor dem Senden vorhandene Bildquellen. Die Suche nach dem Promptbereich endet vor anderen bekannten Prompts, Dokumenteditoren und der Chat-Eingabe. Aktive Generierung, Bilddekodierung, Ladezustände und Stabilität müssen abgeschlossen sein. Ein Ladezustand direkt am Antwortbereich wird ebenfalls berücksichtigt.

Die ursprünglichen PNG-Bytes werden aus Inline-Daten lokal oder über die im Bild sichtbare HTTP-/Blob-Adresse ausgelesen. Ein nicht zugänglicher Download führt zu einer konkreten Fehlermeldung. Es werden keine zusätzlichen Downloadadressen, Anmeldedaten oder privaten Endpunkte ermittelt. Die Diagnose nennt jetzt den Quelltyp und die Lage nach dem offenen Prompt, ohne Bildadressen oder Bilddaten auszugeben.

**Vorhandene Grafik in Schritt 5 weiterverwenden:** Dateien im bisherigen Erweiterungsordner ersetzen, die bestehende Erweiterung unter `chrome://extensions` neu laden und den ursprünglichen Chat mit F5 neu laden. Im Scanner dieselben Quelldateien auswählen und **Automatisch starten / fortsetzen** drücken. Der offene Schritt und sein bereits gesendeter Prompt bleiben erhalten. Nach erfolgreicher Grafikübernahme beginnt Schritt 6. Die neue Struktur wurde anhand der Diagnose simuliert; die Bestätigung im angemeldeten Chat steht aus.

## Version 0.1.10: Fertige Bildantworten in Schritt 5 und 7 übernehmen

Das bereitgestellte Bildelement enthält eine PNG direkt in `src="data:image/png;base64,…"` und ein `data-loaded`-Attribut. Der Klassenname `LoadingImage` bleibt auch an diesem fertigen Bild erhalten und wird deshalb nicht als Ladezustand verwendet.

Bei einem Grafikschritt wartet der Scanner jetzt auf die Ergebnisdatei, auch wenn der Begleittext schon fertig ist. Eine geladene, ausreichend große Inline-PNG nach dem eigenen offenen Scannerprompt kann auch ohne Antworttext und gewöhnliche Antwortknöpfe erkannt werden. Aktive Generierung, Ladezustände und die Stabilitätsprüfung bleiben berücksichtigt. Bereits vorhandene Bildquellen werden vor dem Senden durch lokale Fingerabdrücke erfasst; Nutzeranhänge, alte Bilder und mehrdeutige getrennte Bildbereiche werden bei dieser zusätzlichen Zuordnung ausgeschlossen. Die PNG wird lokal ausgelesen und bytegenau als Ergebnisdatei gespeichert, ohne erneute Bilderstellung oder Netzwerkdownload. Tatsächliche Downloadfehler werden vor der allgemeinen Meldung über eine fehlende Datei angezeigt.

**Bei Schritt 5 fortsetzen:** Dateien im bisherigen Erweiterungsordner ersetzen, die bestehende Erweiterung unter `chrome://extensions` neu laden und den ursprünglichen Chat mit F5 neu laden. Im Scanner dieselben Quelldateien auswählen und **Automatisch starten / fortsetzen** drücken. Der offene Schritt bleibt erhalten; sein Prompt wird nicht erneut gesendet. Nach erfolgreicher Übernahme der sichtbaren Grafik beginnt Schritt 6. Zusammengeklappte frühere Dokumente bei Bedarf öffnen, damit ihr Text im Chat geladen ist.

Die Prüfung mit dem gezeigten Bildelement-Format, verzögerter Bildfertigstellung, alten offenen Schritten und allen elf Schritten erfolgt in einer simulierten Browseroberfläche. Der Praxistest im angemeldeten Chat steht noch aus. Bei uneindeutiger Zuordnung bleibt der Schritt offen; die Diagnose enthält jetzt Bildmaße, Ladezustand und Strukturpfade, ohne Bilddaten oder Bildadressen.

## Version 0.1.9: Eingebettete Dokumente im Dojo auslesen

Die nächste Diagnose aus 0.1.8 zeigt zwei sichtbare editierbare Textfelder. Eines liegt im Dojo-Antwortbereich; dort gibt es außerdem einen Kopierknopf in einer Dokument-Kopfzeile. Die bisherige Antwortsuche brach vor jedem editierbaren Bereich ab, und die Feldsuche konnte Dokument und Chat-Eingabe nicht unterscheiden.

Version **0.1.9** ordnet ein eingebettetes Dokument anhand des bekannten Scannerprompts und der zugehörigen Antwortknöpfe zu. Der verfügbare Dokumenttext wird zusammen mit dem Begleittext ausgelesen und für spätere Schritte übergeben. Dazu werden nur lokale DOM-Kopien ausgewertet; der Dokumenteditor wird nicht beschrieben oder verändert. Ein Kopierknopf in einer Dokument-Kopfzeile zählt nicht als Antwortabschluss. Ladezustände und spätere Änderungen des Dokumenttexts fließen in die Abschlussprüfung ein.

Die Chat-Eingabe bleibt separat: Bereits erkannte Dokumenteditoren werden aus ihrer Suche ausgeschlossen; ein zuvor eindeutig verwendetes Chat-Eingabefeld bleibt bevorzugt. Beim Fortsetzen nach einem Neuladen werden die bekannten Prompts des Laufs erneut zugeordnet. Unabhängige, nicht zuordenbare Textfelder bleiben ein Fehler. Die Diagnose kennzeichnet zugeordnete Dokumentfelder mit `purpose: response-document`, ohne deren Text zu exportieren.

**Vorhandenes Dojo weiterverwenden:** Im bisherigen Erweiterungsordner aktualisieren, Erweiterung neu laden, den ursprünglichen Chat mit F5 neu laden, im Scanner dieselben Quelldateien wählen und **Automatisch starten / fortsetzen** drücken. Der offene Dojo-Schritt wird anhand der vorhandenen Antwort fortgesetzt, ohne seinen Prompt erneut zu senden. Nach erfolgreicher Erfassung soll Schritt 3 beginnen. Falls das Dojo nach F5 nur als zusammengeklappte Dokumentkarte erscheint, es vor dem Fortsetzen öffnen: Der Scanner liest den in der Seite geladenen Dokumenttext. Keine zusätzliche Bestätigung des Dojos erforderlich.

Die Rekonstruktion mit eingebetteten Dokumenten, erneutem Laden und mehreren Dokumenteditoren wurde simuliert. Die Überprüfung an der tatsächlich angemeldeten ChatGPT-Oberfläche steht noch aus.

## Version 0.1.8: Antworttext bei gemeinsamem Prompt-/Antwortcontainer erkennen

Die Diagnose aus 0.1.7 zeigt einen Antwortabsatz mit `data-d-component="text"` und `data-d-stream-word`-Wörtern. Die Antwortknöpfe liegen außerhalb dieses Textbereichs. Ihr erster gemeinsamer Container enthält auch den Nutzerprompt mit der Scanner-Markierung. Die bisherige Erkennung brach an dieser Markierung ab und blieb deshalb trotz fertiger Antwort im Wartestatus.

Version **0.1.8** ordnet den vollständigen, vom Prompt getrennten Antwortbereich den Knöpfen dieses gemeinsamen Containers zu. Der Antworttext wird einschließlich weiterer Absätze, Code und enthaltener Ergebnisdateien erfasst. Der Nutzerprompt und seine Anhänge werden dabei nicht als Antwort übernommen. Mehrdeutige Bereiche mit mehreren getrennten Antwort-Werkzeugleisten werden nicht ungeprüft zusammengefasst. Eine nachfolgende Antwort mit anderer Prompt-Zuordnung hält den Ablauf an. Laufende Generierung, Ladezustände, Bildfertigstellung und die Stabilitätsprüfung gelten weiterhin.

**Ein offener Schritt 1 wird fortgesetzt, ohne den ersten Prompt erneut zu senden.** Dafür Dateien im bisherigen Erweiterungsordner ersetzen, die Erweiterung unter `chrome://extensions` neu laden und den ursprünglichen Chat mit F5 neu laden. Im Scanner dieselben Quelldateien auswählen und **Automatisch starten / fortsetzen** drücken. Für den Regelablauf die OK-Antwort nicht zusätzlich bestätigen. „Oberfläche prüfen“ ist ein Knopf unter **Diagnose und manuelle Reparatur**, kein Auftrag an ChatGPT.

Der aus der tatsächlichen Diagnose rekonstruierte Aufbau wurde einschließlich aller elf Schritte erfolgreich simuliert. **Ein Live-Durchlauf an deinem angemeldeten ChatGPT-Konto steht weiterhin aus.** Die Strukturdiagnose aus 0.1.7 bleibt verfügbar: `replyStructure` erfasst Elternketten und gemeinsame Vorfahren mit lokalen Knotennummern, ohne Gesprächsinhalte, HTML, Klassen, Element-IDs oder Attributwerte zu exportieren. Sie liest die Seite nur und übermittelt nichts automatisch.

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
- `reuse` legt fest, auf welche früheren Original-Ergebnisdateien der Prompt mit Schrittnummer und Titel im selben Chat verweist. Standardmäßig werden dafür keine neuen Anhänge erzeugt. `resultTransfer: "attachments"` aktiviert bei Bedarf die frühere erneute Übergabe von Textabschriften und vorhandenen Originaldateien.
- Sichtbare Grafiken und direkt lesbare Dateilinks innerhalb der Antwort versucht die Erweiterung als Originaldateien zu übernehmen. Es werden nur sichtbare URLs gelesen; keine internen API-Endpunkte geraten, keine Zugangsdaten extrahiert und keine Downloads in beliebigen Windows-Ordnern überwacht.
- **Grenze:** Manche ChatGPT-Dateilinks, insbesondere `sandbox:`-Links, können nur durch die Oberfläche aufgelöst werden. Bilddateien können ebenfalls durch Zugriffsbeschränkungen unlesbar sein. In diesem Fall pausiert der Ablauf. Datei regulär aus ChatGPT herunterladen, im Panel unter **Ergebnisdateien ergänzen** dem offenen Schritt zuordnen und fortsetzen. Diese manuelle Ersatz-Zuordnung wird im Laufprotokoll festgehalten.
- Die Infografik-Schritte 5 und 7 gelten erst mit einer erkannten oder ausdrücklich ergänzten Datei als abgeschlossen. Die Prüfung bestätigt das Vorhandensein einer Datei, nicht ihre fachliche oder grafische Qualität.
- Schritt 9 lädt die Anleitung `META_PROMPT_0S_FINAL_V1.5.4_Druckkontext_Fiktives_Dojo_Gruppenfeld_Zonenlogik.md` hoch und verweist zusätzlich auf den vollständigen persönlichen Abschlussbericht aus Schritt 8.
- Das ZIP enthält die Textberichte, verfügbare Original-Ergebnisdateien und `lauf.json`. **Nicht enthalten:** die ursprünglichen Quelldateien. Fehlen nach einem Neuladen Binärdateien, werden sie im ZIP ausdrücklich als fehlend aufgelistet.

## Wann beginnt der nächste Schritt?

Es gibt keinen festen Timer für einen Scan. Die automatische Erkennung verlangt einen eindeutig markierten eigenen Nutzerprompt im Seiteninhalt, eine nachfolgende Assistentenantwort, ein erkanntes Abschluss-Bedienelement, keinen erkannten laufenden Generierungszustand und einen kurzzeitig stabilen Antwortinhalt. Für Bilder wird zusätzlich deren Ladezustand geprüft. Nachrichtensuche und Antwortprüfung haben jeweils eine Höchstgrenze von zwei Stunden. Diese Grenzen lösen keinen Folgeschritt aus. Uploads haben eine separate Grenze von drei Minuten. Bei ausdrücklich manuell übernommener Antwort bestätigt der Nutzer die Fertigstellung. Solche Oberflächensignale ersetzen keine offizielle Fertigstellungs-Schnittstelle und müssen im echten Chat erprobt werden.

Bei Pause kann ChatGPT weiterarbeiten; nur die Ablaufsteuerung wird unterbrochen. Beim Fortsetzen eines bereits gesendeten Schritts wird dessen Antwort gesucht, **nicht erneut gesendet**. Ist das Senden unklar, wird angehalten. Nicht ungeprüft einen neuen Lauf starten. Schlägt die Vorbereitung vor dem Senden fehl, müssen eventuell liegen gebliebene Anhänge und der vorbereitete Prompt zuerst aus dem Eingabefeld entfernt werden.

## Kontext und Dateien

**Ein einzelner Chat garantiert nicht, dass elf lange Arbeitsschritte gleichzeitig vollständig im Modellkontext liegen.** Kontextgrenzen, Dateiverarbeitung und Komprimierung hängen von Modell, Tarif und ChatGPT ab. Die Erweiterung kann diese Grenzen nicht messen, vergrößern oder umgehen. Die Folgeprompts fordern das Öffnen der früheren Originaldateien im Chat und das Benennen fehlender Zugriffe; ein Verweis garantiert deren fortdauernde Verfügbarkeit nicht. Die Erweiterung prüft keine Behauptung des LLMs, es habe „100 % gelesen“, und prüft nicht automatisch die Einhaltung sämtlicher Fachvorlagen oder der 5.000-Zeichen-Vorgabe.

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
