#!/usr/bin/env node

import { chromium } from "playwright";
import sharp from "sharp";
import * as http from "node:http";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_DIR = path.resolve(__dirname, "..");

// ===== Pattern data with thumbnail mapping =====

interface Pattern {
  id: string;
  name: string;
  category: string;
  thumbnail_idx: number;
}

const PATTERNS: Pattern[] = [
  // A. タイトル・セクション系
  { id: "1", name: "タイトルスライド", category: "A. タイトル・セクション系", thumbnail_idx: 4 },
  { id: "2", name: "セクション開始", category: "A. タイトル・セクション系", thumbnail_idx: 5 },
  { id: "3", name: "セクション終了・まとめ", category: "A. タイトル・セクション系", thumbnail_idx: 6 },
  { id: "4", name: "目次スライド", category: "A. タイトル・セクション系", thumbnail_idx: 2 },
  { id: "5", name: "クロージング", category: "A. タイトル・セクション系", thumbnail_idx: 7 },
  // B. カラムレイアウト系
  { id: "6", name: "2カラム比較", category: "B. カラムレイアウト系", thumbnail_idx: 9 },
  { id: "7a", name: "2カラム（テキスト＋画像）", category: "B. カラムレイアウト系", thumbnail_idx: 10 },
  { id: "7b", name: "2カラム（画像＋テキスト）", category: "B. カラムレイアウト系", thumbnail_idx: 11 },
  { id: "8", name: "3カラム（画像＋テキスト）", category: "B. カラムレイアウト系", thumbnail_idx: 12 },
  { id: "9", name: "3カラム（アクセントカラー付き）", category: "B. カラムレイアウト系", thumbnail_idx: 13 },
  { id: "10", name: "4カラムレイアウト", category: "B. カラムレイアウト系", thumbnail_idx: 14 },
  { id: "11", name: "5カラム（成熟度レベル）", category: "B. カラムレイアウト系", thumbnail_idx: 15 },
  { id: "12", name: "2x2グリッド（画像＋テキスト）", category: "B. カラムレイアウト系", thumbnail_idx: 16 },
  { id: "13", name: "2x3グリッドレイアウト", category: "B. カラムレイアウト系", thumbnail_idx: 17 },
  // C. 縦並びリスト系
  { id: "14", name: "縦3つステップ", category: "C. 縦並びリスト系", thumbnail_idx: 19 },
  { id: "15", name: "番号付きステップ（横型）", category: "C. 縦並びリスト系", thumbnail_idx: 20 },
  { id: "16", name: "タイムラインレイアウト", category: "C. 縦並びリスト系", thumbnail_idx: 21 },
  { id: "17", name: "アイコン付きリスト", category: "C. 縦並びリスト系", thumbnail_idx: 22 },
  // D. パネルデザイン系
  { id: "18", name: "基本パネル（画像ヘッダー付き）", category: "D. パネルデザイン系", thumbnail_idx: 24 },
  { id: "19", name: "強調パネル（左ボーダー付き）", category: "D. パネルデザイン系", thumbnail_idx: 25 },
  { id: "20", name: "ガラス風パネル", category: "D. パネルデザイン系", thumbnail_idx: 26 },
  { id: "21", name: "グラデーションパネル", category: "D. パネルデザイン系", thumbnail_idx: 27 },
  { id: "22", name: "カード型レイアウト（画像付き）", category: "D. パネルデザイン系", thumbnail_idx: 28 },
  // E. 背景・画像系
  { id: "23", name: "背景画像全画面", category: "E. 背景・画像系", thumbnail_idx: 30 },
  { id: "24", name: "背景画像右側配置", category: "E. 背景・画像系", thumbnail_idx: 31 },
  { id: "25", name: "引用スライド", category: "E. 背景・画像系", thumbnail_idx: 32 },
  { id: "26", name: "複数画像・分割背景", category: "E. 背景・画像系", thumbnail_idx: 33 },
  // F. 強調・特殊系
  { id: "27", name: "統計強調スライド", category: "F. 強調・特殊系", thumbnail_idx: 35 },
  { id: "28", name: "中央配置メッセージ", category: "F. 強調・特殊系", thumbnail_idx: 36 },
  { id: "29", name: "Q&A スライド", category: "F. 強調・特殊系", thumbnail_idx: 37 },
  // G. 応用パターン系
  { id: "30", name: "QRコード付き紹介", category: "G. 応用パターン系", thumbnail_idx: 39 },
  { id: "31", name: "問いかけスライド", category: "G. 応用パターン系", thumbnail_idx: 40 },
  { id: "32", name: "脚注引用スライド", category: "G. 応用パターン系", thumbnail_idx: 41 },
  { id: "33", name: "インライン画像スライド", category: "G. 応用パターン系", thumbnail_idx: 42 },
  { id: "34", name: "統計比率スライド", category: "G. 応用パターン系", thumbnail_idx: 43 },
  { id: "35", name: "テキスト＋統計パネル混合", category: "G. 応用パターン系", thumbnail_idx: 44 },
  { id: "36", name: "まとめスライド（ガラス風縦並び）", category: "G. 応用パターン系", thumbnail_idx: 45 },
  { id: "37", name: "シンプルリスト＋補足パネル", category: "G. 応用パターン系", thumbnail_idx: 46 },
  { id: "38", name: "対比＋結論スライド", category: "G. 応用パターン系", thumbnail_idx: 47 },
  { id: "39", name: "テーブル＋ハイライト", category: "G. 応用パターン系", thumbnail_idx: 48 },
];

