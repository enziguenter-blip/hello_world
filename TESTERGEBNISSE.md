# Prüfstand der Testversion

Stand: Version **0.1.13**, 29. Oktober 2026. Alle Ablaufprüfungen laufen gegen eine **simulierte Oberfläche**, nicht gegen ChatGPT oder ein LLM. Die Simulation verwendet eine abgefangene Testseite unter einer ChatGPT-URL, ohne eine Anmeldung oder Modellanfrage auszuführen. Das prüft die Browserbedienung, nicht die fachliche Auswertung oder die Erkennung der tatsächlichen aktuellen ChatGPT-Oberfläche.

## Erfolgreich geprüfte Funktionen

- Upload der vorgesehenen Dateien mit echten Browser-`File`-Objekten.
- Kein Folgeschritt, solange die Antwort noch generiert wird; auch dann nicht, wenn ein Abschlussknopf vorzeitig vorhanden ist.
- Kein Folgeschritt bei fehlendem Abschlussknopf.
- Erneute Übergabe des fertigen Antworttextes als Markdown-Datei und von direkt zugänglichen Bilddateien.
- Pause und Fortsetzen ohne erneutes Senden eines bereits gesendeten Prompts.
- Anhalten bei einem unlesbaren `sandbox:`-Dateilink und Fortsetzen mit ausdrücklich manuell zugeordneter Ersatzdatei.
- Anhalten bei veränderten Quellinhalten, fehlenden Dateien und mehrdeutigen Dateinamen.
- Anhalten, wenn eine zusätzliche manuelle Nachricht im gesteuerten Chat erkannt wird.
- Anhalten bei einer erkannten Fehlermeldung der Oberfläche.
- ZIP-Export mit Unicode-Dateinamen, korrekten Prüfsummen und binären Dateien.
- Bedienung des Panels vom Auswählen der Dateien bis zum heruntergeladenen Ergebnis-ZIP.
- Durchlauf der elf konfigurierten Schritte, einschließlich späterer Grafikdateien und getrennter Dateisätze je Schritt.

Zusätzliche Prüfungen für die gemeldete Eingabefeld-Störung:

- Fünf Editorvarianten: Textarea mit Testkennung, ProseMirror mit verborgenem altem Textfeld, ein Wrapper mit enthaltenem Editor, Lexical und eine Textarea ohne spezielle Feldkennung.
- Verzögertes Einblenden und Austausch des Editors nach dem Datei-Upload.
- Mehrere mögliche Editoren: kein Upload und kein Senden ohne eindeutige Zuordnung.
- Direkte Auswahl des richtigen Editors im Scanner-Panel bis zum Ergebnis-ZIP.
- Migration alter Standardselektoren bei Erhalt eigener Selektoren.
- Eingabebereich ohne `form`, dessen Senden-Knopf erst nach Texteingabe erscheint.
- Diagnoseausgabe ohne Gesprächstexte, Dateinamen und Gesprächs-ID.
- Anhalten auf einer Codex-Seite sowie verständlicher Hinweis bei komplett fehlendem Editor.
- Kein Senden, wenn der vorbereitete Prompt zwischenzeitlich verändert wurde.
- Keine Auswahl eines Editors innerhalb einer alten Assistentennachricht.

Zusätzliche Prüfungen für „gesendete Nachricht nicht erkannt“:

- Alternative Nachrichtenrollen, verschachtelte Rollen ohne Doppelzählung und ein ausgeblendeter Marker mit veränderten Zeilenumbrüchen/Trennzeichen.
- Laufende Generierung länger als das kurze Nachrichtenerkennungsfenster: kein vorzeitiger Abbruch.
- Erneut gerenderter Nutzerprompt während des Wartens auf die Antwort.
- Fortsetzen eines alten offenen Laufs mit zunächst gespeicherter Startseiten-URL: vorhandene Antwort wird übernommen, kein erneutes Senden.
- Manuelle Übernahme einer vorhandenen Antwort, gefolgt von Schritt 2; Schritt 1 wird nicht erneut gesendet.
- Bei noch laufender Generierung oder gescheiterter Speicherung bleibt der Schritt offen.
- Übernahme im Panel durch Anklicken einer fertigen Antwort, auch ohne automatische Erkennung des zugehörigen Nutzerprompts.
- Keine Verwechslung von Schritt 1 mit Schritt 11; fehlende Nutzerzuordnung führt nicht zum ungeprüften Fortschalten.

