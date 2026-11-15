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
  :root{color-scheme:dark;--a:#e50914}
  *{box-sizing:border-box}
  html,body{margin:0;background:transparent;color:#e5e5e5;font:15px/1.4 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;overflow-x:hidden}
  .wrap{padding:8px 16px 4px}
  .top{display:flex;justify-content:flex-end;margin-bottom:-6px;position:relative;z-index:2}
  .btn{height:34px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(20,20,20,.75);color:#fff;padding:0 14px;cursor:pointer;font:inherit;font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:6px}
  .btn:hover{border-color:var(--a)}
  .panel{display:none;max-width:560px;margin:12px 0 8px auto;padding:14px;border-radius:14px;border:1px solid rgba(255,255,255,.1);background:rgba(20,20,20,.95)}
  .panel.open{display:block}
  .panel p{margin:0 0 10px;color:#9a9a9a;font-size:12.5px}
  .pr{display:flex;align-items:center;gap:8px;padding:6px 2px;border-top:1px solid rgba(255,255,255,.06)}
  .pr:first-of-type{border-top:0}
  .pr label{flex:1;display:flex;align-items:center;gap:10px;cursor:pointer;min-width:0}
  .pr input{width:17px;height:17px;accent-color:var(--a);flex:none}
  .pr span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .ib{width:30px;height:30px;border-radius:8px;border:0;background:rgba(255,255,255,.06);color:#ddd;cursor:pointer;font-size:14px;flex:none}
  .ib:hover:not(:disabled){background:rgba(255,255,255,.14)}
  .ib:disabled{opacity:.3;cursor:default}
  .add{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
  select{height:34px;border-radius:9px;border:1px solid rgba(255,255,255,.14);background:#151515;color:#fff;padding:0 8px;font:inherit;font-size:14px;flex:1;min-width:140px}
  .row{margin:22px 0 4px}
  .rh{display:flex;align-items:center;gap:8px;margin:0 0 10px}
  h2{margin:0;font-size:1.35rem;font-weight:700;color:#fff;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .nav{display:flex;gap:6px}
  .nav button{width:32px;height:32px;border-radius:50%;border:0;background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:16px;line-height:1}
  .nav button:hover{background:rgba(255,255,255,.18)}
  @media (hover:none){.nav{display:none}}
  .track{display:flex;gap:14px;overflow-x:auto;scroll-behavior:smooth;scroll-snap-type:x proximity;padding:6px 2px 10px;scrollbar-width:none}
  .track::-webkit-scrollbar{display:none}
  .card{flex:none;width:clamp(128px,14vw,184px);scroll-snap-align:start;cursor:pointer;background:none;border:0;padding:0;text-align:left;color:inherit;font:inherit;position:relative}
  .pic{position:relative;border-radius:8px;overflow:hidden;background:#1c1c1c;aspect-ratio:2/3;transition:transform .2s,box-shadow .2s}
  .pic img{width:100%;height:100%;object-fit:cover;display:block}
  .card:hover .pic,.card:focus-visible .pic{transform:translateY(-3px);box-shadow:0 10px 24px rgba(0,0,0,.6),0 0 0 2px rgba(255,255,255,.8)}
  .badge{position:absolute;left:6px;top:6px;font-size:10.5px;font-weight:700;padding:2px 7px;border-radius:6px;background:rgba(0,0,0,.72);color:#fff;backdrop-filter:blur(4px)}
  .score{position:absolute;right:6px;bottom:6px;font-size:11px;font-weight:700;padding:2px 6px;border-radius:6px;background:rgba(0,0,0,.72);color:#fff}
  .t{margin-top:7px;font-weight:600;font-size:.88rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .s{color:#8f8f8f;font-size:.76rem;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .cc{flex:none;width:clamp(260px,30vw,400px);aspect-ratio:16/8;scroll-snap-align:start;cursor:pointer;border:0;padding:0;border-radius:10px;overflow:hidden;position:relative;background:#1c1c1c;color:#fff;text-align:left;font:inherit;transition:transform .2s,box-shadow .2s}
  .cc:hover,.cc:focus-visible{transform:translateY(-3px);box-shadow:0 10px 24px rgba(0,0,0,.6),0 0 0 2px rgba(255,255,255,.8)}
  .cc .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(.55)}
  .cc .bg.blur{filter:brightness(.4) blur(14px);transform:scale(1.2)}
  .cc .fade{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.92),rgba(0,0,0,.15) 65%)}
  .cc .in{position:absolute;left:0;right:0;bottom:0;display:flex;gap:12px;align-items:flex-end;padding:12px}
  .cc .cv{width:22%;max-width:78px;aspect-ratio:2/3;object-fit:cover;border-radius:6px;box-shadow:0 4px 14px rgba(0,0,0,.6);flex:none}
  .cc .tx{flex:1;min-width:0}
  .cc .ct{font-weight:700;font-size:1rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .cc .cs{color:#d0d0d0;font-size:.8rem;margin-top:3px}
  .cc .pg{height:4px;border-radius:2px;background:rgba(255,255,255,.2);margin-top:7px;overflow:hidden}
  .cc .pg i{display:block;height:100%;background:var(--a)}
  .msg{color:#999;padding:14px 2px;font-size:.9rem}
  .menu{position:fixed;z-index:50;min-width:220px;padding:5px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:rgba(18,18,18,.98);box-shadow:0 12px 30px rgba(0,0,0,.6);display:none}
  .menu.open{display:block}
  .menu button{display:block;width:100%;text-align:left;border:0;background:none;color:#eee;padding:8px 10px;border-radius:7px;font:inherit;font-size:14px;cursor:pointer}
  .menu button:hover{background:rgba(255,255,255,.08)}
</style></head><body>
<div class="wrap">
  <div class="top"><button class="btn" id="cust"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg><span id="custl"></span></button></div>
  <div class="panel" id="panel"></div>
  <div id="rows"></div>
</div>
<div class="menu" id="menu"></div>
<script>
(function(){
  var T={},rows=[],defaults=[],entries=[],hidden={},title="english",cache=null,ani={},aniState="",fetching=false,menuFor=null;
  var GENRES=["Action","Adventure","Comedy","Drama","Ecchi","Fantasy","Horror","Mahou Shoujo","Mecha","Music","Mystery","Psychological","Romance","Sci-Fi","Slice of Life","Sports","Supernatural","Thriller"];
  var LIST={continue:["CURRENT","REPEATING"],planning:["PLANNING"],paused:["PAUSED"],completed:["COMPLETED"]};
  var TTL=6*3600*1000;
  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
  function F(s,a,b){s=String(s||"");if(a!==undefined)s=s.split("{0}").join(String(a));if(b!==undefined)s=s.split("{1}").join(String(b));return s}
  function name(m){var t=m.title||{};return title==="native"?(t.native||t.romaji||t.english||""):title==="romaji"?(t.romaji||t.english||t.native||""):(t.english||t.romaji||t.native||"")}
  function cover(m){var c=m.coverImage||{};return c.extraLarge||c.large||c.medium||""}
  function byId(){var o={};entries.forEach(function(e){o[e.media.id]=e});return o}

  // Your favourite genre: what you read and finished, rated a little higher
  function favGenre(){
    var w={};
    entries.forEach(function(e){
      if(["CURRENT","COMPLETED","REPEATING"].indexOf(e.status)<0)return;
      var p=1+(e.score>=8||(e.score>=80)?1:0);
      (e.media.genres||[]).forEach(function(g){if(g!=="Hentai")w[g]=(w[g]||0)+p});
    });
    var best="",n=0;Object.keys(w).forEach(function(g){if(w[g]>n){n=w[g];best=g}});
    return best;
  }
  function rowTitle(id){
    if(id.indexOf("genre:")===0)return F(T.genreRow,id.slice(6));
    if(id==="foryou"){var g=favGenre();return g?F(T.forYou,g):T.forYouName}
    return {continue:T.continue,new:T.new,trending:T.trending,popular:T.popular,top:T.top,manhwa:T.manhwa,planning:T.planning,paused:T.paused,completed:T.completed}[id]||id;
  }
  function panelName(id){return id==="foryou"?T.forYouName:rowTitle(id)}

  // ---- AniList rows: one request for all of them, saved for 6 hours
  function aniRows(){return rows.filter(function(r){return r.on&&(r.id.indexOf("genre:")===0||["new","trending","popular","top","manhwa","foryou"].indexOf(r.id)>=0)})}
  function yearAgo(){var d=new Date();return (d.getFullYear()-1)*10000+(d.getMonth()+1)*100+d.getDate()}
  function args(id){
    var base="type:MANGA,isAdult:false";
    if(id==="new")return base+",startDate_greater:"+yearAgo()+",sort:[TRENDING_DESC]";
    if(id==="trending")return base+",sort:[TRENDING_DESC]";
    if(id==="popular")return base+",sort:[POPULARITY_DESC]";
    if(id==="top")return base+",sort:[SCORE_DESC],popularity_greater:5000";
    if(id==="manhwa")return base+",countryOfOrigin:\\"KR\\",sort:[TRENDING_DESC]";
    if(id==="foryou"){var g=favGenre();return g?base+",genre:"+JSON.stringify(g)+",sort:[POPULARITY_DESC]":""}
    if(id.indexOf("genre:")===0)return base+",genre:"+JSON.stringify(id.slice(6))+",sort:[TRENDING_DESC]";
    return "";
  }
  function plan(){
    var parts=[],map={};
    aniRows().forEach(function(r,i){var a=args(r.id);if(!a)return;var al="r"+i;map[al]=r.id;
      parts.push(al+":Page(perPage:"+(r.id==="foryou"?40:24)+"){media("+a+"){...F}}")});
    if(!parts.length)return null;
    var q="query{"+parts.join(" ")+"} fragment F on Media{id title{english romaji native} coverImage{extraLarge large medium} bannerImage format chapters status averageScore genres countryOfOrigin startDate{year}}";
    return {key:q,map:map};
  }
  function useData(p,data){
    ani={};
    Object.keys(p.map).forEach(function(al){ani[p.map[al]]=(data[al]&&data[al].media)||[]});
  }
  function loadAni(force){
    var p=plan();
    if(!p){ani={};aniState="";render();return}
    var fresh=cache&&cache.key===p.key&&cache.data&&Date.now()-(cache.at||0)<TTL;
    if(cache&&cache.key===p.key&&cache.data){useData(p,cache.data);aniState=""}
    if(fresh&&!force){render();return}
    if(fetching)return;
    if(!cache||cache.key!==p.key){ani={};aniState="loading"}
    render();
    fetching=true;
    fetch("https://graphql.anilist.co",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({query:p.key})})
      .then(function(r){if(r.status===429)throw{busy:true};return r.json()})
      .then(function(j){
        fetching=false;
        if(!j||!j.data)throw{failed:true};
        cache={key:p.key,at:Date.now(),data:j.data};
        window.webview.send("cache",{key:p.key,data:j.data});
        if(plan()&&plan().key===p.key){useData(p,j.data);aniState=""}
        render();
      })
      .catch(function(e){fetching=false;if(!Object.keys(ani).length)aniState=e&&e.busy?"busy":"failed";render()});
  }

  // ---- Cards
  function poster(m,row,e){
    var mine=byId()[m.id],badge="",sub="";
    if(LIST[row]){
      if(row==="planning"||!e.progress)sub=m.chapters?F(T.chapters,m.chapters):(m.format||"").replace("_"," ");
      else sub=m.chapters?F(T.read,e.progress,m.chapters):F(T.readOnly,e.progress);
    }else{
      if(mine)badge=(T.status&&T.status[mine.status])||T.onList;
      sub=[(m.format||"").replace("_"," "),m.startDate&&m.startDate.year||"",m.chapters?F(T.chapters,m.chapters):""].filter(Boolean).join(" · ");
    }
    var score=!LIST[row]&&m.averageScore?"<span class='score'>"+m.averageScore+"%</span>":"";
    return "<button class='card' data-id='"+m.id+"' data-row='"+esc(row)+"'><div class='pic'><img loading='lazy' alt='' src='"+esc(cover(m))+"'>"+(badge?"<span class='badge'>"+esc(badge)+"</span>":"")+score+"</div><div class='t'>"+esc(name(m))+"</div><div class='s'>"+esc(sub)+"</div></button>";
  }
  function cont(e){
    var m=e.media,next=(e.progress||0)+1,pct=m.chapters?Math.min(100,Math.round(100*(e.progress||0)/m.chapters)):0;
    var line=m.chapters&&e.progress>=m.chapters?F(T.read,e.progress,m.chapters):F(T.nextChapter,next);
    var sub=m.chapters?F(T.read,e.progress||0,m.chapters):(e.progress?F(T.readOnly,e.progress):"");
    var bg=m.bannerImage?"<img class='bg' alt='' loading='lazy' src='"+esc(m.bannerImage)+"'>":"<img class='bg blur' alt='' loading='lazy' src='"+esc(cover(m))+"'>";
    return "<button class='cc' data-id='"+m.id+"' data-row='continue'>"+bg+"<div class='fade'></div><div class='in'><img class='cv' alt='' loading='lazy' src='"+esc(cover(m))+"'><div class='tx'><div class='ct'>"+esc(name(m))+"</div><div class='cs'>"+esc(line)+(sub&&line!==sub?" · "+esc(sub):"")+"</div>"+(m.chapters?"<div class='pg'><i style='width:"+pct+"%'></i></div>":"")+"</div></div></button>";
  }
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
    var h="",shown=0,on=byId();
    rows.forEach(function(r){
      if(!r.on)return;
      var body="";
      if(LIST[r.id]){
        var items=listItems(r.id);if(!items.length)return;
        body=items.map(function(e){return r.id==="continue"?cont(e):poster(e.media,r.id,e)}).join("");
      }else{
        var list=ani[r.id];
        if(!list){
          if(!args(r.id))return;
          body=aniState?"<div class='msg'>"+esc(T[aniState]||T.loading)+"</div>":"";
          if(!body)return;
        }else{
          if(r.id==="foryou")list=list.filter(function(m){return !on[m.id]}).slice(0,24);
          if(!list.length)return;
          body=list.map(function(m){return poster(m,r.id)}).join("");
        }
      }
      shown++;
      h+="<section class='row'><div class='rh'><h2>"+esc(rowTitle(r.id))+"</h2><div class='nav'><button data-dir='-1' aria-label='‹'>‹</button><button data-dir='1' aria-label='›'>›</button></div></div><div class='track'>"+body+"</div></section>";
    });
    if(!shown)h="<div class='msg'>"+esc(T.empty)+"</div>";
    var box=document.getElementById("rows"),keep={};
    Array.prototype.forEach.call(box.querySelectorAll("section"),function(s,i){keep[i]=s.querySelector(".track").scrollLeft});
    box.innerHTML=h;
    Array.prototype.forEach.call(box.querySelectorAll("section"),function(s,i){
      var tr=s.querySelector(".track");if(keep[i])tr.scrollLeft=keep[i];
      Array.prototype.forEach.call(s.querySelectorAll(".nav button"),function(b){
        b.addEventListener("click",function(){tr.scrollBy({left:parseInt(b.getAttribute("data-dir"),10)*tr.clientWidth*.85})});
      });
    });
    Array.prototype.forEach.call(box.querySelectorAll("[data-id]"),function(c){
      c.addEventListener("click",function(){window.webview.send("open",{id:parseInt(c.getAttribute("data-id"),10)})});
      c.addEventListener("contextmenu",function(ev){ev.preventDefault();openMenu(c,ev.clientX,ev.clientY)});
    });
  }

  // ---- Right-click menu
  function findMedia(id,row){
    var e=byId()[id];
    if(LIST[row]&&e)return {media:e.media,entry:e};
    var list=ani[row]||[];for(var i=0;i<list.length;i++)if(list[i].id===id)return {media:list[i],entry:e};
    return e?{media:e.media,entry:e}:null;
  }
  function openMenu(card,x,y){
    var id=parseInt(card.getAttribute("data-id"),10),row=card.getAttribute("data-row"),f=findMedia(id,row);if(!f)return;
    menuFor={id:id,row:row,title:name(f.media),progress:f.entry?f.entry.progress||0:0};
    var h="<button data-a='open'>"+esc(T.open)+"</button>";
    if(row==="continue")h+="<button data-a='hide'>"+esc(T.hide)+"</button>";
    else if(!f.entry)h+="<button data-a='plan'>"+esc(T.plan)+"</button>";
    var m=document.getElementById("menu");m.innerHTML=h;m.className="menu open";
    var w=m.offsetWidth,hh=m.offsetHeight;
    m.style.left=Math.max(4,Math.min(x,window.innerWidth-w-4))+"px";
    m.style.top=Math.max(4,Math.min(y,window.innerHeight-hh-4))+"px";
    Array.prototype.forEach.call(m.querySelectorAll("button"),function(b){
      b.addEventListener("click",function(){
        var a=b.getAttribute("data-a"),f2=menuFor;closeMenu();if(!f2)return;
        if(a==="open")window.webview.send("open",{id:f2.id});
        if(a==="hide")window.webview.send("hide",{id:f2.id,progress:f2.progress,title:f2.title});
        if(a==="plan")window.webview.send("plan",{id:f2.id,title:f2.title});
      });
    });
  }
  function closeMenu(){menuFor=null;document.getElementById("menu").className="menu"}
  document.addEventListener("click",function(e){if(!e.target.closest||!e.target.closest(".menu"))closeMenu()});
  document.addEventListener("keydown",function(e){if(e.key==="Escape")closeMenu()});
  document.addEventListener("scroll",closeMenu,true);

  // ---- Customize
  function panel(){
    var p=document.getElementById("panel");
    var h="<p>"+esc(T.hint)+"</p>";
    rows.forEach(function(r,i){
      h+="<div class='pr'><label><input type='checkbox' data-i='"+i+"'"+(r.on?" checked":"")+"><span>"+esc(panelName(r.id))+"</span></label>"+
        "<button class='ib' data-up='"+i+"' title='"+esc(T.up)+"'"+(i===0?" disabled":"")+">↑</button>"+
        "<button class='ib' data-down='"+i+"' title='"+esc(T.down)+"'"+(i===rows.length-1?" disabled":"")+">↓</button>"+
        (r.id.indexOf("genre:")===0?"<button class='ib' data-del='"+i+"' title='"+esc(T.remove)+"'>×</button>":"<span style='width:30px;flex:none'></span>")+"</div>";
    });
    var free=GENRES.filter(function(g){return !rows.some(function(r){return r.id==="genre:"+g})});
    h+="<div class='add'><select id='gsel'><option value='' disabled selected>"+esc(T.addGenre)+"</option>"+free.map(function(g){return "<option>"+esc(g)+"</option>"}).join("")+"</select><button class='btn' id='gadd'>"+esc(T.add)+"</button></div>";
    var nh=Object.keys(hidden).length;
    h+="<div class='add'><button class='btn' id='rdef'>"+esc(T.resetRows)+"</button>"+(nh?"<button class='btn' id='unh'>"+esc(F(T.unhide,nh))+"</button>":"")+"</div>";
    p.innerHTML=h;
    Array.prototype.forEach.call(p.querySelectorAll("input[data-i]"),function(c){c.addEventListener("change",function(){rows[+c.getAttribute("data-i")].on=c.checked;changed()})});
    Array.prototype.forEach.call(p.querySelectorAll("[data-up],[data-down]"),function(b){b.addEventListener("click",function(){
      var up=b.hasAttribute("data-up"),i=+(b.getAttribute(up?"data-up":"data-down")),j=up?i-1:i+1;if(j<0||j>=rows.length)return;
      var x=rows[i];rows[i]=rows[j];rows[j]=x;changed();
    })});
    Array.prototype.forEach.call(p.querySelectorAll("[data-del]"),function(b){b.addEventListener("click",function(){rows.splice(+b.getAttribute("data-del"),1);changed()})});
    var ga=document.getElementById("gadd");if(ga)ga.addEventListener("click",function(){var g=document.getElementById("gsel").value;if(!g)return;rows.push({id:"genre:"+g,on:true});changed()});
    document.getElementById("rdef").addEventListener("click",function(){window.webview.send("config",{reset:true})});
    var un=document.getElementById("unh");if(un)un.addEventListener("click",function(){window.webview.send("unhide",{})});
  }
  function changed(){panel();window.webview.send("config",{rows:rows});loadAni(false)}

  function start(){
    if(!window.webview){setTimeout(start,100);return}
    window.webview.on("init",function(d){
      T=d.text||{};rows=d.rows||[];defaults=d.defaults||[];entries=d.entries||[];hidden=d.hidden||{};cache=d.cache||cache;title=d.titleLanguage||"english";
      if(d.accent)document.documentElement.style.setProperty("--a",d.accent);
      document.getElementById("custl").textContent=T.customize;
      if(document.getElementById("panel").className.indexOf("open")>=0)panel();
      loadAni(false);
    });
    document.getElementById("cust").addEventListener("click",function(){
      var p=document.getElementById("panel"),o=p.className.indexOf("open")<0;p.className=o?"panel open":"panel";
      document.getElementById("custl").textContent=o?T.done:T.customize;if(o)panel();
    });
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
                text: TEXT[l],
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
