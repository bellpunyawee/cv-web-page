'use strict';
const preferences = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* Session-only preference. */ } }
};
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
function allowsMotion() {
  const state = document.documentElement.dataset.motion;
  return state ? state === 'running' : !motionQuery.matches;
}

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
  const control = document.querySelector('.thesis-flip-control');
  const label = document.querySelector('.thesis-face-label');
  const imageLink = document.querySelector('.thesis-image-link');
  flipper.disabled = false;
  control.disabled = false;

  function toggle() {
    const flipped = flipper.classList.toggle('flipped');
    flipper.setAttribute('aria-pressed', flipped);
    control.setAttribute('aria-pressed', flipped);
    const key = flipped ? 'shelf.back' : 'shelf.front';
    label.dataset.i18n = key;
    setText(label, TRANSLATIONS[document.documentElement.lang][key]);
    imageLink.href = flipped ? 'ver1b.png' : 'ver1.png';
  }

  flipper.addEventListener('click', toggle);
  control.addEventListener('click', toggle);
})();

// ─── Theme toggle ────────────────────────────────────────────────
(function initTheme() {
  const root = document.documentElement;
  const btn  = document.querySelector('.theme-toggle');
  if (!btn) return;

  const saved       = preferences.get('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    preferences.set('theme', t);
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
    "motion.pause": "Pause animations",
    "motion.play": "Play animations",
    "motion.reduced": "Play animations — currently reduced by your device setting",
    "motion.on": "Motion on",
    "motion.off": "Motion off",
    "shelf.kicker": "From my bookshelf",
    "shelf.title": "Motion in Mind",
    "shelf.brief": "How challenge and question design shape learning. My doctoral research at JAIST.",
    "shelf.flip": "Flip the cover",
    "shelf.front": "Front cover",
    "shelf.back": "Research map",
    "shelf.read": "Read thesis ↗",
    "shelf.enlarge": "View cover full size ↗",
    "cloud.label": "Research areas — choose a field to explore",
    "cloud.hint": "Choose a field. Follow the connected ideas.",
    "cloud.reset": "Show all connections",
    "cloud.tag.0": "Challenge-Based",
    "cloud.tag.1": "Game Refinement",
    "cloud.tag.2": "Machine Learning",
    "cloud.tag.3": "Player Experience",
    "cloud.tag.4": "Personalization",
    "cloud.tag.5": "Micro-learning",
    "cloud.tag.6": "Engagement",
    "cloud.tag.7": "Adaptive Quiz",
    "cloud.tag.8": "Human-AI Interaction",
    "cloud.tag.9": "Kahoot",
    "cloud.tag.10": "Mathematical Models",
    "cloud.tag.11": "Knowledge Recommender",
    "cloud.tag.12": "Learning Science",
    "cloud.tag.13": "Game Informatics",
    "cloud.tag.14": "LLM",
    "cloud.tag.15": "Adult Education",
    "cloud.tag.16": "Game-Based Learning",
    "cloud.tag.17": "Continuing Education",
    "cloud.tag.18": "Entertainment Value",
    "cloud.tag.19": "Lifestyle Integration",
    "feed.button": "Feed me cold brew",
    "feed.cup": "cup served",
    "feed.cups": "cups served",
    "feed.browser": "by you, in this browser",
    "feed.session": "by you, this visit",
    "feed.note.0": "Please feed me. Great ideas run on cold brew.",
    "feed.note.1": "Ahh, that's the good stuff. Thank you!",
    "feed.note.2": "One sip closer to my next idea.",
    "feed.note.3": "You bring the brew. I'll bring the curiosity.",
    "feed.note.5": "Five cups! You're officially my favourite barista.",
    "feed.note.10": "Ten cups. This tiny café has a regular!",
    "feed.note.25": "Twenty-five! I think we need a bigger coffee table.",
    "poster.research": "A curious mind.",
    "poster.research.desc": "AI, learning & play",
    "poster.papers": "Ideas, in print.",
    "poster.about": "The real Bell.",
    "poster.degree": "Ph.D.",
    "chapter.choose": "Choose a chapter",
    "chapter.tap.short": "Tap Bell",
    "chapter.research.ai": "Learning that adapts to each learner, with quizzes and personalised feedback.",
    "chapter.research.notes": "Research notes",
    "chapter.research.game": "Using challenge and play to make classroom quizzes more engaging.",
    "chapter.research.entertainment": "Exploring what makes games enjoyable through game refinement theory.",
    "chapter.research.edtech": "Bringing AI-powered micro-learning into everyday life and work.",
    "chapter.research.detail.0": "Developing adaptive quiz systems and personalised learning experiences that respond to individual learners in real time — combining machine learning with insights from educational psychology to improve outcomes at scale.",
    "chapter.research.detail.1": "Examining how challenge-based gamification mechanics can transform classroom quizzing into engaging, rewarding experiences. Published research demonstrates significant gains in student engagement and knowledge retention.",
    "chapter.research.detail.2": "Applying game refinement theory and signal-processing models to measure and optimise the entertainment value of games — linking player experience to mathematical properties of game structure and design.",
    "chapter.research.detail.3": "Conducting and leading a strategic research-and-translation project — developing an AI-powered lifestyle-integrated micro-learning app for continuing education that meets adult learners in the flow of life and work.",
    "chapter.experience.detail.0": "Developing AI and LLM-based adaptive learning solutions for Continuing Education & Training (CET) courses, integrating advanced research practices into educational technology.",
    "chapter.experience.detail.1": "Led \"Improving Adaptive Learning for Professional Upskilling\" (funded by SkillsFuture Singapore / WDARF). Built Knowledge Unit Recommender, Adaptive Quiz, and LLM-based Personalised Feedback systems deployed on LMS.",
    "chapter.experience.detail.2": "Educational training for deep learning and reinforcement learning using MATLAB and Simulink. Organised seminars and webinars at JAIST to share MATLAB knowledge across academic communities.",
    "chapter.experience.detail.3": "Research on Gamification Design for Creative Processes; contributed to ongoing projects including COVID-19 game design studies.",
    "chapter.experience.detail.4": "Supported research and laboratory activities; Teaching Assistant for the Game Informatics course — student support, exam scoring, and LMS management.",
    "chapter.personality.detail.0": "Driven, ambitious, and deeply adaptable. Goal-oriented and invested in excellence and meaningful impact — motivated by achievement and the desire to inspire others through demonstrated success.",
    "chapter.personality.detail.1": "Charismatic and empathetic leader with a rich inner world — equally driven by inspiring others and understanding the world on a deeper, principled level. A natural bridge between vision and people.",
    "chapter.tap": "Tap Bell for a thought",
    "chapter.about.note": "A little work, a little wander.",
    "chapter.about.reply": "There’s always a side quest brewing.",
    "chapter.about.intro": "The person behind the papers.",
    "chapter.education.note": "Pick a stop along the way.",
    "chapter.education.reply": "Good questions take time to steep.",
    "chapter.education.intro": "From the first shot to a deeper brew.",
    "chapter.experience.note": "Every role adds a new flavour.",
    "chapter.experience.reply": "A little more of what went into the brew.",
    "chapter.experience.intro": "Where curiosity becomes practice.",
    "chapter.research.note": "Choose an ingredient to explore.",
    "chapter.research.reply": "Different ingredients. Connected questions.",
    "chapter.research.intro": "Four ingredients. One curious mind.",
    "chapter.publications.note": "Pick a paper for the finer details.",
    "chapter.publications.reply": "The full reading list is on Scholar.",
    "chapter.publications.intro": "Ideas, brewed into papers.",
    "chapter.personality.note": "Two ways to get to know me.",
    "chapter.personality.reply": "A blend of ambition and empathy.",
    "chapter.personality.intro": "A little of my personal blend.",
    "chapter.connect.note": "Research question or coffee chat?",
    "chapter.connect.reply": "Pull up a chair. Let’s talk.",
    "chapter.connect.intro": "Good conversations start here.",
    "chapter.about.contact": "Let’s connect",
    "chapter.about.summary": "Learning science at work. Games, little adventures, and café discoveries after hours.",
    "chapter.about.work": "In the lab",
    "chapter.about.life": "After hours",
    "chapter.about.blend": "Explore my personal blend",
    "chapter.thesis": "Open my doctoral thesis",
    "chapter.research.papers": "See the published work",
    "chapter.scholar": "View all on Google Scholar",
    "chapter.copy": "Copy email address",
    "chapter.profiles": "More places to find me",
    "chapter.copied": "Copied. Let’s talk!",
    "chapter.copy.fail": "Please copy: punyawee@ahlab.org",
    "cafe.brand": "Bell's little corner",
    "cafe.hello": "Say hello",
    "cafe.greeting": "Hi, I'm Bell.",
    "cafe.headline": "Always brewing something.",
    "cafe.name": "Punyawee Anunpattana",
    "cafe.role": "Research Fellow · AHLab, NUS · Singapore",
    "cafe.lede": "A curious mind exploring how we learn, through AI, play, and a good cup of coffee.",
    "cafe.explore": "Explore my research",
    "cafe.tap": "Coffee break? Tap Bell.",
    "cafe.note.0": "Pull up a chair. Curious minds welcome.",
    "cafe.note.1": "Cold brew in hand. New ideas on my mind.",
    "cafe.note.2": "My favourite blend? Learning science + AI.",
    "cafe.note.3": "Off duty: games, little adventures, and café hopping.",
    "cafe.work": "Fresh from the lab",
    "cafe.work.desc": "Selected publications",
    "cafe.journey": "From bean to brew",
    "cafe.journey.desc": "Education & experience",
    "cafe.beyond": "Beyond the lab",
    "cafe.beyond.desc": "The person behind the papers",
    "cafe.back": "Back to the coffee table",
    "cafe.menu": "Explore Bell's story",
    "cafe.topics": "Portfolio topics",
    "cafe.skip": "Skip to main content",
    "cafe.theme": "Toggle dark mode",
    "cafe.language": "Switch to Thai",
    "cafe.cv": "Request CV by email",
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
    'link.cv.desc':     'Request the full CV by email',
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
    "motion.pause": "หยุดแอนิเมชัน",
    "motion.play": "เล่นแอนิเมชัน",
    "motion.reduced": "เปิดแอนิเมชัน — ขณะนี้ลดการเคลื่อนไหวตามการตั้งค่าอุปกรณ์",
    "motion.on": "เปิด motion",
    "motion.off": "ปิด motion",
    "shelf.kicker": "จากชั้นหนังสือของผม",
    "shelf.title": "Motion in Mind",
    "shelf.brief": "ความท้าทายและการออกแบบคำถาม ช่วยให้เราเรียนรู้อย่างไร — งานปริญญาเอก JAIST",
    "shelf.flip": "พลิกปกหนังสือ",
    "shelf.front": "ปกหน้า",
    "shelf.back": "แผนภาพงานวิจัย",
    "shelf.read": "อ่านวิทยานิพนธ์ ↗",
    "shelf.enlarge": "ดูภาพปกขนาดเต็ม ↗",
    "cloud.label": "หัวข้องานวิจัย เลือกเพื่อสำรวจแนวคิดที่เชื่อมโยงกัน",
    "cloud.hint": "เลือกหัวข้อ แล้วตามไปดูแนวคิดที่เชื่อมโยงกัน",
    "cloud.reset": "ดูทุกความเชื่อมโยง",
    "cloud.tag.0": "ความท้าทายเป็นฐาน",
    "cloud.tag.1": "Game Refinement",
    "cloud.tag.2": "การเรียนรู้ของเครื่อง",
    "cloud.tag.3": "ประสบการณ์ผู้เล่น",
    "cloud.tag.4": "ปรับให้เหมาะกับบุคคล",
    "cloud.tag.5": "การเรียนรู้ทีละน้อย",
    "cloud.tag.6": "การมีส่วนร่วม",
    "cloud.tag.7": "แบบทดสอบปรับตัวได้",
    "cloud.tag.8": "ปฏิสัมพันธ์มนุษย์–AI",
    "cloud.tag.9": "Kahoot",
    "cloud.tag.10": "แบบจำลองคณิตศาสตร์",
    "cloud.tag.11": "ระบบแนะนำความรู้",
    "cloud.tag.12": "ศาสตร์การเรียนรู้",
    "cloud.tag.13": "สารสนเทศศาสตร์เกม",
    "cloud.tag.14": "LLM",
    "cloud.tag.15": "การศึกษาผู้ใหญ่",
    "cloud.tag.16": "การเรียนรู้ผ่านเกม",
    "cloud.tag.17": "การศึกษาต่อเนื่อง",
    "cloud.tag.18": "คุณค่าความบันเทิง",
    "cloud.tag.19": "ผสานกับชีวิตประจำวัน",
    "feed.button": "เติมโคลด์บรูว์ให้เบลล์",
    "feed.cup": "แก้วที่เสิร์ฟแล้ว",
    "feed.cups": "แก้วที่เสิร์ฟแล้ว",
    "feed.browser": "จากคุณ ในเบราว์เซอร์นี้",
    "feed.session": "จากคุณ ในการเข้าชมครั้งนี้",
    "feed.note.0": "เติมกาแฟให้หน่อยครับ ไอเดียดี ๆ ต้องมีโคลด์บรูว์",
    "feed.note.1": "อ้า… แก้วนี้ใช่เลย ขอบคุณครับ!",
    "feed.note.2": "อีกหนึ่งจิบ ใกล้ไอเดียใหม่อีกนิด",
    "feed.note.3": "คุณเติมกาแฟ ผมเติมความอยากรู้",
    "feed.note.5": "ห้าแก้วแล้ว! ยกให้เป็นบาริสต้าคนโปรดเลย",
    "feed.note.10": "สิบแก้วแล้ว คาเฟ่เล็ก ๆ นี้มีขาประจำแล้วครับ!",
    "feed.note.25": "ยี่สิบห้าแก้ว! สงสัยต้องหาโต๊ะกาแฟใหญ่กว่านี้",
    "poster.research": "เริ่มที่ความสงสัย",
    "poster.research.desc": "AI การเรียนรู้ และการเล่น",
    "poster.papers": "ไอเดียบนหน้ากระดาษ",
    "poster.about": "ตัวจริงของเบล",
    "poster.degree": "Ph.D.",
    "chapter.choose": "เลือกเรื่องที่อยากอ่าน",
    "chapter.tap.short": "แตะเบล",
    "chapter.research.ai": "การเรียนรู้ที่ปรับให้เหมาะกับแต่ละคน ผ่านแบบทดสอบและคำแนะนำเฉพาะบุคคล",
    "chapter.research.notes": "อ่านเบื้องหลังงานวิจัย",
    "chapter.research.game": "ใช้ความท้าทายและการเล่น ให้แบบทดสอบในห้องเรียนน่าสนุกและมีส่วนร่วมมากขึ้น",
    "chapter.research.entertainment": "ค้นหาว่าอะไรทำให้เกมสนุก ผ่านทฤษฎี Game Refinement",
    "chapter.research.edtech": "นำการเรียนรู้สั้น ๆ ที่ขับเคลื่อนด้วย AI มาอยู่ในชีวิตและการทำงานประจำวัน",
    "chapter.research.detail.0": "พัฒนาระบบแบบทดสอบที่ปรับตามผู้เรียนและประสบการณ์เรียนรู้เฉพาะบุคคลแบบเรียลไทม์ โดยผสานแมชชีนเลิร์นนิงกับความเข้าใจจากจิตวิทยาการศึกษา เพื่อยกระดับผลลัพธ์การเรียนรู้ในวงกว้าง",
    "chapter.research.detail.1": "ศึกษาว่ากลไกเกมที่ใช้ความท้าทายเปลี่ยนการทำแบบทดสอบในห้องเรียนให้มีส่วนร่วมและรู้สึกคุ้มค่าได้อย่างไร งานวิจัยที่ตีพิมพ์แสดงผลด้านการมีส่วนร่วมและการจดจำความรู้",
    "chapter.research.detail.2": "ประยุกต์ทฤษฎี Game Refinement และแบบจำลองการประมวลผลสัญญาณเพื่อวัดและพัฒนาความสนุกของเกม โดยเชื่อมประสบการณ์ผู้เล่นเข้ากับคุณสมบัติทางคณิตศาสตร์ของโครงสร้างและการออกแบบเกม",
    "chapter.research.detail.3": "ทำและนำโครงการวิจัยสู่การใช้งานจริง โดยพัฒนาแอปไมโครเลิร์นนิงที่ใช้ AI และผสานกับวิถีชีวิต ให้ผู้ใหญ่เรียนรู้ต่อเนื่องได้ระหว่างการใช้ชีวิตและทำงาน",
    "chapter.experience.detail.0": "พัฒนาโซลูชันการเรียนรู้แบบปรับตัวด้วย AI และ LLM สำหรับหลักสูตร Continuing Education & Training (CET) โดยนำแนวทางวิจัยมาประยุกต์ใช้กับเทคโนโลยีการศึกษา",
    "chapter.experience.detail.1": "นำโครงการ Improving Adaptive Learning for Professional Upskilling ซึ่งได้รับทุนจาก SkillsFuture Singapore / WDARF พัฒนาระบบแนะนำหน่วยความรู้ แบบทดสอบปรับตามผู้เรียน และคำแนะนำเฉพาะบุคคลด้วย LLM เพื่อใช้งานบน LMS",
    "chapter.experience.detail.2": "จัดอบรมด้าน Deep Learning และ Reinforcement Learning ด้วย MATLAB และ Simulink พร้อมจัดสัมมนาและเว็บบินาร์ที่ JAIST เพื่อแบ่งปันความรู้กับชุมชนวิชาการ",
    "chapter.experience.detail.3": "วิจัยการออกแบบ Gamification เพื่อกระบวนการสร้างสรรค์ และร่วมโครงการวิจัยอื่น รวมถึงการศึกษาออกแบบเกมเกี่ยวกับ COVID-19",
    "chapter.experience.detail.4": "สนับสนุนงานวิจัยและกิจกรรมในห้องปฏิบัติการ เป็นผู้ช่วยสอนวิชา Game Informatics ดูแลผู้เรียน ตรวจข้อสอบ และจัดการระบบ LMS",
    "chapter.personality.detail.0": "มุ่งมั่น ทะเยอทะยาน และปรับตัวได้ดี ให้ความสำคัญกับเป้าหมาย คุณภาพ และผลลัพธ์ที่มีความหมาย พร้อมส่งแรงบันดาลใจผ่านสิ่งที่ลงมือทำสำเร็จ",
    "chapter.personality.detail.1": "ชอบเชื่อมโยงผู้คนด้วยความเข้าอกเข้าใจ และมีโลกภายในที่ลึกซึ้ง สนใจทั้งการสร้างแรงบันดาลใจและการเข้าใจโลกอย่างมีหลักการ เชื่อมภาพอนาคตเข้ากับผู้คน",
    "chapter.tap": "แตะเบลเพื่ออ่านเกร็ดสั้น ๆ",
    "chapter.about.note": "เรื่องงานบ้าง เรื่องเที่ยวบ้าง",
    "chapter.about.reply": "มีเรื่องนอกตำราให้ลองเสมอ",
    "chapter.about.intro": "รู้จักคนเบื้องหลังงานวิจัย",
    "chapter.education.note": "ลองเลือกสักช่วงของการเดินทาง",
    "chapter.education.reply": "คำถามดี ๆ ต้องให้เวลาค่อย ๆ สกัด",
    "chapter.education.intro": "จากช็อตแรก สู่รสชาติที่ลึกขึ้น",
    "chapter.experience.note": "ทุกบทบาทเติมรสชาติใหม่",
    "chapter.experience.reply": "เบื้องหลังแก้วนี้มีอะไรอีกนิด",
    "chapter.experience.intro": "เมื่อความสงสัยได้ลงมือทำจริง",
    "chapter.research.note": "เลือกส่วนผสมที่อยากรู้จัก",
    "chapter.research.reply": "ต่างส่วนผสม แต่คำถามเชื่อมถึงกัน",
    "chapter.research.intro": "สี่ส่วนผสม จากความอยากรู้อยากเห็น",
    "chapter.publications.note": "เลือกสักเรื่อง แล้วอ่านรายละเอียดต่อ",
    "chapter.publications.reply": "ตามอ่านต่อได้ที่ Google Scholar",
    "chapter.publications.intro": "ไอเดียที่ค่อย ๆ ชงออกมาเป็นงานวิจัย",
    "chapter.personality.note": "อีกสองมุมให้ได้รู้จักกัน",
    "chapter.personality.reply": "ผสมความมุ่งมั่นกับความเข้าใจผู้คน",
    "chapter.personality.intro": "ส่วนผสมเล็ก ๆ ที่เป็นตัวผม",
    "chapter.connect.note": "คุยเรื่องวิจัย หรือพักจิบกาแฟดี",
    "chapter.connect.reply": "เลื่อนเก้าอี้มานั่ง แล้วคุยกันครับ",
    "chapter.connect.intro": "บทสนทนาดี ๆ เริ่มตรงนี้",
    "chapter.about.contact": "มาทำความรู้จักกัน",
    "chapter.about.summary": "ในแล็บค้นหาวิธีเรียนรู้ นอกแล็บสนุกกับเกม การเดินทาง และการค้นพบคาเฟ่ใหม่ ๆ",
    "chapter.about.work": "เรื่องในแล็บ",
    "chapter.about.life": "นอกเวลางาน",
    "chapter.about.blend": "รู้จักส่วนผสมที่เป็นผม",
    "chapter.thesis": "เปิดอ่านวิทยานิพนธ์ปริญญาเอก",
    "chapter.research.papers": "ดูผลงานวิจัยที่ตีพิมพ์",
    "chapter.scholar": "ดูผลงานทั้งหมดบน Google Scholar",
    "chapter.copy": "คัดลอกอีเมล",
    "chapter.profiles": "ช่องทางอื่น ๆ",
    "chapter.copied": "คัดลอกแล้ว ไว้คุยกันครับ",
    "chapter.copy.fail": "คัดลอกที่อยู่นี้ได้เลย: punyawee@ahlab.org",
    "cafe.brand": "มุมเล็ก ๆ ของ Bell",
    "cafe.hello": "ทักทายกัน",
    "cafe.greeting": "สวัสดีครับ ผมเบล",
    "cafe.headline": "มีเรื่องให้ชงเสมอ",
    "cafe.name": "Punyawee Anunpattana",
    "cafe.role": "นักวิจัย · AHLab, NUS · สิงคโปร์",
    "cafe.lede": "ชอบค้นหาว่าคนเราเรียนรู้กันอย่างไร ผ่าน AI การเล่น และกาแฟดี ๆ สักแก้ว",
    "cafe.explore": "สำรวจงานวิจัย",
    "cafe.tap": "พักจิบกาแฟ? ลองแตะเบล",
    "cafe.note.0": "นั่งก่อนครับ มีเรื่องให้คุยอีกเยอะ",
    "cafe.note.1": "มือหนึ่งถือโคลด์บรูว์ ในหัวมีไอเดียใหม่",
    "cafe.note.2": "เบลนด์ที่ชอบ? ศาสตร์การเรียนรู้ + AI",
    "cafe.note.3": "นอกแล็บ: เล่นเกม ออกเที่ยว และตามหาคาเฟ่",
    "cafe.work": "ชงสดจากแล็บ",
    "cafe.work.desc": "ผลงานวิจัยที่คัดมา",
    "cafe.journey": "จากเมล็ดสู่แก้ว",
    "cafe.journey.desc": "การศึกษาและประสบการณ์",
    "cafe.beyond": "นอกเวลางาน",
    "cafe.beyond.desc": "รู้จักคนเบื้องหลังงานวิจัย",
    "cafe.back": "กลับมาที่โต๊ะกาแฟ",
    "cafe.menu": "สำรวจเรื่องราวของเบล",
    "cafe.topics": "หัวข้อในพอร์ตโฟลิโอ",
    "cafe.skip": "ข้ามไปยังเนื้อหา",
    "cafe.theme": "สลับธีมสว่างและมืด",
    "cafe.language": "เปลี่ยนเป็นภาษาอังกฤษ",
    "cafe.cv": "ขอ CV ทางอีเมล",
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
    'link.cv.desc':     'ขอ CV ฉบับเต็มทางอีเมล',
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

  let lang = preferences.get('lang') === 'th' ? 'th' : 'en';

  function applyLang(l) {
    lang = l;
    root.setAttribute('lang', l === 'th' ? 'th' : 'en');
    root.setAttribute('data-lang', l);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const t = TRANSLATIONS[l]?.[key];
      if (t !== undefined) setText(el, t);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const label = TRANSLATIONS[l]?.[el.dataset.i18nAria];
      if (label) el.setAttribute('aria-label', label);
    });
    btn.textContent = l === 'en' ? 'TH' : 'EN';
    preferences.set('lang', l);
  }

  btn.addEventListener('click', () => applyLang(lang === 'en' ? 'th' : 'en'));
  applyLang(lang);
})();

