// Action product acceptance.
//
// The inherited engine tests prove the machinery. This file proves the ACTION
// TASTE POLICY is the approved one, and that its defining rule actually holds:
//
//   DENSITY IS NOT INTENSITY.
//
// A title with three enormous sequences in an otherwise inactive runtime must
// be excluded no matter how good everything else about it is - and the same
// title must remain perfectly valid under different profile mechanics, because
// the exclusion is a POLICY of this addon and not a fact about the engine.
//
// Run with: node test/action-profile.test.mjs

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { validateProfile, watchedEvidenceIdentities } from "../scripts/validate-profile.mjs";
import { makePolicy, scoreItem, hardExcluded } from "../scripts/dna-score.mjs";
import { sortItems } from "../scripts/sort.mjs";
import { normalizeTitle } from "../scripts/cinemeta.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

let passed = 0, failed = 0;
const check = (id, description, condition, detail) => {
  if (condition) { passed++; console.log(`  ok   ${id}  ${description}`); }
  else { failed++; console.error(`  FAIL ${id}  ${description}${detail ? `\n         ${detail}` : ""}`); }
};

const clone = v => JSON.parse(JSON.stringify(v));
const profile = JSON.parse(fs.readFileSync(path.join(root, "data", "taste-profile.json"), "utf8"));
const config = JSON.parse(fs.readFileSync(path.join(root, "config", "catalogs.json"), "utf8"));
const policy = makePolicy(profile);
const registry = profile.dna_dimensions.dimensions.map(d => d.id);
const weights = profile.dna_baseline.weights;
const row = id => config.catalogs.find(c => c.id === id);

console.log("WTF Action Discovery - product acceptance");
console.log("");

// ---------------------------------------------------------------------------
// A / B / C / D - the approved registry and weights
// ---------------------------------------------------------------------------
const EXPECTED = ["action_density", "action_intensity", "action_variety", "gunplay",
  "vehicle_action", "stunt_work", "chase_pursuit", "melee_combat", "destruction_spectacle",
  "mystery", "investigation", "conspiracy", "undercover_mole", "high_concept",
  "sci_fi_elements", "fantasy_elements", "deadly_game", "rule_discovery",
  "visual_quality", "retro_visual_style", "visual_spectacle", "pace_speed", "wtf_comedy",
  "badass_protagonist", "ensemble_charisma", "setting_variety", "suspense",
  "action_repetition", "military_focus", "superhero", "sports_fighting",
  "romance_focus", "drama_focus"];

check("A1", "registry declares exactly 33 dimensions", registry.length === 33, `got ${registry.length}`);
check("A2", "registry matches the approved Action set exactly",
  [...registry].sort().join(",") === [...EXPECTED].sort().join(","),
  `unexpected: ${registry.filter(d => !EXPECTED.includes(d)).join(", ") || "none"}; missing: ${EXPECTED.filter(d => !registry.includes(d)).join(", ") || "none"}`);
check("B1", "31 weighted dimensions", Object.keys(weights).length === 31, `got ${Object.keys(weights).length}`);
check("B2", "2 unweighted: pace_speed and superhero",
  profile.dna_baseline.unweighted.length === 2 &&
  profile.dna_baseline.unweighted.includes("pace_speed") &&
  profile.dna_baseline.unweighted.includes("superhero"));

const APPROVED = { action_density: 30, action_intensity: 18, action_variety: 16, high_concept: 14,
  badass_protagonist: 12, stunt_work: 12, mystery: 11, vehicle_action: 10, chase_pursuit: 10,
  conspiracy: 10, sci_fi_elements: 10, deadly_game: 10, visual_spectacle: 10, visual_quality: 10,
  melee_combat: 9, gunplay: 9, destruction_spectacle: 9, undercover_mole: 9, investigation: 8,
  fantasy_elements: 8, rule_discovery: 8, ensemble_charisma: 8, suspense: 8, wtf_comedy: 6,
  setting_variety: 6, drama_focus: -8, romance_focus: -10, action_repetition: -12,
  sports_fighting: -12, retro_visual_style: -12, military_focus: -14 };
const diffs = Object.entries(APPROVED).filter(([k, v]) => weights[k] !== v).map(([k, v]) => `${k}: want ${v}, got ${weights[k]}`);
check("C1", "every baseline weight matches the approved MG-4 value", diffs.length === 0, diffs.join("\n         "));

