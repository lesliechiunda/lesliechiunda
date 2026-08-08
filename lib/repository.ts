import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { agentJobs, approvals, businesses, mediaAssets, portfolioProjects } from "../db/schema";
import { projects as staticProjects } from "../app/data";

export type BusinessRecord = typeof businesses.$inferSelect;
export type PortfolioProjectRecord = typeof portfolioProjects.$inferSelect;
export type BusinessInput = Partial<Omit<typeof businesses.$inferInsert, "id" | "createdAt" | "updatedAt" | "lastActivityAt">> & {
  name: string;
  slug: string;
};

export const demoBusinesses: BusinessRecord[] = [
  {
    id: "biz_don_armando", name: "Don Armando", slug: "don-armando", industry: "Restaurant", city: "Johannesburg",
    website: null, websiteStatus: "none", source: "manual_research", previewStatus: "review", previewUrl: "/preview/don-armando",
    outreachStatus: "draft_ready", approvalStatus: "needs_review", priority: 1, contactName: null, contactEmail: null,
    contactPhone: null, eyebrow: "Neighbourhood kitchen · Johannesburg", headline: "Good food, made for long tables.",
    summary: "A warm, confident restaurant concept built around wood-fired plates, easy bookings and a menu that gets to the point.",
    services: "[\"Lunch & dinner\",\"Group bookings\",\"Private events\"]", heroAssetId: null,
    notes: "Concept ready for owner review. Business details still need verification.",
    lastActivityAt: "2026-08-08 09:40:00", createdAt: "2026-08-05 10:00:00", updatedAt: "2026-08-08 09:40:00",
  },
  {
    id: "biz_cataplana", name: "Cataplana", slug: "cataplana", industry: "Hospitality", city: "Gauteng",
    website: null, websiteStatus: "none", source: "manual_research", previewStatus: "draft", previewUrl: "/preview/cataplana",
    outreachStatus: "not_started", approvalStatus: "approved_for_preview", priority: 2, contactName: null, contactEmail: null,
    contactPhone: null, eyebrow: "Portuguese table · Gauteng", headline: "The coast, served in the city.",
    summary: "A bright hospitality concept with a strong menu story, direct reservation flow and room for events, reviews and seasonal specials.",
    services: "[\"Fresh seafood\",\"Family tables\",\"Celebrations\"]", heroAssetId: null,
    notes: "Visual concept started. Menu and trading hours are placeholders.",
    lastActivityAt: "2026-08-07 15:20:00", createdAt: "2026-08-04 12:00:00", updatedAt: "2026-08-07 15:20:00",
  },
  {
    id: "biz_mctrenz", name: "McTrenz", slug: "mctrenz", industry: "Local services", city: "Johannesburg",
    website: null, websiteStatus: "social_only", source: "agent_discovery", previewStatus: "not_started", previewUrl: "/preview/mctrenz",
    outreachStatus: "not_started", approvalStatus: "needs_review", priority: 3, contactName: null, contactEmail: null,
    contactPhone: null, eyebrow: "Precision services · Johannesburg", headline: "Reliable work. Clear answers. No runaround.",
    summary: "A direct, high-trust service-business concept designed to turn local searches into qualified enquiries.",
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

export async function listPortfolioProjects(options: { includeUnpublished?: boolean } = {}) {
  try {
    const db = getDb();
    await db.insert(portfolioProjects).values(demoProjects).onConflictDoNothing();
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

export async function seedBusinesses() {
  const db = getDb();
  await db.insert(businesses).values(demoBusinesses).onConflictDoNothing();
}

export async function listBusinesses(): Promise<BusinessRecord[]> {
  try {
    const db = getDb();
    await seedBusinesses();
    return await db.select().from(businesses).orderBy(desc(businesses.updatedAt));
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
    previewUrl: input.previewUrl ?? `/preview/${input.slug}`,
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
