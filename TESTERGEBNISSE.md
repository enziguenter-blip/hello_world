# Prüfstand der Testversion

Stand: Version **0.1.2**, 23. Oktober 2026. Alle Ablaufprüfungen laufen gegen eine **simulierte Oberfläche**, nicht gegen ChatGPT oder ein LLM. Die Simulation verwendet eine abgefangene Testseite unter einer ChatGPT-URL, ohne eine Anmeldung oder Modellanfrage auszuführen. Das prüft die Browserbedienung, nicht die fachliche Auswertung oder die Erkennung der tatsächlichen aktuellen ChatGPT-Oberfläche.

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

Der vollständige Testlauf besteht aus **32 Tests: 31 bestanden, 1 übersprungen**; zwei Tests prüfen mehrere Editor- bzw. Nachrichtenvarianten. Der übersprungene Test betrifft die tatsächliche Installation als Chrome-Erweiterung in dieser Cloud.

## Nicht verifiziert / externe Grenzen

- **Installation als Browser-Erweiterung:** Der Chromium-Browser der Cloud meldet beim Laden entpackter Erweiterungen: „Loading of unpacked extensions is disabled by the administrator.“ Diese Richtlinie wurde nicht umgangen. Panel und Steuerung wurden als lokal eingebundene Skripte funktional geprüft; das ist kein Ersatz für die Installation und den Test in einem echten Erweiterungskontext.
- **Firefox:** Hier nicht installiert. Die offiziellen Downloadserver für den Playwright-Firefox-Testbrowser wurden mit HTTP 403 „Domain forbidden“ gesperrt. Deshalb kein ausgeführter Firefox-Test. Ein Firefox-Manifest und ein temporär ladbares Paket sind vorbereitet.
- **Windows 10:** Kein Windows-Rechner in dieser Cloud. Die lokale Installation muss dort geprüft werden.
- **Echtes ChatGPT-Konto:** Kein angemeldetes Benutzerkonto und keine echten Fachquellen vorhanden. Selektoren, Upload-Bestätigung, Abschluss-Erkennung, Grafikgenerierung, Zugriffe auf originale Downloadlinks und ein vollständiger fachlicher Durchlauf sind dort noch zu erproben. Änderungen der Oberfläche können Anpassungen erfordern.
- **Fachliche Qualität und Kontext:** Keine Prüfung, dass ein Modell alle Quellen vollständig liest, spätere Berichte korrekt erstellt oder der gesamte Verlauf im aktiven Kontext liegt. Die Automatisierung kann dies nicht garantieren.

## Nächster Praxistest

Unter Windows die Erweiterung lokal laden und nur **Nächsten Schritt testen** verwenden. Dabei Anhänge, Prompt, genau einmaliges Senden, Antwort und den gespeicherten Textbericht kontrollieren. Erst anschließend weitere Schritte starten. Insbesondere Schritt 5 und 7 müssen mit den tatsächlichen Bild- und Downloadfunktionen des gewählten ChatGPT-Modells erprobt werden. Die Testversion ist noch keine als vollständig unbeaufsichtigt verifizierte Lösung.
