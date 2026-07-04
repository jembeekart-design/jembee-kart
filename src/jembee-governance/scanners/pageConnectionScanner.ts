import fs from "fs";
import path from "path";
import {
  GovernanceViolation,
  PageConnectionReport,
} from "../types/governance.types";
import { shouldExcludeDirectory } from "../utils/scannerExclusions";

export interface PageConnectionScanResult {
  pagesScanned: number;
  reports: PageConnectionReport[];
  violations: GovernanceViolation[];
}

interface RouteInfo {
  route: string;
  filePath: string;
}

export class PageConnectionScanner {
  public scanProject(projectRoot: string): PageConnectionScanResult {
    const reports: PageConnectionReport[] = [];
    const violations: GovernanceViolation[] = [];

    const routes = this.discoverRoutes(projectRoot);

    const navbarFiles = this.findFilesByKeywords(projectRoot, [
      "navbar",
      "header",
      "navigation",
    ]);

    const footerFiles = this.findFilesByKeywords(projectRoot, [
      "footer",
    ]);

    const navbarContent = this.readFiles(navbarFiles);
    const footerContent = this.readFiles(footerFiles);

    for (const routeInfo of routes) {
      const route = routeInfo.route;
      const isAdmin = route.startsWith("/admin");
const isApi = route.startsWith("/api");

const isAuth =
  route === "/login" ||
  route === "/signup" ||
  route === "/verify-email";

const isPayment =
  route.includes("payment") ||
  route.includes("checkout");

if (isApi || isAuth || isPayment) {
  continue;
}

      const navbarConnected =
        navbarContent.includes(`"${route}"`) ||
        navbarContent.includes(`'${route}'`) ||
        navbarContent.includes(`href="${route}"`) ||
        navbarContent.includes(`href='${route}'`);

      const footerConnected =
        footerContent.includes(`"${route}"`) ||
        footerContent.includes(`'${route}'`) ||
        footerContent.includes(`href="${route}"`) ||
        footerContent.includes(`href='${route}'`);

      const deepLinkConnected = navbarConnected || footerConnected;

      const report: PageConnectionReport = {
  pageName: route,
  route: route,
  routeExists: true,
  navbarConnected,
  footerConnected,
  deepLinkConnected,

  requiredParentRoute: undefined,
  actualParentRoutes: [],
  businessFlow: undefined,
  businessImpact: undefined,
  missingConnectionSuggestion: undefined,
  priority: undefined,
  expectedGovernanceScoreGain: undefined,
 connections: [],
orphanStatus: false,
brokenLinks: [],
lastScanned: new Date().toISOString(),
  passed: deepLinkConnected,
};

      reports.push(report);

      if (!deepLinkConnected) {
        violations.push({
          id: "PAGE_ORPHAN",
          title: "Disconnected Page Detected",
          description: "Page route exists but is not connected from navbar or footer.",
          category: "PAGE_CONNECTION",
          severity: "WARNING",
          filePath: routeInfo.filePath,
          pageName: route,
          recommendation: "Add route to navigation, footer, dashboard, or internal links.",
          detectedAt: new Date().toISOString(),
        });
      }

      if (!navbarConnected) {
        violations.push({
          id: "PAGE_NAVBAR_MISSING",
          title: "Navbar Connection Missing",
          description: "Page is not accessible from primary navigation.",
          category: "PAGE_CONNECTION",
          severity: "INFO",
          filePath: routeInfo.filePath,
          pageName: route,
          recommendation: "Consider adding route to Navbar if user-facing.",
          detectedAt: new Date().toISOString(),
        });
      }

      if (!footerConnected) {
        violations.push({
          id: "PAGE_FOOTER_MISSING",
          title: "Footer Connection Missing",
          description: "Page is not accessible from footer navigation.",
          category: "PAGE_CONNECTION",
          severity: "INFO",
          filePath: routeInfo.filePath,
          pageName: route,
          recommendation: "Consider adding route to Footer if appropriate.",
          detectedAt: new Date().toISOString(),
        });
      }
    }

    return {
      pagesScanned: routes.length,
      reports,
      violations,
    };
  }

  private discoverRoutes(projectRoot: string): RouteInfo[] {
    const routes: RouteInfo[] = [];
    const appDir = path.join(projectRoot, "src", "app");

    if (!fs.existsSync(appDir)) return routes;

    const walk = (dir: string) => {
      const entries = fs.readdirSync(dir);

      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip excluded directories in route discovery
          if (shouldExcludeDirectory(entry)) continue;
          walk(fullPath);
          continue;
        }

        const isPage = /page\.(tsx|ts|jsx|js)$/.test(entry);
        if (!isPage) continue;

        const relativePath = path.relative(appDir, fullPath).replace(/\\/g, "/");
        const route = this.convertToRoute(relativePath);

        routes.push({ route, filePath: fullPath });
      }
    };

    walk(appDir);
    return routes;
  }

  private convertToRoute(relativePath: string): string {
    let route = relativePath.replace(/\/page\.(tsx|ts|jsx|js)$/, "");
    return route === "" ? "/" : "/" + route;
  }

  private findFilesByKeywords(rootDir: string, keywords: string[]): string[] {
    const files: string[] = [];

    const walk = (dir: string) => {
      const entries = fs.readdirSync(dir);

      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Integrated centralized exclusion
          if (shouldExcludeDirectory(entry)) continue;
          walk(fullPath);
        } else {
          const lower = fullPath.toLowerCase();
          if (keywords.some((k) => lower.includes(k.toLowerCase()))) {
            files.push(fullPath);
          }
        }
      }
    };
    walk(rootDir);
    return files;
  }

  private readFiles(files: string[]): string {
    return files.map((file) => {
      try { return fs.readFileSync(file, "utf8"); } 
      catch { return ""; }
    }).join("\n");
  }
}

export const pageConnectionScanner = new PageConnectionScanner();
