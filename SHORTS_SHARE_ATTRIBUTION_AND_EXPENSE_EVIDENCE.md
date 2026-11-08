# Paid Video Share Attribution and Verified Expense Evidence

## Share attribution

1. An authenticated sharer uses `POST /api/monetag/share-attribution` to create a random, server-owned share token.
2. The returned URL points to `/shorts?v=<videoId>&ref=<shareId>`.
3. When the buyer starts checkout, `PaidVideoGate` submits the token to `/api/monetag/share-attribution/claim` using the buyer's Firebase ID token.
4. The claim endpoint checks that the token exists, belongs to the same video, was created within the last seven days, and is not a self-share or creator-share.
5. Checkout only stores the sharer UID if the buyer-scoped claim exists. A missing/invalid attribution never invents a sharer; the 20% allocation remains unallocated.

A share claim proves use of the referral link, not that a human viewed the page for a minimum duration. Do not treat it as proof of an ad impression or watch completion.

## Verified expense evidence

1. Admin creates an expense record through `POST /api/admin/shorts/expenses` with a paid-video `orderId`, invoice number, integer `amountPaise`, description, and evidence path.
2. Upload the invoice file to Firebase Storage at `shorts-expense-evidence/<orderId>/<fileName>` (PDF/JPEG/PNG/WebP, max 10 MiB).
3. Set Firebase Storage custom metadata exactly: `orderId`, `invoiceNumber`, and `uploadedByUid` (the UID of the admin who created the expense record).
4. A Super Admin calls `POST /api/admin/shorts/expenses/verify` with the `expenseId`.
5. The verifier checks that the object exists, has an allowed MIME type and size, and that the metadata matches the Firestore expense record. Only then is status changed to `verified` and the `gs://` evidence reference saved.
6. Teacher referral net-profit reconciliation subtracts only expenses with `status=verified`, INR currency, integer paise, and a non-empty evidence reference.

Expense verification is an administrative accounting control, not an automatic determination of tax deductibility or legal validity. Keep the original invoices and have an accountant review them.

## Deployment notes

- Ensure Firebase Admin service account has read access to the configured Storage bucket.
- Keep Firebase Storage write access to this path restricted to authorized finance/admin uploaders; do not make the path publicly writable.
- Run the API contract tests, Firestore/Storage rules tests, TypeScript check, and production build before deployment.
- Paid checkout and payouts remain disabled until Cashfree sandbox end-to-end tests and financial reconciliation are signed off.