Zusätzliche Prüfungen für die verspätete Gesprächsadresse und die unklare Klickanweisung:

- Zuordnung von Startseite, GPT-Chat, Gesprächs-ID und normalem/GPT-Adressalias; keine Gleichsetzung verschiedener bestehender Gespräche oder verschiedener Hosts.
- ChatGPT erstellt die erste Gesprächsadresse während der Generierung: beide Schritte laufen durch, ohne den ersten zu wiederholen.
- Die Gesprächsadresse entsteht erst nach der Speicherung von Schritt 1: Schritt 2 wird korrekt gestartet.
- Ein echter Wechsel zwischen bestehenden Gesprächs-IDs hält den Ablauf weiterhin an.
- Eine fertige Antwort kann aus einer Vorschau im Panel bestätigt werden, ohne sie auf der Gesprächsseite anklicken zu müssen; es wird kein Prompt gesendet.
- Fortsetzen nach Schritt 1 mit noch gespeicherter Startseitenadresse, auch ohne offenen Schritt: nur Schritt 2 wird gesendet.

Zusätzliche Prüfungen für den automatischen Übergang ohne OK-Bestätigung:

- Die vom Nutzer zitierte OK-Antwort für Günter führt ohne erkannte Nutzer-Markierung automatisch zu Schritt 2; kein manuell übernommenes Ergebnis, kein erneutes Senden von Schritt 1 und kein Fortschalten während der Generierung.
- Bei der ausführlichen zusätzlichen Bestätigung starten ein falscher Name, eine falsche Dateianzahl und eine negative Lesbarkeitsmeldung keinen ungeprüften Folgeschritt. Das ausdrücklich verlangte bloße „OK“ wird seit 0.1.6 mit einer passenden neuen Antwort oder eindeutigen ersten Bestätigung akzeptiert; dazu gelten die unten genannten eigenen Prüfungen.
- Ein alter angehaltener erster Schritt lässt sich anhand der eindeutigen fertigen Bestätigung fortsetzen; nur Schritt 2 wird gesendet.
- Eine vor dem neuen Senden vorhandene OK-Antwort wird durch die gespeicherte Ausgangslage ausgeschlossen.
- Mehrdeutige alte Bestätigungen werden nicht automatisch ausgewählt.
- Der primäre automatische Start im Panel führt beide Schritte ohne Dialog und ohne Öffnen der manuellen Werkzeuge aus.

Zusätzliche Prüfungen anhand der echten Diagnose aus Version 0.1.4:

- Eine Testoberfläche ohne Nachrichtenrollen, `conversation-turn`-Kennungen oder Markdown-Klassen und mit zwei kennungslosen Textboxen (eine verborgen) führt beide Schritte automatisch aus. Die Diagnose hat weiterhin dieselben Null-Zähler für alte Kennungen, erkennt aber beide Antwortbereiche.
- Während der ersten Generierung wechseln die Adressen Startseite → vorläufiges Gespräch → Startseite → endgültiges Gespräch. Beide Schritte werden abgeschlossen und der erste Prompt wird nicht wiederholt.
- Schreibgeschützte Nachrichten und Abschlussaktionen mit „Copy response“ bzw. „Antwort kopieren“ werden verarbeitet; die eigene Schrittmarkierung bzw. die genaue OK-Bestätigung ordnet die Antwort zu.
- Eine Diagnose des tatsächlich abgewiesenen Adresswechsels enthält weder Gesprächs-IDs noch Projekt-/Abfrage-/Fragmentwerte.
- Ein gespeicherter offener erster Schritt behält während des Fortsetzens seinen ursprünglichen Startseiten-Bezugspunkt und wird ohne Wiederholung übernommen.

