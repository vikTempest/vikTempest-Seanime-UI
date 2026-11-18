// Live test of providers/aniworld/provider.js against the real aniworld.to, AniList and VidMoly.
// Needs Node 18 or newer and internet. Usage:  node test/aniworld-live.js [path/to/provider.js]
// For each anime: search -> episode list -> stream of episode 1 -> loads the m3u8 with the
// headers the provider returns (what Seanime's proxy does) and checks it is a real playlist.
const fs = require("fs")
const vm = require("vm")
const file = process.argv[2] || __dirname + "/../providers/aniworld/provider.js"
const sandbox = { fetch, console, URL, setTimeout }
vm.createContext(sandbox)
vm.runInContext(fs.readFileSync(file, "utf8") + "\nthis.Provider = Provider", sandbox)
const p = new sandbox.Provider()

// AniList ids and titles like Seanime sends them; expect = season on aniworld.to
const CASES = [
    { name: "Food Wars S3", id: 99255, romaji: "Shokugeki no Souma: San no Sara", english: "Food Wars! The Third Plate", eps: 12, season: 3 },
    { name: "Food Wars S3 Teil 2", id: 100773, romaji: "Shokugeki no Souma: San no Sara - Tootsuki Ressha-hen", english: "Food Wars! The Third Plate: Totsuki Train Arc", eps: 12, season: 3 },
    { name: "Re:Zero S2", id: 108632, romaji: "Re:Zero kara Hajimeru Isekai Seikatsu 2nd Season", english: "Re:ZERO -Starting Life in Another World- Season 2", eps: 13, season: 2 },
    { name: "Demon Slayer Yuukaku-hen", id: 142329, romaji: "Kimetsu no Yaiba: Yuukaku-hen", english: "Demon Slayer: Kimetsu no Yaiba Entertainment District Arc", eps: 11, season: 3 },
    { name: "Attack on Titan S1", id: 16498, romaji: "Shingeki no Kyojin", english: "Attack on Titan", eps: 25, season: 1 },
]

async function one(c, dub) {
    const media = { id: c.id, format: "TV", romajiTitle: c.romaji, englishTitle: c.english, synonyms: [], episodeCount: c.eps }
    let results = []
    for (const q of [c.romaji, c.english]) {
        results = await p.search({ query: q, dub, media, year: 0 })
        if (results.length) break
    }
    if (!results.length) return "keine Suchergebnisse"
    const id = results[0].id
    const eps = await p.findEpisodes(id)
    if (!eps.length) return `${id}: keine Folgen`
    const ep = eps.find((e) => e.number === 1) || eps[0]
    const server = await p.findEpisodeServer(ep, "default")
    const src = server.videoSources[0].url
    const res = await fetch(src, { headers: server.headers || {} })
    const body = await res.text()
    if (!res.ok || !body.startsWith("#EXTM3U")) return `${id}: m3u8 lädt nicht (HTTP ${res.status})`
    // First segment / sub playlist too, that is where a missing Referer usually fails
    const next = body.split("\n").find((l) => l && !l.startsWith("#"))
    if (next) {
        const r2 = await fetch(new URL(next.trim(), src).toString(), { headers: server.headers || {} })
        if (!r2.ok) return `${id}: Playlist ok, Teil dahinter HTTP ${r2.status}`
    }
    return `OK ${id}, ${eps.length} Folgen, Folge 1 spielt (${ep.url})`
}

;(async () => {
    let bad = 0
    for (const c of CASES) {
        for (const dub of [true, false]) {
            let out
            try { out = await one(c, dub) } catch (e) { out = "Fehler: " + (e && e.message || e) }
            if (!out.startsWith("OK")) bad++
            console.log(`${out.startsWith("OK") ? "ok  " : "FAIL"} ${c.name} ${dub ? "Dub" : "Sub"}: ${out}`)
        }
    }
    console.log(bad ? `\n${bad} fehlgeschlagen` : "\nalles ok")
    process.exitCode = bad ? 1 : 0
})()
