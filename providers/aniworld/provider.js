/// <reference path="./online-streaming-provider.d.ts" />

// AniWorld for Seanime: German dub and sub from aniworld.to, played through VidMoly.
// Written from scratch by vikTempest.
//
// How an anime from AniList is found on aniworld.to:
//   - aniworld.to has one page per show with "Staffel 1, 2, ..." and "Filme".
//   - AniList has one entry per season, and splits or joins seasons differently.
//     Black Clover: AniList 170 episodes in one entry, aniworld.to Staffel 1-4.
//     Food Wars: AniList "San no Sara" and "Tootsuki Ressha-hen", aniworld.to one Staffel 3.
//   - So the provider walks the AniList prequels and counts the TV episodes before this entry.
//     With 170 episodes before it, the entry starts at aniworld.to episode 171, in whichever
//     Staffel that is. If that count isn't usable, the season number decides: from the title
//     ("Season 2", "2nd Season", "II", "Staffel 2") or from the number of TV seasons before it.

const SITE = "https://aniworld.to"
const ANILIST = "https://graphql.anilist.co"
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36"
const TV = { TV: true, TV_SHORT: true }
// aniworld.to language keys: 1 German, 2 English subtitles, 3 German subtitles
const LANGS = { dub: ["1"], sub: ["3", "2", "1"] }
const LANG_NAMES = { "1": "Deutsch", "2": "Englisch (UT)", "3": "Deutsch (UT)" }
const ROMAN = { II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10 }
const PAGE_TTL = 10 * 60 * 1000

// ---------------------------------------------------------------- titles

// Season number written in a title, 0 if none
function titleSeason(title) {
    const t = String(title || "")
    const patterns = [
        /\bseason\s*(\d+)/i,
        /\bstaffel\s*(\d+)/i,
        /\b(\d+)\s*(?:st|nd|rd|th)\s+season\b/i,
    ]
    for (const re of patterns) {
        const m = t.match(re)
        if (m) return parseInt(m[1], 10)
    }
    const roman = t.match(/\s(II|III|IV|V|VI|VII|VIII|IX|X)(?=\s*(?::|-|$))/)
    return roman ? ROMAN[roman[1]] : 0
}

// Title without season markers and extras aniworld.to doesn't have in its names
function baseTitle(title) {
    return String(title || "")
        .replace(/\b\d+\s*(?:st|nd|rd|th)\s+season\b/ig, " ")
        .replace(/\b(?:season|staffel)\s*\d+/ig, " ")
        .replace(/\s(?:II|III|IV|V|VI|VII|VIII|IX|X)(?=\s*(?::|-|$))/g, " ")
        .replace(/\b(?:part|cour)\s*\d+\b/ig, " ")
        .replace(/\((?:tv|\d{4})\)/ig, " ")
        .replace(/\bmovie\b/ig, " ")
        .replace(/\s+/g, " ")
        .replace(/[\s:\-–]+$/, "")
        .trim()
}

// What to type into the aniworld.to search, most exact first
function searchTerms(title) {
    const terms = []
    const add = (q) => {
        q = String(q || "").replace(/\s+/g, " ").trim()
        if (q.length > 1 && terms.indexOf(q) < 0) terms.push(q)
    }
    const full = baseTitle(title)
    add(full)
    const head = full.split(/\s*[:–]\s*|\s+-\s+/)[0]
    add(head)
    const words = head.split(" ")
    for (let n = Math.min(3, words.length - 1); n >= 2; n--) add(words.slice(0, n).join(" "))
    return terms
}

// Does this AniList TV entry carry on the season of the one before it (second cour)?
// "X Season 3 Part 2" after "X Season 3", "X: San no Sara - Tootsuki Ressha-hen" after "X: San no Sara"
function carriesOn(title, before) {
    const a = String(title || "").toLowerCase().trim()
    const b = String(before || "").toLowerCase().trim()
    if (!a || !b) return false
    if (/\b(?:part|cour)\s*\d+\b|\b\d+\s*(?:st|nd|rd|th)\s+cour\b/.test(a)) return true
    const sa = titleSeason(title)
    const sb = titleSeason(before)
    if (sa && sb) return sa === sb
    // "X: Name" -> "X: Name - More" carries on, "X" -> "X: Name" is a new season
    return a.length > b.length && a.startsWith(b) && /[:：]/.test(b)
}

// ---------------------------------------------------------------- AniList

const chains = {}