Zusätzliche Prüfungen anhand „OK sichtbar, Antwortbereich nicht erkannt“:

- Ein Antworttext aus nur zwei Zeichen in einem `span`, ohne Nachrichtenkennungen oder Absatzstruktur, wird bei ausgeblendeten Antwortaktionen erkannt. Schritt 2 beginnt nach Ende der Generierung automatisch, ohne manuelle Übernahme.
- Ein neues bloßes „OK“ kann auch bei nicht dargestellter Nutzer-Markierung als erwartete erste Protokollantwort zugeordnet werden.
- Ein bereits vor dem Senden vorhandenes „OK“ bleibt von der neuen Anfrage ausgeschlossen.
- Die Diagnose kann während der Generierung ohne Pause geöffnet werden. Der Fortschritt bleibt unverändert, und der automatische Ablauf schließt anschließend ab.
- Eine bloße OK-Antwort ohne erkanntes Abschluss-Signal startet keinen Folgeschritt.

Zusätzliche Strukturdiagnose in Version 0.1.7:

- Der tatsächlich gelieferte Absatz `<p class="TextBase-qM5iDq Text-nubxrT" data-d-text-flow="" data-d-component="text"><span data-d-text-flow="word" data-d-stream-word="">OK</span></p>` wird unverändert in zwei Testanordnungen verwendet. Die Strukturdiagnose unterscheidet einen gemeinsamen Antwortcontainer von getrennten Ästen für Text und Knöpfe über lokale Knotennummern.
- Der neue Strukturbericht exportiert keine Gesprächs-/Eingabetexte, Dateinamen, HTML, Element-IDs, Klassen oder Attributwerte. Sie verändert weder Seiten-HTML noch den gespeicherten Lauf und sendet keine Nachricht.
- **Die Antworterkennung wurde in 0.1.7 nicht geändert.** In der getrennten Testanordnung bleibt der Fehler reproduzierbar. Die Diagnose soll zunächst die tatsächlichen übergeordneten Container sichtbar machen; eine Reparatur oder ein erfolgreicher Live-Durchlauf wird damit nicht behauptet.

Gezielte Reparatur in Version 0.1.8 anhand der echten Strukturdiagnose:

- Der Antwortabsatz hat 13 gestreamte Wörter und neun übergeordnete Antwortcontainer, darunter einen `display: contents`-Container. Auf Textebene 10 ist der Nutzerprompt enthalten; Textebene 11 ist der gemeinsame Vorfahr der Antwort und zweier Knöpfe in einem getrennten Werkzeugzweig. Ein neuer Test scheiterte mit 0.1.7 reproduzierbar am Antworttimeout und besteht mit der getrennten Text-/Aktionszuordnung.
- Die tatsächliche Bestätigung „OK. Alle sechs Dateien sind vollständig lesbar. Zielperson für den folgenden Ablauf: Günter.“ startet Schritt 2 ohne manuelle Bestätigung; Ergebnistext enthält weder den Prompt noch die Knopfbeschriftungen.
- Ein bereits gesendeter offener Schritt wird mit einer neu erstellten Adapterinstanz fortgesetzt. Der erste Prompt wird nicht erneut gesendet.
- Weitere Antwortabsätze, Überschriften, Code und ein Bild werden vollständig erfasst und an den nächsten Schritt übergeben.
- Mehrere unabhängige Werkzeugzweige in einem gemeinsamen Bereich werden nicht zu einer Antwort zusammengefasst.
- Bei noch laufender Generierung oder fehlenden Abschlussknöpfen wird weiterhin nicht fortgeschaltet.
- Alle elf konfigurierten Schritte mit gestaffelten Dateien und Bildern in Schritt 5 und 7 laufen in diesem rekonstruierten Aufbau durch. Der nächste Prompt startet jeweils erst nach dem simulierten Generierungsende.
- Eine spätere Antwort auf einen anderen Scannerprompt oder eine manuelle Anfrage ersetzt die Antwort des offenen Schritts nicht. Der Ablauf hält stattdessen an.

