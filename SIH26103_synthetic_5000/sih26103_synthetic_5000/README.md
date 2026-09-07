# SIH26103 Synthetic Dataset — 5,000 Projects

**SYNTHETIC DATA — NOT OFFICIAL PAIMANA/MoSPI DATA**

This package contains 5,000 synthetic infrastructure projects and 24 monthly reporting snapshots per project (120,000 project-month records), plus related milestones, issues, outcomes, identity mappings, historical failure cases, predictions, source records, data-quality events, and sector indicators.

Generation is deterministic/reproducible with seed 26103.

The latent project behavior profiles used to make trajectories realistic are generation-only constructs and are NOT included as model features.

Recommended use:
1. Load projects and related tables into PostgreSQL.
2. Run validation and feature engineering.
3. Train/evaluate models using project-level and chronological splits.
4. Keep this dataset visibly labelled synthetic in the UI and demo.

Important: The April 2026 values are synthetic test/validation-style records and must not be represented as official government observations.
