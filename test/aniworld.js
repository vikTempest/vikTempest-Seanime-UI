// Test for providers/aniworld/provider.js with a stand-in for aniworld.to and AniList.
// Usage (from the repository root):  node test/aniworld.js
const fs = require("fs")
const vm = require("vm")
const assert = require("assert")

const src = fs.readFileSync(__dirname + "/../providers/aniworld/provider.js", "utf8")
const searches = []
let failures = 0

// AniList: 103 -> 102 (movie) -> 101 (TV) -> 100 (TV); Food Wars 200..204
const tv = (title, eps, prequel) => ({ format: "TV", title, episodes: eps, prequel: prequel ? { id: prequel, format: "TV" } : null })
const anilist = {
    100: tv("Kimetsu no Yaiba", 26, 0),
    101: tv("Kimetsu no Yaiba: Mugen Ressha-hen", 7, 0),
    102: { format: "MOVIE", title: "Kimetsu no Yaiba Movie: Mugen Ressha-hen", episodes: 1, prequel: { id: 100, format: "TV" } },
    103: tv("Kimetsu no Yaiba: Yuukaku-hen", 11, 101),
    200: tv("Shokugeki no Souma", 24, 0),
    201: tv("Shokugeki no Souma: Ni no Sara", 13, 200),
    202: tv("Shokugeki no Souma: San no Sara", 12, 201),
    203: tv("Shokugeki no Souma: San no Sara - Tootsuki Ressha-hen", 12, 202),
    204: tv("Shokugeki no Souma: Shin no Sara", 12, 203),
}
anilist[101].prequel = { id: 102, format: "MOVIE" }
const site = {
    "Re:Zero kara Hajimeru Isekai Seikatsu": [{ link: "/anime/stream/rezero-starting-life-in-another-world", title: "Re:ZERO" }],
    "Kimetsu no Yaiba": [{ link: "/anime/stream/demon-slayer-kimetsu-no-yaiba", title: "Demon Slayer" }],
    "Shokugeki no": [{ link: "/anime/stream/food-wars-shokugeki-no-sma", title: "Food Wars! Shokugeki no Soma" }],
    "Mushoku Tensei": [{ link: "/anime/stream/mushoku-tensei-jobless-reincarnation", title: "Mushoku Tensei" }],
}
const rows = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => `<tr data-episode-id="${900 + from + i}"><meta itemprop="episodeNumber" content="${from + i}"><a itemprop="url" href="/fw/episode-${from + i}"></tr>`).join("")
const pages = {
    "/anime/stream/food-wars-shokugeki-no-sma": [1, 2, 3, 4, 5].map((n) => `<a href="/anime/stream/food-wars-shokugeki-no-sma/staffel-${n}">${n}</a>`).join(""),
    "/anime/stream/food-wars-shokugeki-no-sma/staffel-3": rows(1, 24),
    "/anime/stream/food-wars-shokugeki-no-sma/staffel-4": rows(1, 12),
    "/anime/stream/short-show": '<a href="/anime/stream/short-show/staffel-1">1</a><a href="/anime/stream/short-show/staffel-2">2</a>',
    "/anime/stream/short-show/staffel-1": rows(1, 12),
    "/anime/stream/short-show/staffel-2": rows(1, 10),
    "/anime/stream/rezero-starting-life-in-another-world": '<a href="/anime/stream/rezero-starting-life-in-another-world/staffel-1">1</a><a href="/anime/stream/rezero-starting-life-in-another-world/staffel-2">2</a>',
    "/anime/stream/rezero-starting-life-in-another-world/staffel-2": '<tr data-episode-id="55"><meta itemprop="episodeNumber" content="1"><a itemprop="url" href="/x/staffel-2/episode-1"></tr>',
}

async function fetchStub(url, opts) {
    if (url === "https://graphql.anilist.co") {
        const id = JSON.parse(opts.body).variables.id
        const m = anilist[id]
        const edges = m && m.prequel ? [{ relationType: "PREQUEL", node: { id: m.prequel.id, type: "ANIME", format: m.prequel.format } }] : []
        return { json: async () => ({ data: { Media: m ? { id, format: m.format, episodes: m.episodes, title: { romaji: m.title }, relations: { edges } } : null } }) }
    }
    if (url === "https://aniworld.to/ajax/search") {
        const kw = decodeURIComponent(opts.body.replace("keyword=", ""))
        searches.push(kw)
        return { text: async () => JSON.stringify(site[kw] || []) }
    }
    const path = url.replace("https://aniworld.to", "")
    return { text: async () => pages[path] || "" }
}

const sandbox = { fetch: fetchStub, console }
vm.createContext(sandbox)
vm.runInContext(src + "\nthis.Provider = Provider; this.seasonInTitle = seasonInTitle; this.searchQueries = searchQueries", sandbox)
const p = new sandbox.Provider()

async function check(name, fn) {
    try { await fn(); console.log("ok   " + name) }
    catch (e) { failures++; console.log("FAIL " + name + "\n     " + (e && e.stack || e)) }
}

