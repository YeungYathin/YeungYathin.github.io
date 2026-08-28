# CLAUDE.md

Guidance for Claude Code when working in this repository. Read before making
changes; keep this file up to date if the workflow evolves.

## What this repo is

Yixuan Yang's personal academic homepage **plus** the LaTeX source for his CV.
The site is a **Jekyll** project built natively by **GitHub Pages** — every push
to `master` goes live at [yixuanyang.com](https://yixuanyang.com) (CNAME in
`CNAME`). No CI, no Actions workflow: GitHub runs Jekyll itself, which means
**no plugins** (safe mode) and only what the `github-pages` gem ships.

The CV is the only artifact compiled before commit.

## Repository layout

| Path | Purpose |
|---|---|
| `_config.yml` | Jekyll config. No theme, no plugins. `exclude:` keeps `cv/`, `assets/papers/` and the tooling files out of the build. |
| `_layouts/default.html` | The only layout: head, top bar, sidebar, content slot, footer. |
| `_data/` | **All content lives here**, not in markup. See the table below. |
| `_includes/` | Markup. Each section is one include; `publication-card.html` is the one reusable component. |
| `index.html` | Home page. Front matter only, then four includes. Sets `anchors: true`. |
| `service.html` | `/service/`. Academic Service, split off the home page. |
| `search.json` | The client-side search index, generated at build time from `_data`. |
| `css/yixuan.css` | The only stylesheet. Token-driven; read its header before touching colours. |
| `js/site.js` | Theme switch, card summaries, search. No framework, no build step. |
| `assets/` | `img/` and `video/` for everything the pages show; `docs/` and `papers/` below. |
| `assets/docs/` | Documents the site links to, and therefore serves: the CV and the course report. Has its own README. |
| `assets/papers/` | Full texts kept as reference. **Excluded from the build, never served** -- two are publisher versions, and re-hosting those is a copyright question the site does not need to answer. Has its own README. |
| `cv/` | **Not tracked by this repo** — `.gitignore`d. A git clone of the Overleaf project that owns the CV source. See "CV workflow". |

### `_data/` — the content layer

| File | Holds | Notes |
|---|---|---|
| `profile.yml` | Name, portrait, avatar, masthead role line, postal address, email, socials, research interests | The sidebar shows avatar, address and socials only; it carries no name |
| `news.yml` | News entries | `label` (date), `body` (raw HTML), `collapsed: true` hides it behind "Earlier news" |
| `publications.yml` | Research entries | `slug`, `badge`, `badge_tone`, `media`, `title`, `title_url`, `authors`, `venue`, `extra[]`, `links[]`, `summary` |
| `projects.yml` | Course project(s) | Same shape as `publications.yml`; rendered after it |
| `service.yml` | Academic service items | Raw HTML per item, nested `<ul>` allowed |
| `nav.yml` | Sidebar in-page anchors | Only rendered where `page.anchors` is set |
| `pages.yml` | Top-bar page links | Cross-page only |