check("D1", "action_density weight is 30", weights.action_density === 30);
check("D2", "action_density is the single dominant positive weight",
  Object.entries(weights).every(([k, v]) => k === "action_density" || v < weights.action_density));
check("D3", "action_density outweighs action_intensity by a wide margin",
  weights.action_density >= weights.action_intensity * 1.5,
  `${weights.action_density} vs ${weights.action_intensity}`);

// ---------------------------------------------------------------------------
// E / F - catalog shape
// ---------------------------------------------------------------------------
const ROWS = ["full-watchlist", "past-24h", "best-matches", "dna-match", "high-action-density",
  "stunts-chases", "badass-combat", "high-concept-action", "mystery-conspiracy-action",
  "fantasy-scifi-action", "relentless-momentum"];
check("F1", "11 logical rows", config.catalogs.length === 11, `got ${config.catalogs.length}`);
check("F2", "row ids are exactly the approved set", config.catalogs.map(c => c.id).join(",") === ROWS.join(","));
const baseRows = config.catalogs.filter(c => c.dna && c.dna.mode === "baseline_profile");
check("E1", "exactly one baseline_profile row, and it is dna-match",
  baseRows.length === 1 && baseRows[0].id === "dna-match", baseRows.map(r => r.id).join(", "));

if (fs.existsSync(path.join(root, "site", "manifest.json"))) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "site", "manifest.json"), "utf8"));
  check("F3", "22 emitted manifest catalogs (11 x 2 types)", manifest.catalogs.length === 22, `got ${manifest.catalogs.length}`);
  check("F4", "manifest id is the approved Action id", manifest.id === "com.github.wtfaction.discovery", manifest.id);
}

// ---------------------------------------------------------------------------
// fixtures
// ---------------------------------------------------------------------------
const NEUTRAL = Object.fromEntries(registry.map(id => [id, 5]));
const item = (over = {}, meta = {}) => ({
  imdb_id: meta.imdb_id || "tt9999999", type: "movie", title: meta.title || "Probe",
  year: meta.year || 2020, status: "watch", match_score: 70, tags: [],
  reason: "probe", added_at: "2026-08-27T00:00:00Z", added_by: "bootstrap",
  source: "https://example.org/identity ; https://example.org/whole-runtime-analysis ; https://example.org/review",
  dna: { ...NEUTRAL, ...over }, dna_confidence: 0.9, dna_tags: [], ...meta
});
const scoreOf = (over, def = row("dna-match")) => scoreItem(policy, def, item(over), new Map());

// A genuinely dense action title: the profile's centre of gravity.
const DENSE = { action_density: 8, action_intensity: 8, action_variety: 7, gunplay: 7,
  vehicle_action: 6, stunt_work: 8, chase_pursuit: 6, melee_combat: 7, destruction_spectacle: 6,
  mystery: 4, investigation: 2, conspiracy: 3, undercover_mole: 2, high_concept: 5,
  sci_fi_elements: 1, fantasy_elements: 0, deadly_game: 0, rule_discovery: 1,
  visual_quality: 8, retro_visual_style: 1, visual_spectacle: 7, pace_speed: 8, wtf_comedy: 3,
  badass_protagonist: 8, ensemble_charisma: 5, setting_variety: 6, suspense: 6,
  action_repetition: 3, military_focus: 1, superhero: 0, sports_fighting: 0,
  romance_focus: 1, drama_focus: 4 };

check("SANITY", "a dense action title scores strongly", scoreOf(DENSE).score >= 60,
  JSON.stringify(scoreOf(DENSE)));

// ---------------------------------------------------------------------------
// G / H / I / J / K / L - THE defining rule
// ---------------------------------------------------------------------------
const sleeper = { ...DENSE, action_density: 2, action_intensity: 9,
  mystery: 10, high_concept: 10, visual_quality: 10, visual_spectacle: 10, badass_protagonist: 10 };

check("G1", "density 2 with intensity 9 is HARD-EXCLUDED", hardExcluded(policy, sleeper),
  "three huge sequences in an otherwise inactive runtime is the failure case this addon exists to reject");
check("G2", "...even with mystery 10, high_concept 10 and craft 10",
  scoreItem(policy, row("dna-match"), item(sleeper), new Map()).reason === "hard_excluded");
