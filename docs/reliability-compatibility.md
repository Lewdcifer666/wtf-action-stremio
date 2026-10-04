# Action compatibility audit

Prepared against `1a72d926bd89e8b000146ab9e8454538db021f01`. This is a dormant
code migration; its local validation does not satisfy the live Thriller pilot
gate or authorize changing the saved task, publisher installation or settings.

The existing profile, catalog configuration, frozen registry, seed identities,
library, discoveries, run logs, rejections, compact state and personalization
files retain their original bytes. Existing package scripts and the Pages
schedule (`42 * * * *`) are preserved. The discovery task stays at 10:00
Europe/Berlin with its existing rotator.

Action has 33 DNA dimensions, 31 weighted dimensions, a minimum of 22 known
dimensions, confidence floor 0.6 and 16 explicitly required-known dimensions.
The unchanged DNA Match scorer requires the union of weighted and required-known
dimensions: only `pace_speed` may be null for a new otherwise eligible item.
Unknown is never zero. Publication and best thresholds remain 60 and 70;
daily limits remain five movies and three series. The action-density <= 3
hard exclusion and all existing archetypes and combination penalties remain.

The old product acceptance test dynamically required all public DNA dimensions
to be integers, beyond the profile's declared semantics. That census remains
for legacy and bootstrap items. Only new items associated with a version 1
publication-provenance run log use the profile/scorer eligibility check and
integer/null representation. Merely setting `added_by` does not qualify.
Regression fixtures finalize a candidate with unknown `pace_speed`, run source
and Action acceptance validation, and prove required-known/weighted unknowns
still fail. Removing the corresponding log provenance restores the strict
legacy census and fails that fixture.

The existing active acceptance checks require at least three source documents,
substantive evidence beyond bare Cinemeta metadata, and no YouTube, youtu.be or
Vimeo evidence. Research intake preserves these checks; the runbook continues
to require whole-runtime density evidence independently from peak intensity.

Historical `tie_break_rank` remains optional metadata and the sorter remains
unchanged: it breaks ties only after row score and match_score, never changes
eligibility or scores, and does not reorder the newest feed. Existing rank
values are preserved. The revised closed packet contract does not accept
AI-authored ranking hints; new items use the existing omitted-field default
zero. Future deterministic cast-affinity derivation requires a separately
reviewed design rather than inventing a new packet ranking field.

The only new dependency is pinned Ajv 8.20.0. The old zero-dependency assertion
now verifies exactly that dependency and no development dependencies. No
cross-repository runtime dependency was introduced. Private feedback learning
remains required unfinished work, and this migration neither activates nor
refreshes personalization.
