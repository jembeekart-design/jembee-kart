# JEMBEE PLAY Architecture

This directory contains architecture decisions, module contracts, and migration records.

- See `../ARCHITECTURE_AUDIT_PHASE_04_05_2026-11-13.md` for the Phase 04–05 source audit and target Modular Monolith map.

Architecture changes must preserve existing route contracts and Firestore document/collection schemas unless an explicit migration plan, backup, and approval are recorded. Keep payment settlement and moderation writes server-side.