// Where an AniList TV entry sits in its series:
//   season: TV seasons up to this one (a second cour doesn't count as a new one)
//   offset: episodes of the same season before this entry (second cour)
//   before: TV episodes of all entries before this one, -1 if unknown
//   episodes: episodes of this entry, 0 if unknown (still airing)
async function placeInSeries(mediaId) {
    const none = { season: 0, offset: 0, before: -1, episodes: 0 }
    if (!mediaId) return none
    if (chains[mediaId]) return chains[mediaId]

    const query = "query ($id: Int) { Media(id: $id, type: ANIME) { id format episodes title { romaji } " +
        "relations { edges { relationType node { id type format } } } } }"
    const entries = []
    const visited = {}
    let id = mediaId
    try {
        while (id && !visited[id] && entries.length < 20) {
            visited[id] = true
            const res = await fetch(ANILIST, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({ query: query, variables: { id: id } }),
            })
            const json = await res.json()
            const media = json && json.data && json.data.Media
            if (!media) break
            entries.push(media)
            const prequels = ((media.relations && media.relations.edges) || [])
                .filter((e) => e && e.relationType === "PREQUEL" && e.node && e.node.type === "ANIME")
                .map((e) => e.node)
            // Through a movie if there is no TV prequel, the movie itself isn't counted
            const next = prequels.find((n) => TV[n.format]) || prequels[0]
            id = next ? next.id : 0
        }
    }
    catch (e) {
        return none
    }
    if (!entries.length) return none

    const series = entries.filter((m) => TV[m.format]).reverse()
    let season = 0
    let offset = 0
    let before = 0
    series.forEach((m, i) => {
        const prev = series[i - 1]
        if (prev && carriesOn(m.title && m.title.romaji, prev.title && prev.title.romaji)) offset += prev.episodes || 0
        else {
            season++
            offset = 0
        }
        if (i < series.length - 1) before = before >= 0 && m.episodes ? before + m.episodes : -1
    })
    const place = { season: season || 1, offset: offset, before: before, episodes: entries[0].episodes || 0 }
    chains[mediaId] = place
    return place
}

// ---------------------------------------------------------------- aniworld.to pages

const pages = {}

async function page(url) {
    const hit = pages[url]
    if (hit && Date.now() - hit.at < PAGE_TTL) return hit.html
    const res = await fetch(url, { headers: { "User-Agent": UA, "Referer": SITE + "/" } })
    const html = await res.text()
    if (res.status && res.status >= 400) throw new Error(`AniWorld antwortet mit HTTP ${res.status} (${url}).`)
    pages[url] = { at: Date.now(), html: html }
    return html
}

// Staffel number -> page url, from a show page
function seasonLinks(showHtml, slug) {
    const links = {}
    const re = new RegExp(`href="(/anime/stream/${escapeRe(slug)}/staffel-(\\d+))"`, "g")
    let m
    while ((m = re.exec(showHtml)) !== null) {
        const n = parseInt(m[2], 10)
        if (n > 0 && !links[n]) links[n] = SITE + m[1]
    }
    return links
}

// Episodes on a Staffel page, in order: [{ url, number }]
function episodeLinks(html, slug, season) {
    const out = []
    const seen = {}
    const re = new RegExp(`href="(/anime/stream/${escapeRe(slug)}/staffel-${season}/episode-(\\d+))"`, "g")
    let m
    while ((m = re.exec(html)) !== null) {
        if (seen[m[1]]) continue
        seen[m[1]] = true
        out.push({ url: SITE + m[1], number: parseInt(m[2], 10) })
    }
    return out.sort((a, b) => a.number - b.number)
}

function movieLinks(html, slug) {
    const out = []
    const seen = {}
    const re = new RegExp(`href="(/anime/stream/${escapeRe(slug)}/filme/film-(\\d+))"`, "g")
    let m
    while ((m = re.exec(html)) !== null) {
        if (seen[m[1]]) continue
        seen[m[1]] = true
        out.push({ url: SITE + m[1], number: parseInt(m[2], 10) })
    }
    return out.sort((a, b) => a.number - b.number)
}

