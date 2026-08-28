# assets/papers

Full texts, kept as reference for writing and checking the summaries on the
site. **Nothing here is served.** `_config.yml` excludes this whole directory
from the Jekyll build, and no page links into it.

That is deliberate, and it is not only about weight. Two of these are publisher
versions -- ACM for SniffySquad, IEEE for the CEC paper -- and re-hosting a
publisher PDF is a copyright question the site does not need to answer. Every
entry on the site already links to the publisher or to arXiv for its full text.

A PDF the site *does* link to belongs in `assets/docs/`, which is served. That
is the whole distinction between the two directories.

| File | Entry it backs |
|---|---|
| `clin-jepa-arxiv-2026.pdf` | Clin-JEPA (arXiv:2605.10840) |
| `olfactory-sensing-hotmobile-2024.pdf` | Olfactory Sensing in Turbulent Airflow (HotMobile 2024) |
| `sniffysquad-tosn-2026.pdf` | SniffySquad (ACM TOSN, Feb 2026) |
| `uflp-problem-reduction-cec-2024.pdf` | Learning-Based Problem Reduction (IEEE CEC 2024) |

`unitree_rl_gym-main.zip` is a code drop kept for reference. It is gitignored
(`*.zip`) and has never been in the repository.

Names are `<short-title>-<venue>-<year>.pdf`. The previous names were hand-made
and one of them actively misled: `GasHunter-Poster.pdf` is the HotMobile paper
titled *Olfactory Sensing in Turbulent Airflow via Collaborative Robots*.
GasHunter is the project name used on the CV, not the paper's title.
