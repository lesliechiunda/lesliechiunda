import { asc, count, desc, eq, inArray } from "drizzle-orm";
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
    publicationApprovedAt: null,
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
    publicationApprovedAt: null,
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
    publicationApprovedAt: null,
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
  {
    id: "article_resilient_networks",
    title: "A good network should make growth feel boring",
    slug: "a-good-network-should-make-growth-feel-boring",
    excerpt: "The best business networks are rarely noticed. They stay predictable as people, devices, locations and expectations grow.",
    category: "Networking",
    coverImage: "/blog-resilient-networks.jpg",
    coverAlt: "Abstract architectural network with luminous blue fibre paths connecting resilient nodes",
    coverObjectKey: null,
    coverContentType: null,
    status: "draft",
    seoTitle: "Why resilient business networks make growth feel boring",
    seoDescription: "A practical view of network design, redundancy, visibility and capacity for growing organisations.",
    sortOrder: 3,
    publishedAt: null,
    publicationApprovedAt: null,
    body: `A network is doing its job when the people using it do not have to think about it. Calls remain clear, files open quickly, cloud systems respond and a new employee can get connected without turning the day into an infrastructure project.

That calm experience is not accidental. It comes from designing for change before change becomes urgent.

## Begin with how the business works

Network design should start with people and operations, not a shopping list of equipment. Which activities cannot stop? Where do staff work? Which systems depend on the internet? What happens when a connection, switch or power source fails?

The answers reveal where capacity, separation and redundancy matter. A restaurant, design studio and distributed services company can have similar device counts but very different risk profiles.

## Separate what should not share risk

Guest Wi-Fi, employee devices, operational systems, cameras and infrastructure management should not all live in one flat network. Thoughtful segmentation reduces unnecessary exposure and makes troubleshooting more precise.

This does not mean making the environment complicated for its own sake. The structure should be documented, understandable and proportionate to the organisation.

## Build visibility before adding complexity

A resilient network needs useful monitoring. Teams should be able to see whether poor performance begins with the internet connection, wireless coverage, a busy uplink or an unhealthy device. Without visibility, upgrades become guesses.

Baselines also matter. Knowing what normal traffic, latency and utilisation look like makes unusual behaviour easier to detect before it becomes an outage.

## Treat documentation as infrastructure

Diagrams, addressing plans, equipment records, configuration backups and recovery steps are part of the network. They reduce dependency on memory and make future changes safer.

Growth should not feel dramatic. When foundations are clear and spare capacity is intentional, adding a person, service or location becomes routine. That kind of boring is a technical achievement.`,
    createdAt: "2026-08-12T10:00:00.000Z",
    updatedAt: "2026-08-12T10:00:00.000Z",
  },
  {
    id: "article_practical_cybersecurity",
    title: "Cybersecurity is a habit, not a product",
    slug: "cybersecurity-is-a-habit-not-a-product",
    excerpt: "Security improves when everyday decisions become safer, recoverable and easier to repeat—not when one tool promises to solve everything.",
    category: "Cybersecurity",
    coverImage: "/blog-practical-cybersecurity.jpg",
    coverAlt: "Layered glass security structure protecting a warm illuminated core in a dark workspace",
    coverObjectKey: null,
    coverContentType: null,
    status: "draft",
    seoTitle: "Cybersecurity is a habit, not a product",
    seoDescription: "Practical cybersecurity foundations for smaller organisations: identity, updates, backups, access and recovery.",
    sortOrder: 4,
    publishedAt: null,
    publicationApprovedAt: null,
    body: `Cybersecurity is often presented through dramatic threats and expensive products. Real protection is usually less theatrical. It is the result of small decisions made consistently across people, devices, accounts and data.

No single tool creates safety. A useful security programme combines layers so that one mistake does not become a complete failure.

## Protect identity first

Accounts are now the front door to email, banking, customer records and cloud services. Unique passwords, a password manager and multi-factor authentication create an immediate improvement for most organisations.

Access should also match the job. Not every person needs administrator rights, and access should be removed promptly when responsibilities change.

## Keep systems current

Updates close known weaknesses, but they only help when devices are visible and supported. An inventory of laptops, phones, routers, software and online services gives the business a clear starting point.

Unsupported systems deserve a replacement plan. The longer they remain essential, the more difficult and costly recovery can become.

## Make recovery part of security

Backups are valuable only when they are recent, protected and tested. Important information should have more than one copy, with at least one copy separated from the systems it protects.

A short incident plan is equally important. Who makes decisions? How will the business communicate if email is unavailable? Which systems return first? Practising those questions is more useful than assuming an incident will never happen.

## Design the safer action to be the easier action

Security guidance fails when it asks people to remember a complicated exception every day. Clear processes, approved tools and sensible defaults reduce the number of risky decisions staff need to make.

The objective is not perfect protection. It is reducing avoidable risk, detecting trouble sooner and recovering with confidence. That work becomes stronger when security is treated as an operating habit rather than a product bought once.`,
    createdAt: "2026-08-12T10:01:00.000Z",
    updatedAt: "2026-08-12T10:01:00.000Z",
  },
  {
    id: "article_technology_curiosity",
    title: "Why I still like taking technology apart",
    slug: "why-i-still-like-taking-technology-apart",
    excerpt: "Hands-on experiments turn abstract technology into something understandable—and often reveal the simplest path to a useful system.",
    category: "Technology",
    coverImage: "/blog-technology-curiosity.jpg",
    coverAlt: "Warm technology workbench with network components, prototype electronics and sketched ideas",
    coverObjectKey: null,
    coverContentType: null,
    status: "draft",
    seoTitle: "Why hands-on technology experiments still matter",
    seoDescription: "A personal reflection on learning through prototypes, networks, electronics and useful technical experiments.",
    sortOrder: 5,
    publishedAt: null,
    publicationApprovedAt: null,
    body: `Some of the most useful technical lessons begin with a question that has no immediate commercial value. What happens if these two systems connect? Can this old device become useful again? Could a small prototype remove one repetitive task?

Taking technology apart—sometimes literally, sometimes through code or network traces—turns a black box into a set of understandable choices.

## Curiosity builds better judgement

Documentation explains how a system is intended to work. Experimentation shows how it behaves when connections are slow, inputs are messy or one component fails.

That difference matters in professional work. Good judgement grows from seeing enough systems succeed and fail to recognise where complexity is justified and where it is hiding a weak idea.

## Small prototypes answer big questions

A prototype does not need to become a product. A spare computer, a sensor, a test network or a short script can prove whether an idea is useful before a large commitment is made.

The best experiments isolate one uncertain part. They create evidence: a measurement, a working interaction or a clear reason to choose another direction.

## Different disciplines make each other stronger

Networking changes how I think about web applications. Cybersecurity changes how I design access and recovery. Software makes physical systems easier to observe and control. Design keeps all of that technology connected to a person with a real task.

The interesting work often happens at those boundaries. Understanding more than one layer makes it easier to see the whole system and communicate with the people responsible for each part.

## Keep a place for unfinished ideas

Not every experiment deserves a polished case study. Notes, diagrams and imperfect prototypes preserve the thinking that may become useful later.

Technology changes quickly, but curiosity remains a durable skill. It keeps learning active and reminds me that the point is not to collect tools. It is to understand what they make possible.`,
    createdAt: "2026-08-12T10:02:00.000Z",
    updatedAt: "2026-08-12T10:02:00.000Z",
  },
];

async function seedBlogArticles() {
  const db = getDb();
  const existing = await db.select({ id: blogArticles.id }).from(blogArticles).where(inArray(blogArticles.id, demoBlogArticles.map((article) => article.id)));
  const existingIds = new Set(existing.map((article) => article.id));
  const missing = demoBlogArticles.filter((article) => !existingIds.has(article.id));
  if (missing.length) await db.insert(blogArticles).values(missing).onConflictDoNothing();
}

export async function listBlogArticles(options: { includeDrafts?: boolean } = {}): Promise<BlogArticleRecord[]> {
  try {
    const db = getDb();
    await seedBlogArticles();
    const rows = await db.select().from(blogArticles).orderBy(asc(blogArticles.sortOrder), desc(blogArticles.updatedAt));
    return options.includeDrafts ? rows : rows.filter((article) => article.status === "published" && Boolean(article.publicationApprovedAt));
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
    if (!article || (!options.includeDrafts && (article.status !== "published" || !article.publicationApprovedAt))) return null;
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
