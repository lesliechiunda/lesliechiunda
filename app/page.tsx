/* eslint-disable @next/next/no-img-element */
import { ConceptGrid, Footer, Header, ProjectGrid, SectionHeading } from "./components";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main>
      <div className="hero-shell">
        <Header />
        <section className="hero">
          <p className="hero-kicker">Independent digital studio · Johannesburg</p>
          <h1>
            Websites built to <em>move</em> business forward.
          </h1>
          <div className="hero-bottom">
            <p>
              I design and build digital products that are clear, useful and ready to grow—from
              focused business websites to full platforms.
            </p>
            <a href="#work" className="round-link" aria-label="See selected work">
              <span>Selected work</span>
              <b aria-hidden="true">↓</b>
            </a>
          </div>
          <div className="hero-ruler" aria-hidden="true">
            <span>01</span><i /><span>STRATEGY</span><i /><span>DESIGN</span><i /><span>CODE</span><i /><span>LAUNCH</span>
          </div>
        </section>
      </div>

      <section className="work-section" id="work">
        <SectionHeading
          index="01"
          eyebrow="Selected work"
          link={{ href: "/work", label: "View all projects" }}
        >
          Built for the real world,
          <br />not the pitch deck.
        </SectionHeading>
        <ProjectGrid limit={4} />
      </section>

      <section className="about-section" id="about">
        <SectionHeading index="02" eyebrow="What I do">
          One partner from first thought to working product.
        </SectionHeading>
        <div className="about-grid">
          <div className="portrait-wrap">
            <div className="portrait-stamp">JOZI / ZA</div>
            <img src="/leslie.jpg" alt="Leslie Chiunda" width="1200" height="1600" />
          </div>
          <div className="about-copy">
            <p className="about-lead">
              I&apos;m Leslie—an independent full-stack developer who thinks good design and solid
              engineering belong in the same room.
            </p>
            <p>
              I work across UX, front-end, backend architecture, authentication and infrastructure.
              That means fewer handovers, clearer decisions and a product that holds together.
            </p>
            <div className="service-list">
              <span>01</span><p>Business websites</p>
              <span>02</span><p>Web apps & platforms</p>
              <span>03</span><p>E-commerce & bookings</p>
              <span>04</span><p>Systems & automation</p>
            </div>
          </div>
        </div>
      </section>

      <section className="concepts-section">
        <SectionHeading
          index="03"
          eyebrow="Ready-made concepts"
          link={{ href: "/concepts", label: "Browse concept studio" }}
        >
          See your business online
          <br />before you say yes.
        </SectionHeading>
        <p className="concepts-intro">
          Selected local businesses get a working website concept on a private preview address.
          Nothing is sent or published as a client project without approval.
        </p>
        <ConceptGrid limit={2} />
      </section>

      <section className="process-section">
        <SectionHeading index="04" eyebrow="The process">
          Clear steps. Visible progress.
        </SectionHeading>
        <div className="process-grid">
          {[
            ["01", "Discover", "We clarify the business, audience and one outcome that matters most."],
            ["02", "Shape", "I turn the brief into a focused structure, visual direction and working plan."],
            ["03", "Build", "Design and development move together, with useful previews along the way."],
            ["04", "Launch", "We connect the domain, analytics and handover only when the work is ready."],
          ].map(([number, title, copy]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
