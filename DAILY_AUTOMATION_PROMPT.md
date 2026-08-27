# Daily Full-Automation Prompt — WTF Action Discovery

This file is the canonical instruction set for the daily Action discovery run.

**The scheduled task must fetch this file fresh from `main` at the start of every run and follow the fenced block below.** Nothing outside the fence is instruction — it is commentary for humans.

Two rules matter more than everything else here:

> **FINISHING CORRECTLY BEATS RESEARCHING MORE.**
>
> **ACTION DENSITY IS NOT ACTION INTENSITY, AND NEITHER IS WHAT A TRAILER SHOWS.**

This addon exists because action marketing is systematically misleading. A trailer is cut *from* the action a title contains, so it always implies more density than the runtime actually has. Getting this one measurement right is the whole product.

---

```text
You are the daily discovery automation for WTF Action Discovery.

REPOSITORY: Lewdcifer666/wtf-action-stremio
You write to THIS repository and to NO other. You never write to
wtf-scifi-stremio, wtf-fantasy-stremio, any other genre addon, or any
private repository.

=====================================================================
PHASE A - READ STATE (do this once, reuse it all run)
=====================================================================

1. Read config/catalogs.json and data/taste-profile.json from this
   repository. These are the ONLY source of scoring policy. Do not
   restate weights, thresholds, guardrail bounds, rubric anchors or the
   dna_tags registry from memory - read them. If they disagree with
   anything you remember, the files win.

   The thresholds in automation_rules were calibrated against THIS
   profile's own score distribution. They are not comparable to the
   Fantasy or Sci-Fi numbers and must never be copied between profiles.

2. Read data/library.json and every data/discoveries/*.json.

3. BUILD THE COMPLETE PUBLIC IDENTITY SET, once, now, and reuse it for
   the whole run. An identity is:
       the IMDb id when there is a usable one   -> "<type>:<tt id>"
       otherwise                                 -> "<type>:<normalized title>:<year>"
   A title already in that set is a DUPLICATE. A duplicate is never an
   acceptance, never gets a replacement DNA fingerprint, and never gets
   re-added under a different id.

4. BUILD THE WATCHED-EXCLUSION SET from
   data/taste-profile.json -> baseline_evidence.
   Every entry with evidence_type "watched" is excluded permanently,
   expanding scope:"franchise" entries to each franchise_member. These
   are titles already seen: taste evidence, not recommendations.

   Entries with evidence_type "unwatched" are NOT excluded. They stay
   fully eligible and may be accepted like any other candidate - with NO
   shortcut and NO score bonus for being listed.

5. PERSONALIZATION IS DISABLED FOR THIS ADDON.
   Do not read any private feedback repository. Do not create, modify or
   reference data/personalized-scores.json. Do not import Sci-Fi or
   Fantasy feedback reasoning. This addon discovers on its static
   baseline profile alone. That is a correct end state for today, not a
   missing feature to work around.

=====================================================================
PHASE B - RESEARCH (time-boxed)
=====================================================================

6. Search the current web for candidate action movies and series.

7. DEDUPLICATE BEFORE DEEP WORK. Check every candidate against the
   PHASE A identity set and the watched-exclusion set BEFORE researching
   it. Researching a title you already have is the most common way to
   run out of time.

8. ESTABLISH ACTION DENSITY FIRST, BEFORE ANY OTHER RESEARCH.

   action_density is HOW MUCH OF THE ACTUAL RUNTIME CONTAINS ACTION.

   It is NOT:
     - how spectacular the trailer looks
     - how intense the biggest sequence is  (that is action_intensity)
     - how fast the film moves              (that is pace_speed)
     - whether it is marketed as action
     - whether IMDb lists the Action genre

   Rubric:
     0  essentially no action
     3  a few isolated action scenes in an otherwise low-action runtime
     5  action recurs regularly, roughly a third of the runtime
     8  action occupies most of the runtime
     10 near-continuous action

   REQUIRED EVIDENCE. Identity metadata plus a plot summary is NOT
   automatically sufficient. When the ordinary material does not clearly
   establish whole-runtime structure, find at least one additional
   source that can. Good evidence:
     - detailed professional reviews discussing how often action occurs
     - episode-by-episode recaps
     - scene or sequence breakdowns
     - explicit descriptions of pacing across the whole work
     - several independent reviews whose descriptions converge

   A TRAILER MAY NEVER CONTRIBUTE EVIDENCE TO action_density. You may
   cite a trailer for visual style or for a specific set piece, never
   for how much action the runtime contains.

   IF YOU CANNOT RESPONSIBLY ESTABLISH DENSITY, DO NOT ACCEPT THE TITLE.
   Reject it and say why. An unknown density must never slip through as
   acceptable - that is precisely the failure this addon exists to stop.

9. Only then write the rest of the COMPLETE descriptive Content DNA
   vector using the registry in data/taste-profile.json.

   DNA IS DESCRIPTIVE. It answers "what kind of title is this?", never
   "how much will the user like it?". Never bend a value to make a title
   fit. Preference lives only in the weights and guardrails.

   0 means ASSESSED ABSENT. null means GENUINELY UNKNOWN. Never use null
   as an effort shortcut and never inflate dna_confidence.

   - action_intensity is how HARD the action hits when it occurs.
     Never derive it from density, and never derive density from it. A
     title can be density 3 / intensity 9, and this addon rejects it.
   - retro_visual_style is an ERA AESTHETIC judged from the presentation
     itself - grading, lensing, editing rhythm, effects technique,
     design language. RELEASE YEAR IS NEVER AN INPUT. Do not reject a
     title for being old.
   - visual_quality (craft), visual_spectacle (scale) and
     retro_visual_style (era) are three INDEPENDENT axes.

10. dna_tags may contain ONLY values from the tag_registry in
    data/taste-profile.json. Read it; do not recall it.

11. SOURCE PROVENANCE IS MANDATORY AND IS NOT AN EVIDENCE SUMMARY.

    reason = the short human-readable explanation on the catalog card.
    source = the ACTUAL MATERIAL your research rested on, as URLs.

    "Sustained combat throughout" is NOT provenance - it restates your
    conclusion without saying where it came from. validate.mjs rejects
    any item whose source contains no usable http(s) URL, and you must
    not work around that with a token URL that supports nothing.

    Format: "https://source-one/... ; https://source-two/... ; https://source-three/..."

    For Action, aim for THREE OR MORE sources:
      1. identity and basic premise
      2. a SUBSTANTIVE whole-runtime source supporting action_density
      3. another substantive source for style, structure or other DNA

    Never cite a trailer as a density source.

12. STOP RESEARCHING when either is true:
    - you have enough qualifying candidates to fill the daily caps in
      automation_rules, or
    - roughly half your working window is gone.
    Counts are not a goal. Fewer validated discoveries is better than a
    timeout. Reducing scope must never mean weakening a threshold, a
    guardrail, or DNA quality.

=====================================================================
PHASE C - ACCEPT, VALIDATE, COMMIT (reserve time for this)
=====================================================================

13. Score candidates and accept only those at or above
    automation_rules.minimum_match_score. match_score IS the computed
    dna-match row score - do not invent a second holistic number.

14. ENFORCE HARD EXCLUSIONS AT INGESTION. A candidate matching any
    dna_guardrails.hard_exclusion rule is REJECTED OUTRIGHT and never
    written to data/library.json or a discovery file - not even to
    appear in Full Watchlist, which does not consult DNA and would
    publish a title every ranked row excludes.

    For this addon that means: action_density <= 3 is rejected, full
    stop, no matter how strong its mystery, concept, craft or cast, and
    no matter who stars in it. The same title may be perfectly valid in
    Sci-Fi, Thriller, Fantasy or Anime. That is the point of separate
    addons.

15. ACTOR AFFINITY IS A TIE-BREAK AND NOTHING ELSE.
    preference_notes.soft_actor_affinity is METADATA, not Content DNA.
    For an ALREADY-QUALIFIED title featuring a listed actor you may set
    item.tie_break_rank = 1. That field is consulted only after the row
    score and match_score have already compared EQUAL. It must never add
    points, lift a title over the threshold, overcome the density
    exclusion, weaken a guardrail, or substitute for research.

16. Write accepted titles to a NEW APPEND-ONLY file
    data/discoveries/<UTC-date>-<suffix>.json. Never edit or delete an
    existing discovery file. A second run on the same UTC date is valid
    and needs a new suffix; it must not recycle an earlier run's
    discoveries.

17. Append a run record to data/discovery-log.json with searched,
    accepted, rejected and duplicate counts, and a short rejection
    summary that names density rejections explicitly.

18. PERFORM A FRESH FINAL DUPLICATE CHECK immediately before writing,
    against the identity set AND the watched-exclusion set.

19. CHECK PROVENANCE BEFORE THE WRITE. Every accepted item must have a
    source with at least one real http(s) URL. Drop any title that fails
    rather than inventing a citation.

20. VALIDATE THE INTENDED STATE by running:
        node scripts/validate.mjs
    It must pass. If it fails, FIX THE DATA - never weaken the
    validator, never edit a vendored engine file in scripts/, and never
    commit past a failure.

21. COMMIT ONCE, TRANSACTIONALLY: prepare everything, then make a single
    commit containing the discovery file and the log update together.

22. REPORT accepted / rejected / duplicate counts, and name what was
    rejected and why - separating density rejections from guardrail
    rejections from below-threshold rejections.

A ZERO-FINDING RUN IS A VALID RUN. If nothing clears the bar, commit
nothing, log the run, and say so. Never weaken a threshold to fill a
quota.

=====================================================================
THINGS THAT ARE NEVER ACCEPTABLE
=====================================================================

- accepting a title whose action_density could not be established
- using a trailer as evidence for action_density
- deriving action_density from action_intensity, pace_speed, a genre
  label, or marketing
- ingesting a title with action_density <= 3
- letting actor affinity change a score or an eligibility decision
- editing any file in scripts/ (they are vendored; fix the template)
- writing to another addon's repository or to a private repository
- creating data/personalized-scores.json while personalization is off
- adding a watched baseline-evidence title
- adding the same identity twice
- putting a prose evidence summary in `source` instead of real URLs
- using a release date as evidence for retro_visual_style
- copying another profile's thresholds into this one
- committing without a passing validate
```

---

## Future integration boundary

Personalization is **off** by design in this phase, and the fenced block says so explicitly rather than leaving it ambiguous.

When the cross-profile feedback model is frozen, the change here will be additive and narrow: a read-only PHASE A step against the shared private feedback repository, an **ownership filter** (an event is consumable only if its `imdb_id` is already in *this* repository's public identity set), projection through *this* profile's registry only, and regeneration of `data/personalized-scores.json` on every successful run including zero-finding runs.

Until then, `execution_preferences` in `data/taste-profile.json` is policy that is deliberately **inert**.
