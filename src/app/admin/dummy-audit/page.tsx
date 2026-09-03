import fs from "fs";
import path from "path";

type Status = "REAL" | "PARTIAL" | "DUMMY" | "SUSPICIOUS";

interface PageAudit {
  title: string;
  route: string;
  file: string;
  status: Status;
  score: number;
  evidence: string[];
  connect: string[];
}

const REAL_PATTERNS = [
  /firebase/i,
  /firestore/i,
  /getDocs/i,
  /getDoc/i,
  /addDoc/i,
  /setDoc/i,
  /updateDoc/i,
  /deleteDoc/i,
  /onSnapshot/i,
  /collection\(/i,
  /fetch\(/i,
  /axios/i,
  /server action/i,
  /use server/i,
  /https?:\/\//i,
];

const DUMMY_PATTERNS = [
  /\bmock\b/i,
  /\bdummy\b/i,
  /\bdemo\b/i,
  /\bplaceholder\b/i,
  /\bcoming soon\b/i,
  /\btest data\b/i,
  /\bfake\b/i,
  /\bsample data\b/i,
  /\bexample data\b/i,
  /\bTODO\b/i,
];

const FAKE_OPERATION_PATTERNS = [
  /setTimeout\s*\(/i,
  /Math\.random\s*\(/i,
  /alert\s*\(/i,
];

const STATIC_DATA_PATTERNS = [
  /const\s+\w+\s*=\s*\[/i,
  /let\s+\w+\s*=\s*\[/i,
];

const ACTION_PATTERNS = [
  /onClick\s*=/i,
  /onSubmit\s*=/i,
  /action\s*=/i,
  /router\.(push|replace)\s*\(/i,
];

function getTitle(file: string, appRoot: string) {
  const relative = path
    .relative(appRoot, file)
    .replace(/\\/g, "/");

  if (relative === "page.tsx") return "Home";

  const folder = relative
    .replace(/\/page\.tsx$/, "")
    .split("/")
    .filter(Boolean)
    .filter((x) => !x.startsWith("["));

  if (!folder.length) return "Home";

  return folder
    .map((word) =>
      word
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    )
    .join(" / ");
}

function getRoute(file: string, appRoot: string) {
  const relative = path
    .relative(appRoot, file)
    .replace(/\\/g, "/");

  let route = "/" + relative.replace(/\/page\.tsx$/, "");

  if (route === "/") return "/";

  route = route
    .replace(/\[\.\.\.[^\]]+\]/g, "[...]")
    .replace(/\[[^\]]+\]/g, "[slug]");

  return route;
}

function scanDirectory(
  dir: string,
  appRoot: string,
  results: PageAudit[] = []
) {
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (
        [
          "api",
          "node_modules",
          ".next",
          "_components",
          "_lib",
          "components",
        ].includes(entry.name)
      ) {
        continue;
      }

      scanDirectory(fullPath, appRoot, results);
      continue;
    }

    if (entry.name !== "page.tsx") continue;

    let source = "";

    try {
      source = fs.readFileSync(fullPath, "utf8");
    } catch {
      continue;
    }

    let score = 0;
    const evidence: string[] = [];
    const connect: string[] = [];

    // REAL CONNECTIONS
    for (const pattern of REAL_PATTERNS) {
      const match = source.match(pattern);

      if (match) {
        score += 3;
        evidence.push(`Real connection: ${match[0]}`);
      }
    }

    // USER ACTIONS
    for (const pattern of ACTION_PATTERNS) {
      const match = source.match(pattern);

      if (match) {
        score += 1;
        evidence.push(`User action: ${match[0]}`);
      }
    }

    // DUMMY SIGNALS
    for (const pattern of DUMMY_PATTERNS) {
      const match = source.match(pattern);

      if (match) {
        score -= 5;
        evidence.push(`Dummy signal: ${match[0]}`);
      }
    }

    // FAKE OPERATIONS
    for (const pattern of FAKE_OPERATION_PATTERNS) {
      const match = source.match(pattern);

      if (match) {
        score -= 3;
        evidence.push(`Suspicious operation: ${match[0]}`);
      }
    }

    // STATIC ARRAYS
    for (const pattern of STATIC_DATA_PATTERNS) {
      const match = source.match(pattern);

      if (match) {
        score -= 1;
        evidence.push(`Static data pattern: ${match[0]}`);
      }
    }

    // CONNECT SUGGESTIONS
    const lower = source.toLowerCase();

    if (
      lower.includes("product") ||
      lower.includes("order") ||
      lower.includes("cart")
    ) {
      connect.push("Check Products / Orders Firestore connection");
    }

    if (
      lower.includes("user") ||
      lower.includes("profile") ||
      lower.includes("account")
    ) {
      connect.push("Check users collection / Firebase Auth");
    }

    if (
      lower.includes("wallet") ||
      lower.includes("income") ||
      lower.includes("commission")
    ) {
      connect.push("Check wallet / commission transaction logic");
    }

    if (
      lower.includes("setting") ||
      lower.includes("config") ||
      lower.includes("theme")
    ) {
      connect.push("Check Admin Settings / Firestore configuration");
    }

    if (
      lower.includes("banner") ||
      lower.includes("announcement")
    ) {
      connect.push("Check Firestore content collection");
    }

    if (
      lower.includes("video") ||
      lower.includes("watch")
    ) {
      connect.push("Check video / Jembee Shorts Firestore logic");
    }

    if (!connect.length) {
      connect.push("Inspect page-specific Firebase/API action");
    }

    let status: Status;

    if (score >= 8) {
      status = "REAL";
    } else if (score >= 2) {
      status = "PARTIAL";
    } else if (
      evidence.some((x) =>
        x.toLowerCase().includes("dummy signal")
      ) ||
      score <= -5
    ) {
      status = "DUMMY";
    } else {
      status = "SUSPICIOUS";
    }

    results.push({
      title: getTitle(fullPath, appRoot),
      route: getRoute(fullPath, appRoot),
      file: path.relative(process.cwd(), fullPath),
      status,
      score,
      evidence: [...new Set(evidence)],
      connect: [...new Set(connect)],
    });
  }

  return results;
}

function statusLabel(status: Status) {
  if (status === "REAL") return "🟢 REAL";
  if (status === "PARTIAL") return "🟡 PARTIAL";
  if (status === "DUMMY") return "🔴 DUMMY";
  return "⚠️ SUSPICIOUS";
}

export default function DummyAuditPage() {
  const appRoot = path.join(process.cwd(), "src", "app");

  const pages = scanDirectory(appRoot, appRoot).sort((a, b) =>
    a.route.localeCompare(b.route)
  );

  const real = pages.filter((p) => p.status === "REAL").length;
  const partial = pages.filter(
    (p) => p.status === "PARTIAL"
  ).length;
  const dummy = pages.filter(
    (p) => p.status === "DUMMY"
  ).length;
  const suspicious = pages.filter(
    (p) => p.status === "SUSPICIOUS"
  ).length;

  return (
    <main className="min-h-screen p-6 bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold">
          Dummy / Demo Page Audit
        </h1>

        <p className="mt-2 text-[var(--muted-text-color)]">
          कौन सा page real है और कौन सा सिर्फ demo/UI दिखा रहा है
        </p>

        {/* SUMMARY */}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">

          {/* TOTAL */}
          <div className="rounded-2xl p-5 border border-[var(--border-color)] bg-[var(--card-color)]">
            <p className="text-sm">Total</p>
            <p className="text-3xl font-bold mt-2">{pages.length}</p>
          </div>

          {/* REAL */}
          <details className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)]">
            <summary className="cursor-pointer list-none p-5">
              <p className="text-sm">🟢 Real</p>
              <p className="text-3xl font-bold mt-2">{real}</p>
              <p className="text-xs mt-2 underline">Click to open Real pages</p>
            </summary>

            <div className="border-t border-[var(--border-color)] p-4 max-h-96 overflow-y-auto">
              {pages.filter((p) => p.status === "REAL").map((p, i) => (
                <div key={p.file} className="border-b border-[var(--border-color)] py-3">
                  <p className="font-bold">
                    #{String(i + 1).padStart(3, "0")} {p.title}
                  </p>
                  <p className="text-xs mt-1 font-mono">{p.route}</p>
                  <p className="text-xs mt-1 opacity-70">{p.file}</p>

                  <a href={p.route} className="inline-block mt-2 underline font-bold">
                    Open →
                  </a>
                </div>
              ))}
            </div>
          </details>

          {/* PARTIAL */}
          <details className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)]">
            <summary className="cursor-pointer list-none p-5">
              <p className="text-sm">🟡 Partial</p>
              <p className="text-3xl font-bold mt-2">{partial}</p>
              <p className="text-xs mt-2 underline">Click to open Partial pages</p>
            </summary>

            <div className="border-t border-[var(--border-color)] p-4 max-h-96 overflow-y-auto">
              {pages.filter((p) => p.status === "PARTIAL").map((p, i) => (
                <div key={p.file} className="border-b border-[var(--border-color)] py-3">
                  <p className="font-bold">
                    #{String(i + 1).padStart(3, "0")} {p.title}
                  </p>
                  <p className="text-xs mt-1 font-mono">{p.route}</p>
                  <p className="text-xs mt-1 opacity-70">{p.file}</p>

                  <div className="text-xs mt-2">
                    {p.connect.map((c) => <p key={c}>🔧 {c}</p>)}
                  </div>

                  <a href={p.route} className="inline-block mt-2 underline font-bold">
                    Open →
                  </a>
                </div>
              ))}
            </div>
          </details>

          {/* DUMMY */}
          <details className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)]">
            <summary className="cursor-pointer list-none p-5">
              <p className="text-sm">🔴 Dummy</p>
              <p className="text-3xl font-bold mt-2">{dummy}</p>
              <p className="text-xs mt-2 underline">Click to open Dummy pages</p>
            </summary>

            <div className="border-t border-[var(--border-color)] p-4 max-h-96 overflow-y-auto">
              {pages.filter((p) => p.status === "DUMMY").map((p, i) => (
                <div key={p.file} className="border-b border-[var(--border-color)] py-3">
                  <p className="font-bold">
                    #{String(i + 1).padStart(3, "0")} {p.title}
                  </p>
                  <p className="text-xs mt-1 font-mono">{p.route}</p>
                  <p className="text-xs mt-1 opacity-70">{p.file}</p>

                  <div className="mt-2 text-xs">
                    {p.evidence.slice(0, 3).map((e) => <p key={e}>🔴 {e}</p>)}
                  </div>

                  <div className="mt-2 text-xs">
                    {p.connect.map((c) => <p key={c}>🔧 {c}</p>)}
                  </div>

                  <a href={p.route} className="inline-block mt-2 underline font-bold">
                    Open →
                  </a>
                </div>
              ))}
            </div>
          </details>

          {/* SUSPICIOUS */}
          <details className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)]">
            <summary className="cursor-pointer list-none p-5">
              <p className="text-sm">⚠️ Suspicious</p>
              <p className="text-3xl font-bold mt-2">{suspicious}</p>
              <p className="text-xs mt-2 underline">Click to open Suspicious pages</p>
            </summary>

            <div className="border-t border-[var(--border-color)] p-4 max-h-96 overflow-y-auto">
              {pages.filter((p) => p.status === "SUSPICIOUS").map((p, i) => (
                <div key={p.file} className="border-b border-[var(--border-color)] py-3">
                  <p className="font-bold">
                    #{String(i + 1).padStart(3, "0")} {p.title}
                  </p>
                  <p className="text-xs mt-1 font-mono">{p.route}</p>
                  <p className="text-xs mt-1 opacity-70">{p.file}</p>

                  <div className="mt-2 text-xs">
                    {p.evidence.slice(0, 5).map((e) => <p key={e}>⚠️ {e}</p>)}
                  </div>

                  <a href={p.route} className="inline-block mt-2 underline font-bold">
                    Open →
                  </a>
                </div>
              ))}
            </div>
          </details>

        </div>

        {/* TABLE */}

        <div className="mt-8 rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="text-left p-4">#</th>
                  <th className="text-left p-4">Page</th>
                  <th className="text-left p-4">Route</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Score</th>
                  <th className="text-left p-4">
                    Evidence
                  </th>
                  <th className="text-left p-4">
                    Connect Here
                  </th>
                </tr>
              </thead>

              <tbody>

                {pages.map((page, index) => (

                  <tr
                    key={page.file}
                    className="border-b border-[var(--border-color)] align-top"
                  >

                    <td className="p-4">
                      {String(index + 1).padStart(3, "0")}
                    </td>

                    <td className="p-4 font-semibold">
                      {page.title}

                      <div className="text-xs mt-1 text-[var(--muted-text-color)]">
                        {page.file}
                      </div>
                    </td>

                    <td className="p-4 font-mono text-[var(--primary-color)]">
                      {page.route}
                    </td>

                    <td className="p-4 font-bold whitespace-nowrap">
                      {statusLabel(page.status)}
                    </td>

                    <td className="p-4 font-mono">
                      {page.score}
                    </td>

                    <td className="p-4 min-w-[280px]">

                      {page.evidence.length ? (
                        <ul className="space-y-1">
                          {page.evidence
                            .slice(0, 8)
                            .map((item, i) => (
                              <li key={i}>
                                • {item}
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <span className="text-[var(--muted-text-color)]">
                          No strong evidence
                        </span>
                      )}

                    </td>

                    <td className="p-4 min-w-[280px]">

                      <ul className="space-y-2">
                        {page.connect.map((item, i) => (
                          <li key={i}>
                            🔗 {item}
                          </li>
                        ))}
                      </ul>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

        {/* EXPLANATION */}

        <div className="mt-8 rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] p-6">

          <h2 className="text-xl font-bold">
            Status का मतलब
          </h2>

          <div className="mt-4 space-y-2">

            <p>
              🟢 <b>REAL</b> — Firebase/API/real backend
              connection के strong संकेत मिले।
            </p>

            <p>
              🟡 <b>PARTIAL</b> — कुछ real connection है,
              लेकिन पूरा business flow verify नहीं हुआ।
            </p>

            <p>
              🔴 <b>DUMMY</b> — demo/mock/fake/static
              behavior के strong संकेत मिले।
            </p>

            <p>
              ⚠️ <b>SUSPICIOUS</b> — source से यह साफ नहीं
              है कि page पूरी तरह real है।
            </p>

          </div>

          <p className="mt-5 text-sm text-[var(--muted-text-color)]">
            यह source-code audit है। FINAL verification के
            लिए Firebase/API और actual user flow भी check
            करना जरूरी है।
          </p>

        </div>

      </div>
    </main>
  );
}