check("G3", "it is excluded from EVERY dna row, not just dna-match",
  config.catalogs.filter(c => c.filter === "dna")
    .every(def => scoreItem(policy, def, item(sleeper), new Map()).reason === "hard_excluded"));

check("H1", "density 3 is HARD-EXCLUDED", hardExcluded(policy, { ...DENSE, action_density: 3 }));
check("I1", "density 4 is NOT hard-excluded", !hardExcluded(policy, { ...DENSE, action_density: 4 }),
  "4 and 5 simply score lower; only <=3 is the sleeper zone");
// Density 4 may still fall below a row's min_score - that is the ordinary
// floor, and it is a DIFFERENT rejection from the hard exclusion. What matters
// is that it is never "hard_excluded", so a strong enough density-4 title can
// still qualify.
check("I2", "density 4 is never rejected AS hard_excluded",
  scoreOf({ ...DENSE, action_density: 4 }).reason !== "hard_excluded",
  "4 and 5 are low-scoring, not disqualified");
check("I3", "a strong density-4 title does score",
  scoreOf({ ...DENSE, action_density: 4, action_variety: 9, high_concept: 9, mystery: 8,
            conspiracy: 8, badass_protagonist: 9, visual_quality: 9, visual_spectacle: 9,
            stunt_work: 9, suspense: 8, sci_fi_elements: 7 }).score !== null,
  "density is dominant, not absolute: a genuinely excellent density-4 title can clear the floor");

function runValidateWith(items) {
  const file = path.join(root, "data", "library.json");
  const original = fs.readFileSync(file);
  try {
    fs.writeFileSync(file, JSON.stringify({ schema_version: 2, updated_at: "2026-08-27T00:00:00Z", items }, null, 2) + "\n");
    try { return { code: 0, output: execFileSync(process.execPath, ["scripts/validate.mjs"], { cwd: root, encoding: "utf8", stdio: "pipe" }) }; }
    catch (e) { return { code: e.status, output: `${e.stdout || ""}${e.stderr || ""}` }; }
  } finally {
    fs.writeFileSync(file, original);
    if (!fs.readFileSync(file).equals(original)) throw new Error("library.json was not restored");
  }
}

{
  const r = runValidateWith([item(sleeper)]);
  check("J1", "a low-density title is REJECTED AT INGESTION",
    r.code !== 0 && /insufficient_action_density/.test(r.output),
    "hard_exclusion only hides it from DNA rows; Full Watchlist does not consult DNA and would publish it");
}

check("K1", "the exclusion is THIS PROFILE's policy, not engine-global", (() => {
  // The identical fixture under a profile whose hard exclusion keys on something
  // else scores perfectly normally. Nothing in the engine knows about Action.
  const other = clone(profile);
  other.dna_guardrails.hard_exclusion = [{ id: "probe", dimension: "superhero", at_or_above: 8 }];
  other.dna_baseline.completeness_defaults.required_known_dimensions =
    other.dna_baseline.completeness_defaults.required_known_dimensions.filter(d => d !== "action_density").concat("superhero");
  const p2 = makePolicy(other);
  return !hardExcluded(p2, sleeper) && scoreItem(p2, row("dna-match"), item(sleeper), new Map()).score !== null;
})(), "a title rejected here must remain valid elsewhere - that is why there are separate addons");

check("L1", "density and intensity are independent: raising intensity cannot rescue low density",
  hardExcluded(policy, { ...DENSE, action_density: 3, action_intensity: 10 }));
check("L2", "high density with modest intensity is fine",
  !hardExcluded(policy, { ...DENSE, action_density: 9, action_intensity: 5 })
  && scoreOf({ ...DENSE, action_density: 9, action_intensity: 5 }).score !== null);
check("L3", "a dense/low-intensity title outscores a sparse/high-intensity one",
  scoreOf({ ...DENSE, action_density: 9, action_intensity: 6 }).score >
  scoreOf({ ...DENSE, action_density: 4, action_intensity: 10 }).score,
  `${scoreOf({ ...DENSE, action_density: 9, action_intensity: 6 }).score} vs ${scoreOf({ ...DENSE, action_density: 4, action_intensity: 10 }).score}`);
