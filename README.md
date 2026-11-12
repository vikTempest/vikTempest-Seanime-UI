# VikTempest Seanime UI

Eine Erweiterung für Seanime mit allem drin:

- **Season Switcher:** Staffeln wie eine Serie: eine Karte pro Serie mit deinem Stand, Staffel-Dropdown über der Folgenliste, alle Staffeln in einer Folgenliste, nächste Staffel unter „Continue watching“
- **AniList Custom Ratings:** Bewertungskategorien und Custom Lists
- **Theme:** schwarzer Netflix-Look in Rot, Lila, Blau oder deinen eigenen Farben
- **Extras:** Bildschirmschoner, Schlaftimer, Schnellsuche (Strg+K), Hinweis auf neue Staffeln, Filler abdunkeln, Rechtsklick auf Folgen, Bewerten nach der letzten Folge, danach direkt zur nächsten Staffel, Weiterschauen mit einem Klick, nochmal geschaute Anime in „Weiterschauen“
- **Seitenleiste:** einfahren lassen und Einträge ausblenden

Sprachen: Deutsch, English, Español, Português, 日本語

## Installation

In Seanime unter **Extensions** auf „Add extensions“ klicken und unter „Install from URL“ diesen Link einfügen:

```
https://raw.githubusercontent.com/vikTempest/vikTempest-Seanime-UI/main/viktempest-ui.json
```

Danach die Erweiterung aktivieren und die Berechtigungen bestätigen (AniList, AniList-Token, Datenbank, Wiedergabe, Einstellungen, Speicher). „Wiedergabe“ braucht der Schlaftimer zum Pausieren und der Bildschirmschoner, damit er nie über einem laufenden Video erscheint..

Beim ersten Start passieren zwei Dinge:

1. Ein kurzer Hinweis zeigt, wo du das **Farbschema** wählst: auf der Seite „VikTempest Seanime UI“, ganz oben unter „Theme“. Ein Klick ändert die Farben sofort. (Früher kam dafür ein Fenster, das Seanime direkt nach der Installation einfrieren konnte.)
2. Seanime fragt einmal, ob die Erweiterung die „Default episode source“ auf ihren Folgen-Tab setzen darf. Erlaubst du das, öffnet jede Anime-Seite direkt mit der Folgenliste.

**Umstieg von den einzelnen Plugins:** Deinstalliere unter **Extensions** vorher **Season Switcher** und **AniList Custom Ratings**, sonst läuft alles doppelt. Den einzelnen Season Switcher (`season-switcher.json`) gibt es nicht mehr. Hast du das Netflix-Theme unter Einstellungen → User Interface → CSS eingefügt, leere dort die Felder. Deine Bewertungen und Listen liegen auf AniList und bleiben erhalten.

## Einstellungen

Alle Einstellungen stehen auf einer eigenen Seite. So kommst du hin:

- oben in der Leiste auf das Symbol der Erweiterung klicken und dann auf **„Einstellungen öffnen“**, oder
- in der linken Seitenleiste von Seanime auf **„VikTempest Seanime UI“** klicken. Direkt nach der Installation erscheint dieser Eintrag erst, wenn du die Seite einmal neu lädst (Strg+R).

- **Theme:** Aus, Rot, Lila, Blau oder Eigene (Akzent- und Hintergrundfarbe frei wählbar). Wirkt sofort, ohne Speichern.
- **Allgemein:** Sprache und jeden Teil einzeln an/aus
- **Season Switcher:** Titel-Sprache, wo das Dropdown steht, alle Staffeln in einer Folgenliste, Serie öffnet deine Staffel, nächste Staffel unter „Continue watching“, Filme/OVAs im Dropdown, Fortschritt im Dropdown, Staffeln zusammenfassen, welche Karte pro Serie, Abzeichen „X Staffeln“, Folgenliste statt Sofort-Stream, Folge anklicken startet Stream
- **Seitenleiste:** einfahren (nur ein schmaler Rand bleibt, mit der Maus fährt sie heraus) und einzelne Einträge ausblenden, z. B. Manga, Torrent-Liste oder die Suche (die gibt es auch oben und mit Strg+K). Wirkt sofort.
- **AniList Custom Ratings:** Schrittweite der Pfeiltasten
- **Extras:** Bildschirmschoner an/aus und nach wie vielen Minuten, Hinweis auf neue Staffeln, Filler-Folgen (normal, abdunkeln, ausblenden), Bewerten nach der letzten Folge, danach zur nächsten Staffel, Weiterschauen, nochmal geschaute Anime in „Weiterschauen“, Rechtsklick-Menü, Schnellsuche, Suche in Discover (Alpha, standardmäßig aus: Suchfeld mit Filtern oben auf der Discover-Seite)

