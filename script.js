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

  // Green Accent — matches CSS --accent: #00754A
  const ACCENT = '0, 117, 74';

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
// Translations are applied as text nodes, never innerHTML, so a string can
// never inject markup. `**…**` is promoted to <strong> by building a real
// element — that keeps one dictionary key per sentence, which matters because
// EN and TH put the emphasised phrase in different places.
function setText(el, str) {
  el.textContent = '';
  str.split(/\*\*(.+?)\*\*/g).forEach((part, i) => {
    if (!part) return;
    if (i % 2) {
      const strong = document.createElement('strong');
      strong.textContent = part;
      el.appendChild(strong);
    } else {
      el.appendChild(document.createTextNode(part));
    }
  });
}

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
    'hero.tagline':     'Slow-steeped research on how people learn — gamification, AI, and the science of engagement.',
    'about.lede':       'Brewing education just like my daily cold brew: clean, bold, steeped to perfection, and zero bitter aftertaste.',
    'about.p1':         'My 9-to-5 basically makes me the head barista at the Learning Science × AI bar. I roast adaptive learning systems with gamified loops until the balance hits just right—locking learners into the zone before their dopamine and caffeine levels crash.',
    'about.p2':         'My research papers have racked up a casual **141 citations (h-index 6)**, obsessing over everything from challenge mechanics to Game Refinement Theory (yes, measuring flow state with the precision of a 0.1g digital coffee scale).',
    'about.p3':         'Off the clock? Full-on side quests: gaming, binge-watching shows, booking impromptu trips on zero free time, and cafe-hopping for specialty drinks with questionable main-character energy—muscular dark roasts, nerdy oat lattes, chunky cappuccinos, soft-boy matchas, and broody dark cocoas. Honestly, what is my life?!',
    'brew.espresso':    'Espresso',
    'brew.americano':   'Americano',
    'brew.coldbrew':    'Cold Brew',
    'research.empty':   'Pick a field to see what’s brewing.',
    'link.cv.desc':     'The full menu (PDF)',
    'footer.brewed':    'Brewed in Singapore',
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
    'hero.tagline':     'งานวิจัยที่ค่อย ๆ สกัดว่าคนเราเรียนรู้อย่างไร — เกมมิฟิเคชัน AI และศาสตร์ของการมีส่วนร่วม',
    'about.lede':       'ตั้งใจเบลนด์การศึกษาให้คลีนและเข้มแบบ Cold Brew แช่มาอย่างเนียน ดื่มง่าย ไม่มีขมติดคอ',
    'about.p1':         'งานหลักคือยืนเป็นบาริสต้าหน้าบาร์ Learning Science x AI คั่วระบบ Adaptive Learning ผสม Gamification ให้รสชาติมันคลิก ล็อกโฟกัสคนเรียนให้อยู่หมัดก่อนเอนเนอร์จี้จะดีดตก',
    'about.p2':         'มีเปเปอร์ถูก cite ไปเบา ๆ **141 ครั้ง (h-index 6)** วิจัยวนไปทั้งเรื่อง Challenge mechanics ยัน Game refinement theory (คำนวณ Flow state แบบชั่งน้ำหนักเมล็ดกาแฟระดับทศนิยม)',
    'about.p3':         'นอกเวลาทำงานทำไร!?: เล่นเกม ดูหนัง ดูซีรีส์ ผจญภัยไม่หยุดหย่อน จัดทริปเที่ยวทั้งๆที่ไม่มีเวลา แล้วตระเวนตามล่า Specialty Coffee อเมริกาโน่คั่วกล้าม ลาเต้ตี๋แว่น คาปูชิอ้วง มัทฉะยิ้มหวาน โกโก้คมเข้ม อะไรวะเนี่ย!',
    'brew.espresso':    'เอสเปรสโซ',
    'brew.americano':   'อเมริกาโน',
    'brew.coldbrew':    'โคลด์บรูว์',
    'research.empty':   'เลือกสักหัวข้อ แล้วดูว่ากำลังต้มอะไรอยู่',
    'link.cv.desc':     'เมนูฉบับเต็ม (PDF)',
    'footer.brewed':    'ชงที่สิงคโปร์',
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
      if (t !== undefined) setText(el, t);
    });
    btn.textContent = l === 'en' ? 'TH' : 'EN';
    localStorage.setItem('lang', l);
  }

  btn.addEventListener('click', () => applyLang(lang === 'en' ? 'th' : 'en'));
  applyLang(lang);
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
        lastClicked = id;
        setActive(id);
      }
    });
  });

  // Scroll: track which section occupies the top of the viewport.
  // rootMargin '-48px 0px -55% 0px' means a section fires when its
  // top edge enters the top 45% of the viewport (below the tab nav).
  const visible = new Set();
  const BAND = 52;              // tab-nav height + a few px of slack
  let lastClicked = null;

  function pick() {
    if (!visible.size) return;

    const all = [...visible].map(el => ({ el, r: el.getBoundingClientRect() }));

    // At the end of the document the final sections can never reach the
    // reading band — the page simply runs out of scroll. Without this, the
    // last sections are permanently unreachable by the scroll-spy.
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

    const passed = all.filter(o => o.r.top <= BAND);
    const pool   = atBottom ? all : (passed.length ? passed : all);

    // Paired sections sit at the same top, so they always tie. Honour the
    // tab the user actually clicked; otherwise take the leftmost.
    pool.sort((a, b) => b.r.top - a.r.top || a.r.left - b.r.left);
    const tied = pool.filter(o => Math.abs(o.r.top - pool[0].r.top) < 2);
    setActive((tied.find(o => o.el.id === lastClicked) || pool[0]).el.id);
  }

  const scrollObserver = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      });
      pick();
    },
    { rootMargin: '-48px 0px -55% 0px', threshold: 0 }
  );

  sections.forEach(s => scrollObserver.observe(s));

  // The observer stops firing once scrolling bottoms out, so the at-bottom
  // case needs its own (rAF-throttled) trigger.
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; pick(); });
  }, { passive: true });
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
  if (window.matchMedia('(hover: none)').matches) return;

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

// ─── Publication items — staggered entrance ──────────────────────────
//
// Fires when pub-list enters view. Delays each item by 65ms,
// starting at 530ms so items appear just as the section finishes its
// 500ms scroll-reveal fade.
//
(function initPubStagger() {
  const list = document.querySelector('.pub-list');
  if (!list) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const items = list.querySelectorAll('.pub-item');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      items.forEach((item, i) => {
        item.style.animationDelay = `${530 + i * 65}ms`;
        item.classList.add('pub-item--entering');
      });
      obs.unobserve(e.target);
    });
  }, { threshold: 0.1 });

  obs.observe(list);
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
