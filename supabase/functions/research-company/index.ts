// supabase/functions/research-company/index.ts
// Deploy with: supabase functions deploy research-company
//
// Environment variables needed:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-provided)
//   SERPER_API_KEY          - Serper.dev API key (free tier: 2,500 queries)
//   GEMINI_API_KEY          - For LLM summarization via Google Gemini (optional, degrades gracefully)
//
// Invocation:
//   POST /functions/v1/research-company
//   Body: { "company_id": 2, "modules": ["website", "media", "shareholders"] }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── Types ───────────────────────────────────────────────────
interface Company {
  id: number;
  company_name: string | null;
  address_city: string | null;
  address_country: string | null;
  shareholder_details: ShareholderDetail[] | null;
  shareholder_names: string | null;
  shareholder_dobs: string | null;
  wz_description: string | null;
  tel: string | null;
  fax: string | null;
  email: string | null;
  website: string | null;
}

interface ShareholderDetail {
  name?: string;
  dob?: string;
  percentage?: number;
}

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source?: string;
  date?: string;
}

interface SerperOrganicResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
  sitelinks?: { title: string; link: string }[];
}

// ─── Helpers ─────────────────────────────────────────────────
const SERPER_KEY = Deno.env.get("SERPER_API_KEY");
const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");

/**
 * Parse Serper date strings (dd.MM.yyyy, relative dates, etc.) to ISO date (YYYY-MM-DD)
 */
function parseSerperDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;

  // Handle dd.MM.yyyy format (e.g. "30.12.2011")
  const dotMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotMatch) {
    const [, day, month, year] = dotMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Handle ISO format already (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.substring(0, 10);
  }

  // Handle relative dates like "2 hours ago", "3 days ago"
  const relMatch = dateStr.match(/(\d+)\s+(hour|day|week|month|year)s?\s+ago/i);
  if (relMatch) {
    const amount = parseInt(relMatch[1]);
    const unit = relMatch[2].toLowerCase();
    const now = new Date();
    if (unit === "hour") now.setHours(now.getHours() - amount);
    else if (unit === "day") now.setDate(now.getDate() - amount);
    else if (unit === "week") now.setDate(now.getDate() - amount * 7);
    else if (unit === "month") now.setMonth(now.getMonth() - amount);
    else if (unit === "year") now.setFullYear(now.getFullYear() - amount);
    return now.toISOString().substring(0, 10);
  }

  // Try native Date parsing as fallback
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toISOString().substring(0, 10);
  } catch { /* ignore */ }

  return null;
}

/**
 * Search the web using Serper.dev (Google Search API wrapper)
 * Docs: https://serper.dev/docs
 *
 * Free tier: 2,500 queries
 */
async function webSearch(
  query: string,
  num = 10,
  type: "search" | "news" = "search"
): Promise<SearchResult[]> {
  if (!SERPER_KEY) {
    console.warn("Serper API not configured, skipping search");
    return [];
  }

  try {
    const endpoint = type === "news"
      ? "https://google.serper.dev/news"
      : "https://google.serper.dev/search";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        num: Math.min(num, 10),
        gl: "de",
        hl: "de",
      }),
    });

    if (!res.ok) {
      console.error(`Serper error: ${res.status} ${await res.text()}`);
      return [];
    }

    const data = await res.json();

    // Serper returns "organic" for search, "news" for news
    const items = type === "news" ? (data.news || []) : (data.organic || []);

    return items.map((item: any) => ({
      title: item.title || "",
      link: item.link || "",
      snippet: item.snippet || item.description || "",
      source: item.source || (item.link ? new URL(item.link).hostname : ""),
      date: parseSerperDate(item.date),
    }));
  } catch (err) {
    console.error("Serper search failed:", err);
    return [];
  }
}

/**
 * Raw Serper search that returns full organic results including sitelinks
 */
