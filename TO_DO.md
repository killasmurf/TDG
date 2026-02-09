# TO_DO List (TDG)

## Critical Issues
- [x] **Tower upgrade cost is not deducted** when an upgrade is applied. This breaks the upgrade mechanic and money system.
- [x] **Saved towers lose `tier` information** after re‑loading a game. Persisting tower tiers is essential for gameplay continuity.

## Other Actions
- [ ] Review and update upgrade system logic (tier 1–3). Ensure cost calculation and payment are handled correctly.
- [ ] Verify serialization / deserialization of tower data (upgrade tier, position, etc.) during save/load.
- [ ] Add unit tests for upgrade cost deduction and tier persistence.
- [ ] Refactor Game class into modules if needed to improve maintainability.
- [ ] Update README 📖 & changelog once these critical fixes are confirmed.
- [ ] **Design & implement mountain path / mountain‑top background** for the base map.
- [ ] Add a new tile type `mountain` with an appropriate texture/colour.
- [ ] Update `MapEditor` to support rendering the mountain background.
- [ ] Ensure tower placement logic respects terrain constraints (e.g., cannot place towers on water, may or may not place on mountains).
- [ ] Write unit tests for map rendering and terrain placement.
- [ ] **Add a PowerShell script that lists all *.js, *.ts, *.tsx files in the repository**.
- [ ] Use the script in CI to generate a file of paths for further analysis.
- [ ] Fix the PowerShell Get-ChildItem usage: use -Include or a single -Filter with a pattern that includes all three extensions.
- [ ] Document the correct command: `Get-ChildItem -Recurse -Path '.' -Include *.js, *.ts, *.tsx -File`.
- [ ] Capture the output into a cached file (e.g., 'code_files.txt').

## Notes
### Last Updated: 2026‑02‑09 19:50:00
- Working directory: C:\Users\Adam Murphy\AI\TDG
- Once given a task, immediately update your todo with all explicit and implicit requirements.
