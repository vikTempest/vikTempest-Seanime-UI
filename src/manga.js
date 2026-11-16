/// <reference path="../plugin.d.ts" />
/// <reference path="../app.d.ts" />

// -------------------------------------------------------------------------------------------------
// Manga page like the home page, for VikTempest Seanime UI.
//
// Seanime's manga page shows your library as big grids. This puts rows in front of it, like the
// home page has them: "Continue reading" (what you are reading, newest first), new manga, trending,
// "because you like <genre>", popular, top rated, manhwa, your planning list and genre rows of
// your choice. Which rows show up and in which order is set with "Customize" on the page itself.
//
// The rows are a webview in the "manga-screen-bottom" slot, moved to the top with CSS. Your own
// lists come from Seanime's cached collection (no AniList request). The discovery rows are one
// AniList request from the page (like the Discover search), saved for 6 hours.
// Right-click (long press on phones) on a card: open, hide from "Continue reading" (only on this
// page, AniList stays as it is; it comes back when you read on), or add to "Planning".
// On top: a big banner like on the home page (trending manga or what you read, setting "mangaBanner",
// it replaces Seanime's header of the manga page) and a manga search with filters like in Discover.
// Built into viktempest-ui.json by suite/build.py.

function init() {
    $ui.register((ctx) => {
        const TEXT = {
            de: {
                continue: "Weiterlesen", new: "Neue Manga", trending: "Gerade beliebt", forYou: "Weil du gerne {0} liest", forYouName: "Für dich (nach deinem Lieblingsgenre)",
                popular: "Beliebteste Manga", top: "Bestbewertet", manhwa: "Manhwa (Korea)", planning: "Geplant", paused: "Pausiert", completed: "Fertig gelesen",
                genreRow: "{0}", customize: "Anpassen", done: "Fertig", addGenre: "Genre-Reihe hinzufügen", add: "Hinzufügen", remove: "Entfernen",
                up: "Nach oben", down: "Nach unten", resetRows: "Standard", unhide: "Ausgeblendete wieder zeigen ({0})",
                chapter: "Kapitel {0}", nextChapter: "Weiter mit Kapitel {0}", read: "{0} / {1} gelesen", readOnly: "{0} gelesen", chapters: "{0} Kapitel",
                open: "Öffnen", hide: "Aus „Weiterlesen“ ausblenden", plan: "Zu „Geplant“ hinzufügen", onList: "Auf deiner Liste",
                busy: "AniList ist gerade ausgelastet, gleich nochmal versuchen.", failed: "Konnte AniList nicht erreichen.", loading: "Lädt …",
                empty: "Hier ist noch nichts. Unter „Anpassen“ kannst du Reihen einschalten.",
                planned: "„{0}“ steht jetzt auf „Geplant“.", planFailed: "Konnte „{0}“ nicht hinzufügen: {1}", hidden: "„{0}“ ausgeblendet. Liest du weiter, ist es wieder da.",
                hint: "Haken = Reihe zeigen. Mit den Pfeilen änderst du die Reihenfolge.",
                status: { CURRENT: "lese ich", PLANNING: "geplant", COMPLETED: "fertig", PAUSED: "pausiert", DROPPED: "abgebrochen", REPEATING: "nochmal" },
            },
            en: {
                continue: "Continue reading", new: "New manga", trending: "Trending now", forYou: "Because you like {0}", forYouName: "For you (your favourite genre)",
                popular: "Most popular", top: "Top rated", manhwa: "Manhwa (Korea)", planning: "Planning", paused: "Paused", completed: "Completed",
                genreRow: "{0}", customize: "Customize", done: "Done", addGenre: "Add a genre row", add: "Add", remove: "Remove",
                up: "Move up", down: "Move down", resetRows: "Default", unhide: "Show hidden again ({0})",
                chapter: "Chapter {0}", nextChapter: "Continue with chapter {0}", read: "{0} / {1} read", readOnly: "{0} read", chapters: "{0} chapters",
                open: "Open", hide: "Hide from \"Continue reading\"", plan: "Add to \"Planning\"", onList: "On your list",
                busy: "AniList is busy right now, try again in a moment.", failed: "Could not reach AniList.", loading: "Loading …",
                empty: "Nothing here yet. Turn rows on under \"Customize\".",
                planned: "\"{0}\" is now on \"Planning\".", planFailed: "Could not add \"{0}\": {1}", hidden: "\"{0}\" hidden. It comes back when you read on.",
                hint: "Tick = show the row. Use the arrows to change the order.",
                status: { CURRENT: "reading", PLANNING: "planning", COMPLETED: "completed", PAUSED: "paused", DROPPED: "dropped", REPEATING: "rereading" },
            },
            es: {
                continue: "Seguir leyendo", new: "Manga nuevo", trending: "En tendencia", forYou: "Porque te gusta {0}", forYouName: "Para ti (tu género favorito)",
                popular: "Más populares", top: "Mejor valorados", manhwa: "Manhwa (Corea)", planning: "Planeado", paused: "En pausa", completed: "Terminado",
                genreRow: "{0}", customize: "Personalizar", done: "Listo", addGenre: "Añadir fila de género", add: "Añadir", remove: "Quitar",
                up: "Subir", down: "Bajar", resetRows: "Por defecto", unhide: "Mostrar ocultos ({0})",
                chapter: "Capítulo {0}", nextChapter: "Seguir con el capítulo {0}", read: "{0} / {1} leídos", readOnly: "{0} leídos", chapters: "{0} capítulos",
                open: "Abrir", hide: "Ocultar de \"Seguir leyendo\"", plan: "Añadir a \"Planeado\"", onList: "En tu lista",
                busy: "AniList está ocupado, inténtalo en un momento.", failed: "No se pudo conectar con AniList.", loading: "Cargando …",
                empty: "Aún no hay nada. Activa filas en \"Personalizar\".",
                planned: "\"{0}\" está ahora en \"Planeado\".", planFailed: "No se pudo añadir \"{0}\": {1}", hidden: "\"{0}\" oculto. Vuelve cuando sigas leyendo.",
                hint: "Marcado = mostrar la fila. Con las flechas cambias el orden.",
                status: { CURRENT: "leyendo", PLANNING: "planeado", COMPLETED: "terminado", PAUSED: "en pausa", DROPPED: "abandonado", REPEATING: "releyendo" },
            },
            pt: {
                continue: "Continuar lendo", new: "Mangás novos", trending: "Em alta", forYou: "Porque você gosta de {0}", forYouName: "Para você (seu gênero favorito)",
                popular: "Mais populares", top: "Mais bem avaliados", manhwa: "Manhwa (Coreia)", planning: "Planejado", paused: "Pausado", completed: "Lido",
                genreRow: "{0}", customize: "Personalizar", done: "Pronto", addGenre: "Adicionar linha de gênero", add: "Adicionar", remove: "Remover",
                up: "Subir", down: "Descer", resetRows: "Padrão", unhide: "Mostrar ocultos ({0})",
                chapter: "Capítulo {0}", nextChapter: "Continuar no capítulo {0}", read: "{0} / {1} lidos", readOnly: "{0} lidos", chapters: "{0} capítulos",
                open: "Abrir", hide: "Ocultar de \"Continuar lendo\"", plan: "Adicionar a \"Planejado\"", onList: "Na sua lista",
                busy: "O AniList está ocupado, tente de novo em instantes.", failed: "Não foi possível acessar o AniList.", loading: "Carregando …",
                empty: "Nada aqui ainda. Ative linhas em \"Personalizar\".",
                planned: "\"{0}\" agora está em \"Planejado\".", planFailed: "Não foi possível adicionar \"{0}\": {1}", hidden: "\"{0}\" oculto. Volta quando você continuar lendo.",
                hint: "Marcado = mostrar a linha. Use as setas para mudar a ordem.",
                status: { CURRENT: "lendo", PLANNING: "planejado", COMPLETED: "lido", PAUSED: "pausado", DROPPED: "largado", REPEATING: "relendo" },
            },
            ja: {
                continue: "続きを読む", new: "新着マンガ", trending: "トレンド", forYou: "{0}が好きなあなたへ", forYouName: "おすすめ（好きなジャンル）",
                popular: "人気のマンガ", top: "高評価", manhwa: "韓国マンガ", planning: "読む予定", paused: "一時停止", completed: "読了",
                genreRow: "{0}", customize: "カスタマイズ", done: "完了", addGenre: "ジャンルの列を追加", add: "追加", remove: "削除",
                up: "上へ", down: "下へ", resetRows: "初期設定", unhide: "非表示を元に戻す（{0}）",
                chapter: "第{0}話", nextChapter: "第{0}話から読む", read: "{0} / {1} 既読", readOnly: "{0} 既読", chapters: "全{0}話",
                open: "開く", hide: "「続きを読む」から非表示", plan: "「読む予定」に追加", onList: "リストにあり",
                busy: "AniListが混み合っています。少し待ってからお試しください。", failed: "AniListに接続できませんでした。", loading: "読み込み中 …",
                empty: "まだ何もありません。「カスタマイズ」で列をオンにできます。",
                planned: "「{0}」を「読む予定」に追加しました。", planFailed: "「{0}」を追加できませんでした: {1}", hidden: "「{0}」を非表示にしました。続きを読むと再表示されます。",
                hint: "チェック＝列を表示。矢印で順番を変更します。",
                status: { CURRENT: "読書中", PLANNING: "予定", COMPLETED: "読了", PAUSED: "一時停止", DROPPED: "中断", REPEATING: "再読" },
            },
        }

        // Texts added in 1.12 (banner, search, filters); missing ones fall back to English
        const TEXT2 = {
            de: {
                heroRank: "#{0} gerade beliebt", readChapter: "Kapitel {0} lesen", readAll: "Alle {0} Kapitel gelesen", planShort: "Merken",
                retry: "Nochmal versuchen", searchPh: "Manga suchen …", filters: "Filter", clear: "Alles zurücksetzen", any: "Alle",
                more: "Mehr laden", none: "Nichts gefunden.", sort: "Sortierung", genre: "Genre", format: "Format", statusL: "Status", country: "Land", year: "Jahr",
                sorts: { POPULARITY_DESC: "Beliebtheit", TRENDING_DESC: "Gerade beliebt", SCORE_DESC: "Bewertung", START_DATE_DESC: "Neueste", FAVOURITES_DESC: "Favoriten", TITLE_ROMAJI: "Titel A–Z" },
                formats: { MANGA: "Manga", NOVEL: "Light Novel", ONE_SHOT: "One-Shot" },
                statuses: { RELEASING: "Läuft", FINISHED: "Abgeschlossen", NOT_YET_RELEASED: "Angekündigt", HIATUS: "Pausiert", CANCELLED: "Abgebrochen" },
                countries: { JP: "Japan (Manga)", KR: "Korea (Manhwa)", CN: "China (Manhua)", TW: "Taiwan" },
            },
            en: {
                heroRank: "#{0} trending", readChapter: "Read chapter {0}", readAll: "All {0} chapters read", planShort: "Save",
                retry: "Try again", searchPh: "Search manga …", filters: "Filters", clear: "Clear all", any: "Any",
                more: "Load more", none: "Nothing found.", sort: "Sort", genre: "Genre", format: "Format", statusL: "Status", country: "Country", year: "Year",
                sorts: { POPULARITY_DESC: "Popularity", TRENDING_DESC: "Trending", SCORE_DESC: "Score", START_DATE_DESC: "Newest", FAVOURITES_DESC: "Favourites", TITLE_ROMAJI: "Title A–Z" },
                formats: { MANGA: "Manga", NOVEL: "Light novel", ONE_SHOT: "One shot" },
                statuses: { RELEASING: "Releasing", FINISHED: "Finished", NOT_YET_RELEASED: "Announced", HIATUS: "Hiatus", CANCELLED: "Cancelled" },
                countries: { JP: "Japan (manga)", KR: "Korea (manhwa)", CN: "China (manhua)", TW: "Taiwan" },
            },
            es: { heroRank: "#{0} en tendencia", readChapter: "Leer capítulo {0}", readAll: "{0} capítulos leídos", planShort: "Guardar", retry: "Reintentar",
                  searchPh: "Buscar manga …", filters: "Filtros", clear: "Borrar todo", any: "Todos", more: "Cargar más", none: "No se encontró nada.",
                  sort: "Orden", genre: "Género", format: "Formato", statusL: "Estado", country: "País", year: "Año" },
            pt: { heroRank: "#{0} em alta", readChapter: "Ler capítulo {0}", readAll: "{0} capítulos lidos", planShort: "Salvar", retry: "Tentar de novo",
                  searchPh: "Buscar mangá …", filters: "Filtros", clear: "Limpar tudo", any: "Todos", more: "Carregar mais", none: "Nada encontrado.",
                  sort: "Ordenar", genre: "Gênero", format: "Formato", statusL: "Status", country: "País", year: "Ano" },
            ja: { heroRank: "トレンド #{0}", readChapter: "第{0}話を読む", readAll: "全{0}話読了", planShort: "保存", retry: "再試行",
                  searchPh: "マンガを検索 …", filters: "フィルター", clear: "すべてクリア", any: "すべて", more: "もっと見る", none: "見つかりませんでした。",
                  sort: "並び替え", genre: "ジャンル", format: "形式", statusL: "状態", country: "国", year: "年" },
        }
        function pageText(l) {
            return Object.assign({}, TEXT.en, TEXT2.en, TEXT[l] || {}, TEXT2[l] || {})
        }

        // Rows in their default order. list: from your list, ani: from AniList.
        const MANGA_ROWS = [
            { id: "continue", kind: "list", on: true },
            { id: "new", kind: "ani", on: true },
            { id: "trending", kind: "ani", on: true },
            { id: "foryou", kind: "ani", on: true },
            { id: "planning", kind: "list", on: true },
            { id: "popular", kind: "ani", on: true },
            { id: "top", kind: "ani", on: true },
            { id: "manhwa", kind: "ani", on: false },
            { id: "paused", kind: "list", on: false },
            { id: "completed", kind: "list", on: false },
        ]
        const ROWS_KEY = "vsm:rows"
        const HIDDEN_KEY = "vsm:hidden"
        const CACHE_KEY = "vsm:cache"
        const EXT_ID = typeof VS_EXT_ID === "string" ? VS_EXT_ID : "viktempest-ui"

        function pref(key, fallback) {
            const v = $getUserPreference(key)
            return v === undefined || v === null || v === "" ? fallback : String(v)
        }
        function lang() {
            const l = pref("language", "de")
            return TEXT[l] ? l : "en"
        }
        function t(key, arg, arg2) {
            const table = TEXT[lang()] || TEXT.en
            let s = table[key] !== undefined ? table[key] : TEXT.en[key]
            if (typeof s === "string" && arg !== undefined) s = s.split("{0}").join(String(arg))
            if (typeof s === "string" && arg2 !== undefined) s = s.split("{1}").join(String(arg2))
            return s
        }
        function load(key, fallback) {
            try {
                const v = $storage.get(key)
                return v === undefined || v === null ? fallback : v
            }
            catch (e) { return fallback }
        }
        function save(key, value) {
            try { $storage.set(key, value) } catch (e) { console.warn("viktempest-ui manga: could not save " + key, e) }
        }
        function titleOf(media) {
            const tl = (media && media.title) || {}
            const want = pref("titleLanguage", "english")
            if (want === "native") return tl.native || tl.romaji || tl.english || ""
            if (want === "romaji") return tl.romaji || tl.english || tl.native || ""
            return tl.english || tl.romaji || tl.native || ""
        }

        // Saved rows plus rows added in a later version (at their default place, at the end)
        function rowConfig() {
            const saved = load(ROWS_KEY, null)
            if (!Array.isArray(saved) || !saved.length) return MANGA_ROWS.map((r) => ({ id: r.id, on: r.on }))
            const out = []
            const seen = {}
            saved.forEach((r) => {
                if (!r || typeof r.id !== "string" || seen[r.id]) return
                const known = MANGA_ROWS.some((d) => d.id === r.id) || /^genre:[A-Za-z -]{2,30}$/.test(r.id)
                if (!known) return
                seen[r.id] = true
                out.push({ id: r.id, on: r.on !== false })
            })
            MANGA_ROWS.forEach((d) => { if (!seen[d.id]) out.push({ id: d.id, on: d.on }) })
            return out
        }

        // Your manga list from Seanime's cache (no AniList request), only what the rows need
        function listEntries() {
            const out = []
            const seen = {}
            try {
                const col = JSON.parse(JSON.stringify($anilist.getMangaCollection(false) || {}))
                const lists = (col && col.MediaListCollection && col.MediaListCollection.lists) || []
                lists.forEach((list) => ((list && list.entries) || []).forEach((e) => {
                    const m = e && e.media
                    if (!m || !m.id || seen[m.id]) return
                    seen[m.id] = true
                    out.push({
                        status: e.status || "", progress: e.progress || 0, updatedAt: e.updatedAt || 0, score: e.score || 0,
                        media: {
                            id: m.id, title: m.title || {}, coverImage: m.coverImage || {}, bannerImage: m.bannerImage || "",
                            chapters: m.chapters || 0, format: m.format || "", status: m.status || "", genres: m.genres || [],
                            startDate: m.startDate || {}, isAdult: !!m.isAdult, countryOfOrigin: m.countryOfOrigin || "",
                            averageScore: m.meanScore || 0, description: String(m.description || "").slice(0, 600),
                        },
                    })
                }))
            }
            catch (e) {
                console.warn("viktempest-ui manga: could not read your manga list", e)
            }
            return out
        }

        function accent() {
            try { return typeof vsAccentHex === "function" && typeof vsLoadSettings === "function" ? vsAccentHex(vsLoadSettings()) : "" }
            catch (e) { return "" }
        }

        // ---- Page layout: the rows on top, Seanime's own lists below (or not)
        function layoutCss() {
            const wv = "[data-webview-container=\"" + EXT_ID + "-manga-screen-bottom\"]"
            const view = "[data-manga-page-container] [data-manga-library-view-container]"
            const lists = view + " [data-manga-library-view-collection-lists-container]"
            const head = "[data-manga-library-view-collection-list-item-header-container]"
            // Only the "Continue reading" list has the list menu (⋮)
            const cur = head + ":has([data-manga-library-dropdown-menu-trigger])"
            let css =
                // The home page can show the manga library too: the rows are only for the manga page
                wv + ":not([data-manga-page-container] " + wv + ") { display: none !important; }\n" +
                view + " { display: flex; flex-direction: column; }\n" +
                view + " > " + wv + " { order: -1; position: relative; z-index: 5; margin-bottom: .5rem; }\n"
            // Our banner replaces Seanime's header of the manga page (and its spacer)
            const banner = pref("mangaBanner", "trending")
            if (banner === "trending" || banner === "reading") {
                css += ":is([data-manga-page-dynamic-banner-spacer], [data-manga-page-custom-banner-spacer]),\n" +
                    "[data-manga-page-container] :is([data-library-header-container], [data-custom-library-banner-container], [data-custom-library-banner-top-spacer]) { display: none !important; }\n"
            }
            const mode = pref("mangaLibrary", "nocurrent")
            if (mode === "off") {
                css += view + " > :not(" + wv + ") { display: none !important; }\n"
            }
            else if (mode === "nocurrent") {
                // Seanime's "Continue reading" header and grid (up to the next list), the genre filter stays
                css += lists + " > " + cur + ",\n" +
                    lists + " > " + cur + " ~ :not(" + head + "):not(" + head + ":not(:has([data-manga-library-dropdown-menu-trigger])) ~ *)" +
                    ":not([data-media-genre-selector]):not(:has([data-media-genre-selector])) { display: none !important; }\n"
            }
            return css
        }
        function applyCss() {
            if (typeof vsSetStyle === "function") vsSetStyle(ctx, "data-vsm-style", layoutCss())
        }
        ctx.dom.onReady(applyCss)
        ctx.screen.onNavigate(applyCss)

        const MANGA_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{color-scheme:dark;--a:#e50914;--bg:#0f0f0f}
  *{box-sizing:border-box}
  html,body{margin:0;background:transparent;color:#e5e5e5;font:15px/1.4 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;overflow-x:hidden}
  button{font:inherit}
  .pad{padding:0 clamp(12px,2.2vw,32px)}
  /* ---- banner */
  .hero{position:relative;height:clamp(340px,36vw,540px);overflow:hidden;-webkit-mask-image:linear-gradient(to bottom,#000 72%,transparent);mask-image:linear-gradient(to bottom,#000 72%,transparent)}
  .hero.none{display:none}
  .slide{position:absolute;inset:0;opacity:0;transition:opacity .7s ease;pointer-events:none}
  .slide.on{opacity:1;pointer-events:auto}
  .slide .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 25%}
  .slide .bg.blur{filter:blur(22px) brightness(.6);transform:scale(1.25)}
  .hero .shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.88) 0%,rgba(0,0,0,.55) 38%,rgba(0,0,0,.05) 75%)}
  .hin{position:absolute;left:0;right:0;bottom:clamp(44px,6vw,72px);display:flex;align-items:flex-end;gap:28px}
  .htx{flex:1;min-width:0;max-width:680px}
  .hk{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:var(--a);padding:3px 9px;border-radius:6px;margin-bottom:12px}
  .ht{margin:0;font-size:clamp(1.6rem,3.3vw,3rem);font-weight:800;line-height:1.08;color:#fff;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-shadow:0 2px 18px rgba(0,0,0,.5)}
  .hm{display:flex;flex-wrap:wrap;gap:6px 12px;margin-top:10px;color:#d6d6d6;font-size:.88rem}
  .hm b{color:#7ddc8a;font-weight:700}
  .hd{margin-top:10px;color:#cfcfcf;font-size:.92rem;line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;max-width:620px}
  .hb{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap}
  .pri{height:42px;padding:0 22px;border-radius:10px;border:0;background:#fff;color:#000;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:8px}
  .pri:hover{background:#e6e6e6}
  .sec{height:42px;padding:0 18px;border-radius:10px;border:0;background:rgba(109,109,110,.55);color:#fff;font-weight:600;cursor:pointer;backdrop-filter:blur(6px)}
  .sec:hover{background:rgba(109,109,110,.75)}
  .hc{width:clamp(120px,11vw,170px);aspect-ratio:2/3;object-fit:cover;border-radius:10px;box-shadow:0 14px 40px rgba(0,0,0,.7);flex:none}
  @media (max-width:760px){.hc{display:none}.hd{-webkit-line-clamp:2}.dots{top:16px;bottom:auto}}
  .dots{position:absolute;right:clamp(12px,2.2vw,32px);bottom:clamp(48px,6vw,76px);display:flex;gap:6px}
  .dots button{width:9px;height:9px;border-radius:5px;border:0;padding:0;background:rgba(255,255,255,.35);cursor:pointer;transition:width .3s,background .3s}
  .dots button.on{width:24px;background:#fff}
  /* ---- toolbar, search, panels */
  .bar{position:relative;z-index:3;display:flex;gap:8px;align-items:center;margin-top:-26px}
  .hero.none + .bar{margin-top:14px}
  .field{position:relative;flex:1;min-width:0;max-width:560px}
  .field svg{position:absolute;left:14px;top:50%;transform:translateY(-50%);opacity:.7;pointer-events:none;z-index:1}
  .q{width:100%;height:42px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(20,20,20,.82);backdrop-filter:blur(8px);color:#fff;padding:0 16px 0 40px;font:inherit;font-size:15px;outline:none}
  .q:focus{border-color:var(--a)}
  .sp{flex:1}
  .btn{height:42px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(20,20,20,.82);color:#fff;padding:0 15px;cursor:pointer;font-size:13.5px;font-weight:600;display:inline-flex;align-items:center;gap:7px;flex:none;white-space:nowrap}
  .btn:hover,.btn.on{border-color:var(--a)}
  .btn b{display:none;min-width:18px;height:18px;border-radius:9px;background:var(--a);font-size:11px;line-height:18px;text-align:center}
  .btn b.n{display:inline-block}
  @media (max-width:560px){.btn span{display:none}.btn{padding:0 12px}.sp{display:none}.field{max-width:none}}
  .panel{display:none;margin:12px 0 4px;padding:14px;border-radius:14px;border:1px solid rgba(255,255,255,.1);background:rgba(20,20,20,.95)}
  .panel.open{display:block}
  .panel p{margin:0 0 10px;color:#9a9a9a;font-size:12.5px}
  .filters{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
  .filters label{display:flex;flex-direction:column;gap:4px;font-size:12px;color:#9a9a9a;font-weight:600}
  .pr{display:flex;align-items:center;gap:8px;padding:6px 2px;border-top:1px solid rgba(255,255,255,.06)}
  .pr:first-of-type{border-top:0}
  .pr label{flex:1;display:flex;align-items:center;gap:10px;cursor:pointer;min-width:0}
  .pr input{width:17px;height:17px;accent-color:var(--a);flex:none}
  .pr span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .ib{width:30px;height:30px;border-radius:8px;border:0;background:rgba(255,255,255,.06);color:#ddd;cursor:pointer;font-size:14px;flex:none}
  .ib:hover:not(:disabled){background:rgba(255,255,255,.14)}
  .ib:disabled{opacity:.3;cursor:default}
  .add{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center}
  .add .btn{height:34px}
  .cols{display:grid;grid-template-columns:1fr;gap:4px 24px}
  @media (min-width:900px){.cols{grid-template-columns:1fr 1fr}}
  select{height:36px;border-radius:9px;border:1px solid rgba(255,255,255,.14);background:#151515;color:#fff;padding:0 8px;font:inherit;font-size:14px;min-width:0}
  .add select{flex:1;min-width:150px;max-width:320px}
  .clear{height:32px;border-radius:8px;border:0;background:transparent;color:#aaa;cursor:pointer;padding:0 10px;font-size:13px}
  .clear:hover{color:#fff}
  /* ---- rows and cards */
  .row{margin:26px 0 2px}
  .rh{display:flex;align-items:center;gap:8px;margin:0 0 8px}
  h2{margin:0;font-size:1.3rem;font-weight:700;color:#fff;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .cnt{color:#8f8f8f;font-size:.85rem;font-weight:500;margin-left:6px}
  .nav{display:flex;gap:6px}
  .nav button{width:32px;height:32px;border-radius:50%;border:0;background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:17px;line-height:1}
  .nav button:hover:not(:disabled){background:rgba(255,255,255,.18)}
  .nav button:disabled{opacity:.25;cursor:default}
  .nav.no{visibility:hidden}
  @media (hover:none){.nav{display:none}}
  .track{display:flex;align-items:flex-start;gap:14px;overflow-x:auto;scroll-behavior:smooth;scroll-snap-type:x proximity;padding:8px 2px 12px;scrollbar-width:none}
  .track::-webkit-scrollbar{display:none}
  .card{flex:none;width:clamp(128px,13.5vw,180px);display:flex;flex-direction:column;align-items:stretch;justify-content:flex-start;scroll-snap-align:start;cursor:pointer;background:none;border:0;padding:0;text-align:left;color:inherit;position:relative;outline:none}
  .pic{position:relative;width:100%;border-radius:8px;overflow:hidden;background:#1c1c1c;aspect-ratio:2/3;flex:none;transition:transform .2s,box-shadow .2s}
  .pic img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
  .card:hover .pic,.card:focus-visible .pic{transform:translateY(-4px);box-shadow:0 10px 24px rgba(0,0,0,.6),0 0 0 2px rgba(255,255,255,.85)}
  .badge{position:absolute;left:6px;top:6px;font-size:10.5px;font-weight:700;padding:2px 7px;border-radius:6px;background:rgba(0,0,0,.75);color:#fff}
  .score{position:absolute;right:6px;bottom:6px;font-size:11px;font-weight:700;padding:2px 6px;border-radius:6px;background:rgba(0,0,0,.75);color:#7ddc8a}
  .bar2{position:absolute;left:0;right:0;bottom:0;height:4px;background:rgba(255,255,255,.2)}
  .bar2 i{display:block;height:100%;background:var(--a)}
  .t{margin-top:8px;font-weight:600;font-size:.88rem;line-height:1.25;min-height:2.5em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .s{color:#8f8f8f;font-size:.76rem;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-height:1.2em}
  .cc{flex:none;width:clamp(270px,28vw,390px);aspect-ratio:16/8.4;scroll-snap-align:start;cursor:pointer;border:0;padding:0;border-radius:10px;overflow:hidden;position:relative;background:#1c1c1c;color:#fff;text-align:left;transition:transform .2s,box-shadow .2s;outline:none}
  .cc:hover,.cc:focus-visible{transform:translateY(-4px);box-shadow:0 10px 24px rgba(0,0,0,.6),0 0 0 2px rgba(255,255,255,.85)}
  .cc .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(.6)}
  .cc .bg.blur{filter:brightness(.45) blur(14px);transform:scale(1.25)}
  .cc .fade{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.92),rgba(0,0,0,.1) 70%)}
  .cc .in{position:absolute;left:0;right:0;bottom:0;display:flex;gap:12px;align-items:flex-end;padding:12px 12px 16px}
  .cc .cv{width:22%;max-width:76px;aspect-ratio:2/3;object-fit:cover;border-radius:6px;box-shadow:0 4px 14px rgba(0,0,0,.6);flex:none}
  .cc .tx{flex:1;min-width:0}
  .cc .ct{font-weight:700;font-size:1rem;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .cc .cs{display:flex;justify-content:space-between;gap:8px;color:#d0d0d0;font-size:.8rem;margin-top:4px}
  .cc .cs span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .cc .cs span+span{flex:none}
  .cc .pg{position:absolute;left:0;right:0;bottom:0;height:4px;background:rgba(255,255,255,.18)}
  .cc .pg i{display:block;height:100%;background:var(--a)}
  .sk{flex:none;width:clamp(128px,13.5vw,180px)}
  .sk i{display:block;aspect-ratio:2/3;border-radius:8px;background:linear-gradient(90deg,#1a1a1a 0%,#262626 50%,#1a1a1a 100%);background-size:200% 100%;animation:sh 1.3s infinite linear}
  .sk u{display:block;height:12px;margin-top:9px;width:80%;border-radius:4px;background:#1f1f1f}
  @keyframes sh{0%{background-position:200% 0}100%{background-position:-200% 0}}
  .msg{color:#9a9a9a;padding:14px 2px;font-size:.9rem;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:18px 14px;margin-top:20px}
  .grid .card{width:auto}
  .more{display:block;margin:18px auto 4px;height:40px;padding:0 22px;border-radius:10px;border:0;background:rgba(255,255,255,.1);color:#fff;font-weight:600;cursor:pointer}
  .searching .hero,.searching #rows{display:none}
  .searching .bar{margin-top:14px}
  .menu{position:fixed;z-index:50;min-width:220px;padding:5px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:rgba(18,18,18,.98);box-shadow:0 12px 30px rgba(0,0,0,.6);display:none}
  .menu.open{display:block}
  .menu button{display:block;width:100%;text-align:left;border:0;background:none;color:#eee;padding:8px 10px;border-radius:7px;font-size:14px;cursor:pointer}
  .menu button:hover{background:rgba(255,255,255,.08)}
</style></head><body>
<div id="app">
  <div class="hero none" id="hero"></div>
  <div class="bar pad">
    <div class="field"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input class="q" id="q" type="search" autocomplete="off"></div>
    <button class="btn" id="fbtn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg><span id="fl"></span><b id="fcount"></b></button>
    <div class="sp"></div>
    <button class="btn" id="cust"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg><span id="custl"></span></button>
  </div>
  <div class="pad"><div class="panel" id="fpanel"><div class="filters" id="filters"></div><div class="add" style="justify-content:flex-end"><button class="clear" id="clear"></button></div></div></div>
  <div class="pad"><div class="panel" id="panel"></div></div>
  <div class="pad" id="results"></div>
  <div class="pad" id="rows"></div>
</div>
<div class="menu" id="menu"></div>
<script>
(function(){
  var T={},rows=[],entries=[],hidden={},title="english",cache=null,ani={},aniState="",fetching=false,menuFor=null,heroMode="trending",heroIdx=0,heroTimer=null,heroHover=false,heroItems=[];
  var GENRES=["Action","Adventure","Comedy","Drama","Ecchi","Fantasy","Horror","Mahou Shoujo","Mecha","Music","Mystery","Psychological","Romance","Sci-Fi","Slice of Life","Sports","Supernatural","Thriller"];
  var LIST={continue:["CURRENT","REPEATING"],planning:["PLANNING"],paused:["PAUSED"],completed:["COMPLETED"]};
  var TTL=6*3600*1000;
  var f={sort:"",genre:"",format:"",status:"",country:"",year:""},sPage=1,sItems=[],sMore=false,sTimer=null,sSeq=0,sCache={},sMsg="";
  function $(id){return document.getElementById(id)}
  function each(sel,root,fn){Array.prototype.forEach.call((root||document).querySelectorAll(sel),fn)}
  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
  function F(s,a,b){s=String(s||"");if(a!==undefined)s=s.split("{0}").join(String(a));if(b!==undefined)s=s.split("{1}").join(String(b));return s}
  function plain(s){return String(s||"").replace(/<br\\s*\\/?>/gi," ").replace(/<[^>]*>/g,"").replace(/&quot;/g,'"').replace(/&#0?39;|&apos;/g,"'").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&nbsp;/g," ").replace(/\\s+/g," ").trim()}
  function name(m){var t=m.title||{};return title==="native"?(t.native||t.romaji||t.english||""):title==="romaji"?(t.romaji||t.english||t.native||""):(t.english||t.romaji||t.native||"")}
  function cover(m){var c=m.coverImage||{};return c.extraLarge||c.large||c.medium||""}
  function fmt(x){return (T.formats&&T.formats[x])||String(x||"").replace("_"," ")}
  var idx={};function byId(){return idx}
  function img(src,cls){return src?"<img"+(cls?" class='"+cls+"'":"")+" loading='lazy' alt='' src='"+esc(src)+"' onerror='this.style.visibility=\\"hidden\\"'>":""}

  function favGenre(){
    var w={};
    entries.forEach(function(e){
      if(["CURRENT","COMPLETED","REPEATING"].indexOf(e.status)<0)return;
      var p=1+(e.score>=8&&e.score<=10||e.score>=80?1:0);
      (e.media.genres||[]).forEach(function(g){if(g!=="Hentai")w[g]=(w[g]||0)+p});
    });
    var best="",n=0;Object.keys(w).forEach(function(g){if(w[g]>n){n=w[g];best=g}});
    return best;
  }
  function rowTitle(id){
    if(id.indexOf("genre:")===0)return F(T.genreRow,(T.genres&&T.genres[id.slice(6)])||id.slice(6));
    if(id==="foryou"){var g=favGenre();return g?F(T.forYou,(T.genres&&T.genres[g])||g):T.forYouName}
    return {continue:T.continue,new:T.new,trending:T.trending,popular:T.popular,top:T.top,manhwa:T.manhwa,planning:T.planning,paused:T.paused,completed:T.completed}[id]||id;
  }
  function panelName(id){return id==="foryou"?T.forYouName:rowTitle(id)}

  // ---- AniList: banner and rows in one request, saved for 6 hours
  function aniRows(){return rows.filter(function(r){return r.on&&(r.id.indexOf("genre:")===0||["new","trending","popular","top","manhwa","foryou"].indexOf(r.id)>=0)})}
  function yearAgo(){var d=new Date();return (d.getFullYear()-1)*10000+(d.getMonth()+1)*100+d.getDate()}
  function args(id){
    var base="type:MANGA,isAdult:false";
    if(id==="hero")return base+",sort:[TRENDING_DESC],status_not:NOT_YET_RELEASED";
    if(id==="new")return base+",startDate_greater:"+yearAgo()+",status_not:NOT_YET_RELEASED,sort:[TRENDING_DESC]";
    if(id==="trending")return base+",sort:[TRENDING_DESC]";
    if(id==="popular")return base+",sort:[POPULARITY_DESC]";
    if(id==="top")return base+",sort:[SCORE_DESC],popularity_greater:5000";
    if(id==="manhwa")return base+",countryOfOrigin:\\"KR\\",sort:[TRENDING_DESC]";
    if(id==="foryou"){var g=favGenre();return g?base+",genre:"+JSON.stringify(g)+",sort:[POPULARITY_DESC]":""}
    if(id.indexOf("genre:")===0)return base+",genre:"+JSON.stringify(id.slice(6))+",sort:[TRENDING_DESC]";
    return "";
  }
  function plan(){
    var parts=[],map={},list=aniRows().map(function(r){return r.id});
    if(heroMode==="trending")list.unshift("hero");
    list.forEach(function(id,i){var a=args(id);if(!a)return;var al="r"+i;map[al]=id;
      parts.push(al+":Page(perPage:"+(id==="foryou"?40:id==="hero"?12:24)+"){media("+a+"){...F"+(id==="hero"?" description(asHtml:false)":"")+"}}")});
    if(!parts.length)return null;
    var q="query{"+parts.join(" ")+"} fragment F on Media{id title{english romaji native} coverImage{extraLarge large medium color} bannerImage format chapters status averageScore genres countryOfOrigin startDate{year}}";
    return {key:q,map:map};
  }
  function useData(p,data){ani={};Object.keys(p.map).forEach(function(al){ani[p.map[al]]=(data[al]&&data[al].media)||[]})}
  function loadAni(force){
    var p=plan();
    if(!p){ani={};aniState="";render();return}
    var have=cache&&cache.key===p.key&&cache.data;
    if(have){useData(p,cache.data);aniState=""}
    if(have&&!force&&Date.now()-(cache.at||0)<TTL){render();return}
    if(fetching)return;
    if(!have){ani={};aniState="loading"}
    render();
    fetching=true;
    fetch("https://graphql.anilist.co",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({query:p.key})})
      .then(function(r){if(r.status===429)throw{busy:true};return r.json()})
      .then(function(j){
        fetching=false;
        if(!j||!j.data)throw{failed:true};
        cache={key:p.key,at:Date.now(),data:j.data};
        window.webview.send("cache",{key:p.key,data:j.data});
        var now=plan();if(now&&now.key===p.key){useData(p,j.data);aniState=""}else{loadAni(false);return}
        render();
      })
      .catch(function(e){fetching=false;if(!Object.keys(ani).length)aniState=e&&e.busy?"busy":"failed";render()});
  }

  // ---- Banner
  function heroList(){
    if(heroMode==="trending"&&!(ani.hero||[]).length&&aniState&&aniState!=="loading")return listItems("continue").map(function(e){return {m:e.media,e:e}}).slice(0,8);
    if(heroMode==="reading")return listItems("continue").map(function(e){return {m:e.media,e:e}}).slice(0,8);
    if(heroMode!=="trending")return [];
    var on=byId(),all=(ani.hero||[]).filter(function(m){return m.bannerImage});
    if(all.length<3)all=ani.hero||[];
    return all.slice(0,8).map(function(m){return {m:m,e:on[m.id]}});
  }
  function heroSlide(it,i){
    var m=it.m,e=it.e,bits=[],lab=heroMode==="reading"||!(ani.hero||[]).length?T.continue:F(T.heroRank,i+1);
    if(m.averageScore)bits.push("<b>"+m.averageScore+"%</b>");
    if(m.format)bits.push(esc(fmt(m.format)));
    if(m.startDate&&m.startDate.year)bits.push(esc(m.startDate.year));
    if(m.chapters)bits.push(esc(F(T.chapters,m.chapters)));
    (m.genres||[]).slice(0,3).forEach(function(g){bits.push(esc((T.genres&&T.genres[g])||g))});
    var desc=plain(m.description);
    var go=e&&e.progress?F(T.readChapter,(e.progress||0)+1):T.open;
    var second=e?"<span class='sec' style='cursor:default'>"+esc((T.status&&T.status[e.status])||T.onList)+"</span>":"<button class='sec' data-plan='"+m.id+"'>+ "+esc(T.planShort)+"</button>";
    var bg=m.bannerImage?img(m.bannerImage,"bg"):img(cover(m),"bg blur");
    return "<div class='slide"+(i===heroIdx?" on":"")+"'>"+bg+"<div class='shade'></div><div class='hin pad'><div class='htx'><span class='hk'>"+esc(lab)+"</span><h1 class='ht'>"+esc(name(m))+"</h1><div class='hm'>"+bits.join("<span>·</span>")+"</div>"+(desc?"<div class='hd'>"+esc(desc)+"</div>":"")+
      "<div class='hb'><button class='pri' data-open='"+m.id+"'><svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'><path d='M5 4h5a3 3 0 0 1 2 .8A3 3 0 0 1 14 4h5v15h-5a2 2 0 0 0-2 1 2 2 0 0 0-2-1H5z'/></svg>"+esc(go)+"</button>"+second+"</div></div>"+img(cover(m),"hc")+"</div></div>";
  }
  function renderHero(){
    var h=$("hero");heroItems=heroList();
    if(!heroItems.length){h.className="hero none";h.innerHTML="";return}
    if(heroIdx>=heroItems.length)heroIdx=0;
    h.className="hero";
    h.innerHTML=heroItems.map(heroSlide).join("")+(heroItems.length>1?"<div class='dots'>"+heroItems.map(function(_,i){return "<button data-dot='"+i+"'"+(i===heroIdx?" class='on'":"")+" aria-label='"+(i+1)+"'></button>"}).join("")+"</div>":"");
    each("[data-open]",h,function(b){b.addEventListener("click",function(){openId(+b.getAttribute("data-open"))})});
    each("[data-plan]",h,function(b){b.addEventListener("click",function(){var id=+b.getAttribute("data-plan"),it=heroItems.filter(function(x){return x.m.id===id})[0];window.webview.send("plan",{id:id,title:it?name(it.m):""})})});
    each("[data-dot]",h,function(b){b.addEventListener("click",function(){showSlide(+b.getAttribute("data-dot"))})});
  }
  function showSlide(i){
    heroIdx=i;
    each(".slide",$("hero"),function(s,j){s.className=j===i?"slide on":"slide"});
    each("[data-dot]",$("hero"),function(d,j){d.className=j===i?"on":""});
  }
  function tick(){if(!heroHover&&heroItems.length>1&&!document.hidden)showSlide((heroIdx+1)%heroItems.length)}

  // ---- Cards
  function poster(m,row,e){
    var mine=byId()[m.id],badge="",sub="",extra="";
    if(LIST[row]){
      if(row==="planning"||!e.progress)sub=[fmt(m.format),m.chapters?F(T.chapters,m.chapters):""].filter(Boolean).join(" · ");
      else{sub=m.chapters?F(T.read,e.progress,m.chapters):F(T.readOnly,e.progress);if(m.chapters)extra="<span class='bar2'><i style='width:"+Math.min(100,Math.round(100*e.progress/m.chapters))+"%'></i></span>"}
    }else{
      if(mine)badge=(T.status&&T.status[mine.status])||T.onList;
      sub=[fmt(m.format),m.startDate&&m.startDate.year||"",m.chapters?F(T.chapters,m.chapters):""].filter(Boolean).join(" · ");
    }
    var score=!LIST[row]&&m.averageScore?"<span class='score'>"+m.averageScore+"%</span>":"";
    return "<button class='card' data-id='"+m.id+"' data-row='"+esc(row)+"'><span class='pic'>"+img(cover(m))+(badge?"<span class='badge'>"+esc(badge)+"</span>":"")+score+extra+"</span><span class='t'>"+esc(name(m))+"</span><span class='s'>"+esc(sub)+"</span></button>";
  }
  function cont(e){
    var m=e.media,p=e.progress||0,pct=m.chapters?Math.min(100,Math.round(100*p/m.chapters)):0;
    var line=m.chapters&&p>=m.chapters?F(T.readAll,p):F(T.nextChapter,p+1);
    var right=m.chapters?p+" / "+m.chapters:(p?F(T.readOnly,p):"");
    var bg=m.bannerImage?img(m.bannerImage,"bg"):img(cover(m),"bg blur");
    return "<button class='cc' data-id='"+m.id+"' data-row='continue'>"+bg+"<span class='fade'></span><span class='in'>"+img(cover(m),"cv")+"<span class='tx'><span class='ct'>"+esc(name(m))+"</span><span class='cs'><span>"+esc(line)+"</span><span>"+esc(right)+"</span></span></span></span>"+(m.chapters?"<span class='pg'><i style='width:"+pct+"%'></i></span>":"")+"</button>";
  }
  function skeleton(){var h="";for(var i=0;i<8;i++)h+="<div class='sk'><i></i><u></u></div>";return h}
  function listItems(id){
    var st=LIST[id],out=entries.filter(function(e){
      if(st.indexOf(e.status)<0||e.media.isAdult)return false;
      if(id==="continue"&&hidden[e.media.id]!==undefined&&(e.progress||0)<=hidden[e.media.id])return false;
      return true;
    });
    out.sort(function(a,b){return (b.updatedAt||0)-(a.updatedAt||0)});
    return out;
  }
  function render(){
    renderHero();
    var h="",shown=0,on=byId(),errShown=false;
    rows.forEach(function(r){
      if(!r.on)return;
      var body="",n=0;
      if(LIST[r.id]){
        var items=listItems(r.id);if(!items.length)return;n=items.length;
        body=items.map(function(e){return r.id==="continue"?cont(e):poster(e.media,r.id,e)}).join("");
      }else{
        var list=ani[r.id];
        if(!list){
          if(!args(r.id))return;
          if(aniState==="loading")body=skeleton();
          else if(aniState&&!errShown){errShown=true;body="<div class='msg'>"+esc(T[aniState])+" <button class='btn' data-retry='1' style='height:32px'>"+esc(T.retry)+"</button></div>"}
          else return;
        }else{
          if(r.id==="foryou")list=list.filter(function(m){return !on[m.id]}).slice(0,24);
          if(!list.length)return;
          body=list.map(function(m){return poster(m,r.id)}).join("");
        }
      }
      shown++;
      h+="<section class='row' data-r='"+esc(r.id)+"'><div class='rh'><h2>"+esc(rowTitle(r.id))+(n>1&&LIST[r.id]?"<span class='cnt'>"+n+"</span>":"")+"</h2><div class='nav'><button data-dir='-1' aria-label='‹'>‹</button><button data-dir='1' aria-label='›'>›</button></div></div><div class='track'>"+body+"</div></section>";
    });
    if(!shown)h="<div class='msg'>"+esc(T.empty)+"</div>";
    var box=$("rows"),keep={};
    each("section",box,function(s){keep[s.getAttribute("data-r")]=s.querySelector(".track").scrollLeft});
    box.innerHTML=h;
    each("section",box,function(s){
      var tr=s.querySelector(".track"),nav=s.querySelector(".nav"),bs=nav.querySelectorAll("button");
      tr.style.scrollBehavior="auto";tr.scrollLeft=keep[s.getAttribute("data-r")]||0;tr.style.scrollBehavior="";
      function upd(){var max=tr.scrollWidth-tr.clientWidth;nav.className=max>4?"nav":"nav no";bs[0].disabled=tr.scrollLeft<=4;bs[1].disabled=tr.scrollLeft>=max-4}
      tr.addEventListener("scroll",upd,{passive:true});window.addEventListener("resize",upd);each("img",tr,function(i){i.addEventListener("load",upd)});upd();
      each("button",nav,function(b){b.addEventListener("click",function(){tr.scrollBy({left:parseInt(b.getAttribute("data-dir"),10)*tr.clientWidth*.85})})});
    });
    bindCards(box);
    each("[data-retry]",box,function(b){b.addEventListener("click",function(){aniState="loading";loadAni(true)})});
  }
  function bindCards(root){
    each("[data-id]",root,function(c){
      c.addEventListener("click",function(){openId(+c.getAttribute("data-id"))});
      c.addEventListener("contextmenu",function(ev){ev.preventDefault();openMenu(c,ev.clientX,ev.clientY)});
    });
  }
  function openId(id){window.webview.send("open",{id:id})}

  // ---- Search with filters (manga only)
  function sel(key,label,opts){
    var h="<label>"+esc(label)+"<select data-k='"+key+"'><option value=''>"+esc(T.any)+"</option>";
    opts.forEach(function(o){h+="<option value='"+esc(o[0])+"'"+(f[key]===String(o[0])?" selected":"")+">"+esc(o[1])+"</option>"});
    return h+"</select></label>";
  }
  function filters(){
    var y=new Date().getFullYear()+1,years=[];for(var i=y;i>=1950;i--)years.push([String(i),String(i)]);
    var o=function(obj){return Object.keys(obj||{}).map(function(k){return[k,obj[k]]})};
    $("filters").innerHTML=sel("sort",T.sort,o(T.sorts))+sel("genre",T.genre,GENRES.map(function(g){return[g,(T.genres&&T.genres[g])||g]}))+
      sel("format",T.format,o(T.formats))+sel("status",T.statusL,o(T.statuses))+sel("country",T.country,o(T.countries))+sel("year",T.year,years);
    each("select[data-k]",$("filters"),function(s){s.addEventListener("change",function(){f[s.getAttribute("data-k")]=s.value;count();search(true)})});
    count();
  }
  function count(){var n=Object.keys(f).filter(function(k){return f[k]}).length,b=$("fcount");b.textContent=n?String(n):"";b.className=n?"n":""}
  function query(){return $("q").value.trim()}
  function active(){return query().length>=1||Object.keys(f).some(function(k){return f[k]})}
  function renderResults(){
    var a=active(),out=$("results");
    $("app").className=a?"searching":"";
    if(!a){out.innerHTML="";return}
    if(sMsg){out.innerHTML="<div class='msg'>"+esc(sMsg)+"</div>";return}
    if(!sItems.length){out.innerHTML="<div class='msg'>"+esc(fetching&&!sItems.length?T.loading:T.none)+"</div>";return}
    out.innerHTML="<div class='grid'>"+sItems.map(function(m){return poster(m,"search")}).join("")+"</div>"+(sMore?"<button class='more' id='more'>"+esc(T.more)+"</button>":"");
    bindCards(out);
    var mb=$("more");if(mb)mb.addEventListener("click",function(){sPage++;run()});
  }
  function search(now){
    clearTimeout(sTimer);sPage=1;sMsg="";
    if(!active()){sSeq++;sItems=[];renderResults();return}
    if(now)sItems=[];
    renderResults();
    sTimer=setTimeout(run,now?50:400);
  }
  function run(){
    var q=query(),my=++sSeq;
    var v={page:sPage,sort:[f.sort||(q?"SEARCH_MATCH":"POPULARITY_DESC")]};
    if(q)v.search=q;if(f.genre)v.genre=f.genre;if(f.format)v.format=f.format;if(f.status)v.status=f.status;if(f.country)v.country=f.country;
    if(f.year){var yy=parseInt(f.year,10);v.sg=yy*10000;v.sl=(yy+1)*10000}
    var key=JSON.stringify(v);
    var done=function(j){
      if(my!==sSeq)return;
      var p=(j&&j.data&&j.data.Page)||{},list=p.media||[];
      sItems=sPage===1?list:sItems.concat(list);sMore=!!(p.pageInfo&&p.pageInfo.hasNextPage);sMsg="";renderResults();
    };
    if(sCache[key]){done(sCache[key]);return}
    var gql="query($page:Int,$search:String,$format:MediaFormat,$genre:String,$sg:FuzzyDateInt,$sl:FuzzyDateInt,$status:MediaStatus,$country:CountryCode,$sort:[MediaSort]){Page(page:$page,perPage:30){pageInfo{hasNextPage}media(type:MANGA,isAdult:false,search:$search,format:$format,genre:$genre,startDate_greater:$sg,startDate_lesser:$sl,status:$status,countryOfOrigin:$country,sort:$sort){id title{english romaji native} coverImage{extraLarge large medium} format chapters status averageScore startDate{year}}}}";
    fetch("https://graphql.anilist.co",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({query:gql,variables:v})})
      .then(function(r){if(r.status===429)throw{busy:true};return r.json()})
      .then(function(j){if(j&&j.data)sCache[key]=j;done(j)})
      .catch(function(e){if(my===sSeq){sMsg=e&&e.busy?T.busy:T.failed;renderResults()}});
  }

  // ---- Right-click menu
  function findMedia(id,row){
    var e=byId()[id];
    if(LIST[row]&&e)return {media:e.media,entry:e};
    var pools=[ani[row]||[],sItems,ani.hero||[]];
    for(var k=0;k<pools.length;k++)for(var i=0;i<pools[k].length;i++)if(pools[k][i].id===id)return {media:pools[k][i],entry:e};
    return e?{media:e.media,entry:e}:null;
  }
  function openMenu(card,x,y){
    var id=parseInt(card.getAttribute("data-id"),10),row=card.getAttribute("data-row"),f2=findMedia(id,row);if(!f2)return;
    menuFor={id:id,row:row,title:name(f2.media),progress:f2.entry?f2.entry.progress||0:0};
    var h="<button data-a='open'>"+esc(T.open)+"</button>";
    if(row==="continue")h+="<button data-a='hide'>"+esc(T.hide)+"</button>";
    else if(!f2.entry)h+="<button data-a='plan'>"+esc(T.plan)+"</button>";
    var m=$("menu");m.innerHTML=h;m.className="menu open";
    var w=m.offsetWidth,hh=m.offsetHeight;
    m.style.left=Math.max(4,Math.min(x,window.innerWidth-w-4))+"px";
    m.style.top=Math.max(4,Math.min(y,window.innerHeight-hh-4))+"px";
    each("button",m,function(b){
      b.addEventListener("click",function(){
        var a=b.getAttribute("data-a"),it=menuFor;closeMenu();if(!it)return;
        if(a==="open")openId(it.id);
        if(a==="hide")window.webview.send("hide",{id:it.id,progress:it.progress,title:it.title});
        if(a==="plan")window.webview.send("plan",{id:it.id,title:it.title});
      });
    });
  }
  function closeMenu(){menuFor=null;$("menu").className="menu"}
  document.addEventListener("click",function(e){if(!e.target.closest||!e.target.closest(".menu"))closeMenu()});
  document.addEventListener("keydown",function(e){if(e.key==="Escape")closeMenu()});
  document.addEventListener("scroll",closeMenu,true);

  // ---- Customize
  function panel(){
    var p=$("panel"),h="<p>"+esc(T.hint)+"</p><div class='cols'>";
    rows.forEach(function(r,i){
      h+="<div class='pr'><label><input type='checkbox' data-i='"+i+"'"+(r.on?" checked":"")+"><span>"+esc(panelName(r.id))+"</span></label>"+
        "<button class='ib' data-up='"+i+"' title='"+esc(T.up)+"'"+(i===0?" disabled":"")+">↑</button>"+
        "<button class='ib' data-down='"+i+"' title='"+esc(T.down)+"'"+(i===rows.length-1?" disabled":"")+">↓</button>"+
        (r.id.indexOf("genre:")===0?"<button class='ib' data-del='"+i+"' title='"+esc(T.remove)+"'>×</button>":"<span style='width:30px;flex:none'></span>")+"</div>";
    });
    h+="</div>";
    var free=GENRES.filter(function(g){return !rows.some(function(r){return r.id==="genre:"+g})});
    h+="<div class='add'><select id='gsel'><option value='' disabled selected>"+esc(T.addGenre)+"</option>"+free.map(function(g){return "<option value='"+esc(g)+"'>"+esc((T.genres&&T.genres[g])||g)+"</option>"}).join("")+"</select><button class='btn' id='gadd'>"+esc(T.add)+"</button></div>";
    var nh=Object.keys(hidden).length;
    h+="<div class='add'><button class='btn' id='rdef'>"+esc(T.resetRows)+"</button>"+(nh?"<button class='btn' id='unh'>"+esc(F(T.unhide,nh))+"</button>":"")+"</div>";
    p.innerHTML=h;
    each("input[data-i]",p,function(c){c.addEventListener("change",function(){rows[+c.getAttribute("data-i")].on=c.checked;changed()})});
    each("[data-up],[data-down]",p,function(b){b.addEventListener("click",function(){
      var up=b.hasAttribute("data-up"),i=+(b.getAttribute(up?"data-up":"data-down")),j=up?i-1:i+1;if(j<0||j>=rows.length)return;
      var x=rows[i];rows[i]=rows[j];rows[j]=x;changed();
    })});
    each("[data-del]",p,function(b){b.addEventListener("click",function(){rows.splice(+b.getAttribute("data-del"),1);changed()})});
    $("gadd").addEventListener("click",function(){var g=$("gsel").value;if(!g)return;rows.push({id:"genre:"+g,on:true});changed()});
    $("rdef").addEventListener("click",function(){window.webview.send("config",{reset:true})});
    var un=$("unh");if(un)un.addEventListener("click",function(){window.webview.send("unhide",{})});
  }
  function changed(){panel();window.webview.send("config",{rows:rows});loadAni(false)}
  function toggle(id,btn,other,otherBtn){
    var p=$(id),o=p.className.indexOf("open")<0;p.className=o?"panel open":"panel";$(btn).className=o?"btn on":"btn";
    if(o){$(other).className="panel";$(otherBtn).className="btn"}
    return o;
  }

  function start(){
    if(!window.webview){setTimeout(start,100);return}
    window.webview.on("init",function(d){
      T=d.text||{};rows=d.rows||[];entries=d.entries||[];hidden=d.hidden||{};cache=d.cache||cache;title=d.titleLanguage||"english";heroMode=d.banner||"trending";
      idx={};entries.forEach(function(e){idx[e.media.id]=e});
      if(d.accent)document.documentElement.style.setProperty("--a",d.accent);
      $("custl").textContent=T.customize;$("fl").textContent=T.filters;$("q").placeholder=T.searchPh;$("clear").textContent=T.clear;
      if(!$("filters").innerHTML)filters();
      if($("panel").className.indexOf("open")>=0)panel();
      loadAni(false);
    });
    $("cust").addEventListener("click",function(){if(toggle("panel","cust","fpanel","fbtn"))panel()});
    $("fbtn").addEventListener("click",function(){toggle("fpanel","fbtn","panel","cust")});
    $("clear").addEventListener("click",function(){Object.keys(f).forEach(function(k){f[k]=""});$("q").value="";filters();search(true)});
    $("q").addEventListener("input",function(){search(false)});
    $("q").addEventListener("keydown",function(e){if(e.key==="Enter")search(true);if(e.key==="Escape"){$("q").value="";search(true)}});
    $("hero").addEventListener("mouseenter",function(){heroHover=true});
    $("hero").addEventListener("mouseleave",function(){heroHover=false});
    heroTimer=setInterval(tick,8000);
    window.webview.send("ready",{});
  }
  start();
})();
</script></body></html>`

        // ---- The rows
        let view = null
        try {
            view = ctx.newWebview({ slot: "manga-screen-bottom", fullWidth: true, autoHeight: true })
            view.setContent(() => MANGA_HTML)
        }
        catch (e) {
            console.error("viktempest-ui manga: could not create the manga rows", e)
            return
        }

        function sendInit() {
            const l = lang()
            view.channel.send("init", {
                text: pageText(l),
                banner: pref("mangaBanner", "trending"),
                rows: rowConfig(),
                defaults: MANGA_ROWS,
                entries: listEntries(),
                hidden: load(HIDDEN_KEY, {}) || {},
                cache: load(CACHE_KEY, null),
                titleLanguage: pref("titleLanguage", "english"),
                accent: accent(),
            })
        }

        view.channel.on("ready", () => {
            if (typeof vsHealth === "function") vsHealth("manga")
            applyCss()
            sendInit()
        })
        view.channel.on("open", (e) => {
            if (e && e.id) ctx.screen.navigateTo("/manga/entry", { id: String(e.id) })
        })
        view.channel.on("config", (e) => {
            if (e && Array.isArray(e.rows)) save(ROWS_KEY, e.rows.map((r) => ({ id: String(r.id), on: r.on !== false })))
            if (e && e.reset) save(ROWS_KEY, null)
            sendInit()
        })
        view.channel.on("cache", (e) => {
            if (e && e.key && e.data) save(CACHE_KEY, { key: String(e.key), at: Date.now(), data: e.data })
        })
        view.channel.on("hide", (e) => {
            if (!e || !e.id) return
            const hidden = load(HIDDEN_KEY, {}) || {}
            hidden[String(e.id)] = Number(e.progress) || 0
            save(HIDDEN_KEY, hidden)
            try { ctx.toast.info(t("hidden", e.title || "")) } catch (err) {}
            sendInit()
        })
        view.channel.on("unhide", () => {
            save(HIDDEN_KEY, {})
            sendInit()
        })
        view.channel.on("plan", (e) => {
            if (!e || !e.id) return
            try {
                $anilist.addMediaToCollection([Number(e.id)])
                try { $anilist.refreshMangaCollection() } catch (err) {}
                ctx.toast.success(t("planned", e.title || ""))
            }
            catch (err) {
                ctx.toast.error(t("planFailed", e.title || "", String((err && err.message) || err)))
            }
            sendInit()
        })

    })
}