// Ambient motion is optional and pauses when the page is not visible.
(function initMotionControl() {
  const button = document.querySelector('.motion-toggle');
  const label = button.querySelector('.motion-state');
  const saved = preferences.get('coffee-motion');
  let choice = ['running', 'paused'].includes(saved) ? saved : null;
  function render() {
    const off = !allowsMotion();
    const key = off ? (!choice && motionQuery.matches ? 'motion.reduced' : 'motion.play') : 'motion.pause';
    const text = TRANSLATIONS[document.documentElement.lang][key];
    button.dataset.i18nAria = key;
    button.setAttribute('aria-label', text);
    button.title = text;
    label.dataset.i18n = off ? 'motion.off' : 'motion.on';
    setText(label, TRANSLATIONS[document.documentElement.lang][label.dataset.i18n]);
  }
  function apply() {
    // Follow the device by default; a deliberate local choice takes precedence.
    const off = choice === 'paused' || (choice !== 'running' && motionQuery.matches);
    document.documentElement.dataset.motion = off ? 'paused' : 'running';
    render();
    document.dispatchEvent(new Event('motionchange'));
  }
  button.hidden = false;
  button.addEventListener('click', () => {
    choice = allowsMotion() ? 'paused' : 'running';
    preferences.set('coffee-motion', choice);
    apply();
  });
  motionQuery.addEventListener('change', apply);
  document.querySelector('.lang-toggle').addEventListener('click', render);
  document.addEventListener('visibilitychange', () => {
    document.documentElement.dataset.pageHidden = String(document.hidden);
  });
  apply();
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
    cols.forEach(c => {
      c.classList.toggle('edu-tl-active', c.dataset.for === key);
      c.setAttribute('aria-pressed', String(c.dataset.for === key));
    });
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
  const cloud = document.getElementById('kw-cloud');
  const panel = document.getElementById('kw-desc-panel');
  if (!cloud || !panel) return;
  const buttons = [...cloud.querySelectorAll('.kw-field')];
  const reset = document.querySelector('.cloud-reset');
  let selected = null;
  let reactions = [];
  function choose(field) {
    selected = field;
    cloud.classList.toggle('has-focus', Boolean(field));
    cloud.querySelectorAll('.kw-pill').forEach(pill => pill.classList.toggle('kw-lit', pill.dataset.field === field));
    buttons.forEach(button => {
      const active = button.dataset.field === field;
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('aria-controls', 'kw-desc-panel');
    });
    reset.hidden = !field;
    panel.querySelector('.kw-desc-empty').hidden = Boolean(field);
    panel.querySelectorAll('.kw-desc').forEach(description => description.classList.toggle('kw-desc--active', description.dataset.field === field));
    reactions.forEach(animation => animation.cancel());
    reactions = [];
    if (field && allowsMotion() && Element.prototype.animate) {
      reactions = [...cloud.querySelectorAll('.kw-tag.kw-lit')].map((tag, index) => tag.animate([
        { transform: 'translateY(0)' },
        { transform: 'translateY(-6px)', offset: .4 },
        { transform: 'translateY(0)' }
      ], {duration: 440, delay: index * 35, easing: 'ease-out'}));
    }
  }
  buttons.forEach(button => button.addEventListener('click', () => choose(selected === button.dataset.field ? null : button.dataset.field)));
  reset.addEventListener('click', () => {
    const previous = buttons.find(button => button.dataset.field === selected);
    choose(null);
    previous?.focus();
  });
  document.addEventListener('motionchange', () => reactions.forEach(animation => animation.cancel()));
  choose(null);
})();