**Fields hold raw inner HTML on purpose** where the markup carries meaning
(`authors` bolds the owner's name, `venue` ends in `<br />`). A `:` followed by
a space inside an unquoted YAML scalar breaks the parse — quote those strings.

## Design contract

`css/yixuan.css` opens with the colour contract and the type ladder. **Read it
before adding a rule.** The short version:

- `--ink` — anything meant to be **read**: prose, author lists, list items,
  news bodies, contact details.
- `--ink-muted` — labels and stamps that **orient** without being read: dates,
  eyebrow labels, venue lines, placeholders, the footer.
- `--brand` / `--link` / `--accent` — headings and names / interactive text /
  status and awards.

Rank is carried by size, weight and face, so colour carries meaning. Every
token clears WCAG AAA (7:1) in both themes; check any new colour against that.

Dark theme is two selector blocks at the top of the file that remap the same
tokens. **Never** define a colour only inside the media query, and never
hardcode a hex below `:root`.

## Homepage workflow

**News entries** (most frequent change) — add at the **top** of `_data/news.yml`:

```yaml
- label: "[Mon. YYYY]"
  body: >-
    message, raw HTML allowed
```

Conventions:
- Month abbreviated with a period: `Jan.`, `Feb.`, `Mar.` … (`May` has none).
- Newest first. Set `collapsed: true` on older entries to fold them away.
- Emojis are allowed in bodies. Only add them if asked or if clearly celebratory.

**Research entries** — add to `_data/publications.yml`. `badge` is the chip
above the figure and carries its own casing (`arXiv`, `HotMobile`, not
uppercased). `badge_tone: venue` is the solid navy chip and means peer-reviewed;
`badge_tone: preprint` is outlined. **Entries that never appeared anywhere get
no badge.** A `summary` makes the whole card clickable.

**Previewing** — `jekyll serve` and open the URL it prints.

> **Opening `index.html` from the filesystem no longer works.** Every asset
> path goes through `relative_url`, which emits `/css/yixuan.css`; under
> `file://` that resolves to the filesystem root and the page renders unstyled.

```bash
PATH="/opt/homebrew/opt/ruby@3.4/bin:$PATH" bundle exec jekyll serve --port 4321
```

The explicit `ruby@3.4` is load-bearing. `/usr/bin/ruby` is macOS's Ruby 2.6 and
cannot see these gems at all, and Homebrew's default `ruby` has moved on to
4.0 while `.bundle/config` still points at a bundle built for the 3.4 ABI.
Without the prefix you get `Could not find bundler` or `command not found:
jekyll`, neither of which names the real cause.

**"The site is still serving the old CV" -- check the host first.** The live site
is whatever was last merged to `master`. While work sits on a branch,
yixuanyang.com legitimately serves the previous everything, and a CV opened
from there will look stale no matter how many times it has been recompiled.
Establish which host is being looked at before touching `cv/`:

```bash
curl -s -o /tmp/served.pdf http://127.0.0.1:4000/assets/docs/Yixuan_Yang_CV.pdf
md5 -q /tmp/served.pdf assets/docs/Yixuan_Yang_CV.pdf cv/main.pdf | uniq | wc -l   # expect 1
pdftotext /tmp/served.pdf - | grep -c "the thing that should be gone"              # expect 0
```

**grep the PDF through NFKC first.** pdftotext emits real ligatures, so `effective`
comes back as `eﬀective` (U+FB00) and a plain grep reports a clean 0 for text that
is plainly on the page. Normalise before asserting:

```bash
python3 -c "import subprocess,unicodedata,re,sys; \
t=subprocess.run(['pdftotext','cv/main.pdf','-'],capture_output=True,text=True).stdout; \
print(('55% more effective' in re.sub(r'\s+',' ',unicodedata.normalize('NFKC',t))))"
```

If those agree, the file is correct and the report is about production, or about
a cached tab. Chrome's built-in viewer holds a PDF hard, so a hard reload
(Cmd+Shift+R) is the fix there -- not another compile.

**`baseurl` is pinned in `_config.yml`, and must stay pinned.** In a production
build `jekyll-github-metadata` derives a `baseurl` of its own. Every asset on
this site goes through `relative_url`, so a derived baseurl rewrites every CSS,
JS, image, video and PDF path and breaks the entire deploy. A local
`jekyll serve` never reveals this: the development environment skips that
override, so the dev site looks perfect while the built site would 404 on
everything. Check the built output, not the server:

```bash
PATH="/opt/homebrew/opt/ruby@3.4/bin:$PATH" JEKYLL_ENV=production \
  PAGES_REPO_NWO=YeungYathin/YeungYathin.github.io \
  bundle exec jekyll build -d /tmp/prod
grep -o 'href="[^"]*yixuan.css"' /tmp/prod/index.html    # expect /css/yixuan.css
grep -o '<link rel="canonical" href="[^"]*"' /tmp/prod/index.html
```

**A stale `_site` outlives its exclusion.** `jekyll serve` regenerates but does
not purge: a file copied into `_site` before it was added to `exclude:` keeps
being served from there. Adding a path to `exclude:` therefore needs
`rm -rf _site/<that path>` to take effect locally. This never reaches
production — GitHub Pages builds from the repository, where the same paths are
gitignored — but it will convince you locally that an exclusion is broken when
it is not.

**Verifying layout** — measure, do not eyeball a screenshot. Headless Chrome
clamps its viewport to a 500px minimum, so a `--window-size=390` screenshot
renders a 500px-wide layout into a 390px image and *looks* broken when it is
not. Check `document.documentElement.scrollWidth` against `window.innerWidth`
and dump the result via `--dump-dom`.

## CV workflow

The CV source lives in an **Overleaf project**, not in this repo. `cv/` is a git
clone of that project and is `.gitignore`d here. The only CV artifact this repo
tracks is `assets/docs/Yixuan_Yang_CV.pdf`.

- Overleaf project: <https://www.overleaf.com/project/6a8ee29d7baef092983f0948>
- Git remote: `https://git@git.overleaf.com/6a8ee29d7baef092983f0948`, branch `main`
- Auth: Overleaf Git token (`olp_…`) cached in the macOS keychain — no setup
  needed per-session. Overleaf's Git integration is a premium feature, granted
  through Duke's site licence (SSO login at overleaf.com/edu/duke).
- **Overleaf's compiler must stay set to XeLaTeX**, matching tectonic (also
  XeTeX-based). Under pdfLaTeX the tight one-page layout can reflow to two pages.

