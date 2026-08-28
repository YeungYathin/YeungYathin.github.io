# assets/docs

Documents the site links to, and therefore serves.

| File | Linked from |
|---|---|
| `Yixuan_Yang_CV.pdf` | the top bar, and the CV icon in the sidebar |
| `learning-to-say-no-ece590-2024.pdf` | the *Learning to Say No* entry: its title and its `[Paper]` link |

`Yixuan_Yang_CV.pdf` is a build artifact, not a source. It must mirror
`cv/main.pdf`, which is compiled from the Overleaf project cloned at `cv/`.
See "CV workflow" in `CLAUDE.md`; changing the CV without refreshing this file
leaves the site serving a stale one.

Reference-only full texts live in `assets/papers/`, which is excluded from the
build.