// Each chapter keeps its detail local and lets Bell react to exploration.
// This setup runs after the dictionaries and chapter navigation are ready.
document.addEventListener('DOMContentLoaded', () => {
  const reader = document.querySelector('.story-reader');
  if (!reader) return;
  const timers = new WeakMap();
  function react(section, toggle = false) {
    const companion = section.querySelector('.chapter-companion');
    if (!companion) return;
    const coffee = toggle ? !companion.classList.contains('is-coffee') : true;
    companion.classList.toggle('is-coffee', coffee);
    const note = companion.querySelector('.chapter-note');
    const key = `chapter.${section.id}.${coffee ? 'reply' : 'note'}`;
    note.dataset.i18n = key;
    setText(note, TRANSLATIONS[document.documentElement.lang]?.[key] || TRANSLATIONS.en[key]);
    clearTimeout(timers.get(companion));
    companion.classList.remove('is-reacting');
    requestAnimationFrame(() => {
      companion.classList.add('is-reacting');
      timers.set(companion, setTimeout(() => companion.classList.remove('is-reacting'), 700));
    });
  }
  reader.querySelectorAll('.chapter-bell').forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => react(button.closest('.section'), true));
  });
  reader.addEventListener('click', event => {
    if (event.target.closest('.edu-tl-col, .kw-field')) react(event.target.closest('.section'));
  });
  reader.addEventListener('toggle', event => {
    if (event.target.matches('details[open]')) react(event.target.closest('.section'));
  }, true);

  const copyButton = reader.querySelector('.copy-email');
  copyButton.hidden = false;
  copyButton.addEventListener('click', async () => {
    let key = 'chapter.copied';
    try { await navigator.clipboard.writeText('punyawee@ahlab.org'); }
    catch { key = 'chapter.copy.fail'; }
    const status = reader.querySelector('.copy-status');
    status.dataset.i18n = key;
    setText(status, TRANSLATIONS[document.documentElement.lang]?.[key] || TRANSLATIONS.en[key]);
    react(document.getElementById('connect'));
  });

  // Printing should include the entire CV, including closed disclosures.
  let printState = [];
  window.addEventListener('beforeprint', () => {
    printState = [...reader.querySelectorAll('details')].map(detail => ({ detail, open: detail.open, name: detail.getAttribute('name') }));
    printState.forEach(({detail}) => { detail.removeAttribute('name'); detail.open = true; });
  });
  window.addEventListener('afterprint', () => {
    printState.forEach(({detail, open, name}) => { detail.open = open; if (name) detail.setAttribute('name', name); });
    printState = [];
  });
});

