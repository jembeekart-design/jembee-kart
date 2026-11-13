# Creators module

Owns public creator-profile projections and private creator/teacher dashboard projections.

The dashboard currently samples at most the up to 100 matching creator video documents across the existing `userId` and `creatorId` fields. These are explicitly a bounded sample, not lifetime totals. Earnings remain unavailable until a verified, reconciled settlement-ledger read model is implemented. Teacher verification status is displayed separately from referral eligibility; this module never grants referral eligibility.