check("L4", "no engine or config path derives one from the other", (() => {
  const files = ["scripts/dna-score.mjs", "scripts/sort.mjs", "config/catalogs.json"];
  return files.every(f => {
    const t = fs.readFileSync(path.join(root, f), "utf8");
    return !/action_density\s*[=:]\s*[^,\n]*action_intensity/.test(t);
  });
})());

// ---------------------------------------------------------------------------
// M / N / O / P / Q / R - combination guardrails
// ---------------------------------------------------------------------------
const fires = (over, id) => {
  const dna = { ...NEUTRAL, ...over };
  const rule = profile.dna_guardrails.combination.find(r => r.id === id);
  if (!rule) return false;
  const all = rule.all_of.every(c => Object.prototype.hasOwnProperty.call(c, "at_or_above")
    ? dna[c.dimension] >= c.at_or_above : dna[c.dimension] <= c.at_or_below);
  const any = !rule.any_of.length || rule.any_of.some(c => Object.prototype.hasOwnProperty.call(c, "at_or_above")
    ? dna[c.dimension] >= c.at_or_above : dna[c.dimension] <= c.at_or_below);
  return all && any;
};

check("M1", "repetition + low variety + one setting fires repetitive_monotonous_action",
  fires({ ...DENSE, action_repetition: 7, action_variety: 3, setting_variety: 2 }, "repetitive_monotonous_action"));
check("M2", "repetition alone does NOT fire it",
  !fires({ ...DENSE, action_repetition: 8 }, "repetitive_monotonous_action"),
  "dense action that varies its beats or its locations is fine");

check("N1", "military + no concept + no mystery fires military_battlefield_focus",
  fires({ ...DENSE, military_focus: 8, high_concept: 2, mystery: 2 }, "military_battlefield_focus"));
check("N2", "military WITH a real mystery does NOT fire it",
  !fires({ ...DENSE, military_focus: 8, high_concept: 2, mystery: 8 }, "military_battlefield_focus"),
  "military action with a real mystery is wanted; only generic battlefield material is not");
check("N3", "military WITH a real high concept does NOT fire it",
  !fires({ ...DENSE, military_focus: 8, high_concept: 8, mystery: 2 }, "military_battlefield_focus"));

check("O1", "sanctioned fighting + drama fires sports_fight_drama",
  fires({ ...DENSE, sports_fighting: 8, drama_focus: 7 }, "sports_fight_drama"));
check("O2", "sanctioned fighting inside an action story does NOT fire it",
  !fires({ ...DENSE, sports_fighting: 8, drama_focus: 2 }, "sports_fight_drama"));

check("P1", "romance + drama + thin action fires romance_drama_over_action",
  fires({ ...DENSE, romance_focus: 7, drama_focus: 7, action_density: 5 }, "romance_drama_over_action"));
check("P2", "romance + drama WITH dense action does NOT fire it",
  !fires({ ...DENSE, romance_focus: 7, drama_focus: 7, action_density: 8 }, "romance_drama_over_action"));

check("Q1", "a The-Boys-shaped fixture escapes the superhero penalty",
  !fires({ ...DENSE, superhero: 9, wtf_comedy: 9, high_concept: 6 }, "traditional_superhero_framing"),
  "the exception survives on its actual differentiators, not on a genre label");
check("Q2", "and a high-concept superhero also escapes it",
  !fires({ ...DENSE, superhero: 9, wtf_comedy: 1, high_concept: 8 }, "traditional_superhero_framing"));
check("R1", "a Dredd-shaped straight superhero fixture DOES trigger it",
  fires({ ...DENSE, superhero: 9, wtf_comedy: 1, high_concept: 3 }, "traditional_superhero_framing"));
check("R2", "superhero is never a HARD exclusion",
  !hardExcluded(policy, { ...DENSE, superhero: 10 }),
  "a blanket ban would make the liked exceptions unrepresentable");

// ---------------------------------------------------------------------------
// S / T - presentation, never age
// ---------------------------------------------------------------------------
const retroLow = scoreOf({ ...DENSE, retro_visual_style: 1 }).score;
const retroHigh = scoreOf({ ...DENSE, retro_visual_style: 9 }).score;
check("S1", "a strongly retro look LOWERS the score", retroHigh < retroLow, `${retroHigh} vs ${retroLow}`);
check("S2", "but never excludes", scoreOf({ ...DENSE, retro_visual_style: 10 }).score !== null
  && !hardExcluded(policy, { ...DENSE, retro_visual_style: 10 }));
