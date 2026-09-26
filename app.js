/* ============================================================
   APP.JS — SPA navigation + view rendering + interactions
   Now wired to the live backend instead of local mock STORE.
   ============================================================ */

/* ⚠️ EDIT THIS ONE LINE before deploying: put your Render URL here. */
const API_BASE = "https://YOUR-BACKEND.onrender.com/api";

const CAMPAIGN_ID = "CMP-024";
const LIFECYCLE = ["Brief","Generate","Adapt","Validate","Approve","Schedule","Publish","Analyze","Learn"];

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed: ${path}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

/* ---------------- NAVIGATION ---------------- */
const railItems = document.querySelectorAll(".rail-item");
const views = document.querySelectorAll(".view");

const VIEW_REFRESH = {
  approval: renderApprovalBoard,
  publisher: renderPublisher,
  analytics: renderAnalytics,
  report: renderReport
};

function goTo(viewName) {
  railItems.forEach(b => b.classList.toggle("is-active", b.dataset.view === viewName));
  views.forEach(v => v.classList.toggle("is-active", v.id === `view-${viewName}`));
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (VIEW_REFRESH[viewName]) VIEW_REFRESH[viewName]();
}
railItems.forEach(btn => btn.addEventListener("click", () => goTo(btn.dataset.view)));
document.getElementById("ctaGoStudio").addEventListener("click", () => goTo("studio"));

/* ---------------- OVERVIEW: LIFECYCLE LOOP (purely visual, no data) ---------------- */
function buildLoopStage() {
  const stage = document.getElementById("loopStage");
  const ring = document.createElement("div");
  ring.className = "loop-ring";
  stage.appendChild(ring);

  const core = document.createElement("div");
  core.className = "loop-core";
  core.innerHTML = `<div class="loop-core-label">The campaign<br>lifecycle</div>`;
  stage.appendChild(core);

  const radius = 158;
  const center = 170;
  LIFECYCLE.forEach((label, i) => {
    const angle = (i / LIFECYCLE.length) * Math.PI * 2 - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    const node = document.createElement("div");
    node.className = "loop-node";
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.innerHTML = `<div class="loop-node-dot"></div><span>${label}</span>`;
    stage.appendChild(node);
  });

  const nodeEls = stage.querySelectorAll(".loop-node");
  let idx = 0;
  setInterval(() => {
    nodeEls.forEach(n => n.classList.remove("is-lit"));
    nodeEls[idx].classList.add("is-lit");
    idx = (idx + 1) % nodeEls.length;
  }, 900);
}
buildLoopStage();

/* ---------------- OVERVIEW: IMPACT STRIP (live from backend) ---------------- */
async function fillImpact() {
  try {
    const impact = await api(`/campaigns/${CAMPAIGN_ID}/impact`);
    document.getElementById("impactMinutes").textContent = impact.briefsToPosts.minutesSaved;
    document.getElementById("impactPosts").textContent = impact.briefsToPosts.posts;
    document.getElementById("impactTurnaround").textContent = impact.approvalTurnaroundMins;
    document.getElementById("impactCatch").textContent = impact.rejectionCatchRate + "%";
  } catch (e) {
    console.error("Impact fetch failed", e);
  }
}
fillImpact();

/* ---------------- GENERATIVE STUDIO ---------------- */
const generateBtn = document.getElementById("generateBtn");
const generateBtnLabel = document.getElementById("generateBtnLabel");
const conceptStage = document.getElementById("conceptStage");
const applyInsightBtn = document.getElementById("applyInsightBtn");
const briefInput = document.getElementById("briefInput");

const CHANNEL_ORDER = ["Instagram", "Facebook", "LinkedIn"];

function placeholderStage() {
  conceptStage.innerHTML = `<div class="concept-placeholder">Generated platform concepts will appear here — three genuinely different visuals, captions and CTAs from one brief.</div>`;
}
placeholderStage();

applyInsightBtn.addEventListener("click", async () => {
  try {
    const insights = await api(`/campaigns/${CAMPAIGN_ID}/insights`);
    const target = insights[0];
    if (target) await api(`/campaigns/${CAMPAIGN_ID}/apply-insight`, { method: "POST", body: JSON.stringify({ insightId: target.id }) });
    briefInput.value = "Lead with a Bengali question under 12 words. " + briefInput.value;
    applyInsightBtn.textContent = "Insight applied ✓";
    applyInsightBtn.disabled = true;
  } catch (e) {
    console.error("Apply insight failed", e);
  }
});