// ===== Thumbnail processing =====

async function makeThumbnailDataUri(imgPath: string, width = 320): Promise<string> {
  const buf = await sharp(imgPath).resize(width).png().toBuffer();
  return `data:image/png;base64,${buf.toString("base64")}`;
}

async function buildPatternsWithThumbnails() {
  const thumbnailDir = path.join(SCRIPT_DIR, "pattern-thumbnails");
  const result = [];
  for (const p of PATTERNS) {
    const imgFile = path.join(thumbnailDir, `pattern.${String(p.thumbnail_idx).padStart(3, "0")}.png`);
    let thumb = "";
    if (fs.existsSync(imgFile)) {
      thumb = await makeThumbnailDataUri(imgFile);
    }
    result.push({ id: p.id, name: p.name, category: p.category, thumb });
  }
  return result;
}

// ===== HTTP server =====

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function serve(directory: string, listenPort = 0): Promise<{ server: http.Server; port: number }> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || "/", "http://localhost");
      const filePath = path.join(directory, decodeURIComponent(url.pathname));
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        res.writeHead(404);
        res.end("Not Found");
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(listenPort, "127.0.0.1", () => {
      const addr = server.address() as { port: number };
      resolve({ server, port: addr.port });
    });
  });
}

// ===== File picker mode =====

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "__pycache__", ".venv"]);
const SKIP_SUFFIXES = ["-review.html", "-nav.html"];
const SKIP_FILES = new Set(["picker.html", "review-template.html"]);

function findDeckFiles(rootDir: string, maxDepth = 4): { name: string; dir: string; path: string }[] {
  const results: { name: string; dir: string; path: string }[] = [];

  function walk(dir: string, depth: number) {
    if (depth > maxDepth) return;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) {
          walk(path.join(dir, entry.name), depth + 1);
        }
      } else if (entry.isFile() && entry.name.endsWith(".html")) {
        if (SKIP_SUFFIXES.some((s) => entry.name.endsWith(s))) continue;
        if (SKIP_FILES.has(entry.name)) continue;
        const fullPath = path.join(dir, entry.name);
        const relDir = path.relative(rootDir, dir);
        results.push({ name: entry.name, dir: relDir, path: fullPath });
      }
    }
  }

  walk(rootDir, 0);
  results.sort((a, b) => a.dir.localeCompare(b.dir) || a.name.localeCompare(b.name));
  return results;
}