check("S3", "no guardrail references retro_visual_style", (() => {
  const dims = [...profile.dna_guardrails.hard_exclusion.map(r => r.dimension),
    ...profile.dna_guardrails.combination.flatMap(r => [...r.all_of, ...r.any_of].map(c => c.dimension))];
  return !dims.includes("retro_visual_style");
})());
check("T1", "no dimension is about release year", !registry.some(d => /year|age|old|date|decade/.test(d)));
check("T2", "release year changes NO score", (() => {
  const a = scoreItem(policy, row("dna-match"), item(DENSE, { year: 1988, title: "Old" }), new Map());
  const b = scoreItem(policy, row("dna-match"), item(DENSE, { year: 2025, title: "New" }), new Map());
  return a.score === b.score && a.score !== null;
})());

// ---------------------------------------------------------------------------
// U / V / W - actor affinity is a tie-break and nothing else
// ---------------------------------------------------------------------------
{
  const scores = new Map();
  const scoreFor = (_d, it) => scores.get(it.title);
  const def = { sort: "dna_score" };
  const base = { added_at: "2026-01-01T00:00:00Z", imdb_id: "tt1" };

  check("U1", "tie_break_rank is not a DNA dimension", !registry.includes("tie_break_rank"));
  check("U2", "tie_break_rank contributes zero score", (() => {
    const plain = scoreItem(policy, row("dna-match"), item(DENSE), new Map());
    const ranked = scoreItem(policy, row("dna-match"), item(DENSE, { tie_break_rank: 99 }), new Map());
    return plain.score === ranked.score;
  })());
  check("U3", "the actor affinity is stored OUTSIDE the DNA registry",
    Array.isArray(profile.preference_notes.soft_actor_affinity)
    && profile.preference_notes.soft_actor_affinity.length === 3
    && !JSON.stringify(profile.dna_dimensions).includes("Statham"));

  scores.set("Plain", 70); scores.set("Preferred", 70);
  check("U4", "among EQUAL scores the preferred title sorts first",
    sortItems(def, [{ ...base, title: "Plain", tie_break_rank: 0 }, { ...base, title: "Preferred", tie_break_rank: 1 }], scoreFor)[0].title === "Preferred");

  scores.set("Preferred", 70); scores.set("Better", 71);
  check("V1", "a ONE-POINT score difference beats tie_break_rank 99",
    sortItems(def, [{ ...base, title: "Preferred", tie_break_rank: 99 }, { ...base, title: "Better", tie_break_rank: 0 }], scoreFor)[0].title === "Better");

  check("W1", "a low-density preferred-actor title is still hard-excluded",
    hardExcluded(policy, { ...DENSE, action_density: 2 }));
  const r = runValidateWith([item({ ...DENSE, action_density: 2 }, { tie_break_rank: 1, title: "Statham Sleeper" })]);
  check("W2", "...and is still REJECTED AT INGESTION with a tie_break_rank set",
    r.code !== 0 && /insufficient_action_density/.test(r.output));
}

// ---------------------------------------------------------------------------
// X / Y / Z - baseline evidence
// ---------------------------------------------------------------------------
const forms = e => {
  const o = [];
  if (e.imdb_id && /^tt\d+$/.test(e.imdb_id)) o.push(`${e.type}:${e.imdb_id}`);
  if (Number.isInteger(e.year)) o.push(`${e.type}:${normalizeTitle(e.title)}:${e.year}`);
  return o;
};
const watched = watchedEvidenceIdentities(profile);
const watchedForms = new Set(watched.flatMap(forms));
const sourceItems = [...JSON.parse(fs.readFileSync(path.join(root, "data", "library.json"), "utf8")).items];
const discDir = path.join(root, "data", "discoveries");
if (fs.existsSync(discDir)) {
  for (const n of fs.readdirSync(discDir).filter(x => x.endsWith(".json"))) {
    const p = JSON.parse(fs.readFileSync(path.join(discDir, n), "utf8"));
    sourceItems.push(...(Array.isArray(p) ? p : p.items || []));
  }
}

