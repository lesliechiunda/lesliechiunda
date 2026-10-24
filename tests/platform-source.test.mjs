import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("portfolio records power both admin and the public project grid", async () => {
  const [schema, repository, admin, components] = await Promise.all([
    read("db/schema.ts"), read("lib/repository.ts"), read("app/admin/AdminWork.tsx"), read("app/components.tsx"),
  ]);
  assert.match(schema, /portfolioProjects/);
  assert.match(repository, /listPortfolioProjects/);
  assert.match(admin, /Show on public Work page/);
  assert.match(components, /listPortfolioProjects\(\)/);
});

test("admin API remains protected and supports portfolio create and update", async () => {
  const [createRoute, updateRoute] = await Promise.all([
    read("app/api/admin/projects/route.ts"), read("app/api/admin/projects/[id]/route.ts"),
  ]);
  assert.match(createRoute, /getAdminForApi/);
  assert.match(createRoute, /createPortfolioProject/);
  assert.match(updateRoute, /getAdminForApi/);
  assert.match(updateRoute, /updatePortfolioProject/);
});

test("outbound automation remains disabled", async () => {
  const adminPage = await read("app/admin/page.tsx");
  assert.doesNotMatch(adminPage, /Agent queue|Outreach|Approvals|Previews|AdminCRM|AdminProjects/);
});

test("invoice records and PDF downloads are owner protected", async () => {
  const [createRoute, pdfRoute, admin] = await Promise.all([
    read("app/api/admin/invoices/route.ts"), read("app/api/admin/invoices/[id]/pdf/route.ts"), read("app/admin/AdminInvoices.tsx"),
  ]);
  assert.match(createRoute, /getAdminForApi/);
  assert.match(pdfRoute, /getAdminForApi/);
  assert.match(pdfRoute, /createInvoicePdf/);
  assert.match(admin, /Download PDF/);
});

test("public navigation uses reliable document links", async () => {
  const components = await read("app/components.tsx");
  assert.match(components, /<a href="\/work">Work<\/a>/);
  assert.doesNotMatch(components, /href="\/concepts"/);
  assert.match(components, /<a href="\/#about">About<\/a>/);
  assert.match(components, /<a href="\/blog">Blog<\/a>/);
  assert.doesNotMatch(components, /from "next\/link"/);
});

test("blog drafts are editable in admin and excluded from public listings", async () => {
  const [schema, repository, admin, publicBlog, articleRoute] = await Promise.all([
    read("db/schema.ts"), read("lib/repository.ts"), read("app/admin/AdminArticles.tsx"), read("app/blog/page.tsx"), read("app/api/admin/articles/[id]/route.ts"),
  ]);
  assert.match(schema, /blogArticles/);
  assert.match(repository, /status: "draft"/);
  assert.match(repository, /eq\(blogArticles\.status, "published"\)/);
  assert.match(repository, /isNotNull\(blogArticles\.publicationApprovedAt\)/);
  assert.match(admin, /Drafts are private/);
  assert.match(admin, /Visibility changes apply immediately/);
  assert.match(admin, /Review draft/);
  assert.match(publicBlog, /listBlogArticles\(\)/);
  assert.match(articleRoute, /getAdminForApi/);
});

test("public article sharing records private aggregate analytics", async () => {
  const [schema, engagement, route, admin] = await Promise.all([
    read("db/schema.ts"), read("app/blog/ArticleEngagement.tsx"), read("app/api/articles/[id]/analytics/route.ts"), read("app/admin/AdminArticles.tsx"),
  ]);
  assert.match(schema, /articleAnalytics/);
  assert.match(engagement, /Share article/);
  assert.match(engagement, /Copy link/);
  assert.match(route, /recordArticleAnalytics/);
  assert.doesNotMatch(route, /listArticleAnalytics/);
  assert.match(admin, /Private analytics/);
});

test("article metadata identifies Leslie as author and supports rich previews", async () => {
  const articlePage = await read("app/blog/[slug]/page.tsx");
  assert.match(articlePage, /type: "article"/);
  assert.match(articlePage, /Published by Leslie Chiunda/);
  assert.match(articlePage, /authors: \["Leslie Chiunda"\]/);
  assert.match(articlePage, /summary_large_image/);
  assert.match(articlePage, /canonical/);
});