async function webSearchRaw(
  query: string,
  num = 10
): Promise<{ organic: SerperOrganicResult[]; knowledgeGraph?: any }> {
  if (!SERPER_KEY) return { organic: [] };

  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: Math.min(num, 10), gl: "de", hl: "de" }),
    });

    if (!res.ok) {
      console.error(`Serper raw error: ${res.status} ${await res.text()}`);
      return { organic: [] };
    }

    const data = await res.json();
    return {
      organic: (data.organic || []).map((item: any) => ({
        title: item.title || "",
        link: item.link || "",
        snippet: item.snippet || "",
        position: item.position || 0,
        sitelinks: item.sitelinks || [],
      })),
      knowledgeGraph: data.knowledgeGraph || null,
    };
  } catch (err) {
    console.error("Serper raw search failed:", err);
    return { organic: [] };
  }
}

// Domains to skip when selecting the company's own website
const AGGREGATOR_DOMAINS = [
  "northdata.de", "northdata.com", "facebook.com", "xing.com",
  "linkedin.com", "instagram.com", "youtube.com", "twitter.com",
  "handelsregister.de", "unternehmensregister.de", "firmenwissen.de",
  "wlw.de", "gelbeseiten.de", "yelp.de", "kununu.com", "glassdoor.de",
  "heinze.de", "google.com", "google.de", "wikipedia.org",
];

async function fetchPageText(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BoughtBot/1.0; +https://bought.app)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return "";

    const html = await res.text();

    // Basic HTML to text conversion (strip tags, decode entities)
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#\d+;/g, "")
      .replace(/\s+/g, " ")
      .trim();

    return text.substring(0, 10000); // Limit to ~10k chars
  } catch (err) {
    console.error(`Failed to fetch ${url}:`, err);
    return "";
  }
}

async function summarizeWithLLM(
  prompt: string,
  systemPrompt: string
): Promise<string | null> {
  if (!GEMINI_KEY) {
    console.warn("GEMINI_API_KEY not set, skipping LLM summarization");
    return null;
  }

  try {
    console.log("Calling Gemini API...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1500,
          temperature: 0.3,
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`Gemini API error: ${res.status} - ${errBody}`);
      return null;
    }

    const data = await res.json();
    console.log("Gemini response keys:", Object.keys(data));
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    console.log("Gemini extracted text length:", text?.length || 0);
    return text;
  } catch (err) {
    console.error("Gemini summarization failed:", err);
    return null;
  }
}