Zusätzliche Prüfungen für das eingebettete Dojo-Dokument in Version 0.1.9:

- Aus der tatsächlichen Diagnose wird ein zweites sichtbares editierbares Textfeld im Antwortbereich samt Dokument-Kopfzeile und eigenem Kopierknopf rekonstruiert. Der neue Test scheiterte vor der Änderung am Antworttimeout. Danach wird der vollständige Dokumentinhalt samt Begleittext für Schritt 3 übergeben, auch bei Markdown im Begleittext.
- Die Steuerung schreibt den nächsten Prompt ausschließlich in die Chat-Eingabe. Keine Eingabeereignisse im Dokumenteditor, dessen vorhandener Inhalt bleibt erhalten.
- Ein offener Dojo-Schritt und ein bereits gespeichertes Dojo lassen sich mit neuem Adapter und ausgetauschtem Chat-Eingabefeld fortsetzen. Kein erneutes Senden von Schritt 1 oder 2. Die Diagnose unterscheidet das Dokumentfeld von der Eingabe und exportiert keinen Dokumenttext.
- Ein noch ladendes Dokument mit späterem Schlussteil wird erst nach dessen Fertigstellung übernommen; Schritt 3 erhält auch den Schlussteil.
- Mehrere Absätze des Nutzerprompts mit denselben Textfluss-Merkmalen werden nicht in das Dojo-Ergebnis übernommen.
- Ein Kopierknopf allein in der Dokument-Kopfzeile startet ohne Antwortabschluss-Knöpfe keinen Folgeschritt.
- Auch ein Dokument innerhalb einer zusätzlich semantisch gekennzeichneten Assistentennachricht wird den außerhalb liegenden Antwortknöpfen zugeordnet.
- Alle elf Schritte laufen mit vier eingebetteten Dokumenteditoren und Bildern durch. Frühere Dokumente werden in späteren Schritten wiederverwendet; alle Dokumenteditoren bleiben von den Eingaben der Steuerung unberührt.

Zusätzliche Prüfungen für die Grafikübernahme in Version 0.1.10:

- Eine Grafik erscheint erst nach dem Generierungsende des Begleittextes. Der Folgeschritt wartet auf die Bilddatei. Dieser Test scheiterte vor der Änderung an der gemeldeten allgemeinen Fehlermeldung.
- Ein Downloadfehler mit HTTP 403 bleibt sichtbar und wird nicht durch die allgemeine Meldung über eine fehlende Grafik verdeckt. Auch dieser Test scheiterte vor der Änderung.
- Eine Bildantwort ohne normalen Antworttext oder Antwortknöpfe verwendet das vom Nutzer gezeigte HTML-Format: `img`, Inline-PNG, `data-loaded` und weiterhin vorhandene `LoadingImage`-Klasse. Die lokalen PNG-Bytes werden bei absichtlich gesperrtem `fetch` exakt übernommen und dem nächsten Schritt übergeben. Die Testgrafik enthält keine privaten Bildinhalte.
- Ein alter offener Bildschritt ohne gespeicherte Bild-Fingerabdrücke wird mit neuem Adapter fortgesetzt. Bereits gesendete Prompts werden nicht wiederholt.
- Alte Grafiken, eine Beispielgrafik hinter dem Marker im Nutzerbereich und eine schon vor dem Senden vorhandene Bildvorschau beenden den Bildschritt nicht.
- Die Bilddiagnose enthält Maße, Ladezustand und Strukturpfade, keine Bilddaten, Bildadressen oder Alt-Texte.
- Alle elf Schritte laufen mit vier Dokumenteditoren sowie verzögerten reinen Inline-Bildantworten in Schritt 5 und 7 durch. Schritt 8 erhält beide PNG-Dateien und die früheren Dokumenttexte; die Dokumenteditoren bleiben unbeschrieben.
- Eine nach einem Dateifehler ausdrücklich zugeordnete Ersatzgrafik erhält beim Fortsetzen die Erkennung der reinen Bildantwort. Der Prompt wird nicht erneut gesendet. Zwei voneinander getrennte Bildbereiche werden nicht durch Auswahl des letzten Bildes aufgelöst.

