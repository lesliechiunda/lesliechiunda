/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getConcept } from "../../data";
import { getBusinessBySlug } from "../../../lib/repository";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const business = await getBusinessBySlug(slug);
  const concept = business ?? getConcept(slug);
  if (!concept) return { title: "Concept not found" };
  return {
    title: `${concept.name} — Website concept`,
    description: concept.summary,
    robots: { index: false, follow: false },
  };
}

export default async function PreviewPage({ params }: Props) {
  const slug = (await params).slug;
  const business = await getBusinessBySlug(slug);
  const fallback = getConcept(slug);
  const services = business ? safeServices(business.services) : fallback?.services ?? [];
  const concept = business ? {
    slug: business.slug,
    name: business.name,
    eyebrow: business.eyebrow || `${business.industry} · ${business.city}`,
    headline: business.headline || `${business.name}, made easier to discover.`,
    summary: business.summary || business.notes || `A focused website concept for ${business.name}.`,
    location: business.city || "South Africa",
    category: business.industry,
    phone: business.contactPhone || "+27 00 000 0000",
    accent: fallback?.accent ?? "#c8f16b",
    background: fallback?.background ?? "#f2efe7",
    foreground: fallback?.foreground ?? "#11130f",
    services: services.length ? services : ["Clear information", "Direct enquiries", "Local visibility"],
    heroAssetId: business.heroAssetId,
    image: business.heroAssetId ? `/api/media/${business.heroAssetId}` : `/concept-${business.slug}.jpg`,
  } : fallback ? { ...fallback, heroAssetId: null, image: `/concept-${fallback.slug}.jpg` } : null;
  if (!concept) notFound();

  return (
    <main
      className="business-preview"
      style={{
        background: concept.background,
        color: concept.foreground,
        ["--business-accent" as string]: concept.accent,
      }}
    >
      <aside className="concept-banner">
        <span>Website concept by Leslie Chiunda</span>
        <p>This is an illustrative preview—not yet the business&apos;s official website.</p>
        <a href={`mailto:lesliechiunda@outlook.com?subject=Claim%20${encodeURIComponent(concept.name)}%20website`}>Are you the owner? Claim this concept ↗</a>
      </aside>
      <nav className="business-nav">
        <strong>{concept.name}</strong>
        <div><a href="#story">Our story</a><a href="#services">What we offer</a><a href="#visit">Visit</a></div>
        <a href={`tel:${concept.phone.replace(/\s/g, "")}`} className="business-book">Book a table ↗</a>
      </nav>
      <section className="business-hero">
        <p>{concept.eyebrow}</p>
        <h1>{concept.headline}</h1>
        <div className="business-hero-bottom">
          <p>{concept.summary}</p>
          <span aria-hidden="true">✦</span>
        </div>
      </section>
      {concept.image ? (
        <figure className="business-hero-image">
          <img src={concept.image} alt={`${concept.name} website concept`} />
        </figure>
      ) : null}
      <section className="business-marquee" aria-label="Highlights">
        <div>{[...concept.services, ...concept.services].map((service, index) => <span key={`${service}-${index}`}>{service} <b>✦</b></span>)}</div>
      </section>
      <section className="business-story" id="story">
        <p className="business-label">Our approach</p>
        <h2>Made with care.<br />Served without fuss.</h2>
        <p>
          We believe the best local experiences feel generous, familiar and worth coming back for.
          Every detail—from the first hello to the final plate—is designed around that idea.
        </p>
      </section>
      <section className="business-services" id="services">
        {concept.services.map((service, index) => (
          <article key={service}><span>0{index + 1}</span><h3>{service}</h3><p>Thoughtful service, clear information and a simple way to make your next visit happen.</p></article>
        ))}
      </section>
      <section className="business-visit" id="visit">
        <div><p className="business-label">Find us</p><h2>{concept.location}</h2></div>
        <div><p>Tuesday—Sunday<br />Lunch & evening</p><a href={`tel:${concept.phone.replace(/\s/g, "")}`}>{concept.phone}</a></div>
      </section>
      <footer className="business-footer"><strong>{concept.name}</strong><a href="/concepts">A Leslie Chiunda website concept ↗</a></footer>
    </main>
  );
}

function safeServices(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string").slice(0, 8) : [];
  } catch {
    return [];
  }
}
