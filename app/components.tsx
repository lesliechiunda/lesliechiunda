/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
import type { ReactNode } from "react";
import { type Project } from "./data";
import { listBusinesses, listPortfolioProjects } from "../lib/repository";
import { FaEnvelope, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";

export function Header({ dark = false }: { dark?: boolean }) {
  return (
    <header className={`site-header ${dark ? "site-header--dark" : ""}`}>
      <a href="/" className="wordmark" aria-label="Leslie Chiunda home">
        LC<span>®</span>
      </a>
      <nav aria-label="Main navigation">
        <a href="/work">Work</a>
        <a href="/blog">Blog</a>
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
        <p className="footer-title">Let&apos;s work together.</p>
      </div>
      <div className="footer-contact-links" aria-label="Social and direct contact links">
        <a href="https://wa.me/27794031161" target="_blank" rel="noreferrer"><span className="contact-label"><span className="contact-icon" aria-hidden="true"><FaWhatsapp /></span> WhatsApp · +27 79 403 1161</span><span aria-hidden="true">↗</span></a>
        <a href="https://www.linkedin.com/in/lesliechiunda/" target="_blank" rel="noreferrer"><span className="contact-label"><span className="contact-icon" aria-hidden="true"><FaLinkedinIn /></span> LinkedIn</span><span aria-hidden="true">↗</span></a>
        <a href="mailto:lesliechiunda@outlook.com"><span className="contact-label"><span className="contact-icon" aria-hidden="true"><FaEnvelope /></span> lesliechiunda@outlook.com</span><span aria-hidden="true">↗</span></a>
      </div>
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

export const workGroups = [
  "Business websites",
  "Web apps & platforms",
  "E-commerce & bookings",
  "Systems & automation",
] as const;

export type WorkGroup = typeof workGroups[number];

function groupForProject(project: Pick<Project, "title" | "category">): WorkGroup {
  const value = `${project.title} ${project.category}`.toLowerCase();
  if (value.includes("e-commerce") || value.includes("fashion") || value.includes("beauty") || value.includes("booking")) return "E-commerce & bookings";
  if (value.includes("loyalty") || value.includes("system") || value.includes("automation")) return "Systems & automation";
  return "Web apps & platforms";
}

async function unifiedProjects() {
  const [portfolio, businesses] = await Promise.all([listPortfolioProjects(), listBusinesses()]);
  const suppliedScreenshots: Record<string, string> = {
    "don-armando": "/concept-don-armando.jpg", cataplana: "/concept-cataplana.jpg", mctrenz: "/concept-mctrenz.jpg",
  };
  const businessProjects = businesses.filter((business) => business.previewStatus !== "archived").map((business) => ({
    title: business.name,
    category: "Business website",
    summary: business.summary,
    href: business.previewUrl || business.website || "/work",
    image: business.heroAssetId ? `/api/media/${business.heroAssetId}` : suppliedScreenshots[business.slug],
    tone: "clay" as const,
    featured: business.featured,
    group: "Business websites" as WorkGroup,
  }));
  return [
    ...businessProjects,
    ...portfolio.map((project) => ({ ...project, image: project.image ?? undefined, tone: project.tone as Project["tone"], group: groupForProject(project) })),
  ];
}

export async function ProjectGrid({ limit, group, featured = false }: { limit?: number; group?: WorkGroup; featured?: boolean }) {
  const allProjects = await unifiedProjects();
  const projects = allProjects.filter((project) => (!group || project.group === group) && (!featured || project.featured));
  return (
    <div className="project-grid">
      {projects.slice(0, limit).map((project) => (
        <ProjectCard key={project.title} project={project} />
      ))}
    </div>
  );
}
