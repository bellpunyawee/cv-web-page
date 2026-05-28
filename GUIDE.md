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

The accent color is terracotta by default. To change it:

**Step 1** — Open `style.css` and find this line in the `:root` block:
```css
--accent: oklch(52% 0.130 30);
```
Change the value. Try `oklch(52% 0.12 200)` for teal, or `oklch(45% 0.15 280)` for purple.

**Step 2** — Open `script.js` and find this line (near the top of `initPolyhedron`):
```js
const ACCENT = '182, 79, 34';
```
Update the RGB values to match your new color. (Use a color picker tool online to find the RGB for your oklch value.)

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
