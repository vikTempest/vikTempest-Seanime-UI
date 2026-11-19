// Test for providers/aniworld/provider.js with a stand-in for aniworld.to, AniList and VidMoly.
// Usage (from the repository root):  node test/aniworld.js
const fs = require("fs")
const vm = require("vm")
const assert = require("assert")

const src = fs.readFileSync(__dirname + "/../providers/aniworld/provider.js", "utf8")
let failures = 0

// ---- AniList: id -> { format, title, episodes, prequel: [id, format] }
const tv = (title, episodes, prequel) => ({ format: "TV", title, episodes, prequel: prequel ? [prequel, "TV"] : null })
const anilist = {
    // Demon Slayer: TV -> movie -> TV arc -> TV arc
    100: tv("Kimetsu no Yaiba", 26),
    101: tv("Kimetsu no Yaiba: Mugen Ressha-hen", 7),
    102: { format: "MOVIE", title: "Kimetsu no Yaiba Movie: Mugen Ressha-hen", episodes: 1, prequel: [100, "TV"] },
    103: tv("Kimetsu no Yaiba: Yuukaku-hen", 11, 101),
    // Food Wars
    200: tv("Shokugeki no Souma", 24),
    201: tv("Shokugeki no Souma: Ni no Sara", 13, 200),
    202: tv("Shokugeki no Souma: San no Sara", 12, 201),
    203: tv("Shokugeki no Souma: San no Sara - Tootsuki Ressha-hen", 12, 202),
    204: tv("Shokugeki no Souma: Shin no Sara", 12, 203),
    // Black Clover: 170 episodes -> movie -> new season, still airing
    300: tv("Black Clover", 170),
    301: { format: "MOVIE", title: "Black Clover: Mahou Tei no Ken", episodes: 1, prequel: [300, "TV"] },
    302: tv("Black Clover (2026)", null),
    // Show with a broken prequel chain on AniList
    400: tv("Overlord IV", 13),
}
anilist[101].prequel = [102, "MOVIE"]
anilist[302].prequel = [301, "MOVIE"]

// ---- aniworld.to
const searchIndex = {
    "Kimetsu no Yaiba": "demon-slayer-kimetsu-no-yaiba",
    "Shokugeki no Souma": "food-wars-shokugeki-no-sma",
    "Black Clover": "black-clover",
    "Re:Zero kara Hajimeru Isekai Seikatsu": "rezero-starting-life-in-another-world",
    "Overlord": "overlord",
}
const site = {}
const searches = []
function show(slug, counts, films) {
    const base = `/anime/stream/${slug}`
    site[base] = Object.keys(counts).map((n) => `<li><a href="${base}/staffel-${n}" title="Staffel ${n}">${n}</a></li>`).join("") +
        (films ? `<li><a href="${base}/filme">Filme</a></li>` : "")
    Object.keys(counts).forEach((n) => {
        site[`${base}/staffel-${n}`] = site[base] + Array.from({ length: counts[n] }, (_, i) =>
            `<tr data-episode-id="${n}${i}"><td><a href="${base}/staffel-${n}/episode-${i + 1}">Folge ${i + 1}</a></td>` +
            `<td><a href="${base}/staffel-${n}/episode-${i + 1}"><i class="icon VidMoly"></i></a></td></tr>`).join("")
    })
    if (films) site[`${base}/filme`] = `<a href="${base}/filme/film-1">Film 1</a><a href="${base}/filme/film-2">Film 2</a>`
}
show("demon-slayer-kimetsu-no-yaiba", { 1: 26, 2: 18, 3: 11 }, true)
show("food-wars-shokugeki-no-sma", { 1: 24, 2: 13, 3: 24, 4: 12, 5: 13 })
show("black-clover", { 1: 51, 2: 51, 3: 52, 4: 16, 5: 3 }, true)
show("rezero-starting-life-in-another-world", { 1: 25, 2: 25 })
show("overlord", { 1: 13, 2: 13, 3: 13, 4: 13 })