// One topic at a time. Without JavaScript the complete, linked CV stays readable.
(function initCoffeeStories() {
  const home = document.querySelector('.cafe-home');
  const reader = document.querySelector('.story-reader');
  const navigation = document.querySelector('.reader-navigation');
  const sections = Array.from(reader.querySelectorAll('.section[id]'));
  const topicLinks = Array.from(navigation.querySelectorAll('[data-story-link]'));
  let returnTarget = null;
  let activeTopic;
  let entrance;

  function showTopic(id, focus = true) {
    const selected = sections.find(section => section.id === id);
    const nextTopic = selected?.id || 'home';
    if (nextTopic === activeTopic) return;
    activeTopic = nextTopic;
    entrance?.cancel();
    home.hidden = Boolean(selected);
    reader.hidden = !selected;
    sections.forEach(section => { section.hidden = section !== selected; });
    topicLinks.forEach(link => {
      if (link.hash === `#${id}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.getElementById('chapter-picker').value = selected ? id : 'research';
    document.body.classList.toggle('reading-story', Boolean(selected));
    if (focus) {
      const target = selected?.querySelector('h2') || returnTarget || document.getElementById('cafe-heading');
      if (selected) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      // A new topic starts at its heading; no long animated trip through the CV.
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    // Content and focus update immediately; motion never delays navigation.
    if (focus && allowsMotion() && Element.prototype.animate) {
      entrance = (selected || home).animate([
        { opacity: 0, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
  }
  document.addEventListener('motionchange', () => entrance?.cancel());

  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-story-link]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (home.contains(link)) returnTarget = link;
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    showTopic(link.hash.slice(1));
  });
  // Hash links, refresh, browser Back/Forward, and shared section URLs all work.
  window.addEventListener('popstate', () => showTopic(location.hash.slice(1)));
  window.addEventListener('hashchange', () => showTopic(location.hash.slice(1)));
  document.getElementById('chapter-picker').addEventListener('change', event => {
    navigation.querySelector('a[href="#' + event.target.value + '"]').click();
  });
  navigation.hidden = false;
  document.body.classList.add('story-enhanced');
  showTopic(location.hash.slice(1), false);

  const character = document.querySelector('.bell-character');
  const scene = document.querySelector('.bell-scene');
  const note = document.getElementById('bell-note');
  const tally = document.getElementById('brew-count');
  const total = tally.querySelector('.brew-total');
  const units = tally.querySelector('[data-i18n]');
  const scope = tally.querySelector('.brew-scope');
  const storageKey = 'bell-cold-brews';
  const saved = Number(preferences.get(storageKey));
  let count = Number.isSafeInteger(saved) && saved >= 0 ? saved : 0;
  let reactions = [];

  function translate(element, key) {
    element.dataset.i18n = key;
    setText(element, TRANSLATIONS[document.documentElement.lang]?.[key] || TRANSLATIONS.en[key]);
  }

  function renderCount() {
    total.textContent = new Intl.NumberFormat(document.documentElement.lang).format(count);
    translate(units, count === 1 ? 'feed.cup' : 'feed.cups');
    scene.classList.toggle('has-coffee', count > 0);
  }

  function saveCount() {
    preferences.set(storageKey, String(count));
    translate(scope, preferences.get(storageKey) === String(count) ? 'feed.browser' : 'feed.session');
  }

  function stopReaction() {
    reactions.forEach(animation => animation.cancel());
    reactions = [];
  }

  saveCount();
  renderCount();
  tally.hidden = false;
  character.disabled = false;
  character.addEventListener('click', () => {
    count = Math.min(count + 1, Number.MAX_SAFE_INTEGER);
    saveCount();
    renderCount();
    const moment = [5, 10, 25].includes(count) ? count : ((count - 1) % 3) + 1;
    translate(note, `feed.note.${moment}`);
    stopReaction();
    // A single, interruptible delivery per click; rapid taps still count every cup.
    if (!allowsMotion() || !Element.prototype.animate) return;
    const portrait = character.querySelector('.bell-portrait');
    reactions = [
      portrait.animate([
        { transform: 'rotate(0deg)' },
        { transform: 'translateY(-5px) rotate(-4deg)', offset: .4 },
        { transform: 'rotate(2deg)', offset: .7 },
        { transform: 'rotate(0deg)' }
      ], { duration: 620, easing: 'ease-out' }),
      character.querySelector('.brew-delivery').animate([
        { opacity: 0, transform: 'translate(40px, 48px) rotate(18deg)' },
        { opacity: 1, offset: .2 },
        { opacity: 1, offset: .65 },
        { opacity: 0, transform: 'translate(0, -10px) rotate(-8deg)' }
      ], { duration: 650, easing: 'ease-out' }),
      character.querySelector('.brew-plus').animate([
        { opacity: 0, transform: 'translateY(12px) scale(.8)' },
        { opacity: 1, offset: .2 },
        { opacity: 1, offset: .65 },
        { opacity: 0, transform: 'translateY(-24px) scale(1)' }
      ], { duration: 850, easing: 'ease-out' }),
      note.closest('.bell-note').animate([
        { opacity: .35, transform: 'translateY(6px) scale(.97)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' }
      ], {duration: 380, easing: 'cubic-bezier(.16,1,.3,1)'}),
      total.animate([{transform:'scale(1.35)'},{transform:'scale(1)'}], {duration:380,easing:'ease-out'})
    ];
    if ([5, 10, 25].includes(count)) {
      character.querySelectorAll('.brew-bean').forEach((bean, index) => {
        const angle = (index / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 85;
        const y = Math.sin(angle) * 75;
        reactions.push(bean.animate([
          {opacity:0,transform:'translate(0, 0) scale(.4)'},
          {opacity:1,offset:.2},
          {opacity:0,transform:`translate(${x}px, ${y}px) rotate(${index * 55}deg) scale(1)`}
        ], {duration:850,delay:index*12,easing:'ease-out'}));
      });
    }
  });
  document.querySelector('.lang-toggle').addEventListener('click', renderCount);
  document.addEventListener('motionchange', stopReaction);
})();