// ─── Module 1: Website Discovery & Crawl ─────────────────────
async function researchWebsite(supabase: any, company: Company) {
  const companyId = company.id;
  const companyName = company.company_name || "";
  const city = company.address_city || "";
  const knownWebsite = company.website || null;

  // Update status
  await supabase
    .from("company_website_profiles")
    .upsert(
      { company_id: companyId, crawl_status: "crawling" },
      { onConflict: "company_id" }
    );

  try {
    let websiteUrl: string;
    let domain: string;
    let sitelinks: { title: string; link: string }[] = [];
    let searchResults: any[] = [];

    if (knownWebsite) {
      // ── Path A: Website URL is known from Hamburg Targets ──
      console.log(`Using known website URL: ${knownWebsite}`);
      websiteUrl = knownWebsite.startsWith("http") ? knownWebsite : `https://${knownWebsite}`;
      domain = new URL(websiteUrl).hostname;

      // Still do Serper search for web presence data
      const searchQuery = `"${companyName}" ${city}`;
      const rawResults = await webSearchRaw(searchQuery, 10);
      searchResults = rawResults.organic.map((r) => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet,
        position: r.position,
        sitelinks: r.sitelinks || [],
      }));

      // Check if any search result matches the known domain for sitelinks
      const matchingResult = rawResults.organic.find((r) => {
        try {
          return new URL(r.link).hostname.includes(domain.replace("www.", ""));
        } catch { return false; }
      });
      if (matchingResult) {
        sitelinks = matchingResult.sitelinks || [];
      }
    } else {
      // ── Path B: Discover website via Serper (original flow) ──
      const searchQuery = `"${companyName}" ${city}`;
      const rawResults = await webSearchRaw(searchQuery, 10);

      if (rawResults.organic.length === 0) {
        await supabase
          .from("company_website_profiles")
          .upsert(
            {
              company_id: companyId,
              crawl_status: "not_found",
              crawl_error: "No search results found",
              search_results: [],
              crawled_at: new Date().toISOString(),
            },
            { onConflict: "company_id" }
          );
        return;
      }

      searchResults = rawResults.organic.map((r) => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet,
        position: r.position,
        sitelinks: r.sitelinks || [],
      }));

      // Pick the company's own website (skip aggregators)
      const nameParts = companyName
        .toLowerCase()
        .replace(/gmbh|ag|kg|ohg|e\.v\.|mbh|co\.|&|g\.m\.b\.h\./gi, "")
        .trim()
        .split(/\s+/)
        .filter((p) => p.length > 2);

      let bestResult = rawResults.organic[0];

      for (const result of rawResults.organic) {
        const hostname = new URL(result.link).hostname.toLowerCase();
        const isAggregator = AGGREGATOR_DOMAINS.some((d) => hostname.includes(d));
        if (!isAggregator && nameParts.some((part) => hostname.includes(part))) {
          bestResult = result;
          break;
        }
      }

      if (AGGREGATOR_DOMAINS.some((d) => new URL(bestResult.link).hostname.includes(d))) {
        const nonAgg = rawResults.organic.find(
          (r) => !AGGREGATOR_DOMAINS.some((d) => new URL(r.link).hostname.includes(d))
        );
        if (nonAgg) bestResult = nonAgg;
      }

      websiteUrl = bestResult.link;
      domain = new URL(websiteUrl).hostname;
      sitelinks = bestResult.sitelinks || [];
    }

    // ── Common flow: Crawl & extract (runs for both paths) ──

    // Step 3: Crawl main page
    const mainPageText = await fetchPageText(websiteUrl);

    // Step 4: Use sitelinks to find Impressum (much more reliable than guessing)
    let impressumText = "";
    let impressumUrl = "";

    const impressumSitelink = sitelinks.find((sl) =>
      sl.title.toLowerCase().includes("impressum")
    );
    if (impressumSitelink) {
      const text = await fetchPageText(impressumSitelink.link);
      if (text.length > 100) {
        impressumText = text;
        impressumUrl = impressumSitelink.link;
      }
    }

    // Fallback: guess common Impressum URLs
    if (!impressumText) {
      const impressumGuesses = [
        `https://${domain}/impressum`,
        `https://${domain}/impressum/`,
        `https://www.${domain.replace("www.", "")}/impressum`,
      ];
      for (const url of impressumGuesses) {
        const text = await fetchPageText(url);
        if (text.length > 100) {
          impressumText = text;
          impressumUrl = url;
          break;
        }
      }
    }

    // Step 5: Use sitelinks to find About/Über uns page
    let aboutText = "";
    const aboutSitelink = sitelinks.find((sl) =>
      /über uns|about|unternehmen|geschäftsleitung|team/i.test(sl.title)
    );
    if (aboutSitelink) {
      aboutText = await fetchPageText(aboutSitelink.link);
    }

    // Fallback: guess common About URLs
    if (!aboutText || aboutText.length < 100) {
      const aboutGuesses = [
        `https://${domain}/ueber-uns`,
        `https://${domain}/about`,
        `https://${domain}/unternehmen`,
        `https://${domain}/ueber-uns/`,
      ];
      for (const url of aboutGuesses) {
        const text = await fetchPageText(url);
        if (text.length > 100) {
          aboutText = text;
          break;
        }
      }
    }

    // Step 6: Crawl additional sitelinks for richer data (Kontakt, Leistungen, etc.)
    let kontaktText = "";
    const kontaktSitelink = sitelinks.find((sl) =>
      /kontakt|contact/i.test(sl.title)
    );
    if (kontaktSitelink) {
      kontaktText = await fetchPageText(kontaktSitelink.link);
    }

    // Step 7: Parse Impressum for structured data
    let impressumData: Record<string, string> = {};
    if (impressumText) {
      const patterns: Record<string, RegExp> = {
        geschaeftsfuehrer:
          /(?:Geschäftsführ(?:er|ung)|Managing Director|Vertretungsberechtig)[\s:]*([^\n,;]+)/i,
        hrb_number: /(?:HRB|HR B|Handelsregister[\s:]*B?)[\s:]*(\d+)/i,
        amtsgericht:
          /(?:Amtsgericht|Registergericht|AG)[\s:]*([A-ZÄÖÜa-zäöü\s]+?)(?:\s*[,;.]|\s*HRB)/i,
        ust_id:
          /(?:USt-?Id(?:Nr)?\.?|Umsatzsteuer-?Identifikationsnummer)[\s.:]*([A-Z]{2}\s*\d[\d\s]*)/i,
        steuernummer: /(?:Steuernummer|St\.?\s*Nr\.?)[\s.:]*(\d[\d\s/]+)/i,
      };

      for (const [key, pattern] of Object.entries(patterns)) {
        const match = impressumText.match(pattern);
        if (match) {
          impressumData[key] = match[1].trim();
        }
      }
    }

    // Step 8: LLM summarization (use all available text including search snippets)
    let description = "";
    let productsServices: string[] = [];
    let teamMembers: any[] = [];

    // Include search result snippets for richer context
    const snippetContext = searchResults
      .map((r: any) => `${r.title}: ${r.snippet}`)
      .join("\n");

    const combinedText = [
      mainPageText.substring(0, 3000),
      aboutText.substring(0, 2000),
      kontaktText.substring(0, 500),
      snippetContext ? `\n--- Search result snippets ---\n${snippetContext}` : "",
    ]
      .filter(Boolean)
      .join("\n\n---\n\n");

    console.log(`Combined text length: ${combinedText.length}, mainPage: ${mainPageText.length}, about: ${aboutText.length}`);

    if (combinedText.length > 50) {
      const summary = await summarizeWithLLM(
        `Here is text extracted from the website of "${companyName}" (${city}, Germany):\n\n${combinedText}`,
        `You are analyzing a German company's website. Extract and return a JSON object with these fields:
        - "description": A 2-3 sentence summary of what the company does (in English)
        - "products_services": Array of up to 8 specific products or services they offer
        - "team_members": Array of objects {name, role} for any team members/leadership mentioned
        Return ONLY valid JSON, no markdown fences.`
      );

      if (summary) {
        try {
          const parsed = JSON.parse(
            summary.replace(/```json|```/g, "").trim()
          );
          description = parsed.description || "";
          productsServices = parsed.products_services || [];
          teamMembers = parsed.team_members || [];
        } catch {
          description = summary.substring(0, 500);
        }
      }
    }

    // Step 9: Extract social links from page text + search results
    const socialPatterns: Record<string, RegExp> = {
      linkedin: /(?:linkedin\.com\/(?:company|in)\/[\w-]+)/i,
      xing: /(?:xing\.com\/(?:companies|profile)\/[\w-]+)/i,
      facebook: /(?:facebook\.com\/[\w.-]+)/i,
      instagram: /(?:instagram\.com\/[\w.-]+)/i,
      youtube: /(?:youtube\.com\/(?:channel|c|@)\/[\w.-]+)/i,
    };

    const socialLinks: Record<string, string> = {};
    const allText = mainPageText + " " + aboutText + " " + impressumText + " " +
      kontaktText + " " + searchResults.map((r: any) => r.link).join(" ");
    for (const [platform, pattern] of Object.entries(socialPatterns)) {
      const match = allText.match(pattern);
      if (match) {
        socialLinks[platform] = `https://${match[0]}`;
      }
    }

    // Step 10: Extract contact info — prefer Hamburg Targets data over regex extraction
    const fullText = mainPageText + " " + aboutText + " " + impressumText + " " + kontaktText;
    const emailMatch = fullText.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    const phoneMatch = fullText.match(/(?:\+49|0049|0)\s*[\d\s/()-]{6,20}/);

    // Save results
    await supabase.from("company_website_profiles").upsert(
      {
        company_id: companyId,
        website_url: websiteUrl,
        domain,
        impressum_url: impressumUrl || null,
        company_description: description || null,
        products_services: productsServices,
        team_members: teamMembers,
        contact_email: company.email || emailMatch?.[0] || null,
        contact_phone: company.tel || phoneMatch?.[0]?.trim() || null,
        contact_fax: company.fax || null,
        social_links: socialLinks,
        impressum_data: impressumData,
        search_results: searchResults,
        crawl_status: "completed",
        crawl_error: null,
        raw_pages: [
          {
            url: websiteUrl,
            title: "Homepage",
            text_excerpt: mainPageText.substring(0, 500),
          },
          impressumUrl
            ? { url: impressumUrl, title: "Impressum", text_excerpt: impressumText.substring(0, 500) }
            : null,
          aboutSitelink
            ? { url: aboutSitelink.link, title: aboutSitelink.title, text_excerpt: aboutText.substring(0, 500) }
            : null,
          kontaktSitelink
            ? { url: kontaktSitelink.link, title: kontaktSitelink.title, text_excerpt: kontaktText.substring(0, 500) }
            : null,
        ].filter(Boolean),
        crawled_at: new Date().toISOString(),
      },
      { onConflict: "company_id" }
    );
  } catch (err) {
    console.error("Website research failed:", err);
    await supabase.from("company_website_profiles").upsert(
      {
        company_id: companyId,
        crawl_status: "failed",
        crawl_error: String(err),
        crawled_at: new Date().toISOString(),
      },
      { onConflict: "company_id" }
    );
  }
}

