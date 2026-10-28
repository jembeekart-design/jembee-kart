"use client";
import { useEffect, useState } from "react";
import { auth } from "@/firebase/config";

type Settings = { uploaderPercent: number; sharerPercent: number };
type Summary = { grossRevenueUsd: number; uploaderEarningsUsd: number; sharerEarningsUsd: number; platformRetainedUsd: number; unallocatedRevenueUsd: number; paidOutUsd: number; importedRecords: number };
export default function MonetagRevenueAdminPage() {
  const [settings, setSettings] = useState<Settings>({ uploaderPercent: 30, sharerPercent: 20 });
  const [record, setRecord] = useState({ externalRecordId: "", period: "", grossRevenueUsd: "", uploaderUserId: "", sharerUserId: "" });
  const [payment, setPayment] = useState({ userId: "", transactionReference: "", amountUsd: "", status: "paid" });
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recentImports, setRecentImports] = useState<Array<Record<string, unknown>>>([]);
  const [shareAttributions, setShareAttributions] = useState<Array<Record<string, unknown>>>([]);
  const [busy, setBusy] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [syncRange, setSyncRange] = useState({ date_from: today, date_to: today });
  const [syncResult, setSyncResult] = useState<Record<string, unknown> | null>(null);
  const [latestApiSync, setLatestApiSync] = useState<Record<string, unknown> | null>(null);
  const [csvText, setCsvText] = useState("");
  const [csvFileName, setCsvFileName] = useState("");
  const [csvDates, setCsvDates] = useState({ dateFrom: today, dateTo: today });
  const [csvPreview, setCsvPreview] = useState<Record<string, unknown> | null>(null);

  async function api(path: string, init: RequestInit = {}) {
    const user = auth.currentUser;
    if (!user) throw new Error("कृपया पहले Admin खाते में लॉगिन करें।");
    const token = await user.getIdToken();
    const res = await fetch(path, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(init.headers || {}) } });
    const data = await res.json();
    if (!res.ok || !data.success) {
      const detail = data.details ? JSON.stringify(data.details, null, 2) : "";
      throw new Error([data.message || "अनुरोध पूरा नहीं हो सका।", detail].filter(Boolean).join("\\n"));
    }
    return data;
  }
  async function refreshDashboard() { const data = await api("/api/admin/monetag-revenue"); setSummary(data.summary); setRecentImports(data.imports || []); setShareAttributions(data.shareAttributions || []); setLatestApiSync(Array.isArray(data.apiSyncs) ? data.apiSyncs[0] || null : null); }
  useEffect(() => { let active = true; Promise.all([api("/api/admin/monetag-settings"), api("/api/admin/monetag-revenue")]).then(([settingsData, revenueData]) => { if (active) { setSettings(settingsData.settings); setSummary(revenueData.summary); setRecentImports(revenueData.imports || []); setShareAttributions(revenueData.shareAttributions || []); setLatestApiSync(Array.isArray(revenueData.apiSyncs) ? revenueData.apiSyncs[0] || null : null); } }).catch((e) => { if (active) setMessage(e.message); }); return () => { active = false; }; }, []);
  async function saveSettings() { setBusy(true); setMessage(""); try { const data = await api("/api/admin/monetag-settings", { method: "PUT", body: JSON.stringify(settings) }); setSettings(data.settings); setMessage("कमाई के प्रतिशत सुरक्षित हो गए हैं।"); } catch (e) { setMessage(e instanceof Error ? e.message : "सेटिंग सुरक्षित नहीं हो सकी।"); } finally { setBusy(false); } }
  async function importRecord() { setBusy(true); setMessage(""); try { const data = await api("/api/admin/monetag-revenue", { method: "POST", body: JSON.stringify({ ...record, grossRevenueUsd: Number(record.grossRevenueUsd) }) }); setMessage(`रिपोर्ट दर्ज हुई। अपलोडर हिस्सा: $${Number(data.result.uploaderShareUsd || 0).toFixed(2)}, शेयर करने वाले का हिस्सा: $${Number(data.result.sharerShareUsd || 0).toFixed(2)}।`); setRecord({ externalRecordId: "", period: "", grossRevenueUsd: "", uploaderUserId: "", sharerUserId: "" }); await refreshDashboard(); } catch (e) { setMessage(e instanceof Error ? e.message : "रिपोर्ट दर्ज नहीं हो सकी।"); } finally { setBusy(false); } }
  async function syncMonetag() { setBusy(true); setMessage(""); setSyncResult(null); try { const data = await api("/api/admin/monetag-sync", { method: "POST", body: JSON.stringify(syncRange) }); setSyncResult(data); setMessage(data.message || "Monetag sync पूरा हुआ।"); } catch (e) { setMessage(e instanceof Error ? e.message : "Monetag sync पूरा नहीं हुआ।"); } finally { setBusy(false); } }
  function csvIsZoneReport() {
    const header = csvText.split(/\r?\n/, 1)[0]?.toLowerCase() || "";
    return header.includes("zone id") && !header.includes("date");
  }

  async function previewCsvImport() {
    setBusy(true);
    setMessage("");
    setCsvPreview(null);
    try {
      const payload: Record<string, string> = { action: "preview", csv: csvText };
      if (csvIsZoneReport()) {
        payload.dateFrom = csvDates.dateFrom;
        payload.dateTo = csvDates.dateTo;
      }
      const data = await api("/api/admin/monetag-revenue/csv-import", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setCsvPreview(data);
      setMessage(data.message || "CSV Preview तैयार है।");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "CSV Preview नहीं बन सका।");
    } finally {
      setBusy(false);
    }
  }

  async function importCsvReport() {
    if (!csvPreview || csvPreview.alreadyImported) return;
    if (!window.confirm("CSV को Unallocated स्थिति में दर्ज करें? किसी uploader या sharer की earning नहीं बनेगी।")) return;

    setBusy(true);
    setMessage("");
    try {
      const report = csvPreview.report as Record<string, unknown> | undefined;
      const payload: Record<string, string> = { action: "import", csv: csvText };
      if (report?.reportType === "zone") {
        payload.dateFrom = csvDates.dateFrom;
        payload.dateTo = csvDates.dateTo;
      }
      const data = await api("/api/admin/monetag-revenue/csv-import", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setMessage(data.message || "CSV Unallocated के रूप में दर्ज हुई।");
      setCsvPreview(null);
      setCsvText("");
      setCsvFileName("");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "CSV Import नहीं हो सका।");
    } finally {
      setBusy(false);
    }
  }

  async function recordPayment() { setBusy(true); setMessage(""); try { const data = await api("/api/admin/monetag-payments", { method: "POST", body: JSON.stringify({ ...payment, amountUsd: Number(payment.amountUsd) }) }); setMessage(data.message); setPayment({ userId: "", transactionReference: "", amountUsd: "", status: "paid" }); } catch (e) { setMessage(e instanceof Error ? e.message : "भुगतान दर्ज नहीं हो सका।"); } finally { setBusy(false); } }
  return <main className="mx-auto max-w-4xl space-y-6 p-5 text-slate-900"><header><h1 className="text-2xl font-bold">Monetag कमाई प्रबंधन</h1><p className="mt-2 text-sm text-slate-600">यहाँ प्रतिशत सुरक्षित रूप से बदलें और Monetag रिपोर्ट से सत्यापित आय दर्ज करें। स्वचालित API सिंक तभी सक्रिय होगा जब Monetag खाते की उपयुक्त API पहुँच उपलब्ध हो।</p></header>
    <section className="space-y-4 rounded-2xl border bg-white p-5"><h2 className="text-lg font-semibold">सत्यापित आय का सारांश</h2><p className="text-sm text-slate-600">यह डेटा मैन्युअल रूप से आयात की गई सत्यापित रिपोर्ट पर आधारित है; यह Monetag का लाइव API डेटा नहीं है।</p>{summary ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{([["कुल सत्यापित आय", summary.grossRevenueUsd], ["अपलोडर की दर्ज कमाई", summary.uploaderEarningsUsd], ["शेयरर की दर्ज कमाई", summary.sharerEarningsUsd], ["JembeeKart का अनुमानित हिस्सा", summary.platformRetainedUsd], ["अभी तक दर्ज भुगतान", summary.paidOutUsd], ["Unallocated आय", summary.unallocatedRevenueUsd]] as const).map(([label, amount]) => <div key={label} className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-600">{label}</p><p className="mt-1 text-xl font-bold">${Number(amount || 0).toFixed(2)} USD</p></div>)}</div> : <p className="text-sm text-slate-600">सारांश लोड हो रहा है या उपलब्ध नहीं है।</p>}<p className="text-xs text-slate-500">हाल के रिकॉर्ड: {summary?.importedRecords ?? 0} (अधिकतम 200) · भुगतान/कमाई totals अधिकतम 1,000 records पर आधारित हैं।</p><button disabled={busy} onClick={() => { setBusy(true); refreshDashboard().then(() => setMessage("डैशबोर्ड अपडेट हो गया।")).catch(e => setMessage(e instanceof Error ? e.message : "डैशबोर्ड अपडेट नहीं हुआ।")).finally(() => setBusy(false)); }} className="rounded-lg border px-4 py-2 font-semibold disabled:opacity-50">रिपोर्ट रीफ़्रेश करें</button>{recentImports.length > 0 && <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">अवधि</th><th className="p-2">कुल आय</th><th className="p-2">स्थिति</th><th className="p-2">Unallocated</th></tr></thead><tbody>{recentImports.slice(0, 10).map(item => <tr key={String(item.id)} className="border-t"><td className="p-2">{String(item.period || "—")}</td><td className="p-2">${Number(item.grossRevenueUsd || 0).toFixed(2)}</td><td className="p-2">{String(item.status || "—")}</td><td className="p-2">${Number(item.unallocatedRevenueUsd || 0).toFixed(2)}</td></tr>)}</tbody></table></div>}</section>
    <section className="space-y-4 rounded-2xl border bg-white p-5"><h2 className="text-lg font-semibold">Uploader / Sharer Attribution</h2><p className="text-sm text-slate-600">हर authenticated share action का unique share ID, video ID, uploader ID और sharer ID यहाँ दिखेगा। यह share record है, अपने-आप Monetag revenue proof नहीं है। हाल के {shareAttributions.length} records (अधिकतम 100)।</p>{shareAttributions.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Video ID</th><th className="p-2">Uploader UID</th><th className="p-2">Sharer UID</th><th className="p-2">Self-share</th><th className="p-2">Date</th></tr></thead><tbody>{shareAttributions.map(item=><tr key={String(item.id)} className="border-t"><td className="p-2">{String(item.videoId || "—")}</td><td className="p-2">{String(item.uploaderUserId || "—")}</td><td className="p-2">{String(item.sharerUserId || "—")}</td><td className="p-2">{item.selfShare ? "हाँ" : "नहीं"}</td><td className="p-2">{String(item.createdAt || "—")}</td></tr>)}</tbody></table></div> : <p className="text-sm text-slate-500">अभी share attribution records नहीं हैं।</p>}</section>
    <section className="space-y-4 rounded-2xl border border-amber-200 bg-white p-5">
      <h2 className="text-lg font-semibold">Monetag CSV Import (Unallocated)</h2>
      <p className="text-sm text-slate-600">Daily या Zone CSV का Preview देखें और पुष्टि के बाद दर्ज करें। आय Unallocated रहेगी; uploader/sharer earnings नहीं बनेंगी।</p>
      <label className="block text-sm font-medium">
        Monetag CSV फ़ाइल
        <input
          className="mt-1 block w-full rounded-lg border p-3"
          type="file"
          accept=".csv,text/csv"
          disabled={busy}
          onChange={async e => {
            const file = e.target.files?.[0];
            setCsvPreview(null);
            if (!file) {
              setCsvText("");
              setCsvFileName("");
              return;
            }
            if (file.size > 1024 * 1024) {
              setCsvText("");
              setCsvFileName("");
              setMessage("CSV फ़ाइल 1 MB से बड़ी है।");
              e.target.value = "";
              return;
            }
            try {
              setCsvText(await file.text());
              setCsvFileName(file.name);
              setMessage("");
            } catch {
              setCsvText("");
              setCsvFileName("");
              setMessage("CSV फ़ाइल पढ़ी नहीं जा सकी।");
            }
          }}
        />
      </label>
      {csvFileName && <p className="text-sm text-slate-600">फ़ाइल: {csvFileName}</p>}
      {csvIsZoneReport() && <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium">Zone रिपोर्ट की शुरू तारीख
          <input type="date" className="mt-1 block w-full rounded-lg border p-3" value={csvDates.dateFrom} max={csvDates.dateTo} onChange={e => setCsvDates(v => ({ ...v, dateFrom: e.target.value }))}/>
        </label>
        <label className="block text-sm font-medium">Zone रिपोर्ट की अंतिम तारीख
          <input type="date" className="mt-1 block w-full rounded-lg border p-3" value={csvDates.dateTo} min={csvDates.dateFrom} max={today} onChange={e => setCsvDates(v => ({ ...v, dateTo: e.target.value }))}/>
        </label>
      </div>}
      <button disabled={busy || !csvText.trim()} onClick={previewCsvImport} className="rounded-lg border px-4 py-3 font-semibold disabled:opacity-50">CSV Preview देखें</button>
      {csvPreview && (() => {
        const report = csvPreview.report && typeof csvPreview.report === "object" ? csvPreview.report as Record<string, unknown> : {};
        return <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
          <p className="font-semibold">Preview परिणाम</p>
          <p>Report type: {String(report.reportType || "—")}</p>
          <p>अवधि: {String(csvPreview.period || "—")}</p>
          <p>Impressions: {Number(report.impressions || 0).toLocaleString()}</p>
          <p>डेटा पंक्तियाँ: {Number(report.rowCount || 0)}</p>
          <p>कुल रिपोर्ट आय: <strong>${Number(report.grossRevenueUsd || 0).toFixed(8)} USD</strong></p>
          <p><strong>Unallocated — किसी uploader/sharer को credit नहीं होगा।</strong></p>
          {csvPreview.alreadyImported
            ? <p className="font-semibold text-red-700">यह अवधि पहले दर्ज है। दोबारा Import नहीं किया जा सकता।</p>
            : <button disabled={busy} onClick={importCsvReport} className="rounded-lg bg-amber-700 px-4 py-3 font-semibold text-white disabled:opacity-50">पुष्टि करें और Unallocated Import करें</button>}
        </div>;
      })()}
    </section>

    <section className="space-y-3 rounded-2xl border border-blue-200 bg-white p-5">
      <h2 className="text-lg font-semibold">Monetag API आय (अभी आवंटित नहीं)</h2>
      <p className="text-sm text-slate-600">यह सबसे हाल के API sync का aggregate आँकड़ा है। यह verified report income में शामिल नहीं है और किसी uploader या sharer को credit नहीं करता।</p>
      {latestApiSync ? (() => {
        const totals = latestApiSync.totals && typeof latestApiSync.totals === "object" ? latestApiSync.totals as Record<string, unknown> : {};
        return <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-slate-600">API Revenue</p>
          <p className="mt-1 text-xl font-bold">${Number(totals.money || 0).toFixed(8)} USD</p>
          <p className="mt-2 text-sm">अवधि: {String(latestApiSync.dateFrom || "—")} से {String(latestApiSync.dateTo || "—")}</p>
          <p className="text-sm">Impressions: {Number(totals.impressions || 0)}</p>
          <p className="text-sm">Rows: {Number(latestApiSync.rowCount || 0)}</p>
          <p className="mt-2 text-xs text-slate-500">Attribution: {String(latestApiSync.attributionStatus || "aggregate_only_unallocated")}</p>
        </div>;
      })() : <p className="text-sm text-slate-500">अभी कोई API sync record उपलब्ध नहीं है। पहले Live API Sync चलाएँ।</p>}
      <button disabled={busy} onClick={() => { setBusy(true); refreshDashboard().then(() => setMessage("API revenue रीफ़्रेश हो गया।")).catch(e => setMessage(e instanceof Error ? e.message : "रीफ़्रेश नहीं हुआ।")).finally(() => setBusy(false)); }} className="rounded-lg border px-4 py-2 font-semibold disabled:opacity-50">API Revenue रीफ़्रेश करें</button>
    </section>
    <section className="space-y-4 rounded-2xl border border-emerald-200 bg-white p-5"><h2 className="text-lg font-semibold">Monetag Live API Sync</h2><p className="text-sm text-slate-600">यह Monetag की official aggregate statistics API से रिपोर्ट लाता है। Aggregate data किसी खास uploader या sharer की कमाई सिद्ध नहीं करता, इसलिए sync के दौरान individual earnings अपने-आप credit नहीं की जातीं।</p><div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-medium">शुरू की तारीख<input type="date" className="mt-1 block w-full rounded-lg border p-3" value={syncRange.date_from} max={syncRange.date_to} onChange={e=>setSyncRange(v=>({...v,date_from:e.target.value}))}/></label><label className="block text-sm font-medium">अंतिम तारीख<input type="date" className="mt-1 block w-full rounded-lg border p-3" value={syncRange.date_to} min={syncRange.date_from} max={today} onChange={e=>setSyncRange(v=>({...v,date_to:e.target.value}))}/></label></div><button disabled={busy} onClick={syncMonetag} className="rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? "कृपया प्रतीक्षा करें…" : "Monetag से Statistics Sync करें"}</button>{syncResult && <div className="rounded-xl bg-slate-50 p-4 text-sm"><p>Site: {String((syncResult.site as Record<string, unknown> | undefined)?.url || "—")}</p><p>Rows: {String(syncResult.rowCount ?? 0)}</p>
<p>Response rows: {String(syncResult.responseRowCount ?? "not returned")}</p>
<p>Response fields: {JSON.stringify(syncResult.responseFields ?? "not returned")}</p><p>Attribution: {String(syncResult.attributionStatus || "—")}</p><pre className="mt-2 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(syncResult.totals || {}, null, 2)}</pre></div>}</section>
    <section className="space-y-4 rounded-2xl border bg-white p-5"><h2 className="text-lg font-semibold">कमाई का हिस्सा</h2><label className="block text-sm font-medium">वीडियो अपलोड करने वाले का हिस्सा (%)<input className="mt-1 block w-full rounded-lg border p-3" type="number" min="0" max="100" value={settings.uploaderPercent} onChange={e=>setSettings(v=>({...v,uploaderPercent:Number(e.target.value)}))}/></label><label className="block text-sm font-medium">वीडियो शेयर करने वाले का हिस्सा (%)<input className="mt-1 block w-full rounded-lg border p-3" type="number" min="0" max="100" value={settings.sharerPercent} onChange={e=>setSettings(v=>({...v,sharerPercent:Number(e.target.value)}))}/></label><p className="text-sm text-slate-600">कुल हिस्सा: {settings.uploaderPercent + settings.sharerPercent}%; JembeeKart के पास बचने वाला हिस्सा: {100-settings.uploaderPercent-settings.sharerPercent}%</p><button disabled={busy} onClick={saveSettings} className="rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50">प्रतिशत सुरक्षित करें</button></section>
    <section className="space-y-4 rounded-2xl border bg-white p-5"><h2 className="text-lg font-semibold">सत्यापित Monetag रिपोर्ट दर्ज करें</h2><p className="text-sm text-slate-600">केवल Monetag की रिपोर्ट से सत्यापित आय दर्ज करें। बाहरी रिकॉर्ड पहचान दोहराई नहीं जा सकती।</p>{([['externalRecordId','रिपोर्ट/रिकॉर्ड पहचान'],['period','रिपोर्ट अवधि'],['grossRevenueUsd','सत्यापित कुल आय (USD)'],['uploaderUserId','वीडियो अपलोड करने वाले का User ID (वैकल्पिक)'],['sharerUserId','वीडियो शेयर करने वाले का User ID (वैकल्पिक)']] as const).map(([key,label])=><label key={key} className="block text-sm font-medium">{label}<input className="mt-1 block w-full rounded-lg border p-3" type={key==='grossRevenueUsd'?'number':'text'} min={key==='grossRevenueUsd'?'0.000001':undefined} step={key==='grossRevenueUsd'?'0.000001':undefined} value={record[key]} onChange={e=>setRecord(v=>({...v,[key]:e.target.value}))}/></label>)}<button disabled={busy} onClick={importRecord} className="rounded-lg bg-cyan-700 px-4 py-3 font-semibold text-white disabled:opacity-50">सत्यापित रिपोर्ट दर्ज करें</button></section>
    <section className="space-y-4 rounded-2xl border bg-white p-5"><h2 className="text-lg font-semibold">वास्तविक भुगतान दर्ज करें</h2><p className="text-sm text-slate-600">यह केवल भुगतान होने या उसकी स्थिति सत्यापित करने के बाद इस्तेमाल करें। यह फ़ॉर्म अपने-आप पैसे ट्रांसफ़र नहीं करता।</p>{([['userId','प्राप्तकर्ता का User ID'],['transactionReference','लेन-देन संदर्भ'],['amountUsd','भुगतान राशि (USD)']] as const).map(([key,label])=><label key={key} className="block text-sm font-medium">{label}<input className="mt-1 block w-full rounded-lg border p-3" type={key==='amountUsd'?'number':'text'} min={key==='amountUsd'?'0.000001':undefined} step={key==='amountUsd'?'0.000001':undefined} value={payment[key]} onChange={e=>setPayment(v=>({...v,[key]:e.target.value}))}/></label>)}<label className="block text-sm font-medium">स्थिति<select className="mt-1 block w-full rounded-lg border p-3" value={payment.status} onChange={e=>setPayment(v=>({...v,status:e.target.value}))}><option value="paid">सफल</option><option value="pending">लंबित</option><option value="failed">असफल</option></select></label><button disabled={busy} onClick={recordPayment} className="rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50">भुगतान रिकॉर्ड सुरक्षित करें</button></section>
    {message && <p role="status" className="rounded-lg border bg-slate-50 p-3 text-sm">{message}</p>}</main>;
}