;(async () => {
    await check("season in the title", () => {
        const s = sandbox.seasonInTitle
        assert.strictEqual(s("Shingeki no Kyojin Season 3 Part 2"), 3)
        assert.strictEqual(s("Re:Zero kara Hajimeru Isekai Seikatsu 2nd Season"), 2)
        assert.strictEqual(s("Mushoku Tensei II: Isekai Ittara Honki Dasu"), 2)
        assert.strictEqual(s("Overlord IV"), 4)
        assert.strictEqual(s("Kimetsu no Yaiba: Yuukaku-hen"), 0)
        assert.strictEqual(s("Kaijuu 8-gou"), 0)
    })
    await check("search words get shorter", () => {
        const q = sandbox.searchQueries("Re:Zero kara Hajimeru Isekai Seikatsu 2nd Season")
        assert.strictEqual(q[0], "Re:Zero kara Hajimeru Isekai Seikatsu")
    })
    await check("2nd Season: finds the show and season 2", async () => {
        searches.length = 0
        const r = await p.search({ query: "Re:Zero kara Hajimeru Isekai Seikatsu 2nd Season", dub: true, media: { id: 999, format: "TV", synonyms: [] } })
        assert.strictEqual(r[0].id, "rezero-starting-life-in-another-world|season:2|dub")
    })
    await check("arc name: season from AniList, movie in between not counted", async () => {
        const r = await p.search({ query: "Kimetsu no Yaiba: Yuukaku-hen", dub: false, media: { id: 103, format: "TV", synonyms: [] } })
        assert.strictEqual(r[0].id, "demon-slayer-kimetsu-no-yaiba|season:3")
    })
    await check("roman numeral and subtitle", async () => {
        const r = await p.search({ query: "Mushoku Tensei II: Isekai Ittara Honki Dasu", dub: false, media: { id: 1, format: "TV", synonyms: [] } })
        assert.strictEqual(r[0].id, "mushoku-tensei-jobless-reincarnation|season:2")
    })
    await check("first season: no suffix", async () => {
        const r = await p.search({ query: "Kimetsu no Yaiba", dub: false, media: { id: 100, format: "TV", synonyms: [] } })
        assert.strictEqual(r[0].id, "demon-slayer-kimetsu-no-yaiba")
    })
    await check("episodes of season 2", async () => {
        const eps = await p.findEpisodes("rezero-starting-life-in-another-world|season:2|dub")
        assert.strictEqual(eps.length, 1)
        assert.strictEqual(eps[0].id, "55|dub")
    })
    await check("season missing on AniWorld: clear error instead of season 1", async () => {
        await assert.rejects(() => p.findEpisodes("rezero-starting-life-in-another-world|season:5"), /keine Staffel 5/)
    })
    await check("Food Wars San no Sara: season 3", async () => {
        const r = await p.search({ query: "Shokugeki no Souma: San no Sara", dub: true, media: { id: 202, format: "TV", synonyms: [] } })
        assert.strictEqual(r[0].id, "food-wars-shokugeki-no-sma|season:3|dub")
    })
    await check("Food Wars Tootsuki Ressha-hen: second half of season 3", async () => {
        const r = await p.search({ query: "Shokugeki no Souma: San no Sara - Tootsuki Ressha-hen", dub: true, media: { id: 203, format: "TV", synonyms: [] } })
        assert.strictEqual(r[0].id, "food-wars-shokugeki-no-sma|season:3|offset:12|dub")
        const eps = await p.findEpisodes(r[0].id)
        assert.strictEqual(eps.length, 12)
        assert.strictEqual(eps[0].number, 1)
        assert.strictEqual(eps[0].url, "https://aniworld.to/fw/episode-13")
    })
    await check("Food Wars Shin no Sara: season 4", async () => {
        const r = await p.search({ query: "Shokugeki no Souma: Shin no Sara", dub: false, media: { id: 204, format: "TV", synonyms: [] } })
        assert.strictEqual(r[0].id, "food-wars-shokugeki-no-sma|season:4")
    })
    await check("second half that is its own season on AniWorld", async () => {
        const eps = await p.findEpisodes("short-show|season:1|offset:12")
        assert.strictEqual(eps.length, 10)
        assert.strictEqual(eps[0].url, "https://aniworld.to/fw/episode-1")
    })
    await check("no VidMoly: the error says which streams exist", async () => {
        pages["/ep"] = '<li data-lang-key="1" data-link-target="/r/1"><i class="icon VOE" title="Hoster VOE"></i></li><li data-lang-key="3" data-link-target="/r/2"><i class="icon Filemoon"></i></li>'
        await assert.rejects(() => p.findEpisodeServer({ id: "1|dub", url: "https://aniworld.to/ep" }, "default"), /Vorhanden: VOE Deutsch, Filemoon Deutsch \(UT\)/)
    })
    console.log(failures ? "\n" + failures + " failed" : "\nall passed")
    process.exitCode = failures ? 1 : 0
})()
