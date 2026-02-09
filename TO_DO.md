# TO_DO List (TDG)

## Critical Issues
- [ ] **Tower upgrade cost is not deducted** when an upgrade is applied. This breaks the upgrade mechanic and money system.
- [ ] **Saved towers lose `tier` information** after re‑loading a game. Persisting tower tiers is essential for gameplay continuity.

## Other Actions
- [ ] Review and update upgrade system logic (tier 1–3). Ensure cost calculation and payment are handled correctly.
- [ ] Verify serialization / deserialization of tower data (upgrade tier, position, etc.) during save/load.
- [ ] Add unit tests for upgrade cost deduction and tier persistence.
- [ ] Refactor Game class into modules if needed to improve maintainability.
- [ ] Update README & changelog once these critical fixes are confirmed.
