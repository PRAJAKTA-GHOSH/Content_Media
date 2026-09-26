/* ============================================================
   PLATFORM CONSTRAINTS
   The one rule the whole gate exists to enforce: a post that
   violates a real platform limit must be REJECTED here, never
   silently marked valid.
   ============================================================ */

const CHANNEL_RULES = {
  Instagram: { charLimit: 220, dims: "1080x1920", maxSizeMb: 8, format: "Reel · 9:16" },
  Facebook:  { charLimit: 300, dims: "1200x1200", maxSizeMb: 5, format: "Image post · 1:1" },
  LinkedIn:  { charLimit: 300, dims: "1200x627",  maxSizeMb: 5, format: "Article card · 1.91:1" }
};

function validatePost(post) {
  const rules = CHANNEL_RULES[post.channel];
  if (!rules) throw new Error(`No validation rules for channel "${post.channel}"`);

  const captionLen = (post.copyEn || "").length;
  const checks = [
    { label: "Caption length", ok: captionLen <= rules.charLimit, detail: `${captionLen}/${rules.charLimit} chars` },
    { label: "Creative dimensions", ok: post.dims === rules.dims, detail: post.dims },
    { label: "File size", ok: post.sizeMb <= rules.maxSizeMb, detail: `${post.sizeMb}MB/${rules.maxSizeMb}MB` },
    { label: "CTA present", ok: !!post.cta, detail: post.cta || "missing" }
  ];

  const failed = checks.filter(c => !c.ok);
  return {
    valid: failed.length === 0,
    checks,
    reason: failed.length ? failed.map(f => f.label).join(", ") + " out of range" : null
  };
}

module.exports = { CHANNEL_RULES, validatePost };