test("article covers can be uploaded and removed through protected storage routes", async () => {
  const coverRoute = await read("app/api/admin/articles/[id]/cover/route.ts");
  assert.match(coverRoute, /getAdminForApi/);
  assert.match(coverRoute, /env\.MEDIA\.put/);
  assert.match(coverRoute, /export async function DELETE/);
});

test("professional networking cybersecurity and technology drafts are seeded without publishing", async () => {
  const repository = await read("lib/repository.ts");
  assert.match(repository, /category: "Networking"/);
  assert.match(repository, /category: "Cybersecurity"/);
  assert.match(repository, /category: "Technology"/);
  assert.match(repository, /article_resilient_networks/);
  assert.match(repository, /article_practical_cybersecurity/);
  assert.match(repository, /article_technology_curiosity/);
  assert.match(repository, /publicationApprovedAt: null/);
  assert.match(repository, /const missing = demoBlogArticles\.filter/);
});

test("mobile navigation remains visible and homepage projects are explicitly featured", async () => {
  const [styles, home, components, work, schema] = await Promise.all([
    read("app/globals.css"), read("app/page.tsx"), read("app/components.tsx"), read("app/admin/AdminWork.tsx"), read("db/schema.ts"),
  ]);
  assert.doesNotMatch(styles, /\.site-header nav \{ display: none; \}/);
  assert.match(home, /<ProjectGrid featured \/>/);
  assert.match(components, /!featured \|\| project\.featured/);
  assert.match(work, /Feature on homepage/);
  assert.match(schema, /featured: integer/);
});

test("articles support backdating and display Leslie's author details", async () => {
  const [admin, article, route] = await Promise.all([
    read("app/admin/AdminArticles.tsx"), read("app/blog/ArticleView.tsx"), read("app/api/admin/articles/[id]/route.ts"),
  ]);
  assert.match(admin, /type="datetime-local"/);
  assert.match(route, /"publishedAt"/);
  assert.match(article, /Published by/);
  assert.match(article, /Leslie Chiunda/);
  assert.match(article, /\/leslie\.jpg/);
  assert.match(article, /SAST/);
});

test("site uses the supplied favicon and exposes LinkedIn and WhatsApp in the footer", async () => {
  const [layout, components] = await Promise.all([read("app/layout.tsx"), read("app/components.tsx")]);
  assert.match(layout, /\/icon\.png/);
  assert.match(layout, /\/apple-icon\.png/);
  assert.match(components, /linkedin\.com\/in\/lesliechiunda/);
  assert.match(components, /wa\.me\/27794031161/);
  assert.match(components, /\+27 79 403 1161/);
});

test("concepts are consolidated into grouped work without image overlays", async () => {
  const [components, work, concepts] = await Promise.all([
    read("app/components.tsx"), read("app/work/page.tsx"), read("app/concepts/page.tsx"),
  ]);
  assert.match(components, /Business websites/);
  assert.match(components, /businessProjects/);
  assert.doesNotMatch(components, /className="project-number"/);
  assert.match(work, /workGroups\.map/);
  assert.match(concepts, /redirect\("\/work"\)/);
  assert.doesNotMatch(components, /\/preview\//);
});

test("business website cards use live project domains", async () => {
  const [components, repository] = await Promise.all([read("app/components.tsx"), read("lib/repository.ts")]);
  assert.match(repository, /donarmandorestaurants-demo\.lesliechiunda\.com/);
  assert.match(repository, /mctrenz\.co\.za/);
  assert.match(repository, /cataplanaportuguese-demo\.lesliechiunda\.com/);
  assert.match(components, /business\.previewUrl/);
  assert.doesNotMatch(components, /\/preview\//);
  assert.doesNotMatch(repository, /previewUrl: `\/preview/);
});

test("admin combines businesses and projects with create update image and delete controls", async () => {
  const [work, businessRoute, projectRoute] = await Promise.all([
    read("app/admin/AdminWork.tsx"),
    read("app/api/admin/businesses/[id]/route.ts"), read("app/api/admin/projects/[id]/route.ts"),
  ]);
  assert.match(work, /Add business website/);
  assert.match(work, /Add other project/);
  assert.match(work, /Upload work image/);
  assert.match(work, /Remove image/);
  assert.match(work, /Feature on homepage/);
  assert.match(businessRoute, /export async function DELETE/);
  assert.match(projectRoute, /export async function DELETE/);
});
