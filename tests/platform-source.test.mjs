import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("portfolio records power both admin and the public project grid", async () => {
  const [schema, repository, admin, components] = await Promise.all([
    read("db/schema.ts"), read("lib/repository.ts"), read("app/admin/AdminProjects.tsx"), read("app/components.tsx"),
  ]);
  assert.match(schema, /portfolioProjects/);
  assert.match(repository, /listPortfolioProjects/);
  assert.match(admin, /Show on public website/);
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
  assert.match(adminPage, /No mail provider or send action is connected/);
  assert.doesNotMatch(adminPage, /sendEmail|sendMail/);
});

test("admin can queue safe internal workflow work without sending anything", async () => {
  const [queueRoute, admin] = await Promise.all([
    read("app/api/admin/businesses/[id]/workflow/route.ts"), read("app/admin/AdminCRM.tsx"),
  ]);
  assert.match(queueRoute, /getAdminForApi/);
  assert.match(queueRoute, /createAdminWorkflowJob/);
  assert.match(admin, /Queue website build/);
  assert.match(admin, /Create outreach draft/);
  assert.match(admin, /will not be sent automatically/);
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
  const [styles, home, components, projects, crm, schema] = await Promise.all([
    read("app/globals.css"), read("app/page.tsx"), read("app/components.tsx"), read("app/admin/AdminProjects.tsx"), read("app/admin/AdminCRM.tsx"), read("db/schema.ts"),
  ]);
  assert.doesNotMatch(styles, /\.site-header nav \{ display: none; \}/);
  assert.match(home, /<ProjectGrid featured \/>/);
  assert.match(components, /!featured \|\| project\.featured/);
  assert.match(projects, /Feature on homepage/);
  assert.match(crm, /Feature on homepage/);
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
  assert.match(components, /donarmandorestaurants-demo\.lesliechiunda\.com/);
  assert.match(components, /mctrenz\.co\.za/);
  assert.match(components, /cataplanaportuguese-demo\.lesliechiunda\.com/);
  assert.doesNotMatch(components, /\/preview\//);
  assert.doesNotMatch(repository, /previewUrl: `\/preview/);
});

test("admin exposes create update reorder and delete controls", async () => {
  const [crm, projects, businessRoute, projectRoute] = await Promise.all([
    read("app/admin/AdminCRM.tsx"), read("app/admin/AdminProjects.tsx"),
    read("app/api/admin/businesses/[id]/route.ts"), read("app/api/admin/projects/[id]/route.ts"),
  ]);
  assert.match(crm, /Choose & upload image/);
  assert.match(crm, /Remove current/);
  assert.match(crm, /Delete listing/);
  assert.match(crm, /Move up/);
  assert.match(projects, /Delete project/);
  assert.match(projects, /Move down/);
  assert.match(businessRoute, /export async function DELETE/);
  assert.match(projectRoute, /export async function DELETE/);
});