// ─── Module 2: Media / News Search ───────────────────────────
async function researchMedia(supabase: any, company: Company) {
  const companyId = company.id;
  const companyName = company.company_name || "";
  const city = company.address_city || "";

  await supabase.from("company_media_searches").upsert(
    { company_id: companyId, search_status: "searching" },
    { onConflict: "company_id" }
  );

  try {
    const allMentions: any[] = [];

    // Search 1: Company name — news articles
    const companyNews = await webSearch(
      `"${companyName}" ${city}`,
      10,
      "news"
    );
    for (const result of companyNews) {
      allMentions.push({
        company_id: companyId,
        title: result.title,
        url: result.link,
        source: result.source,
        published_at: result.date || null,
        snippet: result.snippet,
        sentiment: "unknown",
        mention_type: "company",
        search_query: `"${companyName}" ${city}`,
      });
    }

    // Search 2: Company name — web pages (catches press releases, blog posts, etc.)
    const companyWeb = await webSearch(
      `"${companyName}" ${city}`,
      10,
      "search"
    );
    for (const result of companyWeb) {
      if (!allMentions.some((m) => m.url === result.link)) {
        allMentions.push({
          company_id: companyId,
          title: result.title,
          url: result.link,
          source: result.source,
          published_at: result.date || null,
          snippet: result.snippet,
          sentiment: "unknown",
          mention_type: "company",
          search_query: `"${companyName}" ${city}`,
        });
      }
    }

    // Search 3: Majority shareholders (people only, not corporate entities)
    const shareholders = getShareholderNames(company);
    const personShareholders = shareholders.filter(
      (name) =>
        !name.match(/gmbh|ag|kg|ohg|e\.v\.|holding|verwaltung|beteiligung|mbh|g\.m\.b\.h/i)
    );

    for (const name of personShareholders.slice(0, 3)) {
      // News search for shareholder
      const shNews = await webSearch(
        `"${name}" "${companyName}"`,
        5,
        "news"
      );
      for (const result of shNews) {
        if (!allMentions.some((m) => m.url === result.link)) {
          allMentions.push({
            company_id: companyId,
            title: result.title,
            url: result.link,
            source: result.source,
            published_at: result.date || null,
            snippet: result.snippet,
            sentiment: "unknown",
            mention_type: "shareholder",
            related_shareholder: name,
            search_query: `"${name}" "${companyName}"`,
          });
        }
      }

      // Web search for shareholder
      const shWeb = await webSearch(
        `"${name}" "${companyName}" OR "${city}"`,
        5,
        "search"
      );
      for (const result of shWeb) {
        if (!allMentions.some((m) => m.url === result.link)) {
          allMentions.push({
            company_id: companyId,
            title: result.title,
            url: result.link,
            source: result.source,
            published_at: result.date || null,
            snippet: result.snippet,
            sentiment: "unknown",
            mention_type: "shareholder",
            related_shareholder: name,
            search_query: `"${name}" "${companyName}"`,
          });
        }
      }
    }

    // Delete old mentions for this company, insert fresh
    await supabase
      .from("company_media_mentions")
      .delete()
      .eq("company_id", companyId);

    if (allMentions.length > 0) {
      const { error: insertError } = await supabase.from("company_media_mentions").insert(allMentions);
      if (insertError) {
        console.error("Failed to insert media mentions:", insertError);
        throw new Error(`Insert failed: ${insertError.message}`);
      }
    }

    // LLM summary of all media mentions
    let mediaSummary: string | null = null;
    if (allMentions.length > 0) {
      const mentionSnippets = allMentions
        .map((m) => `[${m.mention_type.toUpperCase()}] ${m.title}${m.source ? ` (${m.source})` : ""}${m.snippet ? `: ${m.snippet}` : ""}`)
        .join("\n");

      mediaSummary = await summarizeWithLLM(
        `Here are ${allMentions.length} search results about "${companyName}" (${city}, Germany) and its shareholders:\n\n${mentionSnippets}`,
        `You are analyzing media mentions and web search results about a German company.
Write a concise 3-5 sentence summary covering:
1. The company's public presence and reputation
2. Any notable news, awards, or events
3. Key findings about shareholders if relevant results exist

If results are mostly directory listings or basic company pages, note that the company has a low media profile.
Write in English. Be factual and specific. Plain text only, no markdown.`
      );
    }

    // Update search status
    await supabase.from("company_media_searches").upsert(
      {
        company_id: companyId,
        search_status: "completed",
        search_error: null,
        mentions_found: allMentions.length,
        media_summary: mediaSummary,
        last_searched_at: new Date().toISOString(),
      },
      { onConflict: "company_id" }
    );
  } catch (err) {
    console.error("Media research failed:", err);
    await supabase.from("company_media_searches").upsert(
      {
        company_id: companyId,
        search_status: "failed",
        search_error: String(err),
        last_searched_at: new Date().toISOString(),
      },
      { onConflict: "company_id" }
    );
  }
}

