/// <reference path="./online-streaming-provider.d.ts" />

// AniWorld (fixed version, same id "aniworld" as the original): online streaming provider for aniworld.to (German dub and sub).
//
// Based on "AniWorld" 1.2.0 by Pal (Seanime-contributions/Seanime-Providers). The scraping of
// episodes and streams is unchanged. What is new is how the right season is found:
//
// The original only opens a later season when the title Seanime searches with contains
// "Season 2". AniList titles often don't: "Re:Zero ... 2nd Season", "Mushoku Tensei II",
// "Kimetsu no Yaiba: Yuukaku-hen", "Boku no Hero Academia 3". Then it opened season 1 (wrong
// episodes) or found nothing at all ("problems" in Seanime).
//
// Here the season comes from, in this order:
//   1. the title: "Season 2", "2nd Season", "Staffel 2", "II" at the end
//   2. the other titles of the anime (synonyms) with the same patterns
//   3. AniList: the number of TV seasons before this one (prequel chain)
// The second half of a season (its own anime on AniList, e.g. "Shokugeki no Souma: San no Sara -
// Tootsuki Ressha-hen") gets the episodes after the first half of that season on aniworld.to.
// and the search on aniworld.to tries shorter titles when the full one finds nothing
// (without the season marker, without the part after ":", the first words).

const ANILIST = "https://graphql.anilist.co"
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
const SEASON_FORMATS = { TV: true, TV_SHORT: true }
const ROMAN = { II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10 }

// Season number written in a title, or 0
function seasonInTitle(title) {
    const t = String(title || "")
    let m = t.match(/\bseason\s*(\d+)/i) || t.match(/\bstaffel\s*(\d+)/i)
    if (m) return parseInt(m[1], 10)
    m = t.match(/\b(\d+)\s*(?:st|nd|rd|th)\s+season\b/i)
    if (m) return parseInt(m[1], 10)
    m = t.match(/\s(II|III|IV|V|VI|VII|VIII|IX|X)(?=\s*(?::|-|$))/)
    if (m) return ROMAN[m[1]]
    return 0
}

// The title without season markers and extras that aniworld.to doesn't know
function cleanTitle(title) {
    return String(title || "")
        .replace(/\b\d+\s*(?:st|nd|rd|th)\s+season\b/ig, "")
        .replace(/\bseason\s*\d+/ig, "")
        .replace(/\bstaffel\s*\d+/ig, "")
        .replace(/\s(II|III|IV|V|VI|VII|VIII|IX|X)(?=\s*(?::|-|$))/g, "")
        .replace(/\b(?:part|cour)\s*\d+\b/ig, "")
        .replace(/\((?:tv|\d{4})\)/ig, "")
        .replace(/\bmovie\b/ig, "")
        .replace(/\s{2,}/g, " ")
        .replace(/[\s:\-–]+$/, "")
        .trim()
}

// Search words to try one after the other, longest first
function searchQueries(title) {
    const out = []
    const add = (q) => {
        q = String(q || "").replace(/\s{2,}/g, " ").trim()
        if (q.length >= 2 && out.indexOf(q) < 0) out.push(q)
    }
    const clean = cleanTitle(title)
    add(clean)
    const head = clean.split(/\s*[:–]\s*|\s+-\s+/)[0]
    add(head)
    const words = head.split(/\s+/)
    if (words.length > 3) add(words.slice(0, 3).join(" "))
    if (words.length > 2) add(words.slice(0, 2).join(" "))
    return out
}

// A TV entry that continues the season before it instead of starting a new one, e.g.
// "Shokugeki no Souma: San no Sara - Tootsuki Ressha-hen" after "... San no Sara" or
// "Shingeki no Kyojin Season 3 Part 2". On aniworld.to both halves are usually one season.
function continues(title, prequelTitle) {
    const t = String(title || "").toLowerCase().trim()
    const p = String(prequelTitle || "").toLowerCase().trim()
    if (!t || !p) return false
    if (/\b(?:part|cour)\s*\d+\b|\b\d+\s*(?:st|nd|rd|th)\s+cour\b/i.test(t)) return true
    const st = seasonInTitle(title), sp = seasonInTitle(prequelTitle)
    if (st && sp) return st === sp
    // Longer version of a title that already names its season ("X: San no Sara" -> "X: San no Sara - Y").
    // "X" -> "X: Ni no Sara" is a new season: the shorter title has no season name.
    return t.length > p.length && t.startsWith(p) && /[:：]/.test(p)
}

