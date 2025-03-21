import * as cheerio from "cheerio";
import fs from "fs";
import glob from "glob";

const buildPath = ".next/server/pages";
const files = glob.sync(`${buildPath}/**/*.html`);

// Exclude system pages from detailed reporting
const systemPages = ["/404.html", "/500.html", "/healthz.html"];

// Summary counters
let totalPages = 0;
let pagesWithIssues = 0;
const issues = {
  shortTitle: 0,
  longTitle: 0,
  missingDescription: 0,
  shortDescription: 0,
  longDescription: 0,
  missingCanonical: 0,
  noindexDetected: 0,
  missingH1: 0,
  incorrectH1: 0,
  missingOgTitle: 0,
  missingOgDesc: 0,
  missingOgImage: 0,
  imagesWithoutAlt: 0,
};

function checkLength(value, min, max) {
  if (!value) return "❌ MISSING";
  const length = value.length;
  if (length < min) return `⚠️ TOO SHORT (${length} chars)`;
  if (length > max) return `⚠️ TOO LONG (${length} chars)`;
  return `✅ OK (${length} chars)`;
}

function updateIssueCount(check, issueType) {
  if (check.includes("❌") || check.includes("⚠️")) {
    issues[issueType]++;
    return true;
  }
  return false;
}

console.log("\n🔍 SEO AUDIT REPORT");
console.log("==================\n");

files.forEach((file) => {
  const relativePath = file.replace(buildPath, "");
  const isSystemPage = systemPages.includes(relativePath);
  totalPages++;

  const content = fs.readFileSync(file, "utf8");
  const $ = cheerio.load(content);

  const title = $("title").text().trim();
  const description = $('meta[name="description"]').attr("content") || "";
  const canonical = $('link[rel="canonical"]').attr("href") || "❌ MISSING";
  const robots =
    $('meta[name="robots"]').attr("content") ||
    "✅ Indexable (no meta robots found)";
  const h1 = $("h1").first().text().trim() || "❌ MISSING";
  const incorrectH1 = "Paramètres d'affichage"; // Expected H1 for comparison

  // OpenGraph meta
  const ogTitle =
    $('meta[property="og:title"]').attr("content") || "❌ MISSING";
  const ogDesc =
    $('meta[property="og:description"]').attr("content") || "❌ MISSING";
  const ogImage =
    $('meta[property="og:image"]').attr("content") || "❌ MISSING";

  // Image alt checks
  const images = $("img");
  let missingAlt = 0;
  let imagesWithMissingAlt = [];

  images.each((_, img) => {
    if (
      !$(img).attr("alt") &&
      !$(img).attr("src").startsWith("data:") &&
      !$(img).attr("role") === "presentation"
    ) {
      missingAlt++;
      const src = $(img).attr("src") || "unknown";
      imagesWithMissingAlt.push(src);
    }
  });

  // Check for issues
  let pageHasIssues = false;

  const titleCheck = checkLength(title, 30, 60);
  pageHasIssues |= updateIssueCount(
    titleCheck,
    title.length < 30 ? "shortTitle" : "longTitle",
  );

  const descriptionCheck = checkLength(description, 50, 160);
  if (!description) issues.missingDescription++;
  else
    pageHasIssues |= updateIssueCount(
      descriptionCheck,
      description.length < 50 ? "shortDescription" : "longDescription",
    );

  if (canonical.includes("❌")) {
    issues.missingCanonical++;
    pageHasIssues = true;
  }

  if (robots.includes("noindex")) {
    issues.noindexDetected++;
    pageHasIssues = true;
  }

  if (h1.includes("❌")) {
    issues.missingH1++;
    pageHasIssues = true;
  } else if (h1 === incorrectH1 && !isSystemPage) {
    issues.incorrectH1++;
    pageHasIssues = true;
  }

  if (ogTitle.includes("❌")) {
    issues.missingOgTitle++;
    pageHasIssues = true;
  }

  if (ogDesc.includes("❌")) {
    issues.missingOgDesc++;
    pageHasIssues = true;
  }

  if (ogImage.includes("❌")) {
    issues.missingOgImage++;
    pageHasIssues = true;
  }

  if (missingAlt > 0) {
    issues.imagesWithoutAlt += missingAlt;
    pageHasIssues = true;
  }

  if (pageHasIssues) pagesWithIssues++;

  console.log(
    `\n🔍 File: ${relativePath}${isSystemPage ? " (System Page)" : ""}`,
  );
  console.log(`  📌 Title: ${title} (${titleCheck})`);
  console.log(`  📝 Meta Description: ${description} (${descriptionCheck})`);
  console.log(`  🔗 Canonical: ${canonical}`);
  console.log(
    `  🤖 Robots Meta: ${robots.includes("noindex") ? "❌ NOINDEX DETECTED" : "✅ Indexable"}`,
  );
  console.log(
    `  🏷️ H1 Tag: ${h1}${h1 === incorrectH1 && !isSystemPage ? " ⚠️ Generic H1 detected" : ""}`,
  );
  console.log(`  📢 OG Title: ${ogTitle}`);
  console.log(`  📄 OG Description: ${ogDesc}`);
  console.log(`  🖼️ OG Image: ${ogImage}`);
  console.log(
    `  🖼️ Missing Alt Attributes: ${missingAlt > 0 ? `⚠️ ${missingAlt} images missing ALT text` : "✅ All images have ALT"}`,
  );

  // Show detailed image info if there are missing alts
  if (missingAlt > 0 && imagesWithMissingAlt.length > 0) {
    console.log("     Images missing ALT:");
    imagesWithMissingAlt.forEach((src, i) => {
      if (i < 5) console.log(`     - ${src}`);
    });
    if (imagesWithMissingAlt.length > 5) {
      console.log(`     ... and ${imagesWithMissingAlt.length - 5} more`);
    }
  }
});