// ─── Module 3: Shareholder Background Search ─────────────────
async function researchShareholders(supabase: any, company: Company) {
  const companyId = company.id;
  const companyName = company.company_name || "";
  const city = company.address_city || "";
  const shareholders = getShareholderNames(company);

  try {
    for (const name of shareholders) {
      const isCompany = name.match(
        /gmbh|ag|kg|ohg|e\.v\.|holding|verwaltung|beteiligung|mbh/i
      );

      if (isCompany) {
        // For corporate shareholders: search the company itself
        await supabase.from("shareholder_backgrounds").upsert(
          {
            company_id: companyId,
            shareholder_name: name,
            enrichment_status: "is_company",
            enriched_at: new Date().toISOString(),
          },
          { onConflict: "company_id,shareholder_name" }
        );

        // Search for the parent company
        const results = await webSearch(
          `"${name}" Handelsregister OR Geschäftsführer`,
          5
        );

        const otherCompanies = results.map((r) => ({
          name: r.title,
          source_url: r.link,
          snippet: r.snippet,
        }));

        await supabase.from("shareholder_backgrounds").upsert(
          {
            company_id: companyId,
            shareholder_name: name,
            other_companies: otherCompanies,
            enrichment_status: "is_company",
            enriched_at: new Date().toISOString(),
          },
          { onConflict: "company_id,shareholder_name" }
        );

        continue;
      }

      // For individual shareholders
      await supabase.from("shareholder_backgrounds").upsert(
        {
          company_id: companyId,
          shareholder_name: name,
          enrichment_status: "enriching",
        },
        { onConflict: "company_id,shareholder_name" }
      );

      try {
        // Search 1: Handelsregister / business roles
        const hrResults = await webSearch(
          `"${name}" Geschäftsführer OR Handelsregister OR Gesellschafter ${city}`,
          5
        );

        const otherCompanies: any[] = [];
        const publicRoles: string[] = [];
        const handelsregisterEntries: any[] = [];

        for (const result of hrResults) {
          // Try to extract company names and roles from snippets
          const snippet = result.snippet.toLowerCase();
          if (
            snippet.includes("geschäftsführer") ||
            snippet.includes("gesellschafter") ||
            snippet.includes("managing director") ||
            snippet.includes("prokurist")
          ) {
            otherCompanies.push({
              name: result.title.split(" - ")[0]?.trim() || result.title,
              source_url: result.link,
              snippet: result.snippet,
            });
          }

          // Check for HRB numbers
          const hrbMatch = result.snippet.match(/HRB\s*(\d+)/i);
          if (hrbMatch) {
            handelsregisterEntries.push({
              hrb_number: `HRB ${hrbMatch[1]}`,
              source: result.link,
              context: result.snippet,
            });
          }
        }

        // Search 2: LinkedIn
        const linkedinResults = await webSearch(
          `site:linkedin.com "${name}" ${city}`,
          3
        );
        const linkedinUrl = linkedinResults[0]?.link || null;

        // Search 3: Xing
        const xingResults = await webSearch(
          `site:xing.com "${name}" ${city}`,
          3
        );
        const xingUrl = xingResults[0]?.link || null;

        // Search 4: Cross-reference within our own database
        const { data: crossRefs } = await supabase
          .from("Hamburg Targets")
          .select("id, company_name")
          .neq("id", companyId)
          .ilike("shareholder_names", `%${name}%`);

        // LLM bio summary (optional)
        let bioSummary = "";
        const allSnippets = hrResults
          .map((r) => `${r.title}: ${r.snippet}`)
          .join("\n");
        if (allSnippets.length > 50) {
          const summary = await summarizeWithLLM(
            `Here are search results about "${name}" who is a shareholder of "${companyName}" in ${city}, Germany:\n\n${allSnippets}`,
            `Summarize what you can learn about this person's business background in 2-3 sentences. 
             Focus on: their roles in companies, industry experience, and any notable information.
             If the information is too sparse, say so briefly. Reply in English, plain text only.`
          );
          bioSummary = summary || "";
        }

        await supabase.from("shareholder_backgrounds").upsert(
          {
            company_id: companyId,
            shareholder_name: name,
            other_companies: otherCompanies,
            handelsregister_entries: handelsregisterEntries,
            linkedin_url: linkedinUrl,
            xing_url: xingUrl,
            public_roles: publicRoles,
            bio_summary: bioSummary || null,
            cross_references: crossRefs || [],
            enrichment_status: "completed",
            enrichment_error: null,
            enriched_at: new Date().toISOString(),
          },
          { onConflict: "company_id,shareholder_name" }
        );
      } catch (err) {
        console.error(`Shareholder "${name}" research failed:`, err);
        await supabase.from("shareholder_backgrounds").upsert(
          {
            company_id: companyId,
            shareholder_name: name,
            enrichment_status: "failed",
            enrichment_error: String(err),
            enriched_at: new Date().toISOString(),
          },
          { onConflict: "company_id,shareholder_name" }
        );
      }
    }
  } catch (err) {
    console.error("Shareholder research failed:", err);
  }
}