const hosters = (items) => "<ul>" + items.map(([lang, hoster, target]) =>
    `<li class="episodeLink1" data-lang-key="${lang}" data-link-id="1" data-link-target="${target}" data-external-embed="false">` +
    `<a class="watchEpisode" href="${target}"><i class="icon ${hoster}" title="Hoster ${hoster}"></i><h4>${hoster}</h4></a></li>`).join("") + "</ul>"

async function fetchStub(url, opts) {
    opts = opts || {}
    if (url === "https://graphql.anilist.co") {
        const id = JSON.parse(opts.body).variables.id
        const m = anilist[id]
        const edges = m && m.prequel ? [{ relationType: "PREQUEL", node: { id: m.prequel[0], type: "ANIME", format: m.prequel[1] } }] : []
        return { json: async () => ({ data: { Media: m ? { id, format: m.format, episodes: m.episodes, title: { romaji: m.title }, relations: { edges } } : null } }) }
    }
    if (url === "https://aniworld.to/ajax/search") {
        const kw = decodeURIComponent(opts.body.replace("keyword=", ""))
        searches.push(kw)
        const slug = searchIndex[kw]
        const list = slug ? [{ link: `/anime/stream/${slug}`, title: `<em>${kw}</em>` }, { link: "/support/anime", title: "x" }] : []
        return { status: 200, text: async () => JSON.stringify(list) }
    }
    if (url === "https://aniworld.to/redirect/vm-broken") return { url: "https://vidmoly.net/w/dead", text: async () => "" }
    if (url === "https://aniworld.to/redirect/vm") return { url: "https://vidmoly.net/w/abc123", text: async () => "<html>Checking your browser</html>" }
    if (url === "https://vidmoly.net/embed-abc123.html") {
        const ok = opts.headers && opts.headers.Cookie === "cf_turnstile_demo_pass_abc123=1"
        return { url, text: async () => ok ? "player.setup({ sources: [{file:'https://cdn.vmeas.cloud/hls/xyz/master.m3u8'}] })" : "" }
    }
    const path = url.replace("https://aniworld.to", "")
    if (site[path] === undefined) return { url, status: 404, text: async () => "Not found" }
    return { url, status: 200, text: async () => site[path] }
}

const sandbox = { fetch: fetchStub, console, Date }
vm.createContext(sandbox)
vm.runInContext(src + "\nthis.Provider = Provider; this.titleSeason = titleSeason; this.searchTerms = searchTerms", sandbox)
const p = new sandbox.Provider()

const search = (query, id, dub, format) => p.search({ query, dub: !!dub, year: 0, media: { id, format: format || "TV", romajiTitle: query, synonyms: [] } })

async function check(name, fn) {
    try { await fn(); console.log("ok   " + name) }
    catch (e) { failures++; console.log("FAIL " + name + "\n     " + (e && e.stack || e)) }
}

