# How to Modify and Deploy Your Website

## File Overview

```
cv-web-page/
├── index.html   ← all page content (text, links, structure)
├── style.css    ← all visual styling (colors, fonts, spacing)
├── script.js    ← icosahedron animation, scroll effects
├── Design.md    ← design system reference
├── CLAUDE.md    ← context for Claude AI assistant
└── GUIDE.md     ← this file
```

Open `index.html` in any browser to preview locally — no server needed.

---

## Editing Content

### Change your name or tagline

Open `index.html`. Find the `.hero` section near the top:

```html
<h1 class="name">
  <span>Ponpailin</span>
  <span>Homsombut</span>
</h1>
<p class="name-jp" lang="ja">ポンパイリン ホンソンブット</p>
<p class="tagline">Master's Student · Computational Geometry · MEXT Scholar</p>
```

Edit the text inside the tags. Keep the HTML tags themselves (`<span>`, `<p>`, etc.) unchanged.

---

### Add your photo

1. Place your photo file (e.g. `photo.jpg`) in the same folder as `index.html`
2. Open `index.html` and find this block in the About section:

```html
<div class="photo-placeholder">
  <span>photo.jpg</span>
</div>
```

3. Delete those three lines and replace with:

```html
<img src="photo.jpg" alt="Ponpailin Homsombut">
```

The image will automatically be cropped and sized correctly by the existing CSS.

---

### Update your links

Open `index.html` and scroll to the **Connect** section (section 03). Each link looks like:

```html
<a class="link-row" href="https://linkedin.com/in/YOUR_USERNAME" target="_blank" rel="noopener noreferrer">
  <span class="link-name">LinkedIn</span>
  <span class="link-desc">linkedin.com/in/your-profile</span>
  <span class="arrow" aria-hidden="true">↗</span>
</a>
```

Replace `YOUR_USERNAME` in the `href` with your real username, and update the `.link-desc` text to match.

For email, use `href="mailto:your.email@example.com"` (no `target="_blank"` needed).

---

### Update your bio or research descriptions

Find the `#about` and `#research` sections in `index.html`. The text is inside `<p>` tags — just edit the text. Keep the surrounding tags intact.

---

### Change the accent color

The accent is Starbucks "Green Accent" by default. To change it:

**Step 1** — Open `style.css` and find this line in the `:root` block:
```css
--accent:       #00754A;
```
Change the value.

**Step 2** — Open `script.js` and find this line (near the top of `initPolyhedron`):
```js
const ACCENT = '0, 117, 74';
```
Update the RGB values to match your new color — this is what the hero icosahedron
is drawn in, and it is the only colour not read from the CSS tokens.

> Note: `--accent` is one of four role-mapped greens. Changing it alone shifts the
> interactive colour but leaves headings (`--primary`) and the footer band
> (`--house`) untouched. See `DESIGN-starbucks.md` before recolouring the system.

---

### Add a new section

Copy this template and paste it before the Connect section in `index.html`:

```html
<section class="section" id="publications" aria-label="Publications">
  <header class="section-head">
    <span class="n">04</span>
    <div class="rule"></div>
    <h2>Publications</h2>
  </header>

  <!-- your content here -->
</section>
```

---

## Deploying to GitHub Pages (Free Hosting)

### First-time setup

