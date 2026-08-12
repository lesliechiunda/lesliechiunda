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
  assert.match(repository, /article\.status === "published" && Boolean\(article\.publicationApprovedAt\)/);
  assert.match(admin, /Drafts are private/);
  assert.match(admin, /Review draft/);
  assert.match(publicBlog, /listBlogArticles\(\)/);
  assert.match(articleRoute, /getAdminForApi/);
});

test("article covers can be uploaded and removed through protected storage routes", async () => {
  const coverRoute = await read("app/api/admin/articles/[id]/cover/route.ts");
  assert.match(coverRoute, /getAdminForApi/);
  assert.match(coverRoute, /env\.MEDIA\.put/);
  assert.match(coverRoute, /export async function DELETE/);
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
