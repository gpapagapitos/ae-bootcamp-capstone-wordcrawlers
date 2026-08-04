# Decisions

Key design and process decisions made during development. Ordered by date; most recent
first. Consult before opening a spec or starting implementation work.

---

## 2026-08-04 — Board game rules fidelity level

Decision: **Hybrid fidelity** (spec 009).
Keep the roguelite framing (branching map, meta-progression, hero kits, save/resume) but
replace core combat/economy rules with the literal Paperback Adventures board-game systems
wherever an equivalent exists.

Implications:
- Splay direction (left/right) is now required for every word submission.
- Top-card-only ability + fatigue replaces the earlier "lowest rarity fatigues" rule.
- Hex and Boon replace the earlier single-resource model.
- Enemy Vowel pseudo-card is a formal mechanic, not an optional flourish.
- Repeat-word penalty is fully removed — the board game has no such rule.
- Spec 009 supersedes conflicting requirements in specs 001–003.

---

## 2026-07-31 — Repeat-word penalty dropped

Decision: penalty removed, aligning with spec 009 ruling above.
Previous decision (−10% per repeat, capped at −40%) is superseded; do not re-introduce.

---

## 2026-07-31 — Dictionary strictness

Decision: strict local word set only (MVP). No fuzzy matching.
Rationale: core skill expression is vocabulary; fuzzy mode blurs that.
Post-MVP: fuzzy/accessibility mode may be added as an opt-in flag.

---

## 2026-07-31 — Combat pacing target

Decision: "snappy tactical" — fast turn resolution, meaningful sequencing.
Slay the Spire-style decision quality; Balatro-like flow speed.
Max acceptable turn resolution after word submit: 8 seconds.

---

## 2026-07-31 — Frontend rendering stack

Decision: React + Vite + Zustand. PixiJS for effects.
Rejected: Godot (toolchain split), Three.js (overkill for 2D card UI).
See `docs/stack-decision.md` for full rationale.

---

## 2026-07-31 — Two heroes in MVP, one act + boss

Decision: Duelist and Arcanist. One act, one boss.
Rationale: replayability without overproducing content before core loop is validated.

---

## 2026-07-31 — Save envelope format

Decision: schema-versioned JSON with CRC32 checksum, stored in localStorage.
Two slots: `current` and `previous` (auto-backup). Atomic temp→current write.
Cloud save out of scope for MVP.

---

## 2026-07-31 — Y classification in dictionary

Decision: auto-classified by dictionary validity; no player toggle in MVP.
Aligns with the board game FAQ "whichever is friendliest to the player" policy.