### Editing the CV

1. **Pull first, always** — Yixuan may have edited on Overleaf since last sync:
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
   cp cv/main.pdf assets/docs/Yixuan_Yang_CV.pdf
   ```
5. Commit `assets/docs/Yixuan_Yang_CV.pdf` in the **outer** repo.

**All five steps, every single time.** They are not optional and they are not
separable. This is a standing instruction from Yixuan, given after a CV edit
reached Overleaf but left the repository serving the previous PDF:

> 以后你改 CV，每改一次，只要我同意了，你同时要 push 这个 Overleaf，同时你也得
> 把它编译成 PDF。这样我本地打开随时能看到它已经变动了。当然你 push 之前也得
> 记得先拉下来，免得我自己改动。

So: **pull, edit, push, compile, copy** — and then commit the PDF when a commit
is authorised. Skipping step 1 risks clobbering an edit he made in Overleaf.
Skipping step 3 means the change never reaches the editor he opens. Skipping
4–5 means he opens the local PDF and sees the old one, which is exactly the
failure that produced this rule.

**Verify, do not assume.** A `replace` that matches one of two occurrences
looks like success. After compiling, check the change is actually in the
output, and check the page count is still 1:

```bash
pdftotext cv/main.pdf - | grep -c "the thing you removed"   # expect 0
pdfinfo cv/main.pdf | grep Pages                            # expect 1
md5 -q cv/main.pdf assets/docs/Yixuan_Yang_CV.pdf | uniq | wc -l   # expect 1
```

**Two repos, two commits.** `git status` in the outer repo never shows `cv/`
changes.

**Do not** switch compilers (no `pdflatex`, `latexmk`). Tectonic auto-fetches
missing packages on first run.

**Git bridge limits:** single branch, no force push, no submodules, no Git LFS,
symlinks get flattened. Never rewrite history in `cv/`.

## Cross-document consistency

Several facts live in **both** `_data/` and `cv/main.tex`. When editing one,
check whether the other needs updating in the same commit:

| Fact | Site | CV |
|---|---|---|
| Advisor / lab / affiliation | `_includes/section-biography.html` | Education, Research Experiences |
| Reviewer list | `_data/service.yml` | Academic Service line |
| Teaching / TA roles | `_data/service.yml` | Academic Service line |
| Government service | `_data/service.yml` | Government Service line |
| Research projects and dates | `_data/publications.yml` | Research Experiences |
| Publication venues and dates | `_data/publications.yml` | Publications |
| Research interests | `_data/profile.yml` | Research Interests line |

Some differences are **deliberate and approved** — do not "fix" them as sync
errors. The CV names venues in abbreviated form where the site spells them out,
and the CV omits submission status that the site shows.

**News → CV rule**: when a news entry describes a durable milestone (passed
qualification exam, new position, paper accepted, new award), the CV usually
needs a matching edit too. Flag this if only the news entry was requested.

## Writing style

- **No em dashes** in anything the site or CV renders. Yixuan finds they read
  as machine-written. Use a colon, a semicolon, or two sentences.
- Summaries are 250–400 characters. Lead with the problem, not the method name.
- Claim only what the work did. Sim-to-real transfer and imitation learning
  were **not** part of the General Robotics Lab project; do not imply otherwise.
- Each summary must stand alone. A reader may open any card first, so no
  entry may refer to "the same problem" as another.

## Git & deploy

- Each commit on `master` is a deploy unit.
- Commit messages: short, imperative, specific about the content changed. Look
  at `git log` for recent style; avoid generic messages like "update site".
- **Do not commit automatically.** Yixuan reviews changes and explicitly says
  "commit and push" (or just "commit"). If unclear, ask.
- Never commit LaTeX build intermediates (`*.aux`, `*.log`, `*.out`,
  `*.fdb_latexmk`, `*.fls`).

## Guard-rails — do not do without asking

- Rewrite `cv/main.tex`, a `_data/` file, or `css/yixuan.css` wholesale. Work
  is almost always additive: one news item, one entry, one rule.
- Introduce a build system (npm, Makefile, CI, GitHub Actions), a Jekyll plugin
  (GitHub Pages runs in safe mode and will silently ignore it), or swap LaTeX
  compilers.
- Add a CDN dependency. The only remote assets are Google Fonts and two icon
  fonts, both already loaded in `_includes/head.html`.
- Delete images, PDFs, or content that looks unreferenced — confirm first.