Die meisten Einstellungen gelten sofort nach dem Speichern, spätestens beim nächsten Seitenwechsel. Nur die mit „nach Neustart“ markierten (Sprache, Teile an/aus, Folgenliste) brauchen einen Neustart von Seanime, weil sich ein Plugin nicht selbst neu laden kann. „Auf Standard zurücksetzen“ stellt alles auf den Anfang.

**Sichern und laden:** „Exportieren“ schreibt alle Einstellungen als Text in das Feld darunter (und in die Zwischenablage). Heb den Text auf, bevor du die Erweiterung deinstallierst, denn Seanime löscht dabei alle ihre Einstellungen. Nach dem Neuinstallieren den Text einfügen und „Importieren“ drücken.

Unter **Status** siehst du, ob die Erweiterung die Teile von Seanime findet, mit denen sie arbeitet. Steht dort nach einem Seanime-Update „noch nicht gesehen“, obwohl du die passende Seite geöffnet hast, hat das Update etwas verändert.

## Season Switcher

**Startseite:** Jede Serie erscheint nur noch einmal. Liegen z. B. Staffel 1 und Staffel 2 im selben Bereich (etwa „Currently watching“ oder „Completed“), bleibt nur eine Karte stehen. Bei „Continue watching“ bleibt die früheste Staffel, also die, bei der du gerade bist. Stehen die Staffeln in verschiedenen Bereichen (Staffel 1 bei „Completed“, Staffel 2 bei „Watching“), bleiben beide sichtbar.

Das gilt auch für die anderen Zeilen der Startseite, z. B. Genre-Zeilen wie „Romance“, und für „My lists“. Die Karte zeigt immer die erste Staffel (Titel, Jahr, Bild). Ein Klick öffnet die Staffel, bei der du gerade bist: die, die du schaust, oder die nächste nach der letzten fertigen. Hat eine Serie mehrere Staffeln, steht oben links auf der Karte ein kleines Abzeichen mit deinem Stand, z. B. „3 Staffeln · S2 5/12“ oder „3 Staffeln ✓“, wenn du alle fertig hast.

**Nächste Staffel unter „Continue watching“:** Hast du eine Staffel in den letzten 60 Tagen fertig geschaut und die nächste ist schon draußen, aber noch nicht angefangen, steht ihre erste Folge unter „Continue watching“. Sobald du sie schaust, trägt Seanime sie wie gewohnt als „Watching“ ein.

**Anime-Seite:** Unter den Knöpfen, direkt über der Folgenliste, steht ein Dropdown **„Staffel“** mit allen Staffeln der Reihe (in den Einstellungen auch wieder unter dem Titel möglich). Wählst du eine aus, springt Seanime auf ihre Seite. Im Dropdown siehst du deinen Stand: „✓“ vor fertigen Staffeln, „5/12“ hinter angefangenen und „nicht auf deiner Liste“ bei Staffeln, die du noch nicht eingetragen hast.

**Folgenliste:** Klickst du auf eine Serie, öffnet sich die Seite mit Infos und allen Folgen, statt sofort einen Stream zu laden. Über der Liste steht unter „Weiterschauen“ die Folge, bei der du aufgehört hast. Erst ein Klick auf eine Folge startet den Online-Stream genau dieser Folge. Dafür lädt die Seite einmal kurz neu, weil Seanime die Ansicht nur beim Öffnen einer Seite wählt. Über den Knopf „Folgenübersicht“ beim Stream kommst du zurück zur Folgenliste.

Die nächste Folge trägt „▶ Weiterschauen“, gesehene Folgen „✓ Gesehen“ und die zuletzt angefangene einen Fortschrittsbalken.