generateBtn.addEventListener("click", async () => {
  generateBtn.disabled = true;
  generateBtnLabel.textContent = "Generating…";
  conceptStage.innerHTML = "";

  CHANNEL_ORDER.forEach(() => {
    const card = document.createElement("div");
    card.className = "concept-card";
    card.innerHTML = `
      <div class="concept-card-inner">
        <div class="concept-face concept-face--front"><div class="spinner"></div></div>
        <div class="concept-face concept-face--back"></div>
      </div>`;
    conceptStage.appendChild(card);
  });

  try {
    const posts = await api(`/campaigns/${CAMPAIGN_ID}/generate`, {
      method: "POST",
      body: JSON.stringify({ brief: briefInput.value })
    });

    const cards = conceptStage.querySelectorAll(".concept-card");
    CHANNEL_ORDER.forEach((channel, i) => {
      const post = posts.find(p => p.channel === channel);
      setTimeout(() => {
        const card = cards[i];
        const back = card.querySelector(".concept-face--back");
        back.innerHTML = renderConceptBack(post, channel);
        card.classList.add("is-flipped");
      }, 400 + i * 500);
    });

    setTimeout(() => {
      generateBtn.disabled = false;
      generateBtnLabel.textContent = "Generate three concepts";
    }, 400 + CHANNEL_ORDER.length * 500 + 200);
  } catch (e) {
    conceptStage.innerHTML = `<div class="concept-placeholder">Generation failed: ${e.message}</div>`;
    generateBtn.disabled = false;
    generateBtnLabel.textContent = "Generate three concepts";
  }
});

function renderConceptBack(post, channel) {
  if (!post) return `<p style="font-size:12px;color:var(--text-faint)">No result for ${channel}</p>`;
  const statusNote = post.status === "REJECTED"
    ? `<p style="font-size:11px;color:var(--red);margin-bottom:8px">⚠ Rejected by validator — fix it in the Approval Gate</p>` : "";
  const bnBlock = post.copyBn ? `
    <span class="concept-copy-label">Bengali · native generation</span>
    <p class="concept-copy concept-copy--bn">${post.copyBn}</p>` : "";
  return `
    <span class="concept-channel">${post.channel} · ${post.format}</span>
    <div class="concept-visual">${post.dims}<br>mock creative preview</div>
    ${statusNote}
    ${bnBlock}
    <span class="concept-copy-label">English · native generation</span>
    <p class="concept-copy">${post.copyEn}</p>
    <div class="concept-meta">
      <span class="tag">${post.cta}</span>
      <span class="tag">${(post.hashtags || "").split(" ")[0] || ""}</span>
    </div>`;
}

/* ---------------- APPROVAL GATE ---------------- */
const approvalBoard = document.getElementById("approvalBoard");

async function renderApprovalBoard() {
  try {
    const posts = await api(`/campaigns/${CAMPAIGN_ID}/posts`);
    approvalBoard.innerHTML = "";
    posts.forEach(post => approvalBoard.appendChild(buildApprovalCard(post)));
  } catch (e) {
    approvalBoard.innerHTML = `<p style="color:var(--red)">Could not load posts: ${e.message}</p>`;
  }
}

function buildApprovalCard(post) {
  const card = document.createElement("div");
  card.className = "approval-card";
  card.id = `approval-${post.id}`;

  const pillMap = {
    PENDING_REVIEW: ["status-pill--wait", "Pending review"],
    REJECTED: ["status-pill--no", "Rejected by validator"],
    APPROVED: ["status-pill--ok", "Approved"],
    DISCARDED: ["status-pill--no", "Discarded"],
    SCHEDULED: ["status-pill--ok", "Scheduled"],
    PUBLISHED: ["status-pill--ok", "Published"],
    GENERATED: ["status-pill--wait", "Generated"]
  };
  const [pillClass, pillText] = pillMap[post.status] || ["status-pill--wait", post.status];

  const checks = (post.lastValidation && post.lastValidation.checks) || [];
  const validRows = checks.map(c => `<div class="validation-row ${c.ok ? "" : "is-fail"}"><span class="v-check">${c.label}</span><span>${c.detail}</span></div>`).join("");

  card.innerHTML = `
    <div class="approval-card-head">
      <div>
        <h4>${post.id} · ${post.channel}</h4>
        <span style="font-size:11px;color:var(--text-faint)">${post.format}</span>
      </div>
      <span class="status-pill ${pillClass}">${pillText}</span>
    </div>
    <p class="approval-copy">${post.copyEn}</p>
    <div class="validation-grid">${validRows}</div>
    <div class="approval-actions">${buildApprovalActions(post)}</div>`;

  card.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => handleApprovalAction(post, btn.dataset.action));
  });
  return card;
}