// Print summary report
console.log("\n\n📊 SUMMARY REPORT");
console.log("================");
console.log(`Total pages analyzed: ${totalPages}`);
console.log(
  `Pages with SEO issues: ${pagesWithIssues} (${Math.round((pagesWithIssues / totalPages) * 100)}%)\n`,
);

console.log("🚨 Critical Issues:");
console.log(`- Missing canonical links: ${issues.missingCanonical}`);
console.log(`- Missing H1 tags: ${issues.missingH1}`);
console.log(`- Generic/incorrect H1 tags: ${issues.incorrectH1}`);
console.log(`- Missing meta descriptions: ${issues.missingDescription}`);
console.log(`- Missing OG title: ${issues.missingOgTitle}`);
console.log(`- Missing OG description: ${issues.missingOgDesc}`);
console.log(`- Missing OG image: ${issues.missingOgImage}`);
console.log(`- Images without alt text: ${issues.imagesWithoutAlt}`);

console.log("\n⚠️ Warnings:");
console.log(`- Titles too short: ${issues.shortTitle}`);
console.log(`- Titles too long: ${issues.longTitle}`);
console.log(`- Descriptions too short: ${issues.shortDescription}`);
console.log(`- Descriptions too long: ${issues.longDescription}`);
console.log(`- Pages with noindex: ${issues.noindexDetected}`);

console.log("\n✅ Recommendations:");
if (issues.missingCanonical > 0)
  console.log("- Add canonical links to all pages");
if (issues.incorrectH1 > 0)
  console.log("- Fix generic H1 tags (currently 'Paramètres d'affichage')");
if (issues.shortTitle > 0)
  console.log("- Improve short page titles (aim for 30-60 characters)");
if (
  issues.missingOgTitle > 0 ||
  issues.missingOgDesc > 0 ||
  issues.missingOgImage > 0
)
  console.log("- Add Open Graph meta tags for better social sharing");
if (issues.imagesWithoutAlt > 0)
  console.log("- Add alt text to all images for accessibility and SEO");