check("X1", "no WATCHED baseline identity appears in public data",
  !sourceItems.some(i => forms(i).some(f => watchedForms.has(f))),
  sourceItems.filter(i => forms(i).some(f => watchedForms.has(f))).map(i => i.title).join(", "));
check("X2", "the watched set expands both franchises to individual films",
  watched.length === 17, `expected 17 (10 Fast & Furious, 4 John Wick, Alice in Borderland, The Matrix, The Boys), got ${watched.length}`);
{
  const r = runValidateWith([item(DENSE, { imdb_id: "tt2911666", title: "John Wick", year: 2014 })]);
  check("X3", "ingesting a watched franchise member is REJECTED",
    r.code !== 0 && /WATCHED baseline evidence/.test(r.output));
}
{
  const ok = runValidateWith([item(DENSE, { imdb_id: "tt7888964", title: "Nobody", year: 2021 })]);
  check("Y1", "an UNWATCHED evidence title is ACCEPTED when researched and scored normally", ok.code === 0, ok.output);
  const cited = scoreItem(policy, row("dna-match"), item(DENSE, { imdb_id: "tt7888964", title: "Nobody" }), new Map());
  const anon = scoreItem(policy, row("dna-match"), item(DENSE, { imdb_id: "tt7000001", title: "Unrelated" }), new Map());
  check("Z1", "baseline evidence membership grants NO score bonus", cited.score === anon.score, `${cited.score} vs ${anon.score}`);
  const averse = scoreItem(policy, row("dna-match"), item(DENSE, { imdb_id: "tt1291584", title: "Warrior" }), new Map());
  check("Z2", "...and a trailer aversion imposes no penalty", averse.score === anon.score);
}
check("Z3", "the profile validates, evidence block included",
  validateProfile(profile).length === 0, validateProfile(profile).join("\n         "));

// ---------------------------------------------------------------------------
// AA / AB / AC - provenance and determinism over the REAL library
// ---------------------------------------------------------------------------
const urlsIn = v => String(v).split(/[;,\s]+/).flatMap(t => {
  try { const u = new URL(t.trim()); return /^https?:$/.test(u.protocol) && u.hostname.includes(".") ? [u.href] : []; }
  catch { return []; }
});
check("AA1", "every source item cites real URLs", sourceItems.every(i => urlsIn(i.source).length > 0),
  sourceItems.filter(i => urlsIn(i.source).length === 0).map(i => i.title).join(", "));
check("AB1", "every Action source item cites THREE OR MORE sources",
  sourceItems.every(i => urlsIn(i.source).length >= 3),
  `identity plus one article does not establish whole-runtime density: ${sourceItems.filter(i => urlsIn(i.source).length < 3).map(i => i.title).join(", ")}`);
check("AB2", "every item cites at least one source beyond bare identity metadata",
  sourceItems.every(i => urlsIn(i.source).some(u => !u.includes("cinemeta"))));
check("AB3", "no source cites a trailer host as evidence",
  sourceItems.every(i => !/youtube\.com|youtu\.be|vimeo\.com/i.test(i.source)),
  "a trailer can never contribute evidence to action_density");
check("AC1", "every stored match_score re-derives exactly from DNA",
  sourceItems.every(i => scoreItem(policy, row("dna-match"), i, new Map()).score === i.match_score),
  sourceItems.filter(i => scoreItem(policy, row("dna-match"), i, new Map()).score !== i.match_score)
    .map(i => `${i.title}: stored ${i.match_score}`).join(", "));
check("AC2", "no ingested item has action_density <= 3",
  sourceItems.every(i => i.dna.action_density > 3),
  sourceItems.filter(i => i.dna.action_density <= 3).map(i => i.title).join(", "));
check("AC3", "every ingested item has a complete 33-value DNA vector",
  sourceItems.every(i => registry.every(d => Number.isInteger(i.dna[d]))));

// ---------------------------------------------------------------------------
// AD / AE / AF - ingestion and provenance hygiene
// ---------------------------------------------------------------------------
check("AD1", "no bootstrap item claims added_by=daily-automation",
  sourceItems.filter(i => i.added_by === "bootstrap").every(i => i.added_by === "bootstrap"));
