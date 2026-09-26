/* ============================================================
   ANIMATIONS3D.JS — High-Impact 3D Visual & Audio Layer for Loop
   Theme: OTT Streaming Platform / Content Operating System
   Hackathon: Hoichoi OTT · Media & AI Content Ops
   Hardware-accelerated CSS 3D Transforms + Canvas 3D & WebGL
   ============================================================ */

(function () {
  'use strict';

  // --- Brand Color Palette matching styles.css ---
  const PALETTE = {
    red: '#E4344F',
    gold: '#F0B93B',
    teal: '#3FBFA8',
    ok: '#35C48C',
    bg: '#0E1016',
    stroke: '#2A2F3F'
  };

  // --- Accessibility: prefers-reduced-motion check ---
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isReducedMotion = motionQuery.matches;
  motionQuery.addEventListener('change', (e) => {
    isReducedMotion = e.matches;
  });

  // ============================================================
  // 1. TASTEFUL PROCEDURAL WEB AUDIO SFX (Muted by default)
  // ============================================================
  let audioCtx = null;
  let isSoundEnabled = false;

  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playChime() {
    if (!isSoundEnabled || isReducedMotion) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Cinema release chime: Dual harmonic bell chord (D5 + A5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now);

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.46);
      osc2.stop(now + 0.46);
    } catch (e) {
      // Audio fallback
    }
  }

  function playDiscardTone() {
    if (!isSoundEnabled || isReducedMotion) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Soft muted gate closure tone: Descending minor interval
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(392.00, now);
      osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.28);

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.1, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch (e) {
      // Audio fallback
    }
  }

  function playWhoosh() {
    if (!isSoundEnabled || isReducedMotion) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Aerodynamic content generation sweep
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.35);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(360, now);
      filter.Q.setValueAtTime(2.0, now);

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.14, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.46);
    } catch (e) {
      // Audio fallback
    }
  }

  function initSoundToggle() {
    const soundToggle = document.getElementById('soundToggle');
    if (!soundToggle) return;

    soundToggle.addEventListener('click', () => {
      getAudioContext();
      isSoundEnabled = !isSoundEnabled;
      soundToggle.classList.toggle('is-active', isSoundEnabled);
      soundToggle.setAttribute('aria-pressed', String(isSoundEnabled));

      const label = soundToggle.querySelector('.sound-toggle-label');
      if (label) {
        label.textContent = isSoundEnabled ? 'Audio: Active' : 'Audio: Muted';
      }

      const icon = soundToggle.querySelector('.sound-toggle-icon');
      if (icon) {
        icon.textContent = isSoundEnabled ? '🔈' : '🔇';
      }

      if (isSoundEnabled) {
        playChime();
      }
    });
  }

  // ============================================================
  // 2. OVERVIEW: 3D GYROSCOPE RINGS & DATA PACKETS IN LOOP
  // ============================================================
  function initOverview3D() {
    const loopStage = document.getElementById('loopStage');
    const overviewView = document.getElementById('view-overview');
    if (!loopStage || !overviewView) return;

    if (!overviewView.querySelector('.hero-bokeh-container')) {
      const bokehWrap = document.createElement('div');
      bokehWrap.className = 'hero-bokeh-container';
      bokehWrap.setAttribute('aria-hidden', 'true');
      bokehWrap.innerHTML = `
        <div class="bokeh-orb bokeh-orb--1"></div>
        <div class="bokeh-orb bokeh-orb--2"></div>
        <div class="bokeh-orb bokeh-orb--3"></div>`;
      overviewView.prepend(bokehWrap);
    }

    if (!loopStage.querySelector('.overview-3d-backdrop')) {
      const backdrop = document.createElement('div');
      backdrop.className = 'overview-3d-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      backdrop.innerHTML = `
        <div class="gyro-ring gyro-ring--1"></div>
        <div class="gyro-ring gyro-ring--2"></div>
        <div class="gyro-ring gyro-ring--3"></div>
        <canvas id="overviewParticlesCanvas" width="520" height="520"></canvas>`;
      loopStage.prepend(backdrop);
    }

    const canvas = document.getElementById('overviewParticlesCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const count = 38;
    const particles = [];
    const colors = [PALETTE.red, PALETTE.gold, PALETTE.teal, '#FFF'];

    for (let i = 0; i < count; i++) {
      particles.push({
        theta: (i / count) * Math.PI * 2,
        speed: 0.007 + Math.random() * 0.006,
        radius: 175 + (Math.random() - 0.5) * 32,
        zDepth: (Math.random() - 0.5) * 90,
        tiltAngle: Math.PI * 0.28,
        size: 3.0 + Math.random() * 2.8,
        color: colors[i % colors.length]
      });
    }

    function renderLoopParticles() {
      if (isReducedMotion || !overviewView.classList.contains('is-active')) {
        requestAnimationFrame(renderLoopParticles);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const fov = 420;

      particles.forEach(p => {
        p.theta = (p.theta + p.speed) % (Math.PI * 2);

        const rawX = p.radius * Math.cos(p.theta);
        const rawY = p.radius * Math.sin(p.theta) * Math.cos(p.tiltAngle);
        const rawZ = p.radius * Math.sin(p.theta) * Math.sin(p.tiltAngle) + p.zDepth;

        const scale = fov / (fov + rawZ);
        const px = cx + rawX * scale;
        const py = cy + rawY * scale;

        const alpha = Math.max(0.25, Math.min(0.95, (scale - 0.65) * 0.9));
        const currentSize = Math.max(1.8, p.size * scale);

        ctx.beginPath();
        ctx.arc(px, py, currentSize * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.35;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = alpha * 0.9;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, currentSize, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = alpha;
        ctx.stroke();
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(renderLoopParticles);
    }

    renderLoopParticles();
  }

  // ============================================================
  // 3. GENERATIVE STUDIO: 3D HOLOGRAPHIC TILES & SCANLINES
  // ============================================================
  function initStudio3D() {
    const studioView = document.getElementById('view-studio');
    const generateBtn = document.getElementById('generateBtn');
    if (!studioView || !generateBtn) return;

    if (!studioView.querySelector('.bg-3d-studio')) {
      const studioLayer = document.createElement('div');
      studioLayer.className = 'bg-3d-studio';
      studioLayer.setAttribute('aria-hidden', 'true');
      studioLayer.innerHTML = `
        <div class="assembly-stage" id="assemblyStage">
          <div class="assembly-plane">
            <div class="assembly-scanline"></div>
          </div>
          <div class="assembly-plane">
            <div class="assembly-scanline"></div>
          </div>
          <div class="assembly-plane">
            <div class="assembly-scanline"></div>
          </div>
        </div>`;
      studioView.prepend(studioLayer);
    }

    const planes = studioView.querySelectorAll('.assembly-plane');

    generateBtn.addEventListener('click', () => {
      playWhoosh();

      planes.forEach((plane, i) => {
        setTimeout(() => {
          plane.classList.add('is-assembling');
        }, i * 450);

        setTimeout(() => {
          plane.classList.remove('is-assembling');
        }, 700 + i * 500 + 400);
      });
    });
  }

  // ============================================================
  // 4. APPROVAL GATE: 3D RELEASE SHUTTERS
  // ============================================================
  function initApproval3D() {
    const approvalView = document.getElementById('view-approval');
    const board = document.getElementById('approvalBoard');
    if (!approvalView || !board) return;

    if (!approvalView.querySelector('.bg-3d-approval')) {
      const gateLayer = document.createElement('div');
      gateLayer.className = 'bg-3d-approval';
      gateLayer.setAttribute('aria-hidden', 'true');
      gateLayer.innerHTML = `
        <div class="gate-panel gate-panel--left">
          <div class="gate-rib gate-rib--1"></div>
          <div class="gate-rib gate-rib--2"></div>
          <div class="gate-rib gate-rib--3"></div>
        </div>
        <div class="gate-panel gate-panel--right">
          <div class="gate-rib gate-rib--1"></div>
          <div class="gate-rib gate-rib--2"></div>
          <div class="gate-rib gate-rib--3"></div>
        </div>`;
      approvalView.prepend(gateLayer);
    }

    const gateLayer = approvalView.querySelector('.bg-3d-approval');
    let gateTimer = null;

    board.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      if (action === 'approve') {
        playChime();
        gateLayer.classList.remove('gate-close');
        gateLayer.classList.add('gate-open');

        clearTimeout(gateTimer);
        gateTimer = setTimeout(() => {
          gateLayer.classList.remove('gate-open');
        }, 1600);
      } else if (action === 'discard') {
        playDiscardTone();
        gateLayer.classList.remove('gate-open');
        gateLayer.classList.add('gate-close');

        clearTimeout(gateTimer);
        gateTimer = setTimeout(() => {
          gateLayer.classList.remove('gate-close');
        }, 1400);
      }
    });
  }

  // ============================================================
  // 5. PUBLISHER: 3D TRANSMISSION RADAR & WAVE PULSES
  // ============================================================
  function initPublisher3D() {
    const publisherView = document.getElementById('view-publisher');
    const pipelineTrack = document.getElementById('pipelineTrack');
    if (!publisherView || !pipelineTrack) return;

    if (!pipelineTrack.querySelector('.bg-3d-publisher')) {
      const pubLayer = document.createElement('div');
      pubLayer.className = 'bg-3d-publisher';
      pubLayer.setAttribute('aria-hidden', 'true');
      pubLayer.innerHTML = `
        <div class="publisher-radar">
          <div class="radar-sweep"></div>
          <div class="radar-beacon"></div>
          <div class="radar-ring"></div>
          <div class="radar-ring"></div>
          <div class="radar-ring"></div>
          <div class="radar-ring"></div>
        </div>`;
      pipelineTrack.prepend(pubLayer);
    }
  }

  // ============================================================
  // 6. ANALYTICS: 3D FLOATING HOLOGRAPHIC GRID & MOUSE PARALLAX
  // ============================================================
  function initAnalytics3D() {
    const analyticsView = document.getElementById('view-analytics');
    if (!analyticsView) return;

    if (!analyticsView.querySelector('.bg-3d-analytics')) {
      const gridLayer = document.createElement('div');
      gridLayer.className = 'bg-3d-analytics';
      gridLayer.setAttribute('aria-hidden', 'true');
      gridLayer.innerHTML = `
        <div class="analytics-3d-grid" id="analyticsGrid">
          <div class="analytics-pillar"></div>
          <div class="analytics-pillar"></div>
          <div class="analytics-pillar"></div>
          <div class="analytics-pillar"></div>
        </div>`;
      analyticsView.prepend(gridLayer);
    }

    const grid = document.getElementById('analyticsGrid');
    if (!grid) return;

    let targetRotX = 52;
    let targetRotZ = 12;
    let currentRotX = 52;
    let currentRotZ = 12;

    analyticsView.addEventListener('mousemove', (e) => {
      if (isReducedMotion) return;
      const rect = analyticsView.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width - 0.5;
      const normY = (e.clientY - rect.top) / rect.height - 0.5;

      targetRotX = 52 + normY * 16;
      targetRotZ = 12 - normX * 18;
    });

    analyticsView.addEventListener('mouseleave', () => {
      targetRotX = 52;
      targetRotZ = 12;
    });

    function updateGrid() {
      if (!isReducedMotion && analyticsView.classList.contains('is-active')) {
        currentRotX += (targetRotX - currentRotX) * 0.08;
        currentRotZ += (targetRotZ - currentRotZ) * 0.08;
        grid.style.transform = `rotateX(${currentRotX.toFixed(2)}deg) rotateZ(${currentRotZ.toFixed(2)}deg) translateZ(-50px)`;
      }
      requestAnimationFrame(updateGrid);
    }

    updateGrid();
  }

  // ============================================================
  // 7. WEEKLY REPORT: 3D OTT CINEMA FILM STRIP & AI EVIDENCE CONSTELLATION
  // ============================================================
  function initReport3D() {
    const reportView = document.getElementById('view-report');
    if (!reportView) return;

    if (!reportView.querySelector('.bg-3d-report')) {
      const reportLayer = document.createElement('div');
      reportLayer.className = 'bg-3d-report';
      reportLayer.setAttribute('aria-hidden', 'true');

      // Add Volumetric Cinema Spotlight Beam & 3D Cinema Film Strip Ribbon
      reportLayer.innerHTML = `
        <div class="projector-beam"></div>
        <div class="cinema-film-ribbon">
          <div class="film-frames-conveyor">
            <div class="film-cell"><span class="film-cell-icon">▶</span><span class="film-cell-label">CMP-024 4K</span></div>
            <div class="film-cell"><span class="film-cell-icon">✦</span><span class="film-cell-label">AI INSIGHT</span></div>
            <div class="film-cell"><span class="film-cell-icon">◉</span><span class="film-cell-label">HOICHOI OTT</span></div>
            <div class="film-cell"><span class="film-cell-icon">ılı</span><span class="film-cell-label">BENGALI NATIVE</span></div>
            <div class="film-cell"><span class="film-cell-icon">★</span><span class="film-cell-label">9.2% ENGAGE</span></div>
            <div class="film-cell"><span class="film-cell-icon">◎</span><span class="film-cell-label">LOOP CMP-025</span></div>
            <div class="film-cell"><span class="film-cell-icon">▶</span><span class="film-cell-label">CMP-024 4K</span></div>
            <div class="film-cell"><span class="film-cell-icon">✦</span><span class="film-cell-label">AI INSIGHT</span></div>
            <div class="film-cell"><span class="film-cell-icon">◉</span><span class="film-cell-label">HOICHOI OTT</span></div>
            <div class="film-cell"><span class="film-cell-icon">ılı</span><span class="film-cell-label">BENGALI NATIVE</span></div>
            <div class="film-cell"><span class="film-cell-icon">★</span><span class="film-cell-label">9.2% ENGAGE</span></div>
            <div class="film-cell"><span class="film-cell-icon">◎</span><span class="film-cell-label">LOOP CMP-025</span></div>
          </div>
        </div>
        <canvas id="reportConstellationCanvas" width="980" height="520"></canvas>`;
      reportView.prepend(reportLayer);
    }

    const canvas = document.getElementById('reportConstellationCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 3D Nodes representing linked OTT Evidence & Insights
    const count = 28;
    const nodes = [];
    const colors = [PALETTE.gold, PALETTE.teal, PALETTE.red, '#FFFFFF'];
    const nodeIcons = ['▶', '✦', 'ılı', '◉', '●'];

    for (let i = 0; i < count; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * 720,
        y: (Math.random() - 0.5) * 340,
        z: (Math.random() - 0.5) * 380,
        radius: 3.2 + Math.random() * 3.0,
        color: colors[i % colors.length],
        icon: nodeIcons[i % nodeIcons.length],
        pulse: Math.random() * Math.PI * 2
      });
    }

    let angleY = 0;
    let angleX = 0;
    let tiltX = 0;
    let tiltY = 0;

    reportView.addEventListener('mousemove', (e) => {
      if (isReducedMotion) return;
      const rect = reportView.getBoundingClientRect();
      tiltY = ((e.clientX - rect.left) / rect.width - 0.5) * 0.4;
      tiltX = ((e.clientY - rect.top) / rect.height - 0.5) * 0.3;
    });

    function renderConstellation() {
      if (isReducedMotion || !reportView.classList.contains('is-active')) {
        requestAnimationFrame(renderConstellation);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      angleY += 0.0014 + tiltY * 0.035;
      angleX += 0.0007 + tiltX * 0.03;

      const fov = 480;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Project 3D nodes
      const projected = nodes.map(n => {
        n.pulse += 0.04;

        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const x1 = n.x * cosY + n.z * sinY;
        const z1 = -n.x * sinY + n.z * cosY;

        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const y2 = n.y * cosX - z1 * sinX;
        const z2 = n.y * sinX + z1 * cosX;

        const scale = fov / (fov + z2 + 400);
        return {
          px: cx + x1 * scale,
          py: cy + y2 * scale,
          scale: scale,
          color: n.color,
          radius: n.radius * scale * (1 + Math.sin(n.pulse) * 0.15),
          icon: n.icon
        };
      });

      // Draw glowing laser connection links
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].px - projected[j].px;
          const dy = projected[i].py - projected[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 165) {
            const alpha = (1 - dist / 165) * 0.42;
            ctx.beginPath();
            ctx.moveTo(projected[i].px, projected[i].py);
            ctx.lineTo(projected[j].px, projected[j].py);
            ctx.strokeStyle = projected[i].color;
            ctx.lineWidth = 1.3;
            ctx.globalAlpha = alpha;
            ctx.stroke();
          }
        }
      }

      // Draw bright OTT nodes
      projected.forEach(p => {
        // Glowing halo
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.radius * 2.6, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.18, p.scale * 0.35);
        ctx.fill();

        // Node center disc
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = Math.max(0.45, p.scale * 0.9);
        ctx.fill();

        // Node border
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.6;
        ctx.globalAlpha = 0.95;
        ctx.stroke();

        // Subtle media icon indicator on key nodes
        if (p.scale > 0.95 && p.radius > 3.2) {
          ctx.font = '8px monospace';
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.85;
          ctx.fillText(p.icon, p.px + p.radius + 3, p.py + 3);
        }
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(renderConstellation);
    }

    renderConstellation();
  }

  // ============================================================
  // INITIALIZATION ON DOM READY
  // ============================================================
  function init() {
    initSoundToggle();
    initOverview3D();
    initStudio3D();
    initApproval3D();
    initPublisher3D();
    initAnalytics3D();
    initReport3D();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
