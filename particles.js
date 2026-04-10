(function () {
  'use strict';

  // ── Canvas setup ────────────────────────────────────────────────────────────
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles;
  const mouse = { x: -9999, y: -9999 };
  const MAX_PARTICLES = 160;
  const CONNECT_DIST  = 120;
  const MOUSE_RADIUS  = 130;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function mkParticle() {
    const violet = Math.random() < 0.2;
    return {
      x:     rand(0, W),
      y:     rand(0, H),
      vx:    rand(-0.25, 0.25),
      vy:    rand(-0.25, 0.25),
      r:     rand(0.6, 2.2),
      color: violet ? '159,0,255' : '0,255,135',
      op:    rand(0.35, 0.85),
    };
  }

  function init() {
    resize();
    const n = Math.min(Math.floor(W * H / 7500), MAX_PARTICLES);
    particles = Array.from({ length: n }, mkParticle);
  }

  // ── Draw ────────────────────────────────────────────────────────────────────
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Constellation lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < CONNECT_DIST * CONNECT_DIST) {
          const a = (1 - Math.sqrt(d2) / CONNECT_DIST) * 0.22;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,255,135,${a})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.op})`;
      ctx.fill();
    });
  }

  // ── Update ──────────────────────────────────────────────────────────────────
  function update() {
    particles.forEach(p => {
      // Mouse repulsion
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < MOUSE_RADIUS * MOUSE_RADIUS) {
        const d = Math.sqrt(d2);
        const f = (MOUSE_RADIUS - d) / MOUSE_RADIUS * 0.4;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }

      // Damping + speed cap
      p.vx *= 0.97;
      p.vy *= 0.97;
      const spd = Math.hypot(p.vx, p.vy);
      if (spd > 1.2) { p.vx = p.vx / spd * 1.2; p.vy = p.vy / spd * 1.2; }

      // Wrap edges
      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
    });
  }

  function loop() {
    draw();
    update();
    requestAnimationFrame(loop);
  }

  // ── Scroll reveal ────────────────────────────────────────────────────────────
  function initScrollReveal() {
    const els = document.querySelectorAll('.fade-in');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(el => io.observe(el));
  }

  // ── Events ───────────────────────────────────────────────────────────────────
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('resize', init);

  init();
  loop();
  initScrollReveal();
})();
