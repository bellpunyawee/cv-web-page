'use strict';

// ─── Footer year ────────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ─── Icosahedron wireframe ───────────────────────────────────────
//
// An icosahedron has 12 vertices arranged as three mutually
// perpendicular golden rectangles. The golden ratio phi = (1+√5)/2
// appears naturally in its geometry — fitting for a portfolio on
// Entertainment Computing.
//
(function initPolyhedron() {
  const canvas = document.getElementById('polyhedron');
  if (!canvas) return;

  const ctx  = canvas.getContext('2d');
  const W    = canvas.width;
  const H    = canvas.height;
  const cx   = W / 2;
  const cy   = H / 2;
  const S    = W * 0.37;

  const phi = (1 + Math.sqrt(5)) / 2;

  const raw = [
    [ 0,  1,  phi], [ 0, -1,  phi], [ 0,  1, -phi], [ 0, -1, -phi],
    [ 1,  phi,  0], [-1,  phi,  0], [ 1, -phi,  0], [-1, -phi,  0],
    [ phi,  0,  1], [-phi,  0,  1], [ phi,  0, -1], [-phi,  0, -1]
  ];

  const norm  = Math.sqrt(1 + phi * phi);
  const verts = raw.map(([x, y, z]) => [x / norm, y / norm, z / norm]);

  const edgeD2 = 4 / (norm * norm);
  const edges  = [];

  for (let i = 0; i < verts.length; i++) {
    for (let j = i + 1; j < verts.length; j++) {
      const dx = verts[i][0] - verts[j][0];
      const dy = verts[i][1] - verts[j][1];
      const dz = verts[i][2] - verts[j][2];
      if (Math.abs(dx * dx + dy * dy + dz * dz - edgeD2) < 0.001) {
        edges.push([i, j]);
      }
    }
  }

  let angle = 0;
  const TILT  = 0.38;
  const SPEED = 0.0032;

  // Warm tan — matches CSS --accent: #C9B59C
  const ACCENT = '201, 181, 156';

  function rotY([x, y, z], a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [x * c + z * s, y, -x * s + z * c];
  }

  function rotX([x, y, z], a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [x, y * c - z * s, y * s + z * c];
  }

  function project([x, y]) {
    return [cx + x * S, cy - y * S];
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const rotated = verts.map(v => rotX(rotY(v, angle), TILT));
    const proj    = rotated.map(project);

    // Painter's algorithm: sort edges back-to-front for depth
    const sorted = edges
      .map(([i, j]) => ({ i, j, z: (rotated[i][2] + rotated[j][2]) * 0.5 }))
      .sort((a, b) => a.z - b.z);

    for (const { i, j, z } of sorted) {
      const alpha = (0.1 + (z + 1) * 0.3).toFixed(2);
      ctx.beginPath();
      ctx.moveTo(...proj[i]);
      ctx.lineTo(...proj[j]);
      ctx.strokeStyle = `rgba(${ACCENT}, ${alpha})`;
      ctx.lineWidth   = 0.8;
      ctx.stroke();
    }

    for (let i = 0; i < rotated.length; i++) {
      const alpha = (0.18 + (rotated[i][2] + 1) * 0.28).toFixed(2);
      ctx.beginPath();
      ctx.arc(...proj[i], 1.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT}, ${alpha})`;
      ctx.fill();
    }

    angle += SPEED;
    requestAnimationFrame(draw);
  }

  draw();
})();

// ─── Thesis cover flip ───────────────────────────────────
(function initCoverFlip() {
  const flipper = document.querySelector('.thesis-cover-flipper');
  if (!flipper) return;

  function toggle() {
    const flipped = flipper.classList.toggle('flipped');
    flipper.setAttribute('aria-pressed', flipped);
  }

  flipper.addEventListener('click', toggle);
  flipper.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
})();

// ─── Theme toggle ────────────────────────────────────────────────
(function initTheme() {
  const root = document.documentElement;
  const btn  = document.querySelector('.theme-toggle');
  if (!btn) return;

  const saved       = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
  }

  applyTheme(saved || (prefersDark ? 'dark' : 'light'));

  btn.addEventListener('click', () => {
    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
})();

// ─── Language switcher ───────────────────────────────────────────
// Values use literal characters (& ampersand, middle dot) so
// textContent can be used safely — no innerHTML needed.
const TRANSLATIONS = {
  en: {
    'tab.about':        'About',
    'tab.education':    'Education',
    'tab.experience':   'Experience',
    'tab.research':     'Research',
    'tab.publications': 'Publications',
    'tab.personality':  'Personality',
    'tab.connect':      'Connect',
    'hero.eyebrow':     'Research Fellow · CHILL · AHLab, NUS',
    'hero.tagline':     'AI & Gamification · Educational Technology · Ph.D. JAIST',
    'section.about':        'About',
    'section.education':    'Education',
    'section.experience':   'Experience',
    'section.research':     'Research',
    'section.publications': 'Publications',
    'section.personality':  'Personality',
    'section.connect':      'Connect',
    'research.ai-learning':   'AI-Driven Adaptive Learning',
    'research.gamification':  'Gamification in Education',
    'research.entertainment': 'Entertainment Computing & Game Informatics',
    'research.edtech':        'AI-powered Educational Technology',
    'link.email':       'Email',
    'link.cv':          'Curriculum Vitae',
    'link.linkedin':    'LinkedIn',
    'link.github':      'GitHub',
    'link.scholar':     'Google Scholar',
    'link.researchgate':'ResearchGate',
    'link.ahlab':       'AHLab Profile',
  },
  th: {
    'tab.about':        'เกี่ยวกับ',
    'tab.education':    'การศึกษา',
    'tab.experience':   'ประสบการณ์',
    'tab.research':     'งานวิจัย',
    'tab.publications': 'ผลงาน',
    'tab.personality':  'บุคลิกภาพ',
    'tab.connect':      'ติดต่อ',
    'hero.eyebrow':     'นักวิจัย · CHILL · AHLab, NUS สิงคโปร์',
    'hero.tagline':     'AI & Gamification · เทคโนโลยีการศึกษา · ปริญญาเอก JAIST',
    'section.about':        'เกี่ยวกับฉัน',
    'section.education':    'การศึกษา',
    'section.experience':   'ประสบการณ์',
    'section.research':     'งานวิจัย',
    'section.publications': 'ผลงาน',
    'section.personality':  'บุคลิกภาพ',
    'section.connect':      'ติดต่อ',
    'research.ai-learning':   'การเรียนรู้แบบปรับตัวด้วย AI',
    'research.gamification':  'การใช้เกมในการศึกษา',
    'research.entertainment': 'การคำนวณเพื่อความบันเทิง & Game Informatics',
    'research.edtech':        'เทคโนโลยีการศึกษาด้วย AI',
    'link.email':       'อีเมล',
    'link.cv':          'ประวัติย่อ (CV)',
    'link.linkedin':    'LinkedIn',
    'link.github':      'GitHub',
    'link.scholar':     'Google Scholar',
    'link.researchgate':'ResearchGate',
    'link.ahlab':       'โปรไฟล์ AHLab',
  }
};

(function initLang() {
  const root = document.documentElement;
  const btn  = document.querySelector('.lang-toggle');
  if (!btn) return;

  let lang = localStorage.getItem('lang') || 'en';

  function applyLang(l) {
    lang = l;
    root.setAttribute('lang', l === 'th' ? 'th' : 'en');
    root.setAttribute('data-lang', l);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const t = TRANSLATIONS[l]?.[key];
      if (t !== undefined) el.textContent = t;
    });
    btn.textContent = l === 'en' ? 'TH' : 'EN';
    localStorage.setItem('lang', l);
  }

  btn.addEventListener('click', () => applyLang(lang === 'en' ? 'th' : 'en'));
  applyLang(lang);
})();

// ─── Scroll reveal ───────────────────────────────────────────────
//
// Sections start invisible (CSS: opacity 0, translateY 16px).
// IntersectionObserver adds .visible when a section enters view,
// triggering the ease-in-out CSS transition.
//
(function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      }
    },
    { threshold: 0.07, rootMargin: '0px 0px -30px 0px' }
  );

  document.querySelectorAll('.section').forEach(s => observer.observe(s));
})();

// ─── Tab navigation ──────────────────────────────────────────────
//
// Tabs:
//   • Click → smooth scroll to section (scroll-margin-top handles offset)
//   • Scroll → active tab follows the section in the upper viewport
//   • Tab bar scrolls the active tab into view on mobile
//
(function initTabs() {
  const tabs     = Array.from(document.querySelectorAll('.tab'));
  const sections = Array.from(document.querySelectorAll('.section[id]'));

  if (!tabs.length || !sections.length) return;

  function setActive(id) {
    tabs.forEach(t => {
      const isActive = t.getAttribute('data-section') === id;
      t.classList.toggle('active', isActive);
      if (isActive) {
        // Scroll active tab into view horizontally on mobile
        t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
  }

  // Click: prevent default, smooth-scroll to section
  tabs.forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      const id = tab.getAttribute('data-section');
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        setActive(id);
      }
    });
  });

  // Scroll: track which section occupies the top of the viewport.
  // rootMargin '-48px 0px -55% 0px' means a section fires when its
  // top edge enters the top 45% of the viewport (below the tab nav).
  const scrollObserver = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) setActive(e.target.id);
      });
    },
    { rootMargin: '-48px 0px -55% 0px', threshold: 0 }
  );

  sections.forEach(s => scrollObserver.observe(s));
})();

// ─── Education timeline — click to reveal degree detail ─────────────
(function initEduTimeline() {
  const timeline = document.querySelector('.edu-timeline');
  const list     = document.querySelector('.edu-list');
  if (!timeline || !list) return;

  const cols  = Array.from(timeline.querySelectorAll('.edu-tl-col'));
  const items = Array.from(list.querySelectorAll('[data-degree]'));

  // Progressive enhancement: hand control to JS
  timeline.classList.add('edu-js');
  list.classList.add('edu-js');

  function activate(key) {
    cols.forEach(c => c.classList.toggle('edu-tl-active', c.dataset.for === key));
    items.forEach(el => el.classList.toggle('edu-visible', el.dataset.degree === key));
  }

  cols.forEach(col => {
    col.addEventListener('click', () => activate(col.dataset.for));
    col.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(col.dataset.for); }
    });
  });

  activate('phd'); // default: show PhD on load
})();

// ─── Hero figure parallax ────────────────────────────────────────────
//
// Translates the icosahedron figure gently toward the cursor (max ±8px).
// Uses lerp (0.08) for a trailing lag. Starts after hero entrance (1s).
//
(function initHeroParallax() {
  const hero   = document.querySelector('.hero-inner');
  const figure = document.querySelector('.hero-figure');
  if (!hero || !figure) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let tx = 0, ty = 0, cx = 0, cy = 0;

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width  - 0.5) * 8;
    ty = ((e.clientY - r.top)  / r.height - 0.5) * 8;
  });
  hero.addEventListener('mouseleave', () => { tx = 0; ty = 0; });

  setTimeout(() => {
    (function tick() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      figure.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
      requestAnimationFrame(tick);
    })();
  }, 1000);
})();

// ─── Research keyword pills — staggered entrance ─────────────────────
(function initKwStagger() {
  const cloud = document.getElementById('kw-cloud');
  if (!cloud) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const pills = cloud.querySelectorAll('.kw-pill');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      pills.forEach((pill, i) => {
        pill.style.animationDelay = `${i * 40}ms`;
        pill.classList.add('kw-pill--entering');
      });
      obs.unobserve(e.target);
    });
  }, { threshold: 0.3 });

  obs.observe(cloud);
})();

// ─── Research keyword cloud ──────────────────────────────────────────
(function initKwCloud() {
  const cloud     = document.getElementById('kw-cloud');
  const descPanel = document.getElementById('kw-desc-panel');
  if (!cloud) return;

  let pinned = null; // null = no field pinned (hover mode active)

  function light(field) {
    cloud.classList.add('has-focus');
    cloud.querySelectorAll('.kw-pill').forEach(el => {
      el.classList.toggle('kw-lit', el.dataset.field === field);
    });
    if (descPanel) {
      descPanel.querySelectorAll('.kw-desc').forEach(d => {
        d.classList.toggle('kw-desc--active', d.dataset.field === field);
      });
    }
  }

  function clear() {
    cloud.classList.remove('has-focus');
    cloud.querySelectorAll('.kw-lit').forEach(el => el.classList.remove('kw-lit'));
    if (descPanel) descPanel.querySelectorAll('.kw-desc--active').forEach(d => d.classList.remove('kw-desc--active'));
  }

  // Click: pin / unpin a field
  cloud.addEventListener('click', e => {
    const btn = e.target.closest('.kw-field');
    if (!btn) return;
    const field = btn.dataset.field;
    if (pinned === field) {
      pinned = null;
      clear();
    } else {
      pinned = field;
      light(field);
    }
  });

  // Hover: preview (only when nothing is pinned)
  cloud.querySelectorAll('.kw-field').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      if (pinned) return;
      light(btn.dataset.field);
    });
    btn.addEventListener('mouseleave', () => {
      if (pinned) return;
      clear();
    });
  });
})();