function createAppServer(rootDir: string, listenPort = 0): Promise<{ server: http.Server; port: number }> {
  return new Promise((resolve) => {
    const pickerHtml = fs.readFileSync(path.join(SCRIPT_DIR, "templates", "picker.html"), "utf-8");
    const reviewCache = new Map<string, string>();

    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url || "/", "http://localhost");

      // API: list deck files
      if (url.pathname === "/api/files") {
        const files = findDeckFiles(rootDir);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(files));
        return;
      }

      // API: generate review for a file
      if (url.pathname === "/api/generate") {
        const filePath = url.searchParams.get("file");
        if (!filePath || !fs.existsSync(filePath)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "File not found" }));
          return;
        }
        try {
          const { html, deckDir, reviewFilename } = await generate(filePath);
          const relDir = path.relative(rootDir, deckDir);
          const reviewUrl = `/review/${relDir ? relDir + "/" : ""}${reviewFilename}`;
          reviewCache.set(reviewUrl, html);
          res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ url: reviewUrl }));
        } catch (err: any) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }

      // API: shutdown server
      if (url.pathname === "/api/shutdown") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
        console.log("\nServer stopped.");
        setTimeout(() => process.exit(0), 100);
        return;
      }

      // Serve generated review pages from memory
      if (url.pathname.startsWith("/review/") && reviewCache.has(url.pathname)) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(reviewCache.get(url.pathname));
        return;
      }

      // Serve picker page at root
      if (url.pathname === "/") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(pickerHtml);
        return;
      }

      // Static files from rootDir
      const filePath = path.join(rootDir, decodeURIComponent(url.pathname));
      const resolved = path.resolve(filePath);
      if (!resolved.startsWith(path.resolve(rootDir))) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
        res.writeHead(404);
        res.end("Not Found");
        return;
      }
      const ext = path.extname(resolved);
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      fs.createReadStream(resolved).pipe(res);
    });

    server.listen(listenPort, "127.0.0.1", () => {
      const addr = server.address() as { port: number };
      resolve({ server, port: addr.port });
    });
  });
}

// ===== Slide capture =====

async function captureSlides(deckPath: string, width = 1280, height = 720) {
  const deckDir = path.dirname(deckPath);
  const deckName = path.basename(deckPath);
  const { server: srv, port } = await serve(deckDir);
  const url = `http://127.0.0.1:${port}/${deckName}`;

  const images: string[] = [];
  let titles: string[] = [];

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(url, { waitUntil: "networkidle" });

    const isBespoke = await page.evaluate(() => {
      return !!document.querySelector('script[src*="bespoke"]')
        || !!document.querySelector(".bespoke-marp-osc");
    });

    titles = await page.evaluate(() =>
      Array.from(document.querySelectorAll("section")).map((s) => {
        const h = s.querySelector("h1, h2");
        return h?.textContent?.trim() ?? "";
      })
    );

    if (isBespoke) {
      const total: number = await page.evaluate(() => {
        const osc = document.querySelector(".bespoke-marp-osc");
        if (osc) {
          const m = (osc.textContent || "").match(/(\d+)\s*of\s*(\d+)/i);
          if (m) return parseInt(m[2]);
        }
        return document.querySelectorAll("section").length;
      });

      await page.evaluate(() => {
        const osc = document.querySelector(".bespoke-marp-osc") as HTMLElement | null;
        if (osc) osc.style.display = "none";
      });

      for (let i = 0; i < total; i++) {
        const buf = await page.screenshot();
        images.push(`data:image/png;base64,${buf.toString("base64")}`);
        if (i < total - 1) {
          await page.keyboard.press("ArrowRight");
          await page.waitForTimeout(500);
        }
      }
    } else {
      const total: number = await page.evaluate(
        () => document.querySelectorAll("svg[data-marpit-svg]").length
      );

      await page.evaluate(() => {
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.body.style.margin = "0";
        document.body.style.padding = "0";
      });

      for (let i = 0; i < total; i++) {
        await page.evaluate((idx: number) => {
          document.querySelectorAll("svg[data-marpit-svg]").forEach((el, j) => {
            (el as HTMLElement).style.display = j === idx ? "" : "none";
          });
        }, i);
        await page.waitForTimeout(100);
        const buf = await page.screenshot();
        images.push(`data:image/png;base64,${buf.toString("base64")}`);
      }
    }

    await browser.close();
  } finally {
    srv.close();
  }

  return { images, titles };
}

