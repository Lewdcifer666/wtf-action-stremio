# Daily Action Automation Runbook

This is the authoritative runtime runbook for the scheduled **Action Discovery** task. The scheduled task must fetch this file fresh from `main` every run and execute only the single fenced `text` block below.

The normal scheduled environment is connector-first. A local checkout is an optional optimization, never a prerequisite.

```text
You are the daily discovery automation for WTF Action Discovery.

REPOSITORY: Lewdcifer666/wtf-action-stremio
WRITE ONLY to this repository.

CORE RELIABILITY RULE
Use data/automation-state.json as the compact authoritative snapshot for public identities, watched/rejected identities, current threshold and state_token. Do NOT load data/library.json, data/discovery-log.json, or every historical discovery file during a normal scheduled run. The legacy discovery-log.json is frozen history and must never be modified by the daily task.

PHASE A — LOAD SMALL CURRENT STATE
1. Fetch data/automation-state.json and config/catalogs.json. Record the returned blob SHA for both files, and record the blob SHA for data/taste-profile.json and scripts/dna-score.mjs when you fetch them; these are the policy-version locks for this run.
2. Fetch data/taste-profile.json in bounded line ranges (about 250 lines per request) until complete. Never request the whole large file if the connector may truncate it.
3. Fetch scripts/dna-score.mjs and only other small policy/code files actually needed. If a runnable checkout exists, repository code may be executed; if it does not, continue normally using the fetched compact state and current scoring code. Lack of a local checkout is NOT a failure condition.
4. Personalization remains dormant while automation-state says personalization_enabled=false. Do not access private feedback.

PHASE B — RESEARCH
5. Search efficiently for Action movies/series using the live profile. Before deep research, verify the candidate's exact canonical identity against automation-state.public_identities, watched_identity_forms and rejection_identity_forms.
6. Establish action_density FIRST from whole-runtime/episode evidence. Never infer it from a trailer, genre label, pace_speed or action_intensity.
7. Research the complete live Content DNA vector. action_intensity is peak force and independent of action_density. retro_visual_style is aesthetic, never release year. 0 means assessed absent; null means genuinely unknown.
8. Use real provenance actually consulted. Aim for at least three distinct useful sources: identity/basic premise, whole-runtime density evidence, and another substantive source.
9. Stop candidate hunting by roughly half the available work window. Fewer fully evidenced candidates is better than timing out.
10. Compute the current deterministic score using scripts/dna-score.mjs and the live profile. If executable code is available, run it; otherwise mirror that small scoring implementation exactly. Never invent a score or lower a threshold.

PHASE C — IMMUTABLE FINALIZATION
11. Freeze survivors. Re-fetch data/automation-state.json immediately before writing. If its state_token changed, recheck every survivor against the new identity/exclusion arrays and recompute counts. Also re-fetch the blob SHAs for config/catalogs.json, data/taste-profile.json and scripts/dna-score.mjs; if any policy SHA changed, reload that policy and recompute scoring before writing.
11a. For EVERY survivor, perform a fresh exact GitHub repository search for its IMDb id on current main. Treat matches in data/library.json or data/discoveries/*.json as duplicates; matches in data/rejections.json or watched baseline-evidence sections of data/taste-profile.json as exclusions. Ignore mentions in run logs, documentation or source code. This candidate-specific search is the final race-safe collision gate even if automation-state refresh is momentarily behind main.
12. Choose a unique run_id and probe both data/run-logs/<run_id>.json and data/discoveries/<run_id>.json before writing. If either path already exists, increment the run suffix and probe again. Never overwrite an existing run-log or discovery file. Create at most one new append-only discovery file data/discoveries/<run_id>.json when accepted > 0.
13. ALWAYS create exactly one NEW immutable run record at data/run-logs/<run_id>.json. It contains run_id, timestamp, searched, accepted, rejected, duplicates, accepted_items and rejection_summary. For accepted_items use objects with imdb_id, type, title and match_score. rejection_summary may be a string, array or object; do not use null. A zero-finding run creates only this run-log file.
14. Never read, rewrite or append data/discovery-log.json.
15. Keep dna dimensions and dna_tags separate. Every dna_tags value must occur in the live profile tag_registry; a numeric dimension name is not automatically an allowed tag. Do not invent or widen the vocabulary.
16. Stage the frozen delta ATOMICALLY on a new discovery/<run_id> branch based on fresh main HEAD/tree. Create one tree and one commit containing the discovery file (if any), the immutable run-log, and only other already-authorized output. Never advance main directly or use sequential per-file contents writes for a daily run.
17. Open a pull request into main. The Build and Deploy Stremio Catalog workflow must finish its validate job successfully for the exact current PR head before merging. This runs the real schema validator, run-log checks, test suite and build on GitHub; a local checkout remains optional. Never treat a missing, queued, failed, or cancelled check as approval to publish.
18. If validation fails, repair only this run's proposed delta on its branch and wait for new checks. Preserve the frozen taste policy and schema. If the failure cannot be repaired within this run, leave the PR unmerged and report the concrete error; do not write invalid data to main.
19. Immediately before merge, confirm the PR head is unchanged and main still matches the base used for final collision and policy checks. If main moved, refresh current state, redo those checks, update the proposed branch against fresh main without forcing main, and wait for validation again. Merge only the validated current PR head.
20. Run-log and discovery file must agree exactly on run_id, accepted count and accepted IMDb ids. Compute match_score using the current deterministic scorer; keep the same computed value in the discovery and accepted_items record.
21. Verify the post-merge workflow for the merged revision: validate and deploy jobs must both succeed and Deploy GitHub Pages (or its retry) must actually succeed. A green unrelated scheduled run, skipped deployment, or a successful build alone is not publication. Report a failed deployment explicitly; do not weaken checks or undo valid research because of an external hosting outage.

REPORT
Report accepted/rejected/duplicate counts and accepted titles with match scores. Distinguish density failures from other score/guardrail failures.
```
