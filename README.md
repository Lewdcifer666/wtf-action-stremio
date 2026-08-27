# wtf-action-stremio

WTF Action Discovery - Automated action that actually runs on action: high density across the whole runtime, stunts, chases and combat, plus high-concept, conspiracy, sci-fi and deadly-game hooks. Titles with three big sequences and ninety quiet minutes are excluded on purpose.

**Manifest ID:** `com.github.wtfaction.discovery`

## Catalog rows

- Full Watchlist
- 🔥 Past 24h Findings
- ⭐ Best Matches
- 🧬 DNA Match
- 💥 High Action Density
- 🏎️ Stunts & Chases
- 🥊 Badass Combat
- 🌀 High-Concept Action
- 🕵️ Mystery / Conspiracy Action
- 🚀 Fantasy / Sci-Fi Action
- ⚡ Relentless Momentum

Each row is emitted for both `movie` and `series`, so Stremio shows 22 catalogs.

## Independence

This repository is self-contained. It has no runtime or build-time dependency on
any other WTF Discovery addon, on their GitHub Pages deployments, or on the
scaffold generator that created it. It validates, builds and deploys alone.

## The vendored engine

Everything in `scripts/` except `registry.mjs` and `known-ids.mjs` is vendored
verbatim from the canonical template and **must not be edited here**.
`test/engine-checksum.test.mjs` fails if one of those files changes locally.
Engine changes go into the template first, then get regenerated into every repo.

`registry.mjs` (this addon's frozen DNA vocabulary) and `known-ids.mjs` are
generated once from this addon's own profile and are owned by this repository.

## Commands

```bash
npm test              # full suite, production-state census last
npm run validate      # fail-closed validation of data/ against the profile
npm run build         # build site/ (manifest + catalog JSON)
```
