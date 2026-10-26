# Prüfstand der Testversion

Stand: Version **0.1.7**, 26. Oktober 2026. Alle Ablaufprüfungen laufen gegen eine **simulierte Oberfläche**, nicht gegen ChatGPT oder ein LLM. Die Simulation verwendet eine abgefangene Testseite unter einer ChatGPT-URL, ohne eine Anmeldung oder Modellanfrage auszuführen. Das prüft die Browserbedienung, nicht die fachliche Auswertung oder die Erkennung der tatsächlichen aktuellen ChatGPT-Oberfläche.

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

Der vollständige Testlauf besteht aus **55 Tests: 54 bestanden, 1 übersprungen**; mehrere Tests prüfen zusätzliche Varianten. Der übersprungene Test betrifft die tatsächliche Installation als Chrome-Erweiterung in dieser Cloud.

## Nicht verifiziert / externe Grenzen

- **Installation als Browser-Erweiterung:** Der Chromium-Browser der Cloud meldet beim Laden entpackter Erweiterungen: „Loading of unpacked extensions is disabled by the administrator.“ Diese Richtlinie wurde nicht umgangen. Panel und Steuerung wurden als lokal eingebundene Skripte funktional geprüft; das ist kein Ersatz für die Installation und den Test in einem echten Erweiterungskontext.
- **Firefox:** Hier nicht installiert. Die offiziellen Downloadserver für den Playwright-Firefox-Testbrowser wurden mit HTTP 403 „Domain forbidden“ gesperrt. Deshalb kein ausgeführter Firefox-Test. Ein Firefox-Manifest und ein temporär ladbares Paket sind vorbereitet.
- **Windows 10:** Kein Windows-Rechner in dieser Cloud. Die lokale Installation muss dort geprüft werden.
- **Echtes ChatGPT-Konto:** Kein angemeldetes Benutzerkonto und keine echten Fachquellen vorhanden. Selektoren, Upload-Bestätigung, Abschluss-Erkennung, Grafikgenerierung, Zugriffe auf originale Downloadlinks und ein vollständiger fachlicher Durchlauf sind dort noch zu erproben. Änderungen der Oberfläche können Anpassungen erfordern.
- **Fachliche Qualität und Kontext:** Keine Prüfung, dass ein Modell alle Quellen vollständig liest, spätere Berichte korrekt erstellt oder der gesamte Verlauf im aktiven Kontext liegt. Die Automatisierung kann dies nicht garantieren.

## Nächster Praxistest

Im ursprünglichen Chat mit sichtbarer fertiger OK-Antwort und Version **0.1.7** unter **Diagnose und manuelle Reparatur → Oberfläche prüfen** den vollständigen Diagnosetext einschließlich `replyStructure` erfassen. Keine HTML-Elemente von Hand auswählen und den ersten Prompt nicht erneut senden. Diese Diagnose erfordert keine Quelldateiauswahl und startet den Ablauf nicht. Erst anhand dieser Struktur soll die weiterhin offene Antwortzuordnung gezielt repariert werden.

Ein vollständiger automatischer Durchlauf sowie insbesondere die Bild- und Downloadfunktionen in Schritt 5 und 7 sind weiterhin an der echten Oberfläche zu erproben.
