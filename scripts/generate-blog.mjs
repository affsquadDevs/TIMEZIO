// ─── Daily blog generator (Timezio) ───────────────────────────────────────────
// Generates N brand-new blog posts with the Claude API, matching the existing
// posts' voice, structure, length, and on-page SEO, then writes them into the
// English source of truth (data/blogPostsNew.ts) and every locale translation
// file (data/blog/<locale>.json). A push of those changes to `main` triggers the
// Vercel production deploy. New posts appear automatically on the blog index,
// the /blog/<slug> route (generateStaticParams over blogPosts), and the sitemap
// (app/sitemap.ts iterates blogPosts) — no other files need editing.
//
// Usage:
//   node scripts/generate-blog.mjs              # generate 2 posts, write files
//   node scripts/generate-blog.mjs --count 1    # generate 1 post
//   node scripts/generate-blog.mjs --no-write   # generate + print, write nothing
//
// Env:
//   ANTHROPIC_API_KEY   required — the Claude API key
//   ANTHROPIC_MODEL     optional — defaults to "claude-opus-4-8"
//
// Dependency-free: Node 20+ global fetch, no npm packages.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Non-default locales (English is the default and lives in the .ts source).
// Keep in sync with i18n/routing.ts: locales minus defaultLocale ("en").
const LOCALES = ["pl", "es", "pt", "fr", "it", "de", "uk", "sv", "cs", "el"];
const LOCALE_NAMES = {
    pl: "Polish", es: "Spanish", pt: "Portuguese", fr: "French", it: "Italian",
    de: "German", uk: "Ukrainian", sv: "Swedish", cs: "Czech", el: "Greek",
};

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";
const API_KEY = process.env.ANTHROPIC_API_KEY;

const args = process.argv.slice(2);
const COUNT = Number(args[args.indexOf("--count") + 1]) > 0 ? Number(args[args.indexOf("--count") + 1]) : 2;
const NO_WRITE = args.includes("--no-write");

// The English source of truth: posts are appended to the newBlogPosts array.
const BLOG_TS = path.join(ROOT, "data/blogPostsNew.ts");
const BLOG_TS_ARRAY = "newBlogPosts: BlogPost[] = ";
const localeFile = (l) => path.join(ROOT, `data/blog/${l}.json`);

// JSON Schema for a single English post (shared by generation + translation).
const POST_SCHEMA = {
    type: "object",
    properties: {
        slug: { type: "string", description: "short, kebab-case, unique slug" },
        title: { type: "string" },
        excerpt: { type: "string", description: "1-2 sentence summary for the blog index card and meta description" },
        readTime: { type: "string", description: 'e.g. "8 min read"' },
        content: { type: "string", description: "full article body in the lightweight markdown subset" },
    },
    required: ["slug", "title", "excerpt", "readTime", "content"],
};

const POSTS_TOOL = {
    name: "submit_posts",
    description: "Submit the finished blog post objects.",
    input_schema: {
        type: "object",
        properties: { posts: { type: "array", items: POST_SCHEMA } },
        required: ["posts"],
    },
};