const chainCache = {}

// From the AniList prequel chain: which season this anime is (TV seasons before it, a movie in
// between doesn't count, the second half of a season doesn't start a new one) and how many
// episodes of its season come before it. { season: 0 } when AniList can't be asked.
async function seasonFromAniList(mediaId) {
    if (!mediaId) return { season: 0, offset: 0 }
    if (chainCache[mediaId]) return chainCache[mediaId]
    const query = "query ($id: Int) { Media(id: $id, type: ANIME) { id format episodes title { romaji english } " +
        "relations { edges { relationType node { id type format } } } } }"
    const chain = []
    const seen = {}
    let id = mediaId
    try {
        for (let hop = 0; hop < 15 && id && !seen[id]; hop++) {
            seen[id] = true
            const res = await fetch(ANILIST, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({ query: query, variables: { id: id } }),
            })
            const data = await res.json()
            const media = data && data.data && data.data.Media
            if (!media) break
            chain.push(media)
            const prequel = ((media.relations && media.relations.edges) || [])
                .filter((e) => e && e.relationType === "PREQUEL" && e.node && e.node.type === "ANIME")
                .map((e) => e.node)
            // Prefer a TV prequel, a movie between two seasons doesn't count
            const next = prequel.filter((n) => SEASON_FORMATS[n.format])[0] || prequel[0]
            id = next ? next.id : 0
        }
    }
    catch (e) {
        return { season: 0, offset: 0 }
    }
    if (!chain.length) return { season: 0, offset: 0 }
    // Oldest first, only TV seasons
    const tv = chain.filter((m) => SEASON_FORMATS[m.format]).reverse()
    let season = 0
    let offset = 0
    let prev = null
    tv.forEach((m) => {
        const title = (m.title && m.title.romaji) || ""
        if (prev && continues(title, (prev.title && prev.title.romaji) || "")) offset += prev.episodes || 0
        else {
            season++
            offset = 0
        }
        prev = m
    })
    const out = { season: season || 1, offset: offset }
    chainCache[mediaId] = out
    return out
}

class Provider {
    constructor() {
        this.base = "https://aniworld.to"
    }

    getSettings() {
        return {
            episodeServers: ["VidMoly"],
            supportsDub: true,
        }
    }

