"use client";

import { useEffect, useState } from "react";
import { ref, uploadBytes } from "firebase/storage";
import { auth, storage } from "@/firebase/config";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
type PendingExpense = { expenseId: string; orderId: string; invoiceNumber: string; amountPaise: number; description: string; evidencePath: string; evidencePreviewUrl: string | null; createdAt: string | null };

export default function ShortsExpensesPage() {
  const [orderId, setOrderId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [pendingExpenses, setPendingExpenses] = useState<PendingExpense[]>([]);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewBusy, setReviewBusy] = useState("");

  async function loadPendingExpenses() {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/shorts/expenses/verify", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (response.status === 403) return;
      const result = await response.json();
      if (response.ok && result?.success && Array.isArray(result.expenses)) setPendingExpenses(result.expenses);
    } catch { setReviewMessage("Could not load pending expense reviews."); }
  }

  useEffect(() => { void loadPendingExpenses(); }, []);

  async function verifyExpense(expenseId: string) {
    const user = auth.currentUser;
    if (!user) { setReviewMessage("Please sign in again."); return; }
    setReviewBusy(expenseId); setReviewMessage("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/shorts/expenses/verify", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ expenseId }) });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) throw new Error(result?.error || "Could not verify invoice.");
      setReviewMessage("Invoice evidence verified.");
      await loadPendingExpenses();
    } catch (error) { setReviewMessage(error instanceof Error ? error.message : "Verification failed."); }
    finally { setReviewBusy(""); }
  }

  async function submitExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const user = auth.currentUser;
    if (!user) { setMessage("Please sign in again."); return; }
    const cleanOrderId = orderId.trim();
    const cleanInvoice = invoiceNumber.trim();
    const amountText = amount.trim();
    const amountMatch = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(amountText);
    const [rupeesPart = "0", paisePart = ""] = amountText.split(".");
    const amountPaise = amountMatch ? Number(rupeesPart) * 100 + Number(paisePart.padEnd(2, "0") || "0") : NaN;
    if (!/^[A-Za-z0-9_-]{3,50}$/.test(cleanOrderId)) { setMessage("Invalid Paid Video Order ID."); return; }
    if (!cleanInvoice || cleanInvoice.length > 80) { setMessage("Enter a valid invoice number."); return; }
    if (!amountMatch || !Number.isSafeInteger(amountPaise) || amountPaise <= 0 || amountPaise > 100_000_000) { setMessage("Enter a valid amount up to ₹1,00,000."); return; }
    if (!description.trim()) { setMessage("Enter an expense description."); return; }
    if (!file || !ALLOWED_TYPES.includes(file.type) || file.size < 1 || file.size > MAX_FILE_BYTES) { setMessage("Select a PDF/JPEG/PNG/WebP invoice up to 10 MB."); return; }

    setBusy(true);
    try {
      const safeInvoice = cleanInvoice.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 60);
      const fileName = `${Date.now()}_${safeInvoice}.${file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"}`;
      const evidencePath = `shorts-expense-evidence/${cleanOrderId}/${fileName}`;
      const token = await user.getIdToken();
      await uploadBytes(ref(storage, evidencePath), file, {
        contentType: file.type,
        customMetadata: { orderId: cleanOrderId, invoiceNumber: cleanInvoice, uploadedByUid: user.uid },
      });
      const response = await fetch("/api/admin/shorts/expenses", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ orderId: cleanOrderId, invoiceNumber: cleanInvoice, evidencePath, amountPaise, description: description.trim() }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) throw new Error(result?.error || "Could not record expense. The uploaded file may need admin cleanup.");
      setMessage(`Expense submitted for Super Admin review. Reference: ${result.expenseId}`);
      setInvoiceNumber(""); setAmount(""); setDescription(""); setFile(null);
      const input = document.getElementById("expense-invoice") as HTMLInputElement | null;
      if (input) input.value = "";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Expense submission failed.");
    } finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] p-4 text-[var(--button-text-color)] md:p-8">
      <section className="mx-auto max-w-2xl rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] p-5 shadow-sm md:p-7">
        <h1 className="text-2xl font-black">Shorts Expense Evidence</h1>
        <p className="mt-2 text-sm text-[var(--muted-text-color)]">Submit an invoice linked to a verified paid-video order. A Super Admin must review the evidence before it affects net-profit reconciliation.</p>
        <form onSubmit={submitExpense} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold">Paid Video Order ID<input value={orderId} onChange={(e) => setOrderId(e.target.value)} required maxLength={50} className="mt-1 w-full rounded-lg border p-3 text-black" /></label>
          <label className="block text-sm font-semibold">Invoice Number<input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} required maxLength={80} className="mt-1 w-full rounded-lg border p-3 text-black" /></label>
          <label className="block text-sm font-semibold">Expense Amount (₹)<input value={amount} onChange={(e) => setAmount(e.target.value)} required inputMode="decimal" type="number" min="0.01" max="100000" step="0.01" className="mt-1 w-full rounded-lg border p-3 text-black" /></label>
          <label className="block text-sm font-semibold">Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} required maxLength={300} rows={3} className="mt-1 w-full rounded-lg border p-3 text-black" /></label>
          <label className="block text-sm font-semibold">Invoice File (PDF/JPEG/PNG/WebP, max 10 MB)<input id="expense-invoice" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-1 block w-full rounded-lg border p-3" /></label>
          <button disabled={busy} className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? "Uploading and submitting…" : "Upload invoice and submit"}</button>
        </form>
        {message && <p role="status" className="mt-4 break-words rounded-lg border p-3 text-sm">{message}</p>}
      </section>
      <section className="mx-auto mt-6 max-w-2xl rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] p-5 md:p-7">
        <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">Pending Invoice Reviews</h2><button type="button" onClick={() => void loadPendingExpenses()} className="rounded-lg border px-3 py-2 text-sm">Refresh</button></div>
        <p className="mt-1 text-sm text-[var(--muted-text-color)]">This list is visible to Super Admin accounts only. Verify an invoice only after independently checking the original document.</p>
        {pendingExpenses.length === 0 ? <p className="mt-4 text-sm">No pending invoices available, or this account does not have Super Admin access.</p> : <ul className="mt-4 space-y-3">{pendingExpenses.map((expense) => <li key={expense.expenseId} className="rounded-xl border p-4"><div className="font-bold">{expense.invoiceNumber} · ₹{(expense.amountPaise / 100).toFixed(2)}</div><div className="mt-1 text-sm">Order: {expense.orderId}</div><div className="text-sm">{expense.description}</div><div className="mt-2 break-all text-xs text-[var(--muted-text-color)]">Evidence: {expense.evidencePath}</div>{expense.evidencePreviewUrl && <a href={expense.evidencePreviewUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold underline">Open private invoice preview (5-minute link)</a>}<button type="button" disabled={Boolean(reviewBusy)} onClick={() => void verifyExpense(expense.expenseId)} className="mt-3 rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{reviewBusy === expense.expenseId ? "Verifying…" : "Verify invoice evidence"}</button></li>)}</ul>}
        {reviewMessage && <p role="status" className="mt-4 break-words rounded-lg border p-3 text-sm">{reviewMessage}</p>}
      </section>
    </main>
  );
}