function buildApprovalActions(post) {
  if (post.status === "REJECTED") {
    return `<button class="btn btn--fix" data-action="fix">Ask AI to fix</button>
            <button class="btn btn--discard" data-action="discard">Discard</button>`;
  }
  if (post.status === "PENDING_REVIEW") {
    return `<button class="btn btn--approve" data-action="approve">Approve</button>
            <button class="btn btn--discard" data-action="discard">Discard &amp; regenerate</button>`;
  }
  if (post.status === "APPROVED") return `<span style="font-size:12px;color:var(--ok)">Queued for scheduling →</span>`;
  if (post.status === "SCHEDULED") return `<span style="font-size:12px;color:var(--ok)">Scheduled for publish →</span>`;
  if (post.status === "PUBLISHED") return `<span style="font-size:12px;color:var(--ok)">✓ Live — see Cross-Platform Insights</span>`;
  if (post.status === "DISCARDED") return `<span style="font-size:12px;color:var(--text-faint)">Sent back to Generative Studio</span>`;
  return "";
}

async function handleApprovalAction(post, action) {
  const oldCard = document.getElementById(`approval-${post.id}`);
  try {
    if (action === "approve") {
      await api(`/posts/${post.id}/approve`, { method: "POST" });
      await api(`/posts/${post.id}/schedule`, { method: "POST", body: JSON.stringify({}) });
      await api(`/posts/${post.id}/publish`, { method: "POST" }); // mock adapter — auto-flows once approved
    } else if (action === "discard") {
      await api(`/posts/${post.id}/discard`, { method: "POST" });
    } else if (action === "fix") {
      await api(`/posts/${post.id}/fix`, { method: "POST" });
    }
    const fresh = await api(`/posts/${post.id}`);
    oldCard.classList.add("is-leaving");
    setTimeout(() => oldCard.replaceWith(buildApprovalCard(fresh)), 300);
  } catch (e) {
    console.error("Action failed", e);
    alert(e.body?.error || e.message);
  }
}

/* ---------------- PUBLISHER ---------------- */
async function renderPublisher() {
  const track = document.getElementById("pipelineTrack");
  const list = document.getElementById("publishList");
  track.innerHTML = "";
  list.innerHTML = "";
  try {
    const posts = await api(`/campaigns/${CAMPAIGN_ID}/posts`);
    const published = posts.filter(p => p.status === "PUBLISHED");

    const stages = ["Approved","Scheduled","Publishing","Published","Metrics ingested"];
    stages.forEach((s, i) => {
      const step = document.createElement("div");
      step.className = `track-step ${published.length ? "is-done" : ""}`;
      step.innerHTML = `<div class="track-step-dot">${i + 1}</div><span>${s}</span>`;
      track.appendChild(step);
      if (i < stages.length - 1) {
        const line = document.createElement("div");
        line.className = `track-line ${published.length ? "is-done" : ""}`;
        track.appendChild(line);
      }
    });

    published.forEach(post => {
      const row = document.createElement("div");
      row.className = "publish-row";
      row.innerHTML = `
        <strong>${post.id}</strong>
        <span>${post.channel} · ${post.format} — via mock channel adapter</span>
        <span style="color:var(--ok)">● Published</span>
        <span style="color:var(--text-dim)">${new Date(post.publishedAt).toLocaleString()}</span>`;
      list.appendChild(row);
    });
  } catch (e) {
    list.innerHTML = `<p style="color:var(--red)">Could not load publisher data: ${e.message}</p>`;
  }
}

