# CLAUDE.md

Guidance for Claude Code when working in this repository. Read before making
changes; keep this file up to date if the workflow evolves.

## What this repo is

Yixuan Yang's personal academic homepage **plus** the LaTeX source for his CV.
Deployed via **GitHub Pages** — every push to `master` goes live at
[yixuanyang.com](https://yixuanyang.com) (CNAME in `CNAME`). No CI, no build
step for the site itself. The CV is the only artifact compiled before commit.

## Repository layout

| Path | Purpose |
|---|---|
| `index.html` | Main homepage. Sections: `#biography`, `#highlights`, `#news`, `#publications` (heading: "Research Experiences"), `#projects`, `#courses`, `#reviewer`, `#yixuanlife`. |
| `index-yinsen.html` | Alternate homepage variant. **Do not edit without asking the user.** |
| `cv/main.tex` | LaTeX source of the CV — single file, `article` class, one-page layout. |
| `cv/*.png` | Images referenced by `main.tex` (currently only `duke_university_wordmark_black.png` is used; `LOGO_0/1.png` are orphans). |
| `cv/main.pdf` | Compiled CV — the build-output copy kept next to the source. |
| `files/Yixuan_Yang_CV.pdf` | **Published CV** — linked from `index.html:120` and `index.html:189`. Must mirror `cv/main.pdf`. |
| `files/*.pdf` | Other downloadable documents (course reports, etc.). |
| `images/`, `css/`, `js/` | Static assets for the homepage. |
| `meta/` | Older versions and templates. **Do not edit without asking the user.** |

## CV workflow

1. Edit `cv/main.tex`.
2. Compile with **tectonic** (installed at `/opt/homebrew/bin/tectonic`):
   ```bash
   tectonic cv/main.tex
   ```
   This produces `cv/main.pdf`.
3. Mirror the output to the published path so the homepage link picks it up:
   ```bash
   cp cv/main.pdf files/Yixuan_Yang_CV.pdf
   ```
4. Commit the `.tex` change and **both PDFs** in the same commit so source and
   published copy stay in lockstep. Do not commit one without the other.

**Do not** switch compilers (no `pdflatex`, `xelatex`, `latexmk`). Tectonic
auto-fetches missing packages on first run.

## Homepage workflow

**News entries** (most frequent change) — add at the **top** of the `<ul>`
inside `<div class="news" id="news">` (~`index.html:363`). Format:

```html
<li>
  <strong class="news-date">[Mon. YYYY]</strong> message
</li>
```

Conventions:
- Month is abbreviated with a period: `Jan.`, `Feb.`, `Mar.`, `Apr.`, `Aug.`,
  `Nov.`, `Dec.` (`May` has no period).
- Newest entry on top.
- Emojis are allowed in news bodies — existing entries use `🎉 🛫 😷`. Only add
  them if the user asks or the news is clearly celebratory.

**Sections** — each top-level section is a `<div class="…" id="…">` with an
`<h1>`. Section `id`s are sidebar anchor targets (sidebar at ~`index.html:130`).
If you add a section, also add a matching sidebar `<li>`.

**Previewing** — open `index.html` directly in a browser. No dev server needed;
the site is static. CDN-loaded libraries (Bulma, FontAwesome, Academicons)
require network.

## Cross-document consistency

Several facts live in **both** `index.html` and `cv/main.tex`. When editing
one, check whether the other needs updating in the same commit:

| Fact | Homepage | CV |
|---|---|---|
| Advisor / lab / affiliation | Bio paragraph (~`index.html:215+`) | Education, Research Experiences (`cv/main.tex:91+`) |
| Reviewer list | `#reviewer` section (~`index.html:1142`) | Academic Service line (`cv/main.tex:178`) |
| Research projects (titles, dates, advisors) | `#publications` (~`index.html:593`), `#projects` (~`index.html:891`) | Research Experiences (`cv/main.tex:121+`) |
| Teaching / TA roles | `#reviewer` section | Academic Service line (`cv/main.tex:177`) |
| Publications | (not currently listed on homepage) | Publications section (`cv/main.tex:159+`) |

**News → CV rule**: when a news entry describes a durable milestone (passed
qualification exam, new position, paper accepted, new award), the CV usually
needs a matching edit too. Flag this to the user if they only ask for the news
entry.

## Git & deploy

- Work directly on `master` — no feature branches. Each commit on `master` is
  a deploy unit.
- Commit messages: short, imperative, specific about the content changed. Look
  at `git log` for recent style; avoid generic messages like "update site".
- **Do not commit automatically.** The user reviews changes and explicitly says
  "commit and push" (or just "commit"). If unclear, ask.
- Never commit LaTeX build intermediates (`*.aux`, `*.log`, `*.out`,
  `*.fdb_latexmk`, `*.fls`). Add to `.gitignore` if they appear.

## Guard-rails — do not do without asking

- Rewrite `index.html` or `cv/main.tex` wholesale. Work is almost always
  additive: one news item, one reviewer entry, one section edit.
- Introduce a build system (npm, Makefile, CI, GitHub Actions) or swap LaTeX
  compilers.
- Edit `meta/` or `index-yinsen.html`.
- Delete images, PDFs, or content that looks unreferenced — confirm first; the
  user may be planning to use it.
