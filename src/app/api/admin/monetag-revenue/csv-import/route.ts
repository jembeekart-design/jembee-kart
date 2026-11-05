import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/firebase/admin";
import { verifyMonetagAdmin } from "@/lib/server/monetagAdminAuth";

export const runtime = "nodejs";

type CsvRow = Record<string, string>;

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (ch === ";" && !quoted) {
      row.push(field.trim());
      field = "";
    } else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field.trim());
      if (row.some((v) => v !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }

  if (quoted) throw new Error("CSV में quotation marks सही नहीं हैं।");
  row.push(field.trim());
  if (row.some((v) => v !== "")) rows.push(row);
  return rows;
}

function parseMoney(value: string): number {
  if (!/^\d+(\.\d+)?$/.test(value)) {
    throw new Error("CSV में Profit की राशि अमान्य है।");
  }
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0 || amount > 100000000) {
    throw new Error("CSV में Profit की राशि सीमा से बाहर है।");
  }
  return amount;
}

function parseReport(csv: string) {
  const rawRows = parseCsv(csv.replace(/^\uFEFF/, ""));
  if (rawRows.length < 2) throw new Error("CSV में रिपोर्ट डेटा नहीं मिला।");

  const headers = rawRows[0].map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());
  const dateIndex = headers.indexOf("date");
  const zoneIndex = headers.indexOf("zone id");
  const impressionsIndex = headers.indexOf("impressions");
  const profitIndex = headers.indexOf("profit");

  if (impressionsIndex < 0 || profitIndex < 0) {
    throw new Error("CSV में Impressions और Profit कॉलम आवश्यक हैं।");
  }

  const reportType = dateIndex >= 0 ? "daily" : zoneIndex >= 0 ? "zone" : "";
  if (!reportType) throw new Error("केवल Daily या Zone Monetag CSV स्वीकार है।");

  const dataRows: CsvRow[] = [];
  let summary: CsvRow | null = null;

  for (const values of rawRows.slice(1)) {
    const item: CsvRow = {};
    headers.forEach((header, index) => {
      item[header] = values[index] ?? "";
    });

    if (!item[headers[impressionsIndex]] && !item[headers[profitIndex]]) continue;

    const isSummary = reportType === "daily"
      ? !(item.date || "").trim()
      : !(item["zone id"] || "").trim();

    if (isSummary) {
      summary = item;
      continue;
    }

    if (reportType === "daily") {
      const date = item.date || "";
      const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) &&
        Number.isFinite(new Date(`${date}T00:00:00Z`).getTime()) &&
        new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date;

      if (!validDate) {
        throw new Error("Daily CSV में वास्तविक तारीख YYYY-MM-DD format में होनी चाहिए।");
      }
    }

    if (reportType === "zone" && !/^\d+$/.test(item["zone id"] || "")) {
      throw new Error("Zone CSV में Zone ID अमान्य है।");
    }

    const impressions = Number(item.impressions);
    if (!Number.isSafeInteger(impressions) || impressions < 0) {
      throw new Error("CSV में Impressions की संख्या अमान्य है।");
    }

    dataRows.push(item);
  }

  if (!dataRows.length) throw new Error("CSV में कोई वैध डेटा पंक्ति नहीं मिली।");

  const dates = reportType === "daily"
    ? dataRows.map((r) => r.date).sort()
    : [];

  const dateFrom = dates[0] || "";
  const dateTo = dates[dates.length - 1] || "";

  const rowProfit = dataRows.reduce((sum, r) => sum + parseMoney(r.profit), 0);
  const impressions = dataRows.reduce((sum, r) => sum + Number(r.impressions), 0);

  if (summary) {
    const summaryProfit = parseMoney(summary.profit);
    const summaryImpressions = Number(summary.impressions);

    if (!Number.isSafeInteger(summaryImpressions) ||
        summaryImpressions !== impressions ||
        Math.abs(summaryProfit - rowProfit) > 0.000001) {
      throw new Error(
        "CSV की Summary और डेटा पंक्तियों का जोड़ मेल नहीं खाता। Import रोक दिया गया।"
      );
    }
  }

  return {
    reportType,
    dateFrom,
    dateTo,
    impressions,
    grossRevenueUsd: Number(rowProfit.toFixed(8)),
    rowCount: dataRows.length,
    summaryPresent: Boolean(summary),
  };
}