Zusätzliche Prüfungen anhand der Grafikdiagnose aus Version 0.1.10:

- Eine geladene PNG mit 1536 × 1024 Pixeln innerhalb einer Bildschaltfläche ohne `data-loaded`, Begleittext oder gewöhnliche Antwortknöpfe wird über ihre sichtbare HTTP-Adresse erfasst. Die Originalbytes werden exakt verglichen. Der Test scheiterte vor der Änderung am Antworttimeout.
- Ein gemeinsamer Verlauf enthält einen früheren Dokumenteditor mit Kopierknopf. Der aktuelle Prompt hat keinen Kopierknopf; seine Beispielgrafik liegt im Nutzerzweig, die neue Grafik daneben im Antwortzweig. Die Suche dehnt den Promptbereich nicht auf den ganzen Verlauf aus. Auch dieser Test scheiterte vor der Änderung.
- Derselbe Aufbau wird mit einer neuen Adapterinstanz und einem alten offenen Schritt ohne gespeicherte Bild-Fingerabdrücke fortgesetzt. Der Prompt wird nicht erneut gesendet. Dieser Test scheiterte ebenfalls vor der Änderung.
- Das Bild ist sichtbar geladen, sein anschließender Dateizugriff liefert jedoch HTTP 403: Der Fehler wird gemeldet, der Schritt bleibt offen und der Prompt wird nicht wiederholt.
- Eine Blob-Bildquelle ohne `data-loaded` wird erfasst und an den Folgeschritt übergeben.
- Ein direkt am Bild-Antwortbereich markierter Ladezustand verzögert den Folgeschritt bis zu seinem Ende.
- Eine große Beispielgrafik ohne `data-loaded` hinter der Promptmarkierung wird ohne passende Bildantwort nicht als Ergebnis übernommen.

Zusätzliche Prüfungen gegen den vorzeitigen Wechsel nach dem ersten Bild:

- Zuerst wird ein Bild geladen, danach endet das Stoppsignal. Später erscheint eine korrigierte Grafik in einem weiteren Zweig derselben Antwort; erst danach werden die Abschlussknöpfe angezeigt. Der nächste Prompt wartet auf diese Knöpfe. Dieser Test scheiterte mit 0.1.11, weil der Folgeprompt vor der Korrektur gesendet wurde.
- Die gespeicherten PNG-Bytes entsprechen exakt der zweiten, korrigierten Grafik. Nur diese eine Datei wird für spätere Schritte gespeichert. Auch dieser Test scheiterte vor der Änderung: Es war die erste Grafik gespeichert.
- Ein geladenes Bild ohne abschließende Antwortaktionen bleibt offen. Vor der Änderung schaltete dieser Test trotz fehlender Knöpfe weiter.
- Ein sichtbarer Kopierknopf innerhalb des Bildwidgets zählt nicht als abschließende Antwortaktion.
- Im Panel lässt sich eine zu früh gespeicherte Grafik mit anderem Dateinamen ausdrücklich ersetzen. Der bereits offene Folgeschritt bleibt erhalten, es wird kein Prompt gesendet, und das ZIP enthält nur die korrigierte Datei dieses Schritts.
- Die älteren Tests mit reinen Bildantworten erhalten jetzt zusätzlich verzögert eingeblendete Abschlussaktionen. Bildfertigstellung allein ist seit 0.1.12 kein zulässiges Abschlusssignal mehr.

Zusätzliche Prüfungen anhand der vollständig bereitgestellten Schaltfläche:

- Der tatsächliche zugängliche Name „Bild kopieren“ mit dem bereitgestellten Kopier-SVG ist der einzige Abschlussknopf der Bildantwort. Erst nach seinem Erscheinen wird fortgeschaltet; nach einer Korrektur stimmen die gespeicherten Bytes mit der zweiten Grafik überein. Dieser Test scheiterte vor der Änderung am Antworttimeout.
- Der bestätigte Bild-Abschlussknopf liegt innerhalb eines Bildwidgets und wird dort erkannt. Ein gewöhnlicher Vorschau-Kopierknopf bleibt durch den bestehenden Test 90 ausgeschlossen. Der neue Test scheiterte ebenfalls vor der Änderung.
- Ein deaktivierter „Bild kopieren“-Knopf hält den Folgeschritt zurück, bis er aktiviert wird. Auch dieser Test scheiterte vor der Änderung.
- Ein gleich beschrifteter Knopf im Nutzerprompt zählt nicht als Antwortabschluss.
- Eine bereits fertige Bildantwort mit „Bild kopieren“ wird mit neuer Adapterinstanz fortgesetzt, ohne den offenen Prompt erneut zu senden. Dieser Test scheiterte vor der Änderung.
- Alte Selektorkonfigurationen ohne `imageCompletion` übernehmen den neuen Standard. Die Diagnose weist genau eine Bild-Abschlussaktion und deren Strukturpfad aus, ohne SVG-Pfade, Bilddaten oder Bildadressen zu exportieren.

Die Gesamtprüfung deckt **97 Tests ab: 96 bestanden, 1 übersprungen**. Mehrere Tests prüfen zusätzliche Varianten. Der übersprungene Test betrifft die tatsächliche Installation als Chrome-Erweiterung in dieser Cloud.

## Nicht verifiziert / externe Grenzen

- **Installation als Browser-Erweiterung:** Der Chromium-Browser der Cloud meldet beim Laden entpackter Erweiterungen: „Loading of unpacked extensions is disabled by the administrator.“ Diese Richtlinie wurde nicht umgangen. Panel und Steuerung wurden als lokal eingebundene Skripte funktional geprüft; das ist kein Ersatz für die Installation und den Test in einem echten Erweiterungskontext.
- **Firefox:** Hier nicht installiert. Die offiziellen Downloadserver für den Playwright-Firefox-Testbrowser wurden mit HTTP 403 „Domain forbidden“ gesperrt. Deshalb kein ausgeführter Firefox-Test. Ein Firefox-Manifest und ein temporär ladbares Paket sind vorbereitet.
- **Windows 10:** Kein Windows-Rechner in dieser Cloud. Die lokale Installation muss dort geprüft werden.
- **Echtes ChatGPT-Konto:** Kein angemeldetes Benutzerkonto und keine echten Fachquellen vorhanden. Selektoren, Upload-Bestätigung, Abschluss-Erkennung, Grafikgenerierung, Zugriffe auf originale Downloadlinks und ein vollständiger fachlicher Durchlauf sind dort noch zu erproben. Änderungen der Oberfläche können Anpassungen erfordern.
- **Fachliche Qualität und Kontext:** Keine Prüfung, dass ein Modell alle Quellen vollständig liest, spätere Berichte korrekt erstellt oder der gesamte Verlauf im aktiven Kontext liegt. Die Automatisierung kann dies nicht garantieren.

## Nächster Praxistest

Version **0.1.13** im bisherigen Erweiterungsordner installieren, die bestehende Erweiterung neu laden und den ursprünglichen Chat mit F5 neu laden. Einen noch offenen Bildschritt nach dem Erscheinen des bestätigten „Bild kopieren“-Knopfs automatisch übernehmen lassen. Wurde Schritt 5 bereits zu früh gespeichert, die endgültige Grafik aus ChatGPT herunterladen, unter „Ergebnisdateien ergänzen“ Schritt 5 auswählen und mit aktivierter Option „Bisherige Ergebnisdateien dieses Schritts ersetzen“ zuordnen. Danach mit denselben Quelldateien den vorhandenen Lauf fortsetzen. Gesendete Prompts werden nicht erneut gesendet; der Fortschritt wird nicht zurückgesetzt.

Ein vollständiger Live-Durchlauf sowie insbesondere die Bild- und Downloadfunktionen in Schritt 5 und 7 bleiben an der echten Oberfläche zu erproben.
