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
| `cv/` | **Not tracked by this repo** — `.gitignore`d. It is a git clone of the Overleaf project that owns the CV source; a repo nested inside a repo. See "CV workflow". |
| `cv/main.tex` | LaTeX source of the CV — single file, `article` class, one-page layout. Synced with Overleaf. |
| `cv/duke_university_wordmark_black.png` | The only image `main.tex` references (`cv/main.tex:85`). |
| `cv/main.pdf` | Local tectonic build output. Excluded via `cv/.git/info/exclude`, so it never reaches Overleaf. |
| `files/Yixuan_Yang_CV.pdf` | **Published CV** — linked from `index.html:120` and `index.html:189`. The only CV artifact this repo tracks. Must mirror `cv/main.pdf`. |
| `files/*.pdf` | Other downloadable documents (course reports, etc.). |
| `images/`, `css/`, `js/` | Static assets for the homepage. |

## CV workflow

The CV source lives in an **Overleaf project**, not in this repo. `cv/` is a git
clone of that project and is `.gitignore`d here. The only CV artifact this repo
tracks is `files/Yixuan_Yang_CV.pdf`.

- Overleaf project: <https://www.overleaf.com/project/6a8ee29d7baef092983f0948>
- Git remote: `https://git@git.overleaf.com/6a8ee29d7baef092983f0948`, branch `main`
- Auth: Overleaf Git token (`olp_…`) cached in the macOS keychain — no setup
  needed per-session. Overleaf's Git integration is a premium feature, granted
  through Duke's site licence (SSO login at overleaf.com/edu/duke).
- **Overleaf's compiler must stay set to XeLaTeX**, matching tectonic (also
  XeTeX-based). Under pdfLaTeX the tight one-page layout can reflow to two pages,
  making the web preview disagree with the published PDF.

### Editing the CV

1. **Pull first, always** — the user may have edited on Overleaf since last sync:
   ```bash
   git -C cv pull
   ```
2. Edit `cv/main.tex`.
3. Push, so the change appears in the Overleaf editor:
   ```bash
   git -C cv add -A && git -C cv commit -m "…" && git -C cv push
   ```
4. Compile and mirror to the published path:
   ```bash
   tectonic cv/main.tex
   cp cv/main.pdf files/Yixuan_Yang_CV.pdf
   ```
5. Commit `files/Yixuan_Yang_CV.pdf` in the **outer** repo.

**Two repos, two commits.** `git status` in the outer repo never shows `cv/`
changes — they are invisible to it. Skipping step 3 means the edit never reaches
Overleaf; skipping steps 4–5 means the website still serves the old PDF. Verify
page count stays at 1 after compiling: `pdfinfo cv/main.pdf | grep Pages`.

**Do not** switch compilers (no `pdflatex`, `latexmk`). Tectonic auto-fetches
missing packages on first run.

**Git bridge limits:** single branch, no force push, no submodules, no Git LFS,
symlinks get flattened. Never rewrite history in `cv/`.

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
- Delete images, PDFs, or content that looks unreferenced — confirm first; the
  user may be planning to use it. Note that `index.html` keeps large blocks of
  commented-out HTML referencing files that no longer exist; a reference inside
  `<!-- -->` is not a live reference. Strip comments before auditing links.