    async searchSite(keyword) {
        const res = await fetch(`${this.base}/ajax/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest",
                "Referer": `${this.base}/`,
            },
            body: `keyword=${encodeURIComponent(keyword)}`,
        })
        const text = await res.text()
        if (!text || text.startsWith("<!DOCTYPE")) return []
        let data
        try { data = JSON.parse(text) } catch (e) { return [] }
        if (!Array.isArray(data)) return []
        return data.filter((item) => item && item.link && item.link.startsWith("/anime/stream/"))
    }

    // { season, offset }: offset = episodes of the same season on aniworld.to before this anime
    async season(query) {
        const media = query.media || {}
        let s = seasonInTitle(query.query)
        if (!s) {
            const titles = [media.englishTitle, media.romajiTitle].concat(media.synonyms || [])
            for (const t of titles) {
                s = seasonInTitle(t)
                if (s) break
            }
        }
        let chain = { season: 0, offset: 0 }
        if (SEASON_FORMATS[media.format]) chain = await seasonFromAniList(media.id)
        // A season in the title wins, the offset still comes from AniList
        return { season: s || chain.season || 1, offset: chain.offset || 0 }
    }

    async search(query) {
        try {
            const media = query.media || {}
            const isMovie = media.format === "MOVIE" || /\bmovie\b/i.test(query.query)

            let suffix = ""
            if (isMovie) suffix = "|movie"
            else {
                const s = await this.season(query)
                if (s.season > 1 || s.offset > 0) suffix = `|season:${s.season}`
                if (s.offset > 0) suffix += `|offset:${s.offset}`
            }
            if (query.dub) suffix += "|dub"

            let items = []
            for (const q of searchQueries(query.query)) {
                items = await this.searchSite(q)
                if (items.length) break
            }

            return items.map((item) => ({
                id: item.link.replace("/anime/stream/", "").replace(/\/.*$/, "") + suffix,
                title: String(item.title || "").replace(/<\/?[^>]+(>|$)/g, "").replace(/&#8230;/g, "..."),
                url: `${this.base}${item.link}`,
                subOrDub: query.dub ? "dub" : "sub",
            }))
        }
        catch (e) {
            return []
        }
    }

    scrapeEpisodes(html, isDub) {
        const epRegex = /<tr[^>]*data-episode-id="(\d+)"[^>]*>.*?<meta itemprop="episodeNumber" content="(\d+)".*?<a itemprop="url" href="([^"]+)">/gs
        const episodes = []
        let match
        while ((match = epRegex.exec(html)) !== null) {
            episodes.push({
                id: match[1] + (isDub ? "|dub" : ""),
                title: `Episode ${match[2]}`,
                number: parseInt(match[2]),
                url: `${this.base}${match[3]}`,
            })
        }
        return episodes
    }

    async findEpisodes(id) {
        const parts = id.split("|")
        const slug = parts[0]
        const isMovie = parts.includes("movie")
        const seasonPart = parts.find((p) => p.startsWith("season:"))
        const offsetPart = parts.find((p) => p.startsWith("offset:"))
        const offset = offsetPart ? parseInt(offsetPart.split(":")[1], 10) || 0 : 0
        const isDub = parts.includes("dub")

        const showUrl = `${this.base}/anime/stream/${slug}`

        if (seasonPart) {
            const seasonNumber = parseInt(seasonPart.split(":")[1], 10)
            const showHtml = await (await fetch(showUrl)).text()
            const seasonUrl = (n) => {
                const m = showHtml.match(new RegExp(`href="([^"]+\\/staffel-${n})"[^>]*>\\s*${n}\\s*<\\/a>`, "i"))
                return m ? `${this.base}${m[1]}` : ""
            }
            const url = seasonUrl(seasonNumber)
            // aniworld.to has fewer seasons than AniList: better no episodes than those of season 1
            if (!url) throw new Error(`AniWorld hat keine Staffel ${seasonNumber} für "${slug}". Wähle die richtige über "Manual match".`)
            const episodes = this.scrapeEpisodes(await (await fetch(url)).text(), isDub)
            if (!offset) return episodes

            // Second half of a season (AniList has it as its own anime, numbered from 1 again):
            // on aniworld.to it usually goes on in the same season, after the first half
            const later = episodes.filter((e) => e.number > offset)
            if (later.length) {
                return later.map((e) => Object.assign({}, e, { number: e.number - offset, title: `Episode ${e.number - offset}` }))
            }
            // Here aniworld.to made it its own season
            const nextUrl = seasonUrl(seasonNumber + 1)
            if (nextUrl) return this.scrapeEpisodes(await (await fetch(nextUrl)).text(), isDub)
            throw new Error(`AniWorld hat in Staffel ${seasonNumber} von "${slug}" nur ${episodes.length} Folgen. Wähle die richtige über "Manual match".`)
        }

        let url = showUrl
        if (isMovie) {
            const html = await (await fetch(url)).text()
            const movieRegex = /href="([^"]+\/filme)"[^>]*>Filme<\/a>/i
            const match = html.match(movieRegex)
            if (match) url = `${this.base}${match[1]}`
            else return [] // No "Filme" section available
        }

        const res = await fetch(url)
        const html = await res.text()

        if (!isMovie) return this.scrapeEpisodes(html, isDub)

        // Strict Movie Scraper
        const movieRowRegex = /<tr[^>]*data-episode-id="(\d+)"[^>]*>.*?<td class="seasonEpisodeTitle"><a href="([^"]+)">\s*<strong>(.*?)<\/strong>\s*(?:-?\s*<span>(.*?)<\/span>)?.*?<i class="icon Vidmoly"/gs

        const allMovies = []
        let match
        while ((match = movieRowRegex.exec(html)) !== null) {
            const [, epId, epUrl, strongTitle, spanTitle] = match
            const rawSpan = spanTitle || ""
            const fullTitleText = (strongTitle + " " + rawSpan).toLowerCase()

            // Check if this row is actually a movie/the main feature
            const isLikelyMovie = fullTitleText.includes("movie") || fullTitleText.includes("film")

            if (isLikelyMovie) {
                const cleanName = (strongTitle.trim() || rawSpan.trim() || "Movie")
                    .replace(/\[movie\]/i, "").replace(/\[ova\]/i, "").trim()

                allMovies.push({
                    id: epId + (isDub ? "|dub" : ""),
                    title: cleanName,
                    number: 1,
                    url: `${this.base}${epUrl}`,
                })
            }
        }

        // Return only the first matching movie entry, or nothing if none found
        return allMovies.length > 0 ? [allMovies[0]] : []
    }

    async findEpisodeServer(episode, _server) {
        const res = await fetch(episode.url)
        const html = await res.text()

        const isDub = episode.id.includes("|dub")
        const priority = isDub ? ["1"] : ["3", "1", "2"]

        let redirectUrl = null
        const liBlocks = html.split(/<li/g)

        for (const key of priority) {
            for (const block of liBlocks) {
                if (block.includes(`data-lang-key="${key}"`) && block.toLowerCase().includes("icon vidmoly")) {
                    const urlMatch = block.match(/data-link-target="([^"]+)"/)
                    if (urlMatch) {
                        redirectUrl = `${this.base}${urlMatch[1]}`
                        break
                    }
                }
            }
            if (redirectUrl) break
        }

        if (!redirectUrl) {
            // Say what aniworld.to does have, so it's clear whether dub/sub or the hoster is missing
            const LANG = { "1": "Deutsch", "2": "Englisch (UT)", "3": "Deutsch (UT)" }
            const have = []
            liBlocks.forEach((block) => {
                const lang = (block.match(/data-lang-key="(\d+)"/) || [])[1]
                const hoster = (block.match(/icon\s+([A-Za-z0-9]+)/) || [])[1]
                const label = hoster && lang ? `${hoster} ${LANG[lang] || lang}` : ""
                if (label && have.indexOf(label) < 0) have.push(label)
            })
            throw new Error((isDub ? "Für diese Folge gibt es auf AniWorld keinen deutschen Dub bei VidMoly." : "Für diese Folge gibt es auf AniWorld keinen VidMoly-Stream.") +
                (have.length ? " Vorhanden: " + have.join(", ") : " AniWorld listet keine Streams dafür."))
        }

        // VidMoly: the stream only plays with VidMoly as Referer. Without it the player in
        // Seanime keeps loading forever (that is why the original AniWorld provider is marked
        // "Broken"). Its embed page also sits behind a Cloudflare check, the cookie skips it.
        const hop = await fetch(redirectUrl, { headers: { "User-Agent": UA, "Referer": `${this.base}/` } })
        let embed = String(hop.url || "")
        let hosterHtml = await hop.text()
        if (!/vidmoly/i.test(embed)) {
            const m = hosterHtml.match(/https?:\/\/(?:www\.)?vidmoly\.[a-z]+\/(?:embed-|w\/)[A-Za-z0-9_-]+(?:\.html)?/i)
            if (m) embed = m[0]
        }
        const originMatch = embed.match(/^https?:\/\/[^/]+/)
        const origin = originMatch && /vidmoly/i.test(originMatch[0]) ? originMatch[0] : "https://vidmoly.net"
        const idMatch = embed.match(/\/(?:embed-|w\/)([A-Za-z0-9_-]+)/)
        const embedId = idMatch ? idMatch[1] : ""
        const playHeaders = { "User-Agent": UA, "Referer": `${origin}/`, "Origin": origin }

        const findM3u8 = (html) => {
            const m = html.match(/sources\s*:\s*\[\s*\{\s*file\s*:\s*["']([^"']+)["']/) ||
                html.match(/file\s*:\s*["'](https?:\/\/[^"']+\/master\.m3u8[^"']*)["']/) ||
                html.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/)
            if (!m) return ""
            const u = m[1].trim()
            return u.startsWith("//") ? "https:" + u : (u.startsWith("/") ? origin + u : u)
        }

        let videoUrl = findM3u8(hosterHtml)
        if (!videoUrl && embedId) {
            const embedUrl = `${origin}/embed-${embedId}.html`
            const res = await fetch(embedUrl, {
                headers: Object.assign({}, playHeaders, {
                    "Referer": embedUrl,
                    "Cookie": `cf_turnstile_demo_pass_${embedId}=1`,
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                }),
            })
            hosterHtml = await res.text()
            videoUrl = findM3u8(hosterHtml)
        }
        if (!videoUrl) throw new Error("VidMoly hat keinen Stream geliefert (Seite geändert oder Cloudflare-Prüfung).")

        return {
            server: "VidMoly",
            headers: playHeaders,
            videoSources: [{ url: videoUrl, quality: "auto", type: "hls" }],
        }
    }
}
