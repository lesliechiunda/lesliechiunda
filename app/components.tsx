/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
import type { ReactNode } from "react";
import { type Concept, type Project } from "./data";
import { listBusinesses, listPortfolioProjects } from "../lib/repository";

export function Header({ dark = false }: { dark?: boolean }) {
  return (
    <header className={`site-header ${dark ? "site-header--dark" : ""}`}>
      <a href="/" className="wordmark" aria-label="Leslie Chiunda home">
        LC<span>®</span>
      </a>
      <nav aria-label="Main navigation">
        <a href="/work">Work</a>
        <a href="/#about">About</a>
      </nav>
      <a href="mailto:lesliechiunda@outlook.com" className="nav-cta">
        Start a project <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <p className="kicker">Have something useful to build?</p>
        <p className="footer-title">Let&apos;s make it real.</p>
      </div>
      <a href="mailto:lesliechiunda@outlook.com" className="footer-mail">
        lesliechiunda@outlook.com <span aria-hidden="true">↗</span>
      </a>
      <div className="footer-bottom">
        <p>Johannesburg, South Africa</p>
        <p>© {new Date().getFullYear()} Leslie Chiunda</p>
      </div>
    </footer>
  );
}

export function SectionHeading({
  index,
  eyebrow,
  children,
  link,
}: {
  index: string;
  eyebrow: string;
  children: ReactNode;
  link?: { href: string; label: string };
}) {
  return (
    <div className="section-heading">
      <p className="section-index">({index})</p>
      <div>
        <p className="kicker">{eyebrow}</p>
        <h2>{children}</h2>
      </div>
      {link ? (
        <a href={link.href} className="text-link">
          {link.label} <span aria-hidden="true">↗</span>
        </a>
      ) : null}
    </div>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noreferrer"
      className={`project-card project-card--${project.tone}`}
    >
      <div className="project-visual">
        {project.image ? (
          <img src={project.image} alt={`${project.title} website screenshot`} />
        ) : (
          <div className="project-placeholder" aria-hidden="true">
            <span>PP</span>
            <i />
            <i />
            <i />
          </div>
        )}
      </div>
      <div className="project-copy">
        <p>{project.category}</p>
        <h3>{project.title}</h3>
        <span aria-hidden="true">↗</span>
      </div>
      <p className="project-summary">{project.summary}</p>
    </a>
  );
}

export function ConceptCard({ concept }: { concept: Concept }) {
  return (
    <a href={`/preview/${concept.slug}`} className="concept-card">
      <div
        className="concept-canvas"
        style={{
          background: concept.background,
          color: concept.foreground,
          ["--concept-accent" as string]: concept.accent,
        }}
      >
        {concept.image ? <img className="concept-card-image" src={concept.image} alt={`${concept.name} website concept`} /> : null}
        {concept.image ? <span className="concept-image-shade" aria-hidden="true" /> : null}
        <div className="concept-mini-nav">
          <strong>{concept.name}</strong>
          <span>Menu &nbsp; About &nbsp; Book</span>
        </div>
        <p>{concept.eyebrow}</p>
        <h3>{concept.headline}</h3>
        <i />
      </div>
      <div className="concept-meta">
        <div>
          <p>{concept.category}</p>
          <h3>{concept.name}</h3>
        </div>
        <span>Open live concept ↗</span>
      </div>
    </a>
  );
}

export const workGroups = [
  "Business websites",
  "Web apps & platforms",
  "E-commerce & bookings",
  "Systems & automation",
] as const;

export type WorkGroup = typeof workGroups[number];

function groupForProject(project: Project): WorkGroup {
  const value = `${project.title} ${project.category}`.toLowerCase();
  if (value.includes("e-commerce") || value.includes("fashion") || value.includes("beauty") || value.includes("booking")) return "E-commerce & bookings";
  if (value.includes("loyalty") || value.includes("system") || value.includes("automation")) return "Systems & automation";
  return "Web apps & platforms";
}

async function unifiedProjects() {
  const [portfolio, businesses] = await Promise.all([listPortfolioProjects(), listBusinesses()]);
  const businessProjects = businesses.filter((business) => business.previewStatus !== "archived").map((business) => ({
    title: business.name,
    category: "Business website",
    summary: business.summary,
    href: business.previewUrl || `/preview/${business.slug}`,
    image: business.heroAssetId ? `/api/media/${business.heroAssetId}` : `/concept-${business.slug}.jpg`,
    tone: "clay" as const,
    group: "Business websites" as WorkGroup,
  }));
  return [
    ...businessProjects,
    ...portfolio.map((project) => ({ ...project, group: groupForProject(project) })),
  ];
}

export async function ProjectGrid({ limit, group }: { limit?: number; group?: WorkGroup }) {
  const allProjects = await unifiedProjects();
  const projects = group ? allProjects.filter((project) => project.group === group) : allProjects;
  return (
    <div className="project-grid">
      {projects.slice(0, limit).map((project) => (
        <ProjectCard key={project.title} project={project} />
      ))}
    </div>
  );
}

export async function ConceptGrid({ limit }: { limit?: number }) {
  const palette = [
    { accent: "#ff5a36", background: "#f2dfc7", foreground: "#28160f" },
    { accent: "#0d66ff", background: "#e9f0e8", foreground: "#10291f" },
    { accent: "#c8f16b", background: "#151713", foreground: "#f4f0e7" },
  ];
  const businesses = await listBusinesses();
  const concepts: Concept[] = businesses.filter((business) => business.previewStatus !== "archived").map((business, index) => ({
    slug: business.slug,
    name: business.name,
    eyebrow: business.eyebrow || `${business.industry} · ${business.city}`,
    headline: business.headline || `${business.name}, made easier to discover.`,
    summary: business.summary,
    location: business.city,
    category: business.industry,
    phone: business.contactPhone || "+27 00 000 0000",
    services: (() => { try { return JSON.parse(business.services) as string[]; } catch { return []; } })(),
    image: business.heroAssetId ? `/api/media/${business.heroAssetId}` : `/concept-${business.slug}.jpg`,
    ...palette[index % palette.length],
  }));
  return (
    <div className="concept-grid">
      {concepts.slice(0, limit).map((concept) => (
        <ConceptCard key={concept.slug} concept={concept} />
      ))}
    </div>
  );
}
