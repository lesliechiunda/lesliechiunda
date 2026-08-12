import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const businesses = sqliteTable(
  "businesses",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    industry: text("industry").notNull().default("Other"),
    city: text("city").notNull().default(""),
    website: text("website"),
    websiteStatus: text("website_status").notNull().default("none"),
    source: text("source").notNull().default("manual"),
    previewStatus: text("preview_status").notNull().default("not_started"),
    previewUrl: text("preview_url"),
    outreachStatus: text("outreach_status").notNull().default("not_started"),
    approvalStatus: text("approval_status").notNull().default("needs_review"),
    priority: integer("priority").notNull().default(2),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    contactName: text("contact_name"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    eyebrow: text("eyebrow").notNull().default(""),
    headline: text("headline").notNull().default(""),
    summary: text("summary").notNull().default(""),
    services: text("services").notNull().default("[]"),
    heroAssetId: text("hero_asset_id"),
    notes: text("notes").notNull().default(""),
    lastActivityAt: text("last_activity_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_businesses_review_queue").on(table.approvalStatus, table.previewStatus),
    index("idx_businesses_outreach_status").on(table.outreachStatus),
    index("idx_businesses_updated_at").on(table.updatedAt),
  ],
);

export const portfolioProjects = sqliteTable(
  "portfolio_projects",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    category: text("category").notNull().default("Website"),
    summary: text("summary").notNull().default(""),
    href: text("href").notNull(),
    image: text("image"),
    tone: text("tone").notNull().default("lime"),
    published: integer("published", { mode: "boolean" }).notNull().default(true),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_portfolio_projects_order").on(table.published, table.sortOrder)],
);

export const blogArticles = sqliteTable(
  "blog_articles",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt").notNull().default(""),
    body: text("body").notNull().default(""),
    category: text("category").notNull().default("Studio notes"),
    coverImage: text("cover_image"),
    coverAlt: text("cover_alt").notNull().default(""),
    coverObjectKey: text("cover_object_key"),
    coverContentType: text("cover_content_type"),
    status: text("status").notNull().default("draft"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    sortOrder: integer("sort_order").notNull().default(0),
    publishedAt: text("published_at"),
    publicationApprovedAt: text("publication_approved_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_blog_articles_status_order").on(table.status, table.sortOrder)],
);

export const mediaAssets = sqliteTable(
  "media_assets",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
    objectKey: text("object_key").notNull().unique(),
    filename: text("filename").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    altText: text("alt_text").notNull().default(""),
    createdBy: text("created_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_media_assets_business_id").on(table.businessId)],
);

export const outreachEvents = sqliteTable(
  "outreach_events",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
    channel: text("channel").notNull().default("email"),
    status: text("status").notNull(),
    subject: text("subject"),
    body: text("body"),
    externalId: text("external_id"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_outreach_events_business_id").on(table.businessId)],
);

export const approvals = sqliteTable(
  "approvals",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    decision: text("decision").notNull().default("pending"),
    requestedBy: text("requested_by").notNull().default("system"),
    decidedBy: text("decided_by"),
    decidedAt: text("decided_at"),
    notes: text("notes").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_approvals_business_id").on(table.businessId)],
);

export const agentJobs = sqliteTable(
  "agent_jobs",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id").references(() => businesses.id, { onDelete: "set null" }),
    jobType: text("job_type").notNull(),
    status: text("status").notNull().default("queued"),
    payload: text("payload").notNull().default("{}"),
    result: text("result"),
    requiresApproval: integer("requires_approval", { mode: "boolean" }).notNull().default(true),
    approvedAt: text("approved_at"),
    executedAt: text("executed_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_agent_jobs_status").on(table.status, table.requiresApproval)],
);