// ─── Utilities ───────────────────────────────────────────────
function getShareholderNames(company: Company): string[] {
  if (company.shareholder_details && Array.isArray(company.shareholder_details)) {
    return company.shareholder_details
      .map((d) => d.name)
      .filter(Boolean) as string[];
  }
  return (
    company.shareholder_names
      ?.split(",")
      .map((n) => n.trim())
      .filter(Boolean) || []
  );
}

// ─── Main Handler ────────────────────────────────────────────
Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { company_id, modules = ["website", "media", "shareholders"] } =
      await req.json();

    // Migration mode: add new columns via raw postgres
    if (modules.includes("migrate")) {
      try {
        const dbUrl = Deno.env.get("SUPABASE_DB_URL");
        if (!dbUrl) {
          return new Response(JSON.stringify({ error: "SUPABASE_DB_URL not set" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        // Use the postgres module available in Deno
        const { default: postgres } = await import("https://deno.land/x/postgresjs@v3.4.5/mod.js");
        const sql = postgres(dbUrl);
        await sql`ALTER TABLE company_media_searches ADD COLUMN IF NOT EXISTS media_summary TEXT`;
        await sql`ALTER TABLE company_website_profiles ADD COLUMN IF NOT EXISTS contact_fax TEXT`;
        await sql.end();
        return new Response(JSON.stringify({ migrate: "success", added: "media_summary + contact_fax columns" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ migrate: "failed", error: String(err) }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // Diagnostic mode: test Gemini API
    if (modules.includes("diagnose")) {
      const geminiKey = Deno.env.get("GEMINI_API_KEY");
      const diag: any = {
        gemini_key_set: !!geminiKey,
        gemini_key_length: geminiKey?.length || 0,
        serper_key_set: !!SERPER_KEY,
      };

      if (geminiKey) {
        try {
          const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
          const testRes = await fetch(testUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: "Say hello in one word" }] }],
            }),
          });
          diag.gemini_status = testRes.status;
          const testBody = await testRes.text();
          diag.gemini_response = testBody.substring(0, 500);
        } catch (err) {
          diag.gemini_error = String(err);
        }
      }

      return new Response(
        JSON.stringify(diag, null, 2),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!company_id) {
      return new Response(
        JSON.stringify({ error: "company_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch company data
    const { data: company, error: fetchError } = await supabase
      .from("Hamburg Targets")
      .select("*")
      .eq("id", company_id)
      .single();

    if (fetchError || !company) {
      return new Response(
        JSON.stringify({ error: "Company not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize research status
    await supabase.from("company_research_status").upsert(
      {
        company_id,
        overall_status: "in_progress",
        website_status: modules.includes("website") ? "in_progress" : "not_started",
        media_status: modules.includes("media") ? "in_progress" : "not_started",
        shareholders_status: modules.includes("shareholders") ? "in_progress" : "not_started",
        triggered_at: new Date().toISOString(),
      },
      { onConflict: "company_id" }
    );

    // Run modules (sequentially to manage API rate limits)
    const results: Record<string, string> = {};

    if (modules.includes("website")) {
      await researchWebsite(supabase, company);
      results.website = "completed";
      await supabase
        .from("company_research_status")
        .update({ website_status: "completed" })
        .eq("company_id", company_id);
    }

    if (modules.includes("media")) {
      await researchMedia(supabase, company);
      results.media = "completed";
      await supabase
        .from("company_research_status")
        .update({ media_status: "completed" })
        .eq("company_id", company_id);
    }

    if (modules.includes("shareholders")) {
      await researchShareholders(supabase, company);
      results.shareholders = "completed";
      await supabase
        .from("company_research_status")
        .update({ shareholders_status: "completed" })
        .eq("company_id", company_id);
    }

    // Mark overall as completed
    await supabase
      .from("company_research_status")
      .update({
        overall_status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("company_id", company_id);

    return new Response(
      JSON.stringify({ success: true, company_id, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Research function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