1. **Create a GitHub account** at [github.com](https://github.com) if you don't have one.

2. **Create a new repository:**
   - Click the `+` button → "New repository"
   - Name it `YOUR_USERNAME.github.io` (replace with your actual GitHub username)
   - Set it to **Public**
   - Click "Create repository"

3. **Upload your files:**
   - In your new repository, click "uploading an existing file"
   - Drag and drop: `index.html`, `style.css`, `script.js`
   - Click "Commit changes"

4. **Enable Pages:**
   - Go to Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `main`, folder: `/ (root)`
   - Click Save

5. **Your site is live** at `https://YOUR_USERNAME.github.io` within 1–2 minutes.

---

### Updating the site after changes

**Option A — GitHub web editor (easiest):**
1. Go to your repository on GitHub
2. Click the file to edit → click the pencil icon (Edit)
3. Make your changes → click "Commit changes"
4. The site redeploys automatically in ~30 seconds

**Option B — Git command line:**
```bash
# First time only: link your local folder to GitHub
git init
git add index.html style.css script.js
git commit -m "Initial site"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_USERNAME.github.io.git
git push -u origin main

# Every update after that:
git add index.html style.css script.js
git commit -m "Update bio"
git push
```

---

### Custom domain (optional)

If you want `ponpailin.dev` or similar instead of `your-name.github.io`:

1. Buy a domain from Namecheap, Cloudflare Registrar, or Google Domains
2. In GitHub Pages settings → enter your custom domain
3. At your domain registrar, add a CNAME DNS record pointing to `YOUR_USERNAME.github.io`
4. DNS propagation takes up to 24 hours

---

## Asking Claude for Help

Open Claude Code (this app) and describe what you want. For example:

- `"Change my email to ponpailin@jaist.ac.jp"`
- `"Add a Publications section with these three papers: ..."`
- `"Make the accent color deep teal"`
- `"The photo isn't showing — what's wrong?"`
- `"Add a fourth research area about origami mathematics"`

Claude has full context in `CLAUDE.md` and will make targeted edits without changing the design.

## Coffee-table homepage

The short homepage introduces Bell with an interactive chibi illustration and a
real portrait in the About preview. Its four story links open research, publications,
education, and about; the primary action opens research. The topic navigation
provides access to all seven original CV sections, one at a time. `#home` returns
to the introduction, and existing section URLs such as `#publications` still work.

- Homepage copy: `.cafe-home` in `index.html`; `cafe.*` keys in both language dictionaries in `script.js`.
- Character poses: the original `bell-chibi.png` and `bell-chibi-coffee.png`; feeding coffee switches poses and updates a short reaction.
- Professional portrait: `photo.jpg`, shown on the homepage and in About.
- Navigation: `initCoffeeStories()`; browser Back/Forward and keyboard focus are supported.
- No JavaScript: the complete CV remains visible. Printing includes all sections.
- The CV link requests a copy by email until a real PDF URL is supplied.

The palette, type, spacing tokens, and green roles still follow `DESIGN-starbucks.md`.

The homepage uses an editorial poster layout: a large central illustration and
headline, supporting text at the edges, then a 2×2 grid mixing image and type.
The English motto runs vertically; Thai stays horizontal. The live character reply
sits directly below the Feed button. A compact thesis bookshelf sits beside the
four story links on desktop and above them on mobile.

### Exploring the inner chapters

Each topic has a short illustrated introduction. Tap its Bell illustration for a
second note; choosing a degree, research topic, or opening a detail also prompts a
brief reaction. The homepage and the About chapter both keep the real portrait.

- About separates lab life and after-hours stories into native disclosures.
- Education keeps degree selection and the full thesis abstract under the PhD. The original front/back cover artwork now appears on the landing page with a short introduction, a text hint to click the book, a full-size image link, and the PDF link. Click the cover (or use Enter/Space) to flip it. The mathematical cover SVG is preserved as its fallback.
- Experience opens one role at a time. Publication titles remain visible, with metadata underneath each title.
- Research restores the original cloud of four fields and twenty related keywords. Selecting a field highlights matching keywords and opens its description. Select it again or use “Show all connections” to reset; research notes still open on demand.
- Personality expands each profile independently. Connect prioritises email, LinkedIn, and CV, with other profiles underneath.
- On small screens, the chapter selector replaces the full navigation row. Browser history and direct section links still work.
- New chapter text lives in the `chapter.*` English/Thai dictionaries. Native disclosures work without JavaScript; print temporarily opens all details and restores their state afterward.
- Copy email provides feedback, including the address to copy manually if clipboard access is unavailable.

Character reactions and disclosure transitions respect reduced-motion preferences.

### Feed Bell a cold brew

On the homepage, tap Bell or “Feed me cold brew” to serve one cup. The counter
belongs to the visitor's browser and persists under `bell-cold-brews` in localStorage;
it is not a shared visitor total. If storage is unavailable, it counts for the current
visit. Short reactions celebrate 5, 10, and 25 cups. Text lives in the bilingual
`feed.*` translations. Delivery and +1 animations only run on interaction and respect
reduced-motion preferences; keyboard Enter and Space work with the native button.

The reply now has a mint background beside the interaction, and each feed animates
the reply and count. At 5, 10, and 25 cups, eight small SVG coffee beans scatter once.
Two decorative beans drift gently near Bell. Use the pause control in the header to
stop motion; that choice persists as `coffee-motion`. Ambient motion pauses in other
chapters and background tabs. The device's reduced-motion setting is the default;
visitors can explicitly enable animations with the header control, even when their
device reduces motion. The desktop control shows “Motion on/off” and remembers the
visitor's choice. CSS and JavaScript use the same effective setting.

Chapter navigation uses an interruptible 320ms fade and slide. The content, URL,
and keyboard focus update immediately; rapid navigation and browser history retain
the latest destination. Without Web Animations support, navigation remains instant.

### Quiet editorial typography

Typography takes its Japanese minimalism from restrained weight, clear hierarchy,
and space. English keeps the original system font stack. Thai uses a self-hosted,
modern loopless Noto Sans Thai face, with the original stack for Latin characters.
This requested Thai-specific choice extends the original system-font-only guide.
The variable WOFF2 contains only the Thai subset (about 27 KB), loads only when
needed, and uses `font-display: swap` so text stays visible while it loads.
The font and its SIL Open Font License are in `fonts/`; the upstream project is
https://github.com/notofonts/thai. No external font service is contacted at runtime.
`style.css` defines semantic `--type-*` sizes and three `--weight-*` roles: 400 for
display headings and prose, 500 for titles and controls, 600 for emphasis.
Body copy stays at 1rem on mobile and desktop; secondary text uses .875rem and
captions .75rem. Thai overrides the heading tracking and line heights to preserve
natural spacing and room for vowel marks. Existing layout spacing tokens stay intact.