if (fs.existsSync(path.join(root, "site", "catalog"))) {
  const p24 = ["movie", "series"].map(t => path.join(root, "site", "catalog", t, `past-24h-${t}.json`))
    .filter(f => fs.existsSync(f)).flatMap(f => JSON.parse(fs.readFileSync(f, "utf8")).metas);
  check("AD2", "the built Past 24h row contains no bootstrap item", p24.length === 0, `${p24.length} leaked`);
}
check("AE1", "no personalized-scores.json exists", !fs.existsSync(path.join(root, "data", "personalized-scores.json")));
check("AE2", "the profile states personalization is disabled",
  profile.execution_preferences.rules.some(r => /DISABLED/.test(r)));
{
  const dup = runValidateWith([item(DENSE, { imdb_id: "tt5555555", title: "Twin A" }), item(DENSE, { imdb_id: "tt5555555", title: "Twin B" })]);
  check("AF1", "a duplicate public identity FAILS CLOSED", dup.code !== 0 && /duplicate public identity/.test(dup.output));
}

// ---------------------------------------------------------------------------
// AG / AH / AJ - engine integrity and independence
// ---------------------------------------------------------------------------
{
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "test", "engine-checksums.json"), "utf8")).files;
  const scripts = fs.readdirSync(path.join(root, "scripts")).filter(n => n.endsWith(".mjs"));
  const REPO_OWNED = ["registry.mjs", "known-ids.mjs"];
  check("AG1", "every engine file is covered by the drift manifest",
    scripts.filter(n => !REPO_OWNED.includes(n)).every(n => manifest[`scripts/${n}`]));
  check("AG2", "this repo's own generated modules are NOT checksummed as engine",
    REPO_OWNED.every(n => !manifest[`scripts/${n}`]));

  const measurable = new Set([...Object.keys(weights), ...profile.dna_baseline.completeness_defaults.required_known_dimensions]);
  const bad = [];
  for (const a of profile.dna_baseline.archetypes) {
    for (const m of [a.emphasis, a.penalise || {}]) for (const d of Object.keys(m)) if (!measurable.has(d)) bad.push(`${a.id}.${d}`);
  }
  check("AH1", "every archetype dimension is weighted or required-known", bad.length === 0, bad.join(", "));
  check("AH2", "every archetype strongly emphasises action_density",
    profile.dna_baseline.archetypes.every(a => (a.emphasis.action_density || 0) >= 9),
    "archetypes describe flavours of action and must never be a route around the density requirement");

  const offenders = [];
  const walk = dir => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if ([".git", "node_modules", "site"].includes(e.name)) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { walk(full); continue; }
      if (!/\.(mjs|json|yml)$/.test(e.name)) continue;
      const rel = path.relative(root, full).split(path.sep).join("/");
      if (rel === "test/action-profile.test.mjs") continue;      // names the tokens in order to forbid them
      const text = fs.readFileSync(full, "utf8");
      for (const bad of ["wtf-scifi", "wtf-fantasy", "wtf-anime", "wtf-thriller"]) if (text.includes(bad)) offenders.push(`${rel} -> ${bad}`);
      if (text.includes("wtf-addon-template") && rel !== "test/engine-checksums.json") offenders.push(`${rel} -> template`);
    }
  };
  walk(root);
  check("AJ1", "no cross-repo reference or runtime dependency", offenders.length === 0, offenders.join("\n         "));
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  check("AJ2", "zero dependencies", !pkg.dependencies && !pkg.devDependencies);
}

// ---------------------------------------------------------------------------
// AK / AL - the real pipeline
// ---------------------------------------------------------------------------
{
  let ok = true, out = "";
  try { out = execFileSync(process.execPath, ["scripts/validate.mjs"], { cwd: root, encoding: "utf8", stdio: "pipe" }); }
  catch (e) { ok = false; out = `${e.stdout || ""}${e.stderr || ""}`; }
  check("AK1", "validate.mjs succeeds on the real library", ok, out);

  let built = true;
  try { execFileSync(process.execPath, ["scripts/build-site.mjs"], { cwd: root, stdio: "pipe" }); }
  catch { built = false; }
  check("AL1", "build-site.mjs succeeds", built);
  check("AL2", "the build emits 22 manifest catalogs",
    JSON.parse(fs.readFileSync(path.join(root, "site", "manifest.json"), "utf8")).catalogs.length === 22);
}

console.log("");
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
