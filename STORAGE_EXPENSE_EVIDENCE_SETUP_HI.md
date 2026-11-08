# Shorts Expense Invoice Evidence — Firebase Storage Setup

Firebase Storage rules are deployed with `firebase deploy --only storage`.
The repository's `firebase.json` now points to `storage.rules`.

## Upload contract

An authenticated `admin` or `super_admin` uploads a file to:

`shorts-expense-evidence/{paidVideoOrderId}/{safeFileName}`

Required custom metadata:

- `orderId`: exact paid-video order ID from the path
- `invoiceNumber`: non-empty invoice number, maximum 80 characters
- `uploadedByUid`: the authenticated admin UID

Allowed types: PDF, JPEG, PNG, WebP. Maximum size: 10 MiB.

The order must already exist in `watchVideoPaymentOrders` with `status == "paid"`.
Uploads are create-only. Clients cannot read, overwrite, or delete evidence. The Super Admin verification endpoint reads the object using Firebase Admin SDK and checks the same metadata before marking an expense verified.

## Before deployment

1. Confirm Firebase Storage is enabled for the project.
2. Confirm `FIREBASE_STORAGE_BUCKET` points at the intended bucket.
3. Deploy Firestore and Storage rules together after emulator validation:
   `firebase deploy --only firestore:rules,storage`
4. Test upload denial for non-admins, unpaid orders, invalid metadata, oversized files, wrong content types, and overwrite/delete attempts.
5. Do not use a client-download URL as proof of verification; the server must inspect object metadata as implemented by the verification API.

The Storage rules emulator was not run in this workspace; the included Node contract tests check the rule contract only. Run the Firebase Storage Emulator tests before production deployment.
