/* ============================================================
   GENERATIVE STUDIO — mock generation engine
   Bengali and English copy are built from two independent
   template branches driven by the same brief, so English is
   never a translation of the Bengali line or vice versa.
   A real LLM call can replace GENRE_LEXICON + buildCopy without
   changing any route or the frontend contract.
   ============================================================ */

const { CHANNEL_RULES } = require("./validators");

const GENRE_LEXICON = [
  {
    keys: ["thriller", "mystery", "suspense", "crime"],
    bn: "একটা রহস্য শুরু হয় এখান থেকেই।",
    en: "It begins the moment you stop asking questions.",
    ctaEn: "Watch Episode 1", ctaBn: "প্রথম পর্ব দেখুন"
  },
  {
    keys: ["comedy", "funny", "sitcom"],
    bn: "হাসতে হাসতে ভুলে যাবেন সময়ের কথা।",
    en: "The kind of funny that sneaks up on you.",
    ctaEn: "Start laughing", ctaBn: "এখনই দেখুন"
  },
  {
    keys: ["romance", "love"],
    bn: "ভালোবাসা সবসময় সহজ হয় না।",
    en: "Love was never going to be simple.",
    ctaEn: "Watch the story", ctaBn: "গল্পটা দেখুন"
  },
  {
    keys: [],
    bn: "একটা নতুন গল্প শুরু হচ্ছে আজ রাতে।",
    en: "A new story begins tonight.",
    ctaEn: "Watch Now", ctaBn: "এখনই দেখুন"
  }
];

function pickLexicon(brief) {
  const lower = (brief || "").toLowerCase();
  return GENRE_LEXICON.find(g => g.keys.some(k => lower.includes(k))) || GENRE_LEXICON[GENRE_LEXICON.length - 1];
}

function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1).trim() + "…" : str;
}

/**
 * Builds one channel's concept. Each channel gets its own copy
 * length, tone and hashtag convention — not one asset relabeled.
 */
function buildConcept(channel, brief, lexicon) {
  const rules = CHANNEL_RULES[channel];

  if (channel === "Instagram") {
    // Short-form + a slice of the raw brief: an intentionally
    // "live" caption so a long typed brief can genuinely trip
    // the character-limit validator, rather than a scripted demo.
    const copyEn = `${lexicon.en} ${brief.trim()} ${lexicon.ctaEn}.`.trim();
    const copyBn = `${lexicon.bn} আজ রাত ৯টায়। 🔍`;
    return {
      channel, format: rules.format, dims: rules.dims, sizeMb: 4.2,
      copyEn, copyBn, cta: lexicon.ctaEn, hashtags: "#HoichoiThriller #BengaliOTT #রহস্য"
    };
  }

  if (channel === "Facebook") {
    const copyEn = `${lexicon.en} ${truncate(brief.trim(), 120)} ${lexicon.ctaEn}.`.trim();
    const copyBn = `${lexicon.bn} ${lexicon.ctaBn}, আজ রাত ৯টা থেকে।`;
    return {
      channel, format: rules.format, dims: rules.dims, sizeMb: 1.8,
      copyEn, copyBn, cta: "Stream Now", hashtags: "#Hoichoi #BengaliSeries"
    };
  }

  // LinkedIn — English only, professional register, no hashtag-heavy tone
  const copyEn = `Hoichoi's next original: ${truncate(brief.trim(), 160)} Streaming from tonight.`;
  return {
    channel, format: rules.format, dims: rules.dims, sizeMb: 1.1,
    copyEn, copyBn: "", cta: "Read the story behind the series", hashtags: "#OTT #RegionalContent #Hoichoi"
  };
}

function generateConcepts(brief) {
  const lexicon = pickLexicon(brief);
  return ["Instagram", "Facebook", "LinkedIn"].map(ch => buildConcept(ch, brief, lexicon));
}

function fixCopy(post) {
  // "Ask AI to fix" — collapse back to the short hook + CTA so it
  // clears the same limit that just rejected it.
  const rules = CHANNEL_RULES[post.channel];
  const short = `${post.copyEn.split(".")[0]}. ${post.cta}.`;
  post.copyEn = truncate(short, rules.charLimit - 5);
  return post;
}

module.exports = { generateConcepts, fixCopy, pickLexicon };
