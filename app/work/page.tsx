import type { Metadata } from "next";
import { Footer, Header, ProjectGrid, workGroups } from "../components";

export const metadata: Metadata = { title: "Work" };
export const dynamic = "force-dynamic";

export default function WorkPage() {
  return (
    <main>
      <Header />
      <section className="page-hero">
        <p className="kicker">Selected work · 2024—2026</p>
        <h1>Useful things,<br /><em>properly built.</em></h1>
        <p className="page-deck">
          A growing body of websites, apps and business systems—each shaped around a real job to be done.
        </p>
      </section>
      <div className="work-groups">
        {workGroups.map((group, index) => (
          <section className="work-section work-group" key={group}>
            <div className="work-group-heading"><span>{String(index + 1).padStart(2, "0")}</span><h2>{group}</h2></div>
            <ProjectGrid group={group} />
          </section>
        ))}
      </div>
      <Footer />
    </main>
  );
}