**Alle Staffeln in einer Folgenliste:** Die Folgenliste zeigt alle Staffeln der Serie untereinander, also „Staffel 1 · Episode 1“ bis „Staffel 3 · Episode 12“, egal auf welcher Staffel-Seite du bist. Ein Klick startet die Folge der richtigen Staffel, und AniList zählt sie auch dort. „✓ Gesehen“ kommt für jede Staffel aus deiner Liste, „▶ Weiterschauen“ steht nur in der Staffel, bei der du gerade bist. Ist die Liste lang, blättert Seanime sie in Seiten; die Folge zum Weiterschauen steht dann trotzdem oben unter „Weiterschauen“. Filme und OVAs kommen nur dazu, wenn du sie im Dropdown anzeigen lässt.

Die Erweiterung ist auf **Online-Streaming** ausgelegt. Willst du Seanime so, wie es ohne diese Optimierung ist (z. B. für Debrid oder Torrent), stell „Anime-Seiten mit Folgenliste öffnen“ und „Folge anklicken startet Online-Stream“ auf „Nein“.

Deine Listen bleiben unverändert: Jede Staffel bleibt auf AniList ein eigener Eintrag.

### Wie die Staffeln gefunden werden

Die Erweiterung folgt auf AniList den Verknüpfungen „Prequel“ und „Sequel“ und sortiert alles nach Startdatum. Als Staffel zählen TV-Serien, Kurzserien und ONAs. Filme, OVAs und Specials werden mit durchlaufen (damit ein Film zwischen zwei Staffeln die Kette nicht unterbricht), aber nur angezeigt, wenn du das einschaltest. Gibt es nur eine Staffel, erscheint kein Dropdown.

### AniList-Limit

AniList erlaubt nur 30 Anfragen pro Minute, und Seanime braucht die meisten davon selbst (vor allem direkt nach dem Öffnen einer Seite). Die Erweiterung hält sich deshalb stark zurück:

- Alle Teile teilen sich einen Speicher, der Neustarts übersteht: fertige Anime einen Monat, laufende drei Tage. Ältere Kopien werden weiter benutzt und nur erneuert, wenn AniList Luft hat.
- Höchstens 6 eigene Anfragen pro Minute, mit mindestens 5 Sekunden Abstand, und keine Hintergrund-Anfragen in den ersten 8 Sekunden nach dem Öffnen einer Seite.
- Musste eine Anfrage auf AniList warten oder kam „too many requests“, macht die ganze Erweiterung eine Pause (1 Minute, bei Wiederholung länger, bis 10 Minuten).
- Das Staffel-Dropdown lädt dann von selbst nach, sobald wieder Platz ist.

## Extras

**Bildschirmschoner:** Machst du eine Weile nichts (Standard 5 Minuten), zeigt Seanime die Anime aus dem großen Banner der Startseite (gerade beliebt auf AniList) bildschirmfüllend mit Titel, Beschreibung und Uhr. Mit „Ansehen“ öffnest du den gezeigten Anime, mit dem Knopf unten in der Mitte (oder Esc) kommst du zurück. Während ein Video läuft, kommt er nie. Ist AniList nicht erreichbar, zeigt er Anime von deiner Liste.

**Symbol oben:** Neben „Einstellungen öffnen“ und den Custom-Ratings-Infos stehen dort der **Schlaftimer** (15, 30, 60 Minuten oder „Nach dieser Folge“, danach pausiert der Player), **Weiterschauen** (deine drei zuletzt geschauten Anime, ein Klick startet die nächste Folge), die Schnellsuche und die neuen Staffeln.

**Nochmal schauen in „Weiterschauen“:** Schaust du einen Anime nochmal, der auf deiner Liste schon „Completed“ ist, steht er auf der Startseite trotzdem unter „Weiterschauen“, z. B. *Food Wars* Staffel 3 bei Folge 12. Hast du die Folge zu Ende geschaut, steht dort die nächste, sonst dieselbe mit Fortschrittsbalken. Pro Serie gibt es nur eine Karte: Schaust du mehrere Staffeln nochmal, steht dort die zuletzt geschaute. Steht eine andere Staffel der Serie schon als „Watching“ in der Reihe, bleibt es bei dieser. Die Erweiterung nimmt dafür Seanimes eigenen Wiedergabe-Verlauf, deine AniList-Liste bleibt komplett unverändert (kein „Rewatching“, kein Fortschritt). Ein Klick öffnet die Folgenliste, oben unter „Weiterschauen“ steht genau diese Folge. Der Anime verschwindet wieder, wenn du die letzte Folge gesehen hast, ihn auf „Watching“ oder „Rewatching“ setzt oder 30 Tage nichts mehr davon geschaut hast. Er steht auch im Symbol oben und in der Schnellsuche. Voraussetzung: In Seanimes Einstellungen ist „Watch continuity“ an (damit merkt sich Seanime, wo du in einer Folge warst).