// ─── Anthropic Messages API (tool use → structured, valid JSON) ───────────────
// Forces the model to call submit_posts; the API returns input already parsed as
// an object, so there is no manual JSON.parse (and no "bad control character"
// failures from raw newlines in the content).
async function claudePosts(prompt, maxTokens = 16000) {
    if (!API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "x-api-key": API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        body: JSON.stringify({
            model: MODEL,
            max_tokens: maxTokens,
            tools: [POSTS_TOOL],
            tool_choice: { type: "tool", name: "submit_posts" },
            messages: [{ role: "user", content: prompt }],
        }),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Anthropic API ${res.status}: ${text.slice(0, 500)}`);
    }
    const data = await res.json();
    const tool = (data.content || []).find((b) => b.type === "tool_use");
    if (!tool || !Array.isArray(tool.input?.posts)) {
        throw new Error(`Model did not return posts (stop_reason: ${data.stop_reason})`);
    }
    return tool.input.posts;
}

// ─── Read the English source of truth out of blogPostsNew.ts ──────────────────
// Each entry is a JSON-shaped object literal, so the array body parses as JSON.
function extractBlogPosts(src) {
    const anchor = src.indexOf(BLOG_TS_ARRAY);
    if (anchor < 0) throw new Error(`Could not locate "${BLOG_TS_ARRAY}" in blogPostsNew.ts`);
    const arrStart = src.indexOf("[", anchor + BLOG_TS_ARRAY.length - 1);
    const arrEnd = src.indexOf("\n];", arrStart);
    if (arrStart < 0 || arrEnd < 0) throw new Error("Could not locate newBlogPosts array bounds");
    const arrText = src.slice(arrStart, arrEnd) + "\n]";
    return { posts: JSON.parse(arrText), arrEnd };
}

// Read every slug currently in use across ALL English source files, so generated
// slugs never collide with an existing post (the main array, extra, or new).
async function allExistingSlugs() {
    const slugs = new Set();
    for (const f of ["data/blogPosts.ts", "data/blogPostsExtra.ts", "data/blogPostsNew.ts"]) {
        let src;
        try { src = await readFile(path.join(ROOT, f), "utf8"); } catch { continue; }
        for (const m of src.matchAll(/(?:^|[\s{])"?slug"?\s*:\s*['"]([a-z0-9-]+)['"]/g)) slugs.add(m[1]);
    }
    return [...slugs];
}

// ─── Prompts ──────────────────────────────────────────────────────────────────
function generationPrompt(samples, existingSlugs) {
    return `You are a senior writer for Timezio (timezio.com), a fast, accurate suite of time-zone tools for distributed teams, travelers, remote workers, and digital nomads. The site includes a world clock, a time-zone converter, a meeting planner, a DST checker, and a 3D globe explorer. All calculations are based on the official IANA time-zone database and are fully DST-aware. Write ${COUNT} brand-new English blog post(s) for the Timezio blog.

Match the EXISTING posts exactly in voice, depth, structure, length, and on-page SEO. Here are ${samples.length} real examples (study their authoritative-but-plain explanatory tone, ~1300-1900 word body length, worked numeric examples with real UTC offsets and city/IANA-zone names, and practical takeaways):

${JSON.stringify(samples, null, 2)}

STRICT REQUIREMENTS for each new post object:
- "slug": short, kebab-case, unique. MUST NOT be any of these existing slugs: ${JSON.stringify(existingSlugs)}
- "title": specific and useful (not clickbait), like the samples. Often phrased as a "How..." / "What is..." explainer.
- "excerpt": 1-2 sentences (roughly 150-200 chars) that work as both the blog index card text and the meta description; lead with the primary keyword.
- "readTime": realistic for the body length, in the form "N min read" (typically "7 min read" to "10 min read").
- "content": full article in the SAME lightweight markdown subset the samples use — blocks separated by a blank line, "## H2" and "### H3" headings, "- " bullet lists, and inline **bold**. Do NOT include a top-level H1 (the title renders separately). Do NOT use *italic*, \`code\` fences, or images. You MAY use plain inline markdown links [text](url) sparingly to authoritative sources (e.g. the IANA tz database) or to Timezio's own tools (use absolute https://www.timezio.com URLs, e.g. [the time zone converter](https://www.timezio.com/time-zone-converter)). Use real, correct UTC offsets and IANA zone names (e.g. America/New_York, Asia/Kolkata). 1300-1900 words.

Pick fresh, genuinely useful time-zone / scheduling / remote-work / travel topics that are NOT already covered by the existing slugs. Each post must be on a distinct topic. Every factual claim about offsets, DST rules, and dates must be accurate.

Call the submit_posts tool with exactly ${COUNT} post object(s).`;
}

function translationPrompt(localeName, posts) {
    return `Translate the following ${posts.length} blog post object(s) from English into ${localeName} for Timezio (timezio.com).

RULES:
- Translate these fields naturally and idiomatically: "title", "excerpt", "readTime" (translate the "min read" wording to ${localeName}), and "content".
- Preserve ALL markdown structure in "content" exactly: the same "##"/"###" headings, "- " bullets, **bold**, blank-line block separation, and every [text](url) link (translate the visible text, keep the URL identical). Keep all UTC offsets, IANA zone names (e.g. America/New_York), hex/number values, and the brand name "Timezio" unchanged.
- Keep the "slug" field EXACTLY as given in English (do not translate it).

English posts:
${JSON.stringify(posts, null, 2)}

Call the submit_posts tool with exactly ${posts.length} translated post object(s).`;
}

// ─── Serialize one English post as a blogPostsNew.ts array element (2-space) ───
function toTsElement(post) {
    // Field order matches the existing entries for clean diffs.
    const ordered = {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        date: post.date,
        readTime: post.readTime,
        content: post.content,
    };
    return JSON.stringify(ordered, null, 2)
        .split("\n")
        .map((line) => "  " + line)
        .join("\n");
}

// Translation entry for data/blog/<locale>.json: keyed by slug, no date field
// (the date is owned by the English source and merged in at render time).
function toLocaleEntry(post) {
    return {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        readTime: post.readTime,
    };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    const src = await readFile(BLOG_TS, "utf8");
    const { posts: newArr } = extractBlogPosts(src); // validates the source parses
    const existingSlugs = await allExistingSlugs();

    // Two most recent posts as the style reference.
    const samples = newArr.slice(-2);

    console.log(`→ Generating ${COUNT} new English post(s) with ${MODEL}…`);
    const generated = await claudePosts(generationPrompt(samples, existingSlugs));

    const today = new Date().toISOString().slice(0, 10);
    const seen = new Set(existingSlugs);
    const newPosts = [];
    for (const p of Array.isArray(generated) ? generated : [generated]) {
        if (!p || !p.slug || !p.content) { console.warn("  ⚠ skipping malformed post", p?.slug); continue; }
        if (seen.has(p.slug)) { console.warn(`  ⚠ duplicate slug "${p.slug}" — skipping`); continue; }
        seen.add(p.slug);
        newPosts.push({ ...p, date: today });
    }
    if (!newPosts.length) throw new Error("Model returned no usable new posts");
    console.log(`  ✓ ${newPosts.length} post(s): ${newPosts.map((p) => p.slug).join(", ")}`);

    // Translate into every locale (one call per locale → array of translated posts).
    const translations = {}; // locale -> { slug: entry }
    for (const loc of LOCALES) {
        console.log(`→ Translating to ${LOCALE_NAMES[loc]} (${loc})…`);
        const arr = await claudePosts(translationPrompt(LOCALE_NAMES[loc], newPosts));
        const bySlug = {};
        newPosts.forEach((en, i) => {
            const tr = arr.find((t) => t && t.slug === en.slug) || arr[i] || {};
            bySlug[en.slug] = toLocaleEntry({ ...en, ...tr });
        });
        translations[loc] = bySlug;
    }

    if (NO_WRITE) {
        console.log("\n--no-write: nothing written. Generated English posts:\n");
        console.log(JSON.stringify(newPosts, null, 2));
        return;
    }

    // Write English into blogPostsNew.ts (append before the array close `\n];`).
    const freshSrc = await readFile(BLOG_TS, "utf8");
    const insertAt = freshSrc.indexOf("\n];", freshSrc.indexOf(BLOG_TS_ARRAY));
    const tsBlock = newPosts.map(toTsElement).join(",\n");
    const newSrc = freshSrc.slice(0, insertAt) + ",\n" + tsBlock + freshSrc.slice(insertAt);
    await writeFile(BLOG_TS, newSrc);
    console.log(`  ✓ wrote ${newPosts.length} post(s) to data/blogPostsNew.ts`);

    // Write translations into each data/blog/<locale>.json (object keyed by slug).
    for (const loc of LOCALES) {
        const file = localeFile(loc);
        const obj = JSON.parse(await readFile(file, "utf8"));
        Object.assign(obj, translations[loc]);
        await writeFile(file, JSON.stringify(obj, null, 2) + "\n");
        console.log(`  ✓ ${loc}.json now has ${Object.keys(obj).length} posts`);
    }

    console.log("\n✅ Done.");
}

main().catch((err) => {
    console.error("❌", err.message);
    process.exit(1);
});
