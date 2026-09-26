/* ============================================================
   IN-MEMORY STORE
   Swap this module for a real database later — every route
   only ever calls the functions exported here, never touches
   the arrays directly.
   ============================================================ */

const db = {
  campaigns: [
    {
      id: "CMP-024",
      objective: "Promote Bengali thriller series launch",
      brief: "Announce the new Bengali psychological thriller series. Lead with intrigue, not plot summary. Drive first-episode views.",
      status: "LEARNED",
      createdAt: "2026-09-12T09:00:00.000Z"
    },
    {
      id: "CMP-025",
      objective: "Promote Bengali thriller series — Week 2 momentum",
      brief: "",
      status: "DRAFT",
      createdAt: new Date().toISOString()
    }
  ],

  // status machine: GENERATED -> PENDING_REVIEW | REJECTED -> APPROVED | DISCARDED -> SCHEDULED -> PUBLISHED
  posts: [
    {
      id: "POST-104", campaignId: "CMP-024", channel: "Instagram", lang: "both",
      format: "Reel · 9:16", dims: "1080x1920", sizeMb: 4.2,
      copyBn: "একটা রহস্য শুরু হয় এখান থেকেই। প্রথম পর্ব আজ রাত ৯টায়। 🔍",
      copyEn: "It begins the moment you stop asking questions. Episode 1, tonight 9 PM.",
      cta: "Watch Episode 1", hashtags: "#HoichoiThriller #BengaliOTT #রহস্য",
      status: "PUBLISHED", generatedAt: "2026-09-12T09:02:00.000Z", approvedAt: "2026-09-12T09:08:00.000Z",
      scheduledFor: "2026-09-12T21:00:00.000Z", publishedAt: "2026-09-12T21:00:00.000Z",
      metrics: { reach: 42000, engagementPct: 9.2, ctaClicks: 1420 }
    },
    {
      id: "POST-105", campaignId: "CMP-024", channel: "Facebook", lang: "both",
      format: "Image post · 1:1", dims: "1200x1200", sizeMb: 1.8,
      copyBn: "সত্যি কি সবসময় আরাম দেয়? নতুন বাংলা থ্রিলার সিরিজ, আজ রাত ৯টা থেকে।",
      copyEn: "Does the truth always feel safe? A new Bengali thriller series, tonight from 9 PM.",
      cta: "Stream Now", hashtags: "#Hoichoi #BengaliSeries",
      status: "PUBLISHED", generatedAt: "2026-09-12T09:02:00.000Z", approvedAt: "2026-09-12T09:07:00.000Z",
      scheduledFor: "2026-09-12T21:00:00.000Z", publishedAt: "2026-09-12T21:00:00.000Z",
      metrics: { reach: 31000, engagementPct: 6.1, ctaClicks: 870 }
    },
    {
      id: "POST-106", campaignId: "CMP-024", channel: "LinkedIn", lang: "en",
      format: "Article card · 1.91:1", dims: "1200x627", sizeMb: 1.1,
      copyBn: "",
      copyEn: "Hoichoi's next original explores how one lie reshapes a family across three generations. Streaming from tonight.",
      cta: "Read the story behind the series", hashtags: "#OTT #RegionalContent #Hoichoi",
      status: "PUBLISHED", generatedAt: "2026-09-12T09:02:00.000Z", approvedAt: "2026-09-12T09:10:00.000Z",
      scheduledFor: "2026-09-12T21:00:00.000Z", publishedAt: "2026-09-12T21:00:00.000Z",
      metrics: { reach: 12000, engagementPct: 3.4, ctaClicks: 210 }
    }
  ],

  insights: [
    {
      id: "INS-014", campaignId: "CMP-024",
      finding: "Bengali short-form openings that lead with a question outperformed longer descriptive openings.",
      evidence: ["POST-104", "POST-105"],
      recommendation: "Lead the next brief's hook with a question, in Bengali, under 12 words.",
      metricDelta: "+3.1 pts engagement vs. descriptive openings"
    },
    {
      id: "INS-015", campaignId: "CMP-024",
      finding: "Instagram short-form video reach was 3.5x LinkedIn's for the same campaign objective.",
      evidence: ["POST-104", "POST-106"],
      recommendation: "Prioritize Instagram Reels as the lead format for awareness-stage briefs.",
      metricDelta: "42K vs 12K reach, same campaign"
    }
  ],

  _seq: 107
};

function nextPostId() {
  db._seq += 1;
  return `POST-${db._seq}`;
}

function getCampaigns() { return db.campaigns; }
function getCampaign(id) { return db.campaigns.find(c => c.id === id); }
function addCampaign(campaign) { db.campaigns.push(campaign); return campaign; }
function updateCampaign(id, patch) {
  const c = getCampaign(id);
  if (!c) return null;
  Object.assign(c, patch);
  return c;
}

function getPostsByCampaign(campaignId) { return db.posts.filter(p => p.campaignId === campaignId); }
function getPost(id) { return db.posts.find(p => p.id === id); }
function addPost(post) { db.posts.push(post); return post; }

function getInsightsByCampaign(campaignId) { return db.insights.filter(i => i.campaignId === campaignId); }
function addInsight(insight) { db.insights.push(insight); return insight; }

module.exports = {
  db, nextPostId,
  getCampaigns, getCampaign, addCampaign, updateCampaign,
  getPostsByCampaign, getPost, addPost,
  getInsightsByCampaign, addInsight
};