**Neue Staffeln:** Einmal am Tag schaut die Erweiterung, ob es von Anime, die du gesehen hast oder gerade schaust, eine Fortsetzung gibt, die noch nicht auf deiner Liste ist. Neue Funde meldet sie einmal kurz, die ganze Liste steht im Symbol oben.

**Filler:** Folgen, die Seanime als Filler kennt, können abgedunkelt oder ausgeblendet werden.

**Rechtsklick auf Folgen** (im Folgen-Tab): „Bis hier als gesehen markieren“ und „Online-Stream starten“.

**Bewerten nach der letzten Folge:** Hast du die letzte Folge einer Staffel gesehen, öffnet sich nach dem Player einmal das Bewertungsfenster von AniList Custom Ratings.

**Nächste Staffel:** Nach der letzten Folge einer Staffel öffnet sich direkt die Folgenliste der Fortsetzung. Ist sie noch nicht erschienen, sagt dir ein Hinweis, wann sie startet.

**Opening/Ending überspringen** kann Seanime schon selbst: im Player unter Einstellungen „Auto Skip OP/ED“ (nutzt AniSkip). Deshalb hat die Erweiterung dafür nichts Eigenes.

**Schnellsuche:** Strg+K (am Mac Cmd+K) sucht in deiner Liste, zeigt oben „Weiterschauen“ und bietet Aktionen wie Schlaftimer oder Einstellungen. Im Browser kann Strg+K schon belegt sein, dann geht es über das Symbol oben.

## Auf dem Handy

Die Erweiterung läuft auf dem Seanime-Server und funktioniert deshalb auch im Handy-Browser, ohne extra Einstellung. Das Staffel-Dropdown nutzt dort die ganze Breite und ist groß genug zum Tippen.

Seanime schickt Seitenwechsel von Plugins an alle offenen Geräte. Springt eine Seite unerwartet, während Seanime gleichzeitig auf PC und Handy offen ist, schließ Seanime auf dem Gerät, das du gerade nicht nutzt.

## Für Entwickler

- `viktempest-ui.json`: die installierbare Erweiterung
- `suite/settings.js`: Einstellungsseite, Farbschemas, Hinweis beim ersten Start, Laden der Teile
- `src/plugin.js`: Season Switcher
- `src/extras.js`: Extras (Bildschirmschoner, Schlaftimer, neue Staffeln, Filler, Rechtsklick, Bewerten, Schnellsuche)
- `suite/ratings/plugin.js`: AniList Custom Ratings (Kopie aus dem Repo custom-ratings-.5-options)
- `suite/theme/`: Netflix-Theme (Desktop und Handy). Die Dateien bleiben direkt als Custom CSS nutzbar. Beim Bauen werden die festen Farben durch die Farben des gewählten Schemas ersetzt.
- `test/smoke.js`: startet die Erweiterung mit nachgebauten Seanime-Schnittstellen und prüft die wichtigsten Abläufe

Wichtig: Seanime führt `init()` (Hooks) und die Funktion in `$ui.register()` in getrennten Umgebungen aus, jeweils nur aus ihrem eigenen Quelltext. `suite/build.py` packt deshalb alles für die Oberfläche (Einstellungsseite und die Oberfläche beider Teile) in eine einzige `$ui.register()`-Funktion. Der Test macht das genauso nach.

Nach jeder Änderung: `VERSION` in `suite/build.py` erhöhen, `python3 suite/build.py .` und `node test/smoke.js` ausführen. GitHub prüft bei jedem Push, ob die JSON zum Code passt und der Test durchläuft.
