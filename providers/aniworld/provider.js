/// <reference path="./online-streaming-provider.d.ts" />

// AniWorld (VikTempest): online streaming provider for aniworld.to (German dub and sub).
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
// and the search on aniworld.to tries shorter titles when the full one finds nothing
// (without the season marker, without the part after ":", the first words).

const ANILIST = "https://graphql.anilist.co"
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

const seasonCache = {}

// How many TV seasons come before this anime on AniList (following "Prequel"), plus one.
// 0 when AniList can't be asked.
async function seasonFromAniList(mediaId) {
    if (!mediaId) return 0
    if (seasonCache[mediaId] !== undefined) return seasonCache[mediaId]
    const query = "query ($id: Int) { Media(id: $id, type: ANIME) { id format " +
        "relations { edges { relationType node { id type format } } } } }"
    let id = mediaId
    let count = 1
    const seen = {}
    try {
        for (let hop = 0; hop < 12 && id && !seen[id]; hop++) {
            seen[id] = true
            const res = await fetch(ANILIST, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({ query: query, variables: { id: id } }),
            })
            const data = await res.json()
            const media = data && data.data && data.data.Media
            if (!media) break
            const prequel = ((media.relations && media.relations.edges) || [])
                .filter((e) => e && e.relationType === "PREQUEL" && e.node && e.node.type === "ANIME")
                .map((e) => e.node)
            // Prefer a TV prequel, a movie between two seasons doesn't count
            const next = prequel.filter((n) => SEASON_FORMATS[n.format])[0] || prequel[0]
            if (!next) break
            if (SEASON_FORMATS[next.format]) count++
            id = next.id
        }
    }
    catch (e) {
        seasonCache[mediaId] = 0
        return 0
    }
    seasonCache[mediaId] = count
    return count
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
        if (!s && SEASON_FORMATS[media.format]) s = await seasonFromAniList(media.id)
        return s || 1
    }

    async search(query) {
        try {
            const media = query.media || {}
            const isMovie = media.format === "MOVIE" || /\bmovie\b/i.test(query.query)

            let suffix = ""
            if (isMovie) suffix = "|movie"
            else {
                const s = await this.season(query)
                if (s > 1) suffix = `|season:${s}`
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

    async findEpisodes(id) {
        const parts = id.split("|")
        const slug = parts[0]
        const isMovie = parts.includes("movie")
        const seasonPart = parts.find((p) => p.startsWith("season:"))
        const isDub = parts.includes("dub")

        let url = `${this.base}/anime/stream/${slug}`

        // 1. Resolve correct sub-page
        if (isMovie || seasonPart) {
            const res = await fetch(url)
            const html = await res.text()

            if (seasonPart) {
                const seasonNumber = seasonPart.split(":")[1]
                const seasonRegex = new RegExp(`href="([^"]+\\/staffel-${seasonNumber})"[^>]*>\\s*${seasonNumber}\\s*<\\/a>`, "i")
                const match = html.match(seasonRegex)
                if (match) url = `${this.base}${match[1]}`
                // aniworld.to has fewer seasons than AniList (e.g. two cours in one season):
                // better no episodes than the episodes of season 1
                else throw new Error(`AniWorld has no season ${seasonNumber} for "${slug}". Use "Manual match" to pick it.`)
            }
            else if (isMovie) {
                const movieRegex = /href="([^"]+\/filme)"[^>]*>Filme<\/a>/i
                const match = html.match(movieRegex)
                if (match) url = `${this.base}${match[1]}`
                else return [] // No "Filme" section available
            }
        }

        const res = await fetch(url)
        const html = await res.text()

        if (isMovie) {
            // 2. Strict Movie Scraper
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

        // 3. Standard Episode Scraper
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
            throw new Error(isDub
                ? "No German dub on VidMoly for this episode. Try without \"Dubbed\"."
                : "No VidMoly stream for this episode.")
        }

        const hosterRes = await fetch(redirectUrl)
        const hosterHtml = await hosterRes.text()

        const m3u8Regex = /file\s*:\s*["'](https?:\/\/[^"']+\/master\.m3u8[^"']*)["']/
        const fileMatch = hosterHtml.match(m3u8Regex)

        const videoUrl = fileMatch ? fileMatch[1] : (hosterHtml.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/)?.[1])
        if (!videoUrl) throw new Error("M3U8 not found.")

        return {
            server: "VidMoly",
            videoSources: [{ url: videoUrl, quality: "auto", type: "hls" }],
        }
    }
}
