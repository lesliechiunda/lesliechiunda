import { asc, count, desc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { agentJobs, approvals, blogArticles, businesses, mediaAssets, outreachEvents, portfolioProjects } from "../db/schema";
import { projects as staticProjects } from "../app/data";

export type BusinessRecord = typeof businesses.$inferSelect;
export type PortfolioProjectRecord = typeof portfolioProjects.$inferSelect;
export type AgentJobRecord = typeof agentJobs.$inferSelect;
export type BlogArticleRecord = typeof blogArticles.$inferSelect;
export type BusinessInput = Partial<Omit<typeof businesses.$inferInsert, "id" | "createdAt" | "updatedAt" | "lastActivityAt">> & {
  name: string;
  slug: string;
};

export const demoBusinesses: BusinessRecord[] = [
  {
    id: "biz_don_armando", name: "Don Armando", slug: "don-armando", industry: "Restaurant", city: "Johannesburg",
    website: null, websiteStatus: "none", source: "manual_research", previewStatus: "live", previewUrl: "https://donarmandorestaurants-demo.lesliechiunda.com/",
    outreachStatus: "draft_ready", approvalStatus: "needs_review", priority: 1, contactName: null, contactEmail: null,
    contactPhone: null, eyebrow: "Neighbourhood kitchen · Johannesburg", headline: "Good food, made for long tables.",
    summary: "A warm, confident restaurant website built around wood-fired plates, easy bookings and a menu that gets to the point.",
    services: "[\"Lunch & dinner\",\"Group bookings\",\"Private events\"]", heroAssetId: null,
    notes: "Live project listed in the public portfolio.",
    lastActivityAt: "2026-08-08 09:40:00", createdAt: "2026-08-05 10:00:00", updatedAt: "2026-08-08 09:40:00",
  },
  {
    id: "biz_cataplana", name: "Cataplana", slug: "cataplana", industry: "Hospitality", city: "Gauteng",
    website: null, websiteStatus: "none", source: "manual_research", previewStatus: "live", previewUrl: "https://cataplanaportuguese-demo.lesliechiunda.com/",
    outreachStatus: "not_started", approvalStatus: "approved_for_preview", priority: 2, contactName: null, contactEmail: null,
    contactPhone: null, eyebrow: "Portuguese table · Gauteng", headline: "The coast, served in the city.",
    summary: "A bright hospitality website with a strong menu story, direct reservation flow and room for events, reviews and seasonal specials.",
    services: "[\"Fresh seafood\",\"Family tables\",\"Celebrations\"]", heroAssetId: null,
    notes: "Live project listed in the public portfolio.",
    lastActivityAt: "2026-08-07 15:20:00", createdAt: "2026-08-04 12:00:00", updatedAt: "2026-08-07 15:20:00",
  },
  {
    id: "biz_mctrenz", name: "McTrenz", slug: "mctrenz", industry: "Local services", city: "Johannesburg",
    website: null, websiteStatus: "social_only", source: "agent_discovery", previewStatus: "live", previewUrl: "https://mctrenz.co.za/",
    outreachStatus: "not_started", approvalStatus: "needs_review", priority: 3, contactName: null, contactEmail: null,
    contactPhone: null, eyebrow: "Precision services · Johannesburg", headline: "Reliable work. Clear answers. No runaround.",
    summary: "A direct, high-trust service-business website designed to turn local searches into qualified enquiries.",
    services: "[\"Fast quotations\",\"On-site service\",\"Ongoing support\"]", heroAssetId: null,
    notes: "Discovered as a possible fit. Human review required before any next step.",
    lastActivityAt: "2026-08-08 08:15:00", createdAt: "2026-08-08 08:15:00", updatedAt: "2026-08-08 08:15:00",
  },
];

const demoProjects: PortfolioProjectRecord[] = staticProjects.map((project, index) => ({
  id: `project_${project.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`,
  title: project.title,
  category: project.category,
  summary: project.summary,
  href: project.href,
  image: project.image ?? null,
  tone: project.tone,
  published: true,
  sortOrder: index,
  createdAt: "2026-08-08 10:00:00",
  updatedAt: "2026-08-08 10:00:00",
}));

export const demoBlogArticles: BlogArticleRecord[] = [
  {
    id: "article_clarity_before_features",
    title: "Clarity before features: what a small-business website actually needs",
    slug: "clarity-before-features",
    excerpt: "A useful website starts by answering the right questions—not by adding more pages, animations or features.",
    category: "Business websites",
    coverImage: "/blog-clarity-before-features.jpg",
    coverAlt: "Editorial desk scene with papers, a cobalt-blue block and a lime-green accent",
    coverObjectKey: null,
    coverContentType: null,
    status: "draft",
    seoTitle: "What a small-business website actually needs",
    seoDescription: "A practical guide to choosing the message, structure and actions that make a small-business website useful.",
    sortOrder: 0,
    publishedAt: null,
    body: `A website can be technically impressive and still make a business harder to understand. Before choosing colours, animations or a long list of features, I start with a simpler question: what should a visitor understand and do next?

## Start with the decision

Most small-business websites have one main job. That might be getting a visitor to request a quotation, book a table, buy a product or trust the business enough to make contact. When that decision is clear, the rest of the website becomes easier to plan.

The home page should quickly explain what the business offers, who it is for and why it is worth choosing. A visitor should not need to decode a slogan before they can understand the service.

## Build the smallest useful structure

A focused website often needs fewer pages than expected. A strong home page, clear services or products, useful proof, an about section and a direct contact path can do more than a large site filled with repeated content.

The goal is not to make the website look small. It is to remove uncertainty. Good structure helps people find answers quickly on a phone, on a slow connection and in the middle of a busy day.

## Add proof where doubt appears

Useful proof can include real photographs, completed work, customer feedback, locations, pricing guidance or a clear explanation of the process. It should appear close to the claim it supports instead of being hidden on a separate page.

Once the message, action and proof are working together, features have a purpose. Booking, payments, customer accounts or automation can then be added because they improve the journey—not simply because they are possible.`,
    createdAt: "2026-08-12T08:00:00.000Z",
    updatedAt: "2026-08-12T08:00:00.000Z",
  },
  {
    id: "article_idea_to_product",
    title: "From rough idea to working product: a practical build process",
    slug: "from-rough-idea-to-working-product",
    excerpt: "How I turn an early idea into a clear, testable digital product without losing the useful parts along the way.",
    category: "Product development",
    coverImage: "/blog-idea-to-product.jpg",
    coverAlt: "A dark creative worktable where rough sketches transition into a polished digital object",
    coverObjectKey: null,
    coverContentType: null,
    status: "draft",
    seoTitle: "From rough idea to working digital product",
    seoDescription: "A practical product-development process from first conversation through design, build and release.",
    sortOrder: 1,
    publishedAt: null,
    body: `Early product ideas are rarely tidy. They arrive as a frustration, a collection of notes or a sentence that begins with “what if”. The first stage of a good build is not writing code. It is finding the useful core of the idea.

## Define the outcome

I begin by describing what should be different for the person using the product. This keeps the conversation grounded in an outcome rather than a list of screens. A clear outcome also makes it easier to decide which features belong in the first version.

## Map the smallest complete journey

The first release should be small, but it still needs to feel complete. I map the essential journey from entry to result: what a person sees, what they need to provide, what the system does and how success is confirmed.

This map exposes gaps before they become expensive. It also gives design and development one shared picture of the product.

## Design with real content

Real names, realistic data and representative images reveal problems that placeholder content hides. The design should work with a long title, an empty state, a slow connection and a small screen—not only in a perfect desktop mock-up.

## Build, test and learn

The first working version creates better questions. People can react to something concrete, and the team can observe where they hesitate or take an unexpected path. Those observations guide the next iteration.

A practical process does not remove ambition. It protects it. By proving the core journey first, there is a stronger foundation for the richer product that follows.`,
    createdAt: "2026-08-12T08:01:00.000Z",
    updatedAt: "2026-08-12T08:01:00.000Z",
  },
  {
    id: "article_trustworthy_business_website",
    title: "What makes a local business website feel trustworthy?",
    slug: "what-makes-a-local-business-website-trustworthy",
    excerpt: "Trust is built through small, specific signals—from honest photography to clear contact details and a calm mobile experience.",
    category: "Design & strategy",
    coverImage: "/blog-trustworthy-business-website.jpg",
    coverAlt: "Warm, welcoming modern business entrance with sunlight and natural materials",
    coverObjectKey: null,
    coverContentType: null,
    status: "draft",
    seoTitle: "What makes a local business website trustworthy?",
    seoDescription: "The practical design and content signals that help local customers trust a business website.",
    sortOrder: 2,
    publishedAt: null,
    body: `People often visit a local business website with a quiet question in mind: can I trust this company with my time, money or personal information? The answer is shaped by many small signals long before a visitor reaches the contact form.

## Be specific

Clear information feels trustworthy. State what the business does, where it operates, when it is open and what a customer can expect next. Specific language is more convincing than broad claims such as “the best service” or “world-class quality”.

## Show the real business

Real photography, genuine work and recognisable locations help a visitor connect the website to a business that exists beyond the screen. Stock imagery can support a design, but it should not replace the evidence that matters.

## Make contact easy

A visible phone number, email address, location and response expectation reduce risk. Contact forms should ask only for the information needed to begin the conversation. On mobile, buttons should be easy to tap and directions should open in the visitor's preferred map.

## Respect the visitor

Trust also comes from what a website avoids: surprise pop-ups, confusing prices, broken links, exaggerated scarcity and forms that collect too much information. Fast loading, readable text and accessible controls communicate care.

A trustworthy website does not need to look corporate. It needs to feel consistent with the real experience the business promises to provide.`,
    createdAt: "2026-08-12T08:02:00.000Z",
    updatedAt: "2026-08-12T08:02:00.000Z",
  },
];

async function seedBlogArticles() {
  const db = getDb();
  const [existing] = await db.select({ value: count() }).from(blogArticles);
  if (!existing?.value) await db.insert(blogArticles).values(demoBlogArticles).onConflictDoNothing();
}

export async function listBlogArticles(options: { includeDrafts?: boolean } = {}): Promise<BlogArticleRecord[]> {
  try {
    const db = getDb();
    await seedBlogArticles();
    const rows = await db.select().from(blogArticles).orderBy(asc(blogArticles.sortOrder), desc(blogArticles.updatedAt));
    return options.includeDrafts ? rows : rows.filter((article) => article.status === "published");
  } catch {
    return options.includeDrafts ? demoBlogArticles : [];
  }
}

export async function getBlogArticleById(id: string) {
  const db = getDb();
  await seedBlogArticles();
  const [article] = await db.select().from(blogArticles).where(eq(blogArticles.id, id)).limit(1);
  return article ?? null;
}

export async function getBlogArticleBySlug(slug: string, options: { includeDrafts?: boolean } = {}) {
  try {
    const db = getDb();
    await seedBlogArticles();
    const [article] = await db.select().from(blogArticles).where(eq(blogArticles.slug, slug)).limit(1);
    if (!article || (!options.includeDrafts && article.status !== "published")) return null;
    return article;
  } catch {
    const article = demoBlogArticles.find((item) => item.slug === slug) ?? null;
    return options.includeDrafts ? article : null;
  }
}

export async function createBlogArticle(input: Pick<BlogArticleRecord, "title" | "slug" | "excerpt" | "body" | "category" | "coverImage" | "coverAlt" | "status" | "seoTitle" | "seoDescription" | "sortOrder">) {
  const db = getDb();
  const now = new Date().toISOString();
  const [created] = await db.insert(blogArticles).values({
    id: crypto.randomUUID(), ...input, publishedAt: input.status === "published" ? now : null, createdAt: now, updatedAt: now,
  }).returning();
  return created;
}

export async function updateBlogArticle(id: string, values: Partial<Omit<BlogArticleRecord, "id" | "createdAt" | "updatedAt">>) {
  const db = getDb();
  const [updated] = await db.update(blogArticles).set({ ...values, updatedAt: new Date().toISOString() }).where(eq(blogArticles.id, id)).returning();
  return updated ?? null;
}

export async function deleteBlogArticle(id: string) {
  const db = getDb();
  const [deleted] = await db.delete(blogArticles).where(eq(blogArticles.id, id)).returning();
  return deleted ?? null;
}

export async function listPortfolioProjects(options: { includeUnpublished?: boolean } = {}) {
  try {
    const db = getDb();
    const [existing] = await db.select({ value: count() }).from(portfolioProjects);
    if (!existing?.value) await db.insert(portfolioProjects).values(demoProjects).onConflictDoNothing();
    const rows = await db.select().from(portfolioProjects).orderBy(asc(portfolioProjects.sortOrder), asc(portfolioProjects.title));
    return options.includeUnpublished ? rows : rows.filter((project) => project.published);
  } catch {
    return options.includeUnpublished ? demoProjects : demoProjects.filter((project) => project.published);
  }
}

export async function createPortfolioProject(input: Pick<PortfolioProjectRecord, "title" | "category" | "summary" | "href" | "image" | "tone" | "published" | "sortOrder">) {
  const db = getDb();
  const now = new Date().toISOString();
  const [created] = await db.insert(portfolioProjects).values({ id: crypto.randomUUID(), ...input, createdAt: now, updatedAt: now }).returning();
  return created;
}

export async function updatePortfolioProject(id: string, values: Partial<Omit<PortfolioProjectRecord, "id" | "createdAt" | "updatedAt">>) {
  const db = getDb();
  const [updated] = await db.update(portfolioProjects).set({ ...values, updatedAt: new Date().toISOString() }).where(eq(portfolioProjects.id, id)).returning();
  return updated;
}

export async function deletePortfolioProject(id: string) {
  const db = getDb();
  const [deleted] = await db.delete(portfolioProjects).where(eq(portfolioProjects.id, id)).returning();
  return deleted ?? null;
}

export async function seedBusinesses() {
  const db = getDb();
  const [existing] = await db.select({ value: count() }).from(businesses);
  if (!existing?.value) await db.insert(businesses).values(demoBusinesses).onConflictDoNothing();
}

export async function listBusinesses(): Promise<BusinessRecord[]> {
  try {
    const db = getDb();
    await seedBusinesses();
    return await db.select().from(businesses).orderBy(asc(businesses.priority), desc(businesses.updatedAt));
  } catch (error) {
    console.warn("D1 is not ready; rendering local preview CRM data.", error);
    return demoBusinesses;
  }
}

export async function updateBusiness(
  id: string,
  values: Partial<Omit<BusinessRecord, "id" | "createdAt" | "updatedAt" | "lastActivityAt">>,
  actorEmail: string,
) {
  const db = getDb();
  const now = new Date().toISOString();
  const [updated] = await db.update(businesses).set({ ...values, updatedAt: now, lastActivityAt: now }).where(eq(businesses.id, id)).returning();
  if (values.approvalStatus) {
    await db.insert(approvals).values({
      id: crypto.randomUUID(), businessId: id, kind: "workflow", decision: values.approvalStatus,
      requestedBy: "admin_ui", decidedBy: actorEmail, decidedAt: now,
    });
  }
  return updated;
}

export async function createBusiness(input: BusinessInput) {
  const db = getDb();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const [created] = await db.insert(businesses).values({
    ...input,
    id,
    source: input.source ?? "manual",
    previewUrl: input.previewUrl ?? input.website ?? null,
    approvalStatus: "needs_review",
    previewStatus: input.previewStatus ?? "draft",
    outreachStatus: "not_started",
    services: input.services ?? "[]",
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
  }).returning();
  return created;
}

export async function getBusinessBySlug(slug: string) {
  try {
    const db = getDb();
    const [business] = await db.select().from(businesses).where(eq(businesses.slug, slug)).limit(1);
    return business ?? null;
  } catch {
    return demoBusinesses.find((business) => business.slug === slug) ?? null;
  }
}

export async function createMediaAsset(input: {
  businessId: string;
  objectKey: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  altText: string;
  createdBy: string;
}) {
  const db = getDb();
  const id = crypto.randomUUID();
  const [asset] = await db.insert(mediaAssets).values({ id, ...input }).returning();
  await db.update(businesses).set({ heroAssetId: id, updatedAt: new Date().toISOString() }).where(eq(businesses.id, input.businessId));
  return asset;
}

export async function getMediaAsset(id: string) {
  const db = getDb();
  const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
  return asset ?? null;
}

export async function removeMediaAsset(id: string, businessId: string) {
  const db = getDb();
  const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
  if (!asset || asset.businessId !== businessId) return null;
  await db.batch([
    db.update(businesses).set({ heroAssetId: null, updatedAt: new Date().toISOString() }).where(eq(businesses.id, businessId)),
    db.delete(mediaAssets).where(eq(mediaAssets.id, id)),
  ]);
  return asset;
}

export async function deleteBusiness(id: string) {
  const db = getDb();
  const assets = await db.select().from(mediaAssets).where(eq(mediaAssets.businessId, id));
  const [deleted] = await db.delete(businesses).where(eq(businesses.id, id)).returning();
  return deleted ? { business: deleted, assets } : null;
}

export async function createAdminWorkflowJob(input: {
  businessId: string;
  jobType: "preview_build_request" | "outreach_draft";
  actorEmail: string;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const [business] = await db.select().from(businesses).where(eq(businesses.id, input.businessId)).limit(1);
  if (!business) return null;

  const actions = [
    db.insert(agentJobs).values({
      id,
      businessId: business.id,
      jobType: input.jobType,
      status: "queued",
      payload: JSON.stringify({ requestedBy: input.actorEmail, businessName: business.name }),
      requiresApproval: true,
      createdAt: now,
      updatedAt: now,
    }),
    db.update(businesses).set({
      previewStatus: input.jobType === "preview_build_request" && business.previewStatus === "not_started" ? "draft" : business.previewStatus,
      outreachStatus: input.jobType === "outreach_draft" ? "draft_ready" : business.outreachStatus,
      updatedAt: now,
      lastActivityAt: now,
    }).where(eq(businesses.id, business.id)),
  ];

  if (input.jobType === "outreach_draft") {
    actions.push(db.insert(outreachEvents).values({
      id: crypto.randomUUID(),
      businessId: business.id,
      channel: "email",
      status: "draft",
      subject: `A website idea for ${business.name}`,
      body: `Hi ${business.contactName || "there"},\n\nI put together an early website idea for ${business.name}. It is only a draft for your review—nothing has been published as an official business website or sent on your behalf.`,
      createdAt: now,
    }));
  }

  await db.batch(actions);
  return { id, businessId: business.id, jobType: input.jobType };
}

export async function listAgentJobs(): Promise<AgentJobRecord[]> {
  try {
    const db = getDb();
    return await db.select().from(agentJobs).orderBy(desc(agentJobs.updatedAt));
  } catch {
    return [];
  }
}

export async function ingestAgentDiscovery(input: {
  name: string; slug: string; industry?: string; city?: string; website?: string | null; notes?: string;
}) {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.batch([
    db.insert(businesses).values({
      id, name: input.name, slug: input.slug, industry: input.industry ?? "Other", city: input.city ?? "",
      website: input.website ?? null, websiteStatus: input.website ? "has_website" : "none", source: "agent_discovery",
      approvalStatus: "needs_review", notes: input.notes ?? "", createdAt: now, updatedAt: now, lastActivityAt: now,
    }),
    db.insert(agentJobs).values({
      id: crypto.randomUUID(), businessId: id, jobType: "research_review", status: "waiting_for_approval",
      payload: JSON.stringify(input), requiresApproval: true, createdAt: now, updatedAt: now,
    }),
  ]);
  return { id, status: "needs_review" as const };
}
