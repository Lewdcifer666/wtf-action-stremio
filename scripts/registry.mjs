// GENERATED ONCE AT SCAFFOLD TIME - this repo's frozen DNA vocabulary.
//
// This is the one file the generator writes from the profile rather than
// copying verbatim, and it is what lets validate-profile.mjs stay genre-neutral
// and vendored. The guard it feeds is deliberately strict: data/taste-profile.json
// must declare EXACTLY these dimensions and EXACTLY these tags, no more and no
// fewer, so a typo becomes a loud failure instead of quiet new metadata.
//
// Changing this list is a schema decision. It means a registry version bump, a
// migration for every already-enriched record, and a review of every consumer -
// never a casual edit.

export const CANONICAL_DIMENSIONS = [
  "action_density",
  "action_intensity",
  "action_variety",
  "gunplay",
  "vehicle_action",
  "stunt_work",
  "chase_pursuit",
  "melee_combat",
  "destruction_spectacle",
  "mystery",
  "investigation",
  "conspiracy",
  "undercover_mole",
  "high_concept",
  "sci_fi_elements",
  "fantasy_elements",
  "deadly_game",
  "rule_discovery",
  "visual_quality",
  "retro_visual_style",
  "visual_spectacle",
  "pace_speed",
  "wtf_comedy",
  "badass_protagonist",
  "ensemble_charisma",
  "setting_variety",
  "suspense",
  "action_repetition",
  "military_focus",
  "superhero",
  "sports_fighting",
  "romance_focus",
  "drama_focus"
];

export const CANONICAL_DNA_TAGS = [
  "heist",
  "car_chase",
  "gun_fu",
  "martial_arts",
  "assassin",
  "revenge",
  "siege",
  "survival_run",
  "prison",
  "cartel",
  "espionage",
  "hacker",
  "street_race",
  "arena",
  "post_apocalyptic",
  "cyberpunk",
  "urban_night",
  "desert",
  "jungle",
  "one_location"
];

// The single deliberate exception to the shared absent..dominant scale:
// pace_speed measures slow..fast. Exactly one dimension may be slow_to_fast.
export const SLOW_TO_FAST_DIMENSION = "pace_speed";