/* ---------------- ANALYTICS ---------------- */
async function renderAnalytics() {
  const table = document.getElementById("compareTable");
  const cardsWrap = document.getElementById("insightCards");
  try {
    const [compare, insights] = await Promise.all([
      api(`/campaigns/${CAMPAIGN_ID}/compare`),
      api(`/campaigns/${CAMPAIGN_ID}/insights`)
    ]);

    const posts = compare.posts;
    table.innerHTML = posts.length ? `
      <thead><tr><th>Campaign ${CAMPAIGN_ID}</th>${posts.map(p => `<th>${p.channel}</th>`).join("")}</tr></thead>
      <tbody>
        <tr><td>Post</td>${posts.map(p => `<td><button class="post-id-link" data-post="${p.id}">${p.id}</button></td>`).join("")}</tr>
        <tr><td>Reach</td>${posts.map(p => `<td>${p.reach.toLocaleString()}</td>`).join("")}</tr>
        <tr><td>Engagement</td>${posts.map(p => `<td class="${p.isTopEngagement ? "metric-lead" : ""}">${p.engagementPct}%</td>`).join("")}</tr>
        <tr><td>CTA clicks</td>${posts.map(p => `<td>${p.ctaClicks.toLocaleString()}</td>`).join("")}</tr>
      </tbody>` : `<tbody><tr><td>No published posts with metrics yet.</td></tr></tbody>`;
    table.querySelectorAll(".post-id-link").forEach(btn => btn.addEventListener("click", () => openPostModal(btn.dataset.post)));

    cardsWrap.innerHTML = insights.map(ins => `
      <div class="insight-card">
        <p class="insight-card-finding">${ins.finding}</p>
        <span class="insight-card-delta">${ins.metricDelta}</span>
        <p class="insight-card-rec">Next brief: ${ins.recommendation}</p>
        <div class="insight-evidence">
          ${ins.evidence.map(id => `<button class="post-id-link" data-post="${id}">${id}</button>`).join("")}
        </div>
      </div>`).join("");
    cardsWrap.querySelectorAll(".post-id-link").forEach(btn => btn.addEventListener("click", () => openPostModal(btn.dataset.post)));
  } catch (e) {
    table.innerHTML = `<tbody><tr><td style="color:var(--red)">Could not load analytics: ${e.message}</td></tr></tbody>`;
  }
}

/* ---------------- WEEKLY REPORT ---------------- */
async function renderReport() {
  const claimsEl = document.getElementById("reportClaims");
  try {
    const report = await api(`/campaigns/${CAMPAIGN_ID}/report`);
    document.getElementById("reportWeek").textContent = report.week;
    document.getElementById("reportSummary").textContent = report.summary;
    claimsEl.innerHTML = report.claims.map(c => `
      <li>${c.text}
        <span class="claim-evidence">Evidence: ${c.evidence.map(id => `<button class="post-id-link" data-post="${id}">${id}</button>`).join(" · ")}</span>
      </li>`).join("") || "<li>No evidence-backed claims yet — publish some posts first.</li>";
    claimsEl.querySelectorAll(".post-id-link").forEach(btn => btn.addEventListener("click", () => openPostModal(btn.dataset.post)));
  } catch (e) {
    claimsEl.innerHTML = `<li style="color:var(--red)">Could not load report: ${e.message}</li>`;
  }
}

/* ---------------- POST EVIDENCE MODAL ---------------- */
const postModal = document.getElementById("postModal");
const modalBody = document.getElementById("modalBody");
document.getElementById("modalClose").addEventListener("click", () => postModal.classList.remove("is-open"));
postModal.addEventListener("click", e => { if (e.target === postModal) postModal.classList.remove("is-open"); });

async function openPostModal(postId) {
  try {
    const post = await api(`/posts/${postId}`);
    const metricsBlock = post.metrics ? `
      <div class="modal-metrics">
        <div class="modal-metric"><strong>${(post.metrics.reach / 1000).toFixed(0)}K</strong><span>Reach</span></div>
        <div class="modal-metric"><strong>${post.metrics.engagementPct}%</strong><span>Engagement</span></div>
        <div class="modal-metric"><strong>${post.metrics.ctaClicks}</strong><span>CTA clicks</span></div>
      </div>` : `<p style="color:var(--red);font-size:12.5px;margin-top:12px">Rejected before publish: ${post.rejectReason || "not yet published"}</p>`;

    modalBody.innerHTML = `
      <h3>${post.id} · ${post.channel}</h3>
      <div class="modal-meta">
        <span class="tag">${post.format}</span>
        <span class="tag">${post.copyBn ? "Bengali native" : "English native"}</span>
        <span class="tag">${post.status}</span>
      </div>
      <p style="font-size:13px;color:var(--text-dim)">${post.copyEn}</p>
      ${metricsBlock}`;
    postModal.classList.add("is-open");
  } catch (e) {
    console.error("Post fetch failed", e);
  }
}

/* ---------------- INITIAL LOAD ---------------- */
renderApprovalBoard();