// ===== Generate =====

async function generate(deckPath: string) {
  deckPath = path.resolve(deckPath);
  const deckName = path.basename(deckPath, path.extname(deckPath));
  const deckDir = path.dirname(deckPath);

  console.log("Building pattern thumbnails...");
  const patterns = await buildPatternsWithThumbnails();

  console.log("Capturing slide screenshots...");
  const { images: slideImages, titles } = await captureSlides(deckPath);
  console.log(`Captured ${slideImages.length} slides`);

  const templatePath = path.join(SCRIPT_DIR, "templates", "review-template.html");
  let html = fs.readFileSync(templatePath, "utf-8");

  html = html.replaceAll("__DECK_NAME__", deckName);
  html = html.replaceAll("__DECK_PATH__", path.relative(process.cwd(), deckPath));
  html = html.replace("__PATTERNS_DATA__", JSON.stringify(patterns));
  html = html.replace("__SLIDE_IMAGES__", JSON.stringify(slideImages));
  html = html.replace("__SLIDE_TITLES__", JSON.stringify(titles));

  const reviewFilename = `${deckName}-review.html`;

  return { html, deckDir, reviewFilename };
}

// ===== CLI =====

function openBrowser(url: string) {
  const cmd =
    process.platform === "darwin" ? "open" :
    process.platform === "win32" ? "start \"\"" : "xdg-open";
  exec(`${cmd} "${url}"`);
}

async function checkChromium() {
  try {
    const browser = await chromium.launch({ headless: true });
    await browser.close();
  } catch {
    console.error("\nError: Chromium が見つかりません。以下のコマンドでインストールしてください:\n");
    console.error("  npx playwright install chromium\n");
    process.exit(1);
  }
}

async function main() {
  const noBrowser = process.argv.includes("--no-browser");
  const args = process.argv.slice(2).filter((a) => a !== "--no-browser");

  await checkChromium();

  const shutdown = (server: http.Server) => {
    process.on("SIGINT", () => { server.close(); console.log("\nServer stopped."); process.exit(0); });
    process.on("SIGTERM", () => { server.close(); process.exit(0); });
  };

  if (args.length === 0) {
    // Picker mode: serve from CWD
    const rootDir = process.cwd();
    const { server, port } = await createAppServer(rootDir);
    const url = `http://127.0.0.1:${port}/`;
    console.log(`Slide Review: ${url}`);
    if (!noBrowser) openBrowser(url);
    console.log("Press Ctrl+C to stop the server");
    shutdown(server);
    return;
  }

  // Direct mode: generate review for a specific deck, then use app server
  const deckPath = path.resolve(args[0]);
  if (!fs.existsSync(deckPath)) {
    console.log(`Error: ${deckPath} not found`);
    process.exit(1);
  }

  const rootDir = process.cwd();
  const { server, port } = await createAppServer(rootDir);

  // Generate via the app server's API to populate its cache
  const generateUrl = `http://127.0.0.1:${port}/api/generate?file=${encodeURIComponent(deckPath)}`;
  const genRes = await fetch(generateUrl);
  const genData = await genRes.json() as { url?: string; error?: string };
  if (!genData.url) {
    console.error(`Error: ${genData.error || "generation failed"}`);
    process.exit(1);
  }

  const fullUrl = `http://127.0.0.1:${port}${genData.url}`;
  console.log(`Review page: ${fullUrl}`);

  if (!noBrowser) {
    openBrowser(fullUrl);
  }

  console.log("Press Ctrl+C to stop the server");
  shutdown(server);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
