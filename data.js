/* ============================================================
   MOCK DATA LAYER
   Stands in for the backend. Every screen reads from here so
   the frontend can be wired to real APIs later without
   touching markup — just swap these fetchers.
   ============================================================ */

const STORE = {

  campaigns: [
    {
      id: "CMP-024",
      objective: "Promote Bengali thriller series launch",
      brief: "Announce the new Bengali psychological thriller series. Lead with intrigue, not plot summary. Drive first-episode views.",
      status: "LEARNED",
      createdAt: "2026-09-12",
    },
    {
      id: "CMP-025",
      objective: "Promote Bengali thriller series — Week 2 momentum",
      brief: "",
      status: "DRAFT",
      createdAt: "2026-09-26",
    }
  ],

  posts: [
    {
      id: "POST-104",
      campaignId: "CMP-024",
      channel: "Instagram",
      lang: "bn",
      status: "PUBLISHED",
      format: "Reel · 9:16",
      copyBn: "একটা রহস্য শুরু হয় এখান থেকেই। প্রথম পর্ব আজ রাত ৯টায়। 🔍",
      copyEn: "It begins the moment you stop asking questions. Episode 1, tonight 9 PM.",
      cta: "Watch Episode 1",
      hashtags: "#HoichoiThriller #BengaliOTT #রহস্য",
      chars: 96,
      charLimit: 220,
      dims: "1080×1920",
      sizeMb: 4.2,
      sizeLimitMb: 8,
      validation: "VALID",
      metrics: { reach: 42000, engagementPct: 9.2, ctaClicks: 1420 }
    },
    {
      id: "POST-105",
      campaignId: "CMP-024",
      channel: "Facebook",
      lang: "bn",
      status: "PUBLISHED",
      format: "Image post · 1:1",
      copyBn: "সত্যি কি সবসময় আরাম দেয়? নতুন বাংলা থ্রিলার সিরিজ, আজ রাত ৯টা থেকে।",
      copyEn: "Does the truth always feel safe? A new Bengali thriller series, tonight from 9 PM.",
      cta: "Stream Now",
      hashtags: "#Hoichoi #BengaliSeries",
      chars: 132,
      charLimit: 300,
      dims: "1200×1200",
      sizeMb: 1.8,
      sizeLimitMb: 5,
      validation: "VALID",
      metrics: { reach: 31000, engagementPct: 6.1, ctaClicks: 870 }
    },
    {
      id: "POST-106",
      campaignId: "CMP-024",
      channel: "LinkedIn",
      lang: "en",
      status: "PUBLISHED",
      format: "Article card · 1.91:1",
      copyBn: "",
      copyEn: "Hoichoi's next original explores how one lie reshapes a family across three generations. Streaming from tonight.",
      cta: "Read the story behind the series",
      hashtags: "#OTT #RegionalContent #Hoichoi",
      chars: 184,
      charLimit: 300,
      dims: "1200×627",
      sizeMb: 1.1,
      sizeLimitMb: 5,
      validation: "VALID",
      metrics: { reach: 12000, engagementPct: 3.4, ctaClicks: 210 }
    },
    {
      id: "POST-107",
      campaignId: "CMP-024",
      channel: "Instagram",
      lang: "en",
      status: "REJECTED",
      format: "Reel · 9:16",
      copyBn: "",
      copyEn: "This week on Hoichoi we are so incredibly excited to finally bring you the story that our entire writers room has been obsessing over for the past eighteen months, a thriller unlike anything the platform has released before, streaming tonight at nine.",
      cta: "Watch Now",
      hashtags: "#Hoichoi",
      chars: 412,
      charLimit: 220,
      dims: "1080×1920",
      sizeMb: 4.0,
      sizeLimitMb: 8,
      validation: "REJECTED",
      rejectReason: "Caption exceeds platform limit by 192 characters.",
      metrics: null
    }
  ],

  insights: [
    {
      id: "INS-014",
      campaignId: "CMP-024",
      finding: "Bengali short-form openings that lead with a question outperformed longer descriptive openings.",
      evidence: ["POST-104", "POST-105"],
      recommendation: "Lead the next brief's hook with a question, in Bengali, under 12 words.",
      metricDelta: "+3.1 pts engagement vs. descriptive openings"
    },
    {
      id: "INS-015",
      campaignId: "CMP-024",
      finding: "Instagram short-form video reach was 3.5x LinkedIn's for the same campaign objective.",
      evidence: ["POST-104", "POST-106"],
      recommendation: "Prioritize Instagram Reels as the lead format for awareness-stage briefs.",
      metricDelta: "42K vs 12K reach, same campaign"
    }
  ],

  report: {
    campaignId: "CMP-024",
    week: "Sep 15 – Sep 21, 2026",
    summary: "Bengali-first, question-led short-form content generated the strongest results this week. LinkedIn served awareness among industry audiences but did not drive comparable CTA volume.",
    claims: [
      { text: "Bengali short-form content generated higher engagement than the same campaign's English long-form post.", evidence: ["POST-104", "POST-106"] },
      { text: "Instagram produced 63% more CTA clicks than Facebook for an identical campaign objective.", evidence: ["POST-104", "POST-105"] },
      { text: "The rejected Instagram variant would have breached the platform's caption limit by 192 characters had validation not intercepted it.", evidence: ["POST-107"] }
    ]
  },

  impact: {
    briefsToPosts: { briefs: 1, posts: 3, minutesSaved: 340 },
    approvalTurnaroundMins: 6,
    rejectionCatchRate: 100
  }
};

function getCampaign(id) {
  return STORE.campaigns.find(c => c.id === id);
}
function getPostsByCampaign(id) {
  return STORE.posts.filter(p => p.campaignId === id);
}
function getPost(id) {
  return STORE.posts.find(p => p.id === id);
}
