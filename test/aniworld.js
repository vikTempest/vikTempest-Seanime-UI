// Test for providers/aniworld/provider.js with a stand-in for aniworld.to and AniList.
// Usage (from the repository root):  node test/aniworld.js
const fs = require("fs")
const vm = require("vm")
const assert = require("assert")

const src = fs.readFileSync(__dirname + "/../providers/aniworld/provider.js", "utf8")
const searches = []
let failures = 0

// AniList: 103 -> 102 (movie) -> 101 (TV) -> 100 (TV)
const anilist = {
    100: { format: "TV", prequel: null },
    101: { format: "TV", prequel: { id: 100, format: "TV" } },
    102: { format: "MOVIE", prequel: { id: 101, format: "TV" } },
    103: { format: "TV", prequel: { id: 102, format: "MOVIE" } },
}
const site = {
    "Re:Zero kara Hajimeru Isekai Seikatsu": [{ link: "/anime/stream/rezero-starting-life-in-another-world", title: "Re:ZERO" }],
    "Kimetsu no Yaiba": [{ link: "/anime/stream/demon-slayer-kimetsu-no-yaiba", title: "Demon Slayer" }],
    "Mushoku Tensei": [{ link: "/anime/stream/mushoku-tensei-jobless-reincarnation", title: "Mushoku Tensei" }],
}
const pages = {
    "/anime/stream/rezero-starting-life-in-another-world": '<a href="/anime/stream/rezero-starting-life-in-another-world/staffel-1">1</a><a href="/anime/stream/rezero-starting-life-in-another-world/staffel-2">2</a>',
    "/anime/stream/rezero-starting-life-in-another-world/staffel-2": '<tr data-episode-id="55"><meta itemprop="episodeNumber" content="1"><a itemprop="url" href="/x/staffel-2/episode-1"></tr>',
}

async function fetchStub(url, opts) {
    if (url === "https://graphql.anilist.co") {
        const id = JSON.parse(opts.body).variables.id
        const m = anilist[id]
        const edges = m && m.prequel ? [{ relationType: "PREQUEL", node: { id: m.prequel.id, type: "ANIME", format: m.prequel.format } }] : []
        return { json: async () => ({ data: { Media: m ? { id, format: m.format, relations: { edges } } : null } }) }
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
        await assert.rejects(() => p.findEpisodes("rezero-starting-life-in-another-world|season:5"), /no season 5/)
    })
    console.log(failures ? "\n" + failures + " failed" : "\nall passed")
    process.exitCode = failures ? 1 : 0
})()
