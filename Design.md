# Design System

## Concept

**Warm Earth Minimalist — 60/30/10**

A warm, refined palette inspired by Japanese wabi-sabi and artisan craft aesthetics. Four tones of cream, sand, and warm tan build every surface: `#F9F8F6` (60%), `#EFE9E3` + `#D9CFC7` (30%), `#C9B59C` (10%). The structure is disciplined and minimal — generous white space, warm soft borders — with the tan accent used sparingly for section numbers, eyebrow labels, card left-edges, and the top bar.

The icosahedron wireframe in the hero now renders in warm tan, referencing *Entertainment Computing* — the mathematical heart of Punyawee's research.

---

## Color Palette

All colors are defined as CSS custom properties in the `:root` block at the top of `style.css`.

| Token           | Value                    | Usage                                        |
|-----------------|--------------------------|----------------------------------------------|
| `--bg`          | `#F9F8F6`                | 60% — dominant cream background              |
| `--bg-tinted`   | `#EFE9E3`                | 30% — hover, card tints, photo placeholder   |
| `--text`        | `oklch(11% 0.035 65)`    | Near-black warm primary text                 |
| `--text-2`      | `oklch(36% 0.05 70)`     | Body paragraphs, descriptions                |
| `--text-3`      | `oklch(56% 0.04 72)`     | Metadata, captions, footer                   |
| `--primary`     | `oklch(24% 0.06 70)`     | Dark warm brown — icons, tabs, links         |
| `--primary-dim` | `#EFE9E3`                | Icon container backgrounds                   |
| `--accent`      | `#C9B59C`                | 10% — eyebrow, numbers, card borders, bar    |
| `--border`      | `#EFE9E3`                | Soft internal dividers                       |
| `--border-bold` | `#D9CFC7`                | Structural section lines, card borders       |

> **Important:** If you change `--accent`, also update `ACCENT` in `script.js`:
> `const ACCENT = '201, 181, 156';` → update to matching RGB values of the new accent colour.

---

## Typography

| Role                              | Font               | Weight | Size              |
|-----------------------------------|--------------------|--------|-------------------|
| Name, section titles, pull quote, pub titles | Cormorant Garamond | 300, 400 italic | fluid 44–88px |
| Body, labels, tagline, numbers    | DM Sans            | 300, 400, 500, 600 | fluid 11–17px |

Loaded from Google Fonts. No monospace — the "technical" feel comes from structure, not font choice.

---

## Spacing Scale

| Token      | Range         |
|------------|---------------|
| `--sp-2xs` | 4 – 6px       |
| `--sp-xs`  | 8 – 12px      |
| `--sp-s`   | 12 – 18px     |
| `--sp-m`   | 20 – 32px     |
| `--sp-l`   | 32 – 56px     |
| `--sp-xl`  | 56 – 96px     |

---

## Section Structure

Every section follows this pattern:

```html
<section class="section" id="slug" aria-label="Title">
  <header class="section-head">
    <span class="n">01</span>   <!-- red section number -->
    <div class="rule"></div>    <!-- soft horizontal rule -->
    <h2>Title</h2>              <!-- serif, right side -->
  </header>
  <!-- content -->
</section>
```

Section top border uses `--border-bold` (near-black) for strong structural separation.

---

## Sections

| # | ID             | Description                                      |
|---|----------------|--------------------------------------------------|
| 01 | `#about`      | Photo + italic pull-quote + bio paragraphs       |
| 02 | `#research`   | 3 research areas in two-column rows              |
| 03 | `#publications` | 5 papers with year (red) + title + authors     |
| 04 | `#personality` | Enneagram + MBTI character cards               |
| 05 | `#connect`    | 6 links with red left-edge hover indicator       |

---

## Personality Cards (Persona UI)

The Personality section uses a character-card style inspired by Persona's stat screens:

- **Black border** all around (`1px solid --border-bold`)
- **Red left border** (`3px solid --accent`) — signature Persona-style accent line
- **★ star** in top-right corner (red, `aria-hidden`)
- Tag: tiny uppercase red label (`ENNEAGRAM` / `MBTI`)
- Type: large serif display number/letters (`Type 3` / `ENFJ / INFJ`)
- Label: small uppercase gray subtitle (`THE ACHIEVER`)
- Thin divider, then description text

---

## Interactive States

### Links (section 05)
- Default: clean row with name + description + ↗ arrow
- Hover: light gray background + **red left edge appears** (2px, scale animation) + arrow turns red

### Inline links (About bio, Scholar link)
- Default: red text + 30%-opacity red underline
- Hover: full-opacity underline

### Personality cards
- Default: white background + black border + red left border
- Hover: tinted background

---

## The Icosahedron

Drawn on `<canvas id="polyhedron">` in `script.js`. Parameters:

```js
const TILT  = 0.38;   // fixed X-axis tilt in radians
const SPEED = 0.0032; // rotation speed (radians/frame)
const ACCENT = '185, 22, 28'; // Persona red in rgba format
```

Figcaption label: `"Entertainment Computing"` — references Punyawee's PhD specialty.

---

## Accent Bar

A solid 3px red line at the very top of the page — bold, unambiguous, Persona-style. Not a gradient. Never gray.
