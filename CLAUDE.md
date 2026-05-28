# Claude Context

## Project Overview

Personal academic portfolio for **Punyawee Anunpattana** (nickname: Bell), Research Fellow at the Augmented Human Lab (AHLab), National University of Singapore.

**Stack:** Plain HTML + CSS + JavaScript — no framework, no build step, no npm.
Open `index.html` directly in a browser, or serve with any static host.

---

## File Map

| File         | Purpose                                          |
|--------------|--------------------------------------------------|
| `index.html` | All page content — text, links, structure        |
| `style.css`  | All styling — design tokens in `:root`           |
| `script.js`  | Icosahedron animation + scroll-reveal            |
| `Design.md`  | Design system reference (colors, type, layout)   |
| `GUIDE.md`   | How to modify content and deploy to GitHub Pages |

---

## Design Intent

**Warm Earth Minimalist — 60/30/10 palette.**

- 60% `#F9F8F6` — dominant cream background (`--bg`)
- 30% `#EFE9E3` + `#D9CFC7` — secondary surfaces, borders, card tints (`--bg-tinted`, `--border`, `--border-bold`)
- 10% `#C9B59C` — accent: top bar, eyebrow, section numbers, card left-edge, tags (`--accent`)
- Primary text/icons: dark warm brown `oklch(24% 0.06 70)` (`--primary`)
- Canvas icosahedron ACCENT: `'201, 181, 156'` (the `#C9B59C` RGB triple in `script.js`)
- Font: System font stack (`-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', sans-serif`) — hierarchy via weight and size only

Do not change the overall aesthetic without the user's approval. Do not introduce dark mode, glassmorphism, gradients on text, or blue/purple/cyan color schemes.

---

## Content Locations (all in `index.html`)

| What to change          | Where to find it                                  |
|-------------------------|---------------------------------------------------|
| Name                    | `.name` spans in `.hero`                          |
| Nickname / location     | `.name-sub`                                       |
| Role / tagline          | `.tagline`                                        |
| About bio               | `.about-body` paragraphs                          |
| Education degrees       | `.edu-item` divs in `#education` (02)             |
| Thesis abstract/link    | `.thesis-book` in `#education` (02)               |
| Research descriptions   | `.research-item` articles in `#research` (03)     |
| Publications            | `.pub-item` articles in `#publications` (04)      |
| Personality types       | `.persona-card` divs in `#personality` (05)       |
| Links / URLs            | `.link-row` anchors in `#connect` (06)            |
| Photo                   | `.photo-wrap` — see comment in HTML               |
| Tab labels              | `.tab` anchors in `.tab-nav`                      |
| Footer name             | `<footer>` text                                   |

## Sections (6 total — academic CV priority order)

| # | ID             | Content                                                          |
|---|----------------|------------------------------------------------------------------|
| 01 | `#about`      | Photo + italic pull-quote + 2 bio paragraphs                     |
| 02 | `#education`  | PhD (JAIST 2018–2023) + thesis book + B.Eng. (SIIT 2014–2018)   |
| 03 | `#research`   | 3 research areas (two-column rows)                               |
| 04 | `#publications` | 5 papers + Google Scholar link                                 |
| 05 | `#personality` | Enneagram Type 3 + ENFJ/INFJ character cards                    |
| 06 | `#connect`    | 6 links with 36px icon containers                                |

## Real Profile Info

- **Name:** Punyawee Anunpattana (Bell)
- **Role:** Research Fellow, Augmented Human Lab, NUS Singapore
- **PhD:** Information Science, JAIST (2018–2023)
- **B.Eng.:** Information and Communication Technology, SIIT, Thammasat University (2014–2018)
- **Thesis:** "Analyzing Learning Process on Educational Assessment and Its Theoretical Concepts Using Motion in Mind" — https://dspace.jaist.ac.jp/dspace/bitstream/10119/18418/2/paper.pdf
- **Email:** punyawee@ahlab.org
- **LinkedIn:** linkedin.com/in/bell-punyawee
- **GitHub:** github.com/bellpunyawee
- **Scholar:** scholar.google.com/citations?user=J4xtAsQAAAAJ (141 citations, h-index 6)
- **ResearchGate:** researchgate.net/profile/Punyawee-Anunpattana-2

---

## Style Rules

- **Colors:** Only change via CSS custom properties in `:root` at the top of `style.css`
- **Accent in canvas:** Must also update `ACCENT` constant in `script.js` when changing `--accent`
- **Spacing:** Use existing `--sp-*` tokens; avoid arbitrary pixel values
- **Fonts:** System font stack only — do not add Google Fonts or web fonts

---

## Icon Rules (STRICT)

- **Never** use emoji as icons. Zero exceptions.
- Use **inline SVG stroke icons** only — Lucide/Heroicons outline style
- `stroke-width="1.75"`, `fill="none"`, `stroke="currentColor"`
- In link rows and education items: 36px `border-radius: 8px` container, `--primary-dim` background, `--primary` stroke
- In tab nav: icons are inline (no container), inherit tab color via `currentColor`

## Common Tasks

**Add a new link:**
Copy an existing `.link-row` in `#connect`, replace the SVG inside `.link-icon`, update `href`, `.link-name`, `.link-desc`.

**Add a new section:**
Follow the `<section class="section">` pattern with `.section-head` header. Increment the `<span class="n">` number.

**Change the accent color:**
1. Update `--accent` in `:root` of `style.css`
2. Update `ACCENT` on the marked line in `script.js` (use `r, g, b` format, e.g. `'100, 150, 200'`)

**Change rotation speed:**
In `script.js`, adjust `SPEED` (lower = slower). Also `TILT` for the static viewing angle.

**Add a photo:**
1. Place `photo.jpg` next to `index.html`
2. In the `#about` section, replace `<div class="photo-placeholder">...</div>` with `<img src="photo.jpg" alt="Punyawee Anunpattana">`

**Update thesis link:**
In `#education`, find `.thesis-link` anchor and update the `href` attribute.

**Add a publication / paper:**
Copy an existing `.pub-item` in `#publications`, update year, title, and author/citation info.

---

## What NOT to change without asking

- The icosahedron geometry in `script.js` (it is mathematically exact)
- The `clamp()` spacing system (it handles all screen sizes)
- The `IntersectionObserver` scroll-reveal logic
- The thesis book SVG (it is the same mathematical projection as the canvas)
