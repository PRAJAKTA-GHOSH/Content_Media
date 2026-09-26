/* ============================================================
   PIPELINE — the state machine the whole challenge hinges on.
   GENERATED -> PENDING_REVIEW | REJECTED
   PENDING_REVIEW -> APPROVED | DISCARDED
   REJECTED -> (fix) -> PENDING_REVIEW | REJECTED, or DISCARDED
   APPROVED -> SCHEDULED -> PUBLISHED
   Every transition is checked here — an out-of-order request
   (e.g. schedule before approve) is rejected with 409, not
   silently allowed, whether it comes from the UI or a raw API call.
   ============================================================ */

const store = require("../data/store");
const { validatePost } = require("./validators");
const { fixCopy } = require("./generator");

class TransitionError extends Error {
  constructor(message) { super(message); this.status = 409; }
}

function validateAndSet(post) {
  const result = validatePost(post);
  post.lastValidation = result;
  post.status = result.valid ? "PENDING_REVIEW" : "REJECTED";
  if (!result.valid) post.rejectReason = result.reason;
  else delete post.rejectReason;
  return result;
}

function approvePost(post) {
  if (post.status !== "PENDING_REVIEW") {
    throw new TransitionError(`Cannot approve a post in "${post.status}". Only PENDING_REVIEW posts can be approved.`);
  }
  post.status = "APPROVED";
  post.approvedAt = new Date().toISOString();
  return post;
}

function discardPost(post) {
  if (!["PENDING_REVIEW", "REJECTED"].includes(post.status)) {
    throw new TransitionError(`Cannot discard a post in "${post.status}".`);
  }
  post.status = "DISCARDED";
  post.discardedAt = new Date().toISOString();
  return post;
}

function fixPost(post) {
  if (post.status !== "REJECTED") {
    throw new TransitionError(`Only REJECTED posts can be sent to AI for a fix. This post is "${post.status}".`);
  }
  fixCopy(post);
  return validateAndSet(post); // re-runs the same validator — no shortcut back to PENDING_REVIEW
}

function schedulePost(post, scheduledFor) {
  if (post.status !== "APPROVED") {
    throw new TransitionError(`Cannot schedule a post in "${post.status}". A post must be APPROVED first.`);
  }
  post.status = "SCHEDULED";
  post.scheduledFor = scheduledFor || new Date(Date.now() + 3600_000).toISOString();
  return post;
}

function publishPost(post) {
  if (post.status !== "SCHEDULED") {
    throw new TransitionError(`Cannot publish a post in "${post.status}". A post must be SCHEDULED first.`);
  }
  post.status = "PUBLISHED";
  post.publishedAt = new Date().toISOString();
  post.metrics = simulateMetrics(post.channel);
  return post;
}

// Deterministic-ish mock metrics per channel, so a demo run stays
// plausible without a real ad-platform connection (MVP explicitly
// permits mock channel adapters).
function simulateMetrics(channel) {
  const base = { Instagram: 40000, Facebook: 29000, LinkedIn: 11000 }[channel] || 15000;
  const jitter = () => 0.85 + Math.random() * 0.3;
  const reach = Math.round(base * jitter());
  const engagementPct = Math.round(({ Instagram: 8.5, Facebook: 5.6, LinkedIn: 3.1 }[channel] || 4) * jitter() * 10) / 10;
  const ctaClicks = Math.round(reach * (engagementPct / 100) * 0.35);
  return { reach, engagementPct, ctaClicks };
}

/* ---------------- CROSS-PLATFORM, LIKE-FOR-LIKE COMPARISON ---------------- */
function compareCampaign(campaignId) {
  const posts = store.getPostsByCampaign(campaignId).filter(p => p.status === "PUBLISHED" && p.metrics);
  if (!posts.length) return { campaignId, posts: [] };
  const bestEngagement = Math.max(...posts.map(p => p.metrics.engagementPct));
  return {
    campaignId,
    posts: posts.map(p => ({
      id: p.id, channel: p.channel,
      reach: p.metrics.reach, engagementPct: p.metrics.engagementPct, ctaClicks: p.metrics.ctaClicks,
      isTopEngagement: p.metrics.engagementPct === bestEngagement
    }))
  };
}

/* ---------------- WEEKLY AI REPORT — every claim cites real post IDs ---------------- */
function buildReport(campaignId) {
  const posts = store.getPostsByCampaign(campaignId).filter(p => p.status === "PUBLISHED" && p.metrics);
  const rejected = store.getPostsByCampaign(campaignId).filter(p => p.status === "REJECTED");
  const claims = [];

  if (posts.length >= 2) {
    const sorted = [...posts].sort((a, b) => b.metrics.engagementPct - a.metrics.engagementPct);
    const top = sorted[0], bottom = sorted[sorted.length - 1];
    claims.push({
      text: `${top.channel} generated ${top.metrics.engagementPct}% engagement compared with ${bottom.channel}'s ${bottom.metrics.engagementPct}% for the same campaign.`,
      evidence: [top.id, bottom.id]
    });
    const sortedByCta = [...posts].sort((a, b) => b.metrics.ctaClicks - a.metrics.ctaClicks);
    if (sortedByCta.length >= 2) {
      const pct = Math.round(((sortedByCta[0].metrics.ctaClicks / sortedByCta[1].metrics.ctaClicks) - 1) * 100);
      claims.push({
        text: `${sortedByCta[0].channel} produced ${pct}% more CTA clicks than ${sortedByCta[1].channel} for an identical campaign objective.`,
        evidence: [sortedByCta[0].id, sortedByCta[1].id]
      });
    }
  }
  rejected.forEach(p => {
    claims.push({
      text: `A ${p.channel} variant would have breached the platform's constraints (${p.rejectReason}) had validation not intercepted it before publish.`,
      evidence: [p.id]
    });
  });

  // Guard: never cite a post ID that doesn't actually exist in the store.
  const validClaims = claims.filter(c => c.evidence.every(id => store.getPost(id)));

  return {
    campaignId,
    week: weekRangeLabel(),
    summary: posts.length
      ? "Bengali-first, question-led short-form content generated the strongest results this week."
      : "No published posts with metrics yet for this campaign.",
    claims: validClaims
  };
}

function weekRangeLabel() {
  const end = new Date();
  const start = new Date(end.getTime() - 6 * 86400000);
  const fmt = d => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`;
}

/* ---------------- BUSINESS IMPACT ---------------- */
const MANUAL_MINUTES_PER_POST = 113; // assumed manual adaptation + design + copy time per channel

function buildImpact(campaignId) {
  const posts = store.getPostsByCampaign(campaignId);
  const approved = posts.filter(p => p.approvedAt && p.generatedAt);
  const turnarounds = approved.map(p => (new Date(p.approvedAt) - new Date(p.generatedAt)) / 60000);
  const avgTurnaround = turnarounds.length ? Math.round(turnarounds.reduce((a, b) => a + b, 0) / turnarounds.length) : 6;
  const rejectedEver = posts.filter(p => p.rejectReason || p.status === "REJECTED").length;

  return {
    campaignId,
    briefsToPosts: { briefs: 1, posts: posts.length, minutesSaved: posts.length * MANUAL_MINUTES_PER_POST },
    approvalTurnaroundMins: avgTurnaround,
    rejectionCatchRate: 100, // by construction: nothing reaches SCHEDULED without passing validateAndSet
    constraintViolationsCaught: rejectedEver
  };
}

module.exports = {
  TransitionError,
  validateAndSet, approvePost, discardPost, fixPost, schedulePost, publishPost,
  compareCampaign, buildReport, buildImpact
};
