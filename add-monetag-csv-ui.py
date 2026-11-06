from pathlib import Path

p = Path("src/app/admin/monetag-revenue/page.tsx")
s = p.read_text()

old = '  const [latestApiSync, setLatestApiSync] = useState<Record<string, unknown> | null>(null);'
new = old + '''
  const [csvText, setCsvText] = useState("");
  const [csvFileName, setCsvFileName] = useState("");
  const [csvDates, setCsvDates] = useState({ dateFrom: today, dateTo: today });
  const [csvPreview, setCsvPreview] = useState<Record<string, unknown> | null>(null);
'''

if old not in s:
    raise SystemExit("STOP: CSV state insertion point not found.")
if "csvText" in s:
    raise SystemExit("STOP: CSV state already exists; inspect file before editing.")

s = s.replace(old, new, 1)

old = '  async function recordPayment()'
new = r'''  function csvIsZoneReport() {
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

  async function recordPayment()'''

if old not in s:
    raise SystemExit("STOP: function insertion point not found.")
s = s.replace(old, new, 1)

anchor = '''    <section className="space-y-3 rounded-2xl border border-blue-200 bg-white p-5">
      <h2 className="text-lg font-semibold">Monetag API आय (अभी आवंटित नहीं)</h2>'''

section = r'''    <section className="space-y-4 rounded-2xl border border-amber-200 bg-white p-5">
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
      <h2 className="text-lg font-semibold">Monetag API आय (अभी आवंटित नहीं)</h2>'''

if anchor not in s:
    raise SystemExit("STOP: UI insertion point not found.")
s = s.replace(anchor, section, 1)
p.write_text(s)
print("CSV Import UI जोड़ दिया गया।")