export async function POST(req: Request) {
  try {
    const adminUid = await verifyMonetagAdmin(req);
    const body = await req.json();
    const action = String(body.action || "");
    const csv = String(body.csv || "");

    if (!["preview", "import"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "action preview या import होना चाहिए।" },
        { status: 400 }
      );
    }

    if (!csv || csv.length > 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "CSV खाली है या 1 MB की सीमा से बड़ी है।" },
        { status: 400 }
      );
    }

    const report = parseReport(csv);
    const requestedFrom = String(body.dateFrom || report.dateFrom).trim();
    const requestedTo = String(body.dateTo || report.dateTo).trim();

    const validDate = (s: string) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
      const parsed = new Date(`${s}T00:00:00Z`);
      return Number.isFinite(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === s;
    };

    if (!validDate(requestedFrom) || !validDate(requestedTo) ||
        requestedFrom > requestedTo ||
        (report.reportType === "daily" &&
          (requestedFrom !== report.dateFrom || requestedTo !== report.dateTo))) {
      return NextResponse.json(
        { success: false, message: "रिपोर्ट की तारीख की सीमा अमान्य है।" },
        { status: 400 }
      );
    }

    const period = `${requestedFrom}..${requestedTo}`;
    const db = getAdminDb();

    // Daily और Zone रिपोर्ट एक ही अवधि के लिए एक ही रिकॉर्ड की पहचान साझा करते हैं।
    const key = createHash("sha256")
      .update(`monetag|jembee-kart.vercel.app|${period}`)
      .digest("hex");
    const ref = db.collection("monetagCsvImports").doc(key);

    if (action === "preview") {
      const existing = await ref.get();
      const importedPeriods = await db.collection("monetagCsvImports").get();
      const overlapping = importedPeriods.docs.some((doc) => {
        const data = doc.data();
        const from = String(data.dateFrom || "");
        const to = String(data.dateTo || "");
        return from <= requestedTo && to >= requestedFrom;
      });
      const blocked = existing.exists || overlapping;
      return NextResponse.json({
        success: true,
        action: "preview",
        report,
        period,
        alreadyImported: blocked,
        message: blocked
          ? "इस अवधि से मेल खाने वाली या overlap करने वाली Monetag CSV पहले दर्ज है। दोबारा Import न करें।"
          : "Preview तैयार है। पुष्टि से पहले राशि और अवधि जाँचें।",
      });
    }

    const result = await db.runTransaction(async (tx) => {
      const guardRef = db.collection("monetagCsvImportGuard").doc("global");
      const guard = await tx.get(guardRef);
      const existing = await tx.get(ref);
      const importedPeriods = await tx.get(db.collection("monetagCsvImports"));

      const overlapping = importedPeriods.docs.some((doc) => {
        const data = doc.data();
        const from = String(data.dateFrom || "");
        const to = String(data.dateTo || "");
        return from <= requestedTo && to >= requestedFrom;
      });

      if (existing.exists || overlapping) return { duplicate: true };

      const revision = Number(guard.data()?.revision || 0) + 1;
      tx.set(guardRef, {
        revision,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: adminUid,
      });

      tx.create(ref, {
        provider: "monetag",
        site: "jembee-kart.vercel.app",
        reportType: report.reportType,
        period,
        dateFrom: requestedFrom,
        dateTo: requestedTo,
        impressions: report.impressions,
        grossRevenueUsd: report.grossRevenueUsd,
        unallocatedRevenueUsd: report.grossRevenueUsd,
        rowCount: report.rowCount,
        summaryPresent: report.summaryPresent,
        currency: "USD",
        status: "unallocated",
        attributionStatus: "aggregate_only_unallocated",
        importedBy: adminUid,
        createdAt: FieldValue.serverTimestamp(),
      });

      return { duplicate: false };
    });

    if (result.duplicate) {
      return NextResponse.json(
        { success: false, duplicate: true, message: "इस अवधि से मेल खाने वाली या overlap करने वाली रिपोर्ट पहले ही दर्ज है।" },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      report,
      period,
      status: "unallocated",
      message: "CSV दर्ज हुई। राशि Unallocated है; कोई uploader/sharer earning नहीं बनाई गई।",
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const status = code === "UNAUTHORIZED" ? 401 :
      code === "FORBIDDEN" ? 403 : 400;

    return NextResponse.json({
      success: false,
      message: status === 401
        ? "कृपया Admin में लॉगिन करें।"
        : status === 403
          ? "केवल अधिकृत Admin यह कार्य कर सकता है।"
          : error instanceof Error
            ? error.message
            : "CSV Import पूरा नहीं हो सका।",
    }, { status });
  }
}