;(async () => {
    await check("season written in titles", () => {
        const s = sandbox.titleSeason
        assert.strictEqual(s("Shingeki no Kyojin Season 3 Part 2"), 3)
        assert.strictEqual(s("Re:Zero kara Hajimeru Isekai Seikatsu 2nd Season"), 2)
        assert.strictEqual(s("Mushoku Tensei II: Isekai Ittara Honki Dasu"), 2)
        assert.strictEqual(s("Overlord IV"), 4)
        assert.strictEqual(s("Kimetsu no Yaiba: Yuukaku-hen"), 0)
        assert.strictEqual(s("Kaijuu 8-gou"), 0)
    })
    await check("search terms get shorter", () => {
        const t = sandbox.searchTerms("Shokugeki no Souma: San no Sara - Tootsuki Ressha-hen")
        assert.strictEqual(t[0], "Shokugeki no Souma: San no Sara - Tootsuki Ressha-hen")
        assert.ok(t.indexOf("Shokugeki no Souma") > 0)
    })
    await check("first season: plain id, only show links", async () => {
        const r = await search("Kimetsu no Yaiba", 100)
        assert.strictEqual(r.length, 1)
        assert.strictEqual(r[0].id, "demon-slayer-kimetsu-no-yaiba|b:0|e:26")
        assert.strictEqual(r[0].title, "Kimetsu no Yaiba")
        const eps = await p.findEpisodes(r[0].id)
        assert.strictEqual(eps.length, 26)
        assert.strictEqual(eps[0].url, "https://aniworld.to/anime/stream/demon-slayer-kimetsu-no-yaiba/staffel-1/episode-1")
    })
    await check("Black Clover new season: episode 171 on, that is Staffel 5", async () => {
        const r = await search("Black Clover (2026)", 302)
        assert.strictEqual(r[0].id, "black-clover|s:2|b:170")
        const eps = await p.findEpisodes(r[0].id)
        assert.strictEqual(eps.length, 3)
        assert.strictEqual(eps.map((e) => e.number).join(","), "1,2,3")
        assert.strictEqual(eps[0].url, "https://aniworld.to/anime/stream/black-clover/staffel-5/episode-1")
    })
    await check("Black Clover first entry: all 170 episodes across Staffel 1-4", async () => {
        const r = await search("Black Clover", 300, true)
        assert.strictEqual(r[0].id, "black-clover|b:0|e:170|dub")
        const eps = await p.findEpisodes(r[0].id)
        assert.strictEqual(eps.length, 170)
        assert.strictEqual(eps[51].number, 52)
        assert.strictEqual(eps[51].url, "https://aniworld.to/anime/stream/black-clover/staffel-2/episode-1")
        assert.strictEqual(eps[169].url, "https://aniworld.to/anime/stream/black-clover/staffel-4/episode-16")
    })
    await check("Demon Slayer Yuukaku-hen: after Mugen Ressha-hen in the same Staffel", async () => {
        const r = await search("Kimetsu no Yaiba: Yuukaku-hen", 103)
        assert.strictEqual(r[0].id, "demon-slayer-kimetsu-no-yaiba|s:3|b:33|e:11")
        const eps = await p.findEpisodes(r[0].id)
        assert.strictEqual(eps.length, 11)
        assert.strictEqual(eps[0].url, "https://aniworld.to/anime/stream/demon-slayer-kimetsu-no-yaiba/staffel-2/episode-8")
    })
    await check("Food Wars San no Sara: Staffel 3 episodes 1-12", async () => {
        const r = await search("Shokugeki no Souma: San no Sara", 202, true)
        assert.strictEqual(r[0].id, "food-wars-shokugeki-no-sma|s:3|b:37|e:12|dub")
        const eps = await p.findEpisodes(r[0].id)
        assert.strictEqual(eps.length, 12)
        assert.strictEqual(eps[0].id, "/anime/stream/food-wars-shokugeki-no-sma/staffel-3/episode-1|dub")
    })
    await check("Food Wars Tootsuki Ressha-hen: Staffel 3 episodes 13-24 as 1-12", async () => {
        const r = await search("Shokugeki no Souma: San no Sara - Tootsuki Ressha-hen", 203)
        assert.strictEqual(r[0].id, "food-wars-shokugeki-no-sma|s:3|o:12|b:49|e:12")
        const eps = await p.findEpisodes(r[0].id)
        assert.strictEqual(eps.length, 12)
        assert.strictEqual(eps[0].number, 1)
        assert.strictEqual(eps[0].url, "https://aniworld.to/anime/stream/food-wars-shokugeki-no-sma/staffel-3/episode-13")
    })
    await check("Food Wars Shin no Sara: Staffel 4", async () => {
        const r = await search("Shokugeki no Souma: Shin no Sara", 204)
        const eps = await p.findEpisodes(r[0].id)
        assert.strictEqual(eps.length, 12)
        assert.strictEqual(eps[0].url, "https://aniworld.to/anime/stream/food-wars-shokugeki-no-sma/staffel-4/episode-1")
    })
    await check("title season above AniList's count: season number, not the count", async () => {
        const r = await search("Overlord IV", 400)
        assert.strictEqual(r[0].id, "overlord|s:4")
        const eps = await p.findEpisodes(r[0].id)
        assert.strictEqual(eps[0].url, "https://aniworld.to/anime/stream/overlord/staffel-4/episode-1")
    })
    await check("unknown on AniList, season from the title", async () => {
        const r = await search("Re:Zero kara Hajimeru Isekai Seikatsu 2nd Season", 999, true)
        assert.strictEqual(r[0].id, "rezero-starting-life-in-another-world|s:2|dub")
        const eps = await p.findEpisodes(r[0].id)
        assert.strictEqual(eps.length, 25)
    })
    await check("count beyond aniworld.to: falls back to the season number", async () => {
        const eps = await p.findEpisodes("food-wars-shokugeki-no-sma|s:4|b:500")
        assert.strictEqual(eps.length, 12)
    })
    await check("second cour that is its own Staffel on aniworld.to", async () => {
        const eps = await p.findEpisodes("overlord|s:1|o:13")
        assert.strictEqual(eps[0].url, "https://aniworld.to/anime/stream/overlord/staffel-2/episode-1")
    })
    await check("missing Staffel: clear error", async () => {
        await assert.rejects(() => p.findEpisodes("rezero-starting-life-in-another-world|s:5"), /keine Staffel 5.*nur 1, 2/)
    })
    await check("movie: first film", async () => {
        const r = await search("Kimetsu no Yaiba Movie: Mugen Ressha-hen", 102, false, "MOVIE")
        assert.strictEqual(r[0].id, "demon-slayer-kimetsu-no-yaiba|movie")
        const eps = await p.findEpisodes(r[0].id)
        assert.strictEqual(eps.length, 1)
        assert.strictEqual(eps[0].url, "https://aniworld.to/anime/stream/demon-slayer-kimetsu-no-yaiba/filme/film-1")
    })
    await check("stream: German dub from VidMoly, past Cloudflare, m3u8 with VidMoly Referer", async () => {
        site["/ep1"] = hosters([["3", "VidMoly", "/redirect/sub"], ["1", "VOE", "/redirect/voe"], ["1", "VidMoly", "/redirect/vm"]])
        const r = await p.findEpisodeServer({ id: "x|dub", url: "https://aniworld.to/ep1", number: 1 }, "VidMoly")
        assert.strictEqual(r.server, "VidMoly")
        assert.strictEqual(r.videoSources[0].type, "m3u8")
        assert.strictEqual(r.videoSources[0].url, "https://cdn.vmeas.cloud/hls/xyz/master.m3u8")
        assert.strictEqual(r.headers.Referer, "https://vidmoly.net/")
    })
    await check("stream: next VidMoly link when the first one is dead", async () => {
        site["/ep2"] = hosters([["3", "VidMoly", "/redirect/vm-broken"], ["3", "VidMoly", "/redirect/vm"]])
        const r = await p.findEpisodeServer({ id: "x", url: "https://aniworld.to/ep2", number: 1 }, "VidMoly")
        assert.strictEqual(r.videoSources[0].url, "https://cdn.vmeas.cloud/hls/xyz/master.m3u8")
    })
    await check("stream: no VidMoly, the error says what exists", async () => {
        site["/ep3"] = hosters([["1", "VOE", "/redirect/1"], ["3", "Filemoon", "/redirect/2"]])
        await assert.rejects(() => p.findEpisodeServer({ id: "x|dub", url: "https://aniworld.to/ep3", number: 1 }, "VidMoly"),
            /Vorhanden: VOE Deutsch, Filemoon Deutsch \(UT\)/)
    })
    console.log(failures ? "\n" + failures + " failed" : "\nall passed")
    process.exitCode = failures ? 1 : 0
})()