function escapeRe(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// Hoster links on an episode page: [{ lang, hoster, target }]
function hosterLinks(html) {
    const out = []
    String(html).split(/<li\b/).slice(1).forEach((block) => {
        const head = block.slice(0, block.indexOf(">") + 1)
        const lang = (head.match(/data-lang-key="(\d+)"/) || [])[1]
        const target = (head.match(/data-link-target="([^"]+)"/) || [])[1]
        if (!lang || !target) return
        const hoster = (block.match(/<h4>\s*([^<]+?)\s*<\/h4>/) || block.match(/class="icon\s+([A-Za-z0-9]+)"/) || [])[1] || ""
        out.push({ lang: lang, hoster: hoster.trim(), target: target.startsWith("http") ? target : SITE + target })
    })
    return out
}

// ---------------------------------------------------------------- VidMoly

function findM3u8(html, origin) {
    const m = html.match(/sources\s*:\s*\[\s*\{\s*file\s*:\s*["']([^"']+)["']/) ||
        html.match(/file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/) ||
        html.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/)
    if (!m) return ""
    const u = m[1].trim()
    if (u.startsWith("//")) return "https:" + u
    if (u.startsWith("/")) return origin + u
    return u
}

// aniworld.to redirect link -> { url, headers } of the HLS stream
async function vidmolyStream(target) {
    const hop = await fetch(target, { headers: { "User-Agent": UA, "Referer": SITE + "/" } })
    let html = await hop.text()
    let embed = String(hop.url || "")
    if (!/vidmoly/i.test(embed)) {
        const m = html.match(/https?:\/\/(?:www\.)?vidmoly\.[a-z]+\/(?:embed-|w\/)[A-Za-z0-9_-]+(?:\.html)?/i)
        embed = m ? m[0] : ""
    }
    const originMatch = embed.match(/^https?:\/\/[^/]+/)
    const origin = originMatch ? originMatch[0] : "https://vidmoly.net"
    const code = (embed.match(/\/(?:embed-|w\/)([A-Za-z0-9_-]+)/) || [])[1] || ""
    // The stream only plays with VidMoly as Referer, so Seanime gets these headers to send along
    const headers = { "User-Agent": UA, "Referer": origin + "/", "Origin": origin }

    let url = findM3u8(html, origin)
    if (!url && code) {
        // Embed page behind a Cloudflare check: the cookie skips it
        const embedUrl = `${origin}/embed-${code}.html`
        const res = await fetch(embedUrl, {
            headers: Object.assign({}, headers, {
                "Referer": embedUrl,
                "Cookie": `cf_turnstile_demo_pass_${code}=1`,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            }),
        })
        html = await res.text()
        url = findM3u8(html, origin)
    }
    return url ? { url: url, headers: headers } : null
}

// ---------------------------------------------------------------- ids
// Search result id: "<slug>|s:2|o:12|b:170|e:12|dub" or "<slug>|movie|dub"
// b: AniList TV episodes before this entry (missing if unknown), e: its episodes (missing if unknown)

function makeId(slug, info) {
    const parts = [slug]
    if (info.movie) parts.push("movie")
    else {
        if (info.season > 1) parts.push("s:" + info.season)
        if (info.offset > 0) parts.push("o:" + info.offset)
        if (info.before >= 0) parts.push("b:" + info.before)
        if (info.before >= 0 && info.episodes > 0) parts.push("e:" + info.episodes)
    }
    if (info.dub) parts.push("dub")
    return parts.join("|")
}

function readId(id) {
    const parts = String(id).split("|")
    const num = (key, missing) => {
        const p = parts.find((x) => x.startsWith(key + ":"))
        return p ? parseInt(p.slice(key.length + 1), 10) || 0 : (missing || 0)
    }
    return {
        slug: parts[0],
        movie: parts.indexOf("movie") >= 0,
        dub: parts.indexOf("dub") >= 0,
        season: num("s") || 1,
        offset: num("o"),
        before: num("b", -1),
        episodes: num("e"),
    }
}

// ---------------------------------------------------------------- provider

class Provider {
    getSettings() {
        return {
            episodeServers: ["VidMoly"],
            supportsDub: true,
        }
    }

    async lookup(keyword) {
        const res = await fetch(`${SITE}/ajax/search`, {
            method: "POST",
            headers: {
                "User-Agent": UA,
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest",
                "Referer": SITE + "/",
            },
            body: "keyword=" + encodeURIComponent(keyword),
        })
        let list
        try { list = JSON.parse(await res.text()) } catch (e) { return [] }
        if (!Array.isArray(list)) return []
        const shows = []
        list.forEach((item) => {
            const m = item && String(item.link || "").match(/^\/anime\/stream\/([^/?#]+)\/?$/)
            if (!m || shows.some((s) => s.slug === m[1])) return
            const title = String(item.title || "").replace(/<[^>]*>/g, "").replace(/&#8230;/g, "...").replace(/&amp;/g, "&").trim()
            shows.push({ slug: m[1], title: title || m[1] })
        })
        return shows
    }

    // Season, offset and episode count for the search result id
    async placeOf(query) {
        const media = query.media || {}
        let season = titleSeason(query.query)
        if (!season) {
            for (const t of [media.romajiTitle, media.englishTitle].concat(media.synonyms || [])) {
                season = titleSeason(t)
                if (season) break
            }
        }
        const place = TV[media.format] ? await placeInSeries(media.id) : { season: 0, offset: 0, before: -1, episodes: 0 }
        // Title says a later season than AniList counts: the prequels on AniList are incomplete,
        // so their episode count is wrong too
        const before = season && season > place.season ? -1 : place.before
        return {
            season: season || place.season || 1,
            offset: place.offset,
            before: before,
            episodes: place.episodes || media.episodeCount || 0,
        }
    }

    async search(query) {
        const media = query.media || {}
        const movie = media.format === "MOVIE"
        const info = movie ? { movie: true } : await this.placeOf(query)
        info.dub = !!query.dub

        let shows = []
        for (const term of searchTerms(query.query)) {
            try { shows = await this.lookup(term) } catch (e) { shows = [] }
            if (shows.length) break
        }
        return shows.map((s) => ({
            id: makeId(s.slug, info),
            title: s.title,
            url: `${SITE}/anime/stream/${s.slug}`,
            subOrDub: query.dub ? "dub" : "sub",
        }))
    }

    async findEpisodes(id) {
        const q = readId(id)
        const tag = q.dub ? "|dub" : ""
        const showUrl = `${SITE}/anime/stream/${q.slug}`
        const show = await page(showUrl)
        const toDetails = (list) => list.map((e, i) => ({
            id: e.url.replace(SITE, "") + tag,
            number: i + 1,
            url: e.url,
            title: `Episode ${i + 1}`,
        }))

        if (q.movie) {
            const films = movieLinks(await page(`${showUrl}/filme`), q.slug)
            if (!films.length) throw new Error(`AniWorld hat keine Filme für "${q.slug}".`)
            return toDetails(films.slice(0, 1))
        }

        const links = seasonLinks(show, q.slug)
        const numbers = Object.keys(links).map(Number).sort((a, b) => a - b)
        if (!numbers.length) throw new Error(`AniWorld hat keine Staffeln für "${q.slug}".`)
        const seasonEpisodes = async (n) => links[n] ? episodeLinks(await page(links[n]), q.slug, n) : []

        // 1. Count episodes over all Staffeln (Black Clover, Food Wars). Also for a first season:
        //    Black Clover's first AniList entry has 170 episodes, that is Staffel 1-4 here
        if (q.before >= 0) {
            const all = [].concat.apply([], await Promise.all(numbers.map(seasonEpisodes)))
            if (all.length > q.before) {
                return toDetails(all.slice(q.before, q.episodes > 0 ? q.before + q.episodes : undefined))
            }
        }

        // 2. Season number
        if (!links[q.season]) {
            throw new Error(`AniWorld hat keine Staffel ${q.season} für "${q.slug}" (nur ${numbers.join(", ")}). Wähle die richtige über "Manual match".`)
        }
        const episodes = await seasonEpisodes(q.season)
        if (!q.offset) return toDetails(episodes)
        // Second cour: after the first one in the same Staffel, or the next Staffel
        if (episodes.length > q.offset) return toDetails(episodes.slice(q.offset))
        const next = await seasonEpisodes(q.season + 1)
        if (next.length) return toDetails(next)
        throw new Error(`AniWorld hat in Staffel ${q.season} von "${q.slug}" nur ${episodes.length} Folgen.`)
    }

    async findEpisodeServer(episode, _server) {
        const dub = String(episode.id).endsWith("|dub")
        const links = hosterLinks(await page(episode.url))
        const order = dub ? LANGS.dub : LANGS.sub
        const candidates = links
            .filter((l) => /vidmoly/i.test(l.hoster) && order.indexOf(l.lang) >= 0)
            .sort((a, b) => order.indexOf(a.lang) - order.indexOf(b.lang))

        if (!candidates.length) {
            const have = []
            links.forEach((l) => {
                const label = `${l.hoster || "?"} ${LANG_NAMES[l.lang] || l.lang}`
                if (have.indexOf(label) < 0) have.push(label)
            })
            throw new Error((dub ? "Kein deutscher Dub bei VidMoly für diese Folge." : "Kein VidMoly-Stream für diese Folge.") +
                (have.length ? " Vorhanden: " + have.join(", ") : " AniWorld listet keine Streams dafür."))
        }

        for (const c of candidates) {
            let stream = null
            try { stream = await vidmolyStream(c.target) } catch (e) { stream = null }
            if (stream) {
                return {
                    server: "VidMoly",
                    headers: stream.headers,
                    videoSources: [{ url: stream.url, type: "m3u8", quality: "auto", subtitles: [] }],
                }
            }
        }
        throw new Error("VidMoly hat keinen Stream geliefert (Seite geändert oder Cloudflare-Prüfung).")
    }
}
