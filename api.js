const express = require("express");
const router = express.Router();

const store = require("../data/store");
const { generateConcepts } = require("../services/generator");
const pipeline = require("../services/pipeline");

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
function notFound(res, what) { return res.status(404).json({ error: `${what} not found` }); }

/* ---------------- HEALTH ---------------- */
router.get("/health", (req, res) => res.json({ ok: true, service: "loop-backend", time: new Date().toISOString() }));

/* ---------------- CAMPAIGNS ---------------- */
router.get("/campaigns", (req, res) => res.json(store.getCampaigns()));

router.get("/campaigns/:id", (req, res) => {
  const c = store.getCampaign(req.params.id);
  if (!c) return notFound(res, "Campaign");
  res.json(c);
});

router.post("/campaigns", (req, res) => {
  const { objective, brief } = req.body || {};
  if (!objective) return res.status(400).json({ error: "objective is required" });
  const id = `CMP-${String(Math.floor(Math.random() * 900) + 100)}`;
  const campaign = { id, objective, brief: brief || "", status: "DRAFT", createdAt: new Date().toISOString() };
  store.addCampaign(campaign);
  res.status(201).json(campaign);
});

// Campaign Memory: fold a stored insight's recommendation into the brief
router.post("/campaigns/:id/apply-insight", (req, res) => {
  const campaign = store.getCampaign(req.params.id);
  if (!campaign) return notFound(res, "Campaign");
  const { insightId } = req.body || {};
  const insight = store.getInsightsByCampaign(campaign.id).find(i => i.id === insightId)
    || store.db.insights.find(i => i.id === insightId);
  if (!insight) return notFound(res, "Insight");
  campaign.brief = `${insight.recommendation} ${campaign.brief || ""}`.trim();
  res.json(campaign);
});

/* ---------------- GENERATIVE STUDIO ---------------- */
router.post("/campaigns/:id/generate", (req, res) => {
  const campaign = store.getCampaign(req.params.id);
  if (!campaign) return notFound(res, "Campaign");
  const brief = (req.body && req.body.brief) || campaign.brief;
  if (!brief) return res.status(400).json({ error: "A brief is required before generating concepts" });

  campaign.brief = brief;
  campaign.status = "GENERATING";

  const concepts = generateConcepts(brief);
  const createdPosts = concepts.map(concept => {
    const post = {
      id: store.nextPostId(),
      campaignId: campaign.id,
      ...concept,
      status: "GENERATED",
      generatedAt: new Date().toISOString()
    };
    pipeline.validateAndSet(post); // runs immediately — nothing sits "generated but unchecked"
    store.addPost(post);
    return post;
  });

  campaign.status = "PENDING_REVIEW";
  res.status(201).json(createdPosts);
});

router.get("/campaigns/:id/posts", (req, res) => {
  if (!store.getCampaign(req.params.id)) return notFound(res, "Campaign");
  res.json(store.getPostsByCampaign(req.params.id));
});

/* ---------------- POSTS / APPROVAL GATE ---------------- */
router.get("/posts/:id", (req, res) => {
  const post = store.getPost(req.params.id);
  if (!post) return notFound(res, "Post");
  res.json(post);
});

function transitionRoute(action, fn) {
  router.post(`/posts/:id/${action}`, (req, res) => {
    const post = store.getPost(req.params.id);
    if (!post) return notFound(res, "Post");
    try {
      const result = fn(post, req.body || {});
      res.json(result || post);
    } catch (err) {
      if (err instanceof pipeline.TransitionError) return res.status(409).json({ error: err.message, status: post.status });
      throw err;
    }
  });
}

transitionRoute("approve", (post) => pipeline.approvePost(post));
transitionRoute("discard", (post) => pipeline.discardPost(post));
transitionRoute("fix", (post) => pipeline.fixPost(post) && post);
transitionRoute("schedule", (post, body) => pipeline.schedulePost(post, body.scheduledFor));
transitionRoute("publish", (post) => pipeline.publishPost(post));

/* ---------------- ANALYTICS / INSIGHTS ---------------- */
router.get("/campaigns/:id/compare", (req, res) => {
  if (!store.getCampaign(req.params.id)) return notFound(res, "Campaign");
  res.json(pipeline.compareCampaign(req.params.id));
});

router.get("/campaigns/:id/insights", (req, res) => {
  if (!store.getCampaign(req.params.id)) return notFound(res, "Campaign");
  res.json(store.getInsightsByCampaign(req.params.id));
});

router.get("/campaigns/:id/report", (req, res) => {
  if (!store.getCampaign(req.params.id)) return notFound(res, "Campaign");
  res.json(pipeline.buildReport(req.params.id));
});

router.get("/campaigns/:id/impact", (req, res) => {
  if (!store.getCampaign(req.params.id)) return notFound(res, "Campaign");
  res.json(pipeline.buildImpact(req.params.id));
});

/* ---------------- PIPELINE / LIFECYCLE SNAPSHOT (for the Publisher view) ---------------- */
router.get("/campaigns/:id/lifecycle", (req, res) => {
  if (!store.getCampaign(req.params.id)) return notFound(res, "Campaign");
  const posts = store.getPostsByCampaign(req.params.id);
  const counts = posts.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {});
  res.json({ campaignId: req.params.id, counts, posts });
});

module.exports = router;
