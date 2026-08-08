import type { Metadata } from "next";
import { ConceptGrid, Footer, Header } from "../components";

export const metadata: Metadata = { title: "Website concepts" };

export default function ConceptsPage() {
  return (
    <main>
      <Header />
      <section className="page-hero page-hero--concepts">
        <p className="kicker">Concept studio · Preview before purchase</p>
        <h1>Your next website<br /><em>might already exist.</em></h1>
        <div className="page-deck">
          <p>
            These are working, unclaimed website concepts made for real local businesses. They show
            what the business could look like online before any domain is bought or commitment is made.
          </p>
          <p className="concept-policy">
            <strong>Concept policy</strong><br />No concept implies a client relationship. Business details are illustrative until verified and approved.
          </p>
        </div>
      </section>
      <section className="concepts-section concepts-section--page">
        <ConceptGrid />
      </section>
      <section className="claim-section">
        <p className="kicker">Are you the owner?</p>
        <h2>Claim it, shape it,<br />make it yours.</h2>
        <a href="mailto:lesliechiunda@outlook.com?subject=Website%20concept%20enquiry" className="button button--lime">Start the conversation ↗</a>
      </section>
      <Footer />
    </main>
  );
}
