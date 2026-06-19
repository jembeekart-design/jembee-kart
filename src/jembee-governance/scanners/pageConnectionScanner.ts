// src/jembee-governance/scanners/pageConnectionScanner.ts

import fs from "fs";
import path from "path";
import {
  GovernanceViolation,
  PageConnectionReport,
} from "../types/governance.types";

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
  /**
   * Main Scan Entry
   */
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

      const deepLinkConnected =
        navbarConnected || footerConnected;

      const report: PageConnectionReport = {
        pageName: route,
        routeExists: true,
        navbarConnected,
        footerConnected,
        deepLinkConnected,
        passed: deepLinkConnected,
      };

      reports.push(report);

      /**
       * Orphan Page
       */
      if (!deepLinkConnected) {
        violations.push({
          id: "PAGE_ORPHAN",
          title: "Disconnected Page Detected",
          description:
            "Page route exists but is not connected from navbar or footer.",
          category: "PAGE_CONNECTION",
          severity: "WARNING",
          filePath: routeInfo.filePath,
          pageName: route,
          recommendation:
            "Add route to navigation, footer, dashboard, or internal links.",
          detectedAt: new Date().toISOString(),
        });
      }

      /**
       * Navbar Missing
       */
      if (!navbarConnected) {
        violations.push({
          id: "PAGE_NAVBAR_MISSING",
          title: "Navbar Connection Missing",
          description:
            "Page is not accessible from primary navigation.",
          category: "PAGE_CONNECTION",
          severity: "INFO",
          filePath: routeInfo.filePath,
          pageName: route,
          recommendation:
            "Consider adding route to Navbar if user-facing.",
          detectedAt: new Date().toISOString(),
        });
      }

      /**
       * Footer Missing
       */
      if (!footerConnected) {
        violations.push({
          id: "PAGE_FOOTER_MISSING",
          title: "Footer Connection Missing",
          description:
            "Page is not accessible from footer navigation.",
          category: "PAGE_CONNECTION",
          severity: "INFO",
          filePath: routeInfo.filePath,
          pageName: route,
          recommendation:
            "Consider adding route to Footer if appropriate.",
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

  /**
   * Discover Next.js App Routes
   */
  private discoverRoutes(projectRoot: string): RouteInfo[] {
    const routes: RouteInfo[] = [];

    const appDir = path.join(projectRoot, "src", "app");

    if (!fs.existsSync(appDir)) {
      return routes;
    }

    const walk = (dir: string) => {
      const entries = fs.readdirSync(dir);

      for (const entry of entries) {
        const fullPath = path.join(dir, entry);

        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walk(fullPath);
          continue;
        }

        const isPage =
          entry === "page.tsx" ||
          entry === "page.ts" ||
          entry === "page.jsx" ||
          entry === "page.js";

        if (!isPage) continue;

        const relativePath = path
          .relative(appDir, fullPath)
          .replace(/\\/g, "/");

        const route = this.convertToRoute(relativePath);

        routes.push({
          route,
          filePath: fullPath,
        });
      }
    };

    walk(appDir);

    return routes;
  }

  /**
   * Convert Next.js file path -> route
   */
  private convertToRoute(relativePath: string): string {
    let route = relativePath
      .replace("/page.tsx", "")
      .replace("/page.ts", "")
      .replace("/page.jsx", "")
      .replace("/page.js", "");

    if (route === "page.tsx" || route === "") {
      return "/";
    }

    route = "/" + route;

    route = route
      .replace("/page.tsx", "")
      .replace("/page.ts", "")
      .replace("/page.jsx", "")
      .replace("/page.js", "");

    return route;
  }

  /**
   * Find files by keywords
   */
  private findFilesByKeywords(
    rootDir: string,
    keywords: string[]
  ): string[] {
    const files: string[] = [];

    const walk = (dir: string) => {
      const entries = fs.readdirSync(dir);

      for (const entry of entries) {
        const fullPath = path.join(dir, entry);

        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (
            entry === "node_modules" ||
            entry === ".next" ||
            entry === ".git" ||
            entry === "dist"
          ) {
            continue;
          }

          walk(fullPath);
        } else {
          const lower = fullPath.toLowerCase();

          const matched = keywords.some((k) =>
            lower.includes(k.toLowerCase())
          );

          if (matched) {
            files.push(fullPath);
          }
        }
      }
    };

    walk(rootDir);

    return files;
  }

  /**
   * Merge file contents
   */
  private readFiles(files: string[]): string {
    return files
      .map((file) => {
        try {
          return fs.readFileSync(file, "utf8");
        } catch {
          return "";
        }
      })
      .join("\n");
  }
}

export const pageConnectionScanner =
  new PageConnectionScanner();
