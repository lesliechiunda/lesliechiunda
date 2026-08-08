import type { Metadata } from "next";
import Link from "next/link";
import { chatGPTSignOutPath } from "../chatgpt-auth";
import { requireAdmin } from "../../lib/admin-auth";
import { listBusinesses, listPortfolioProjects } from "../../lib/repository";
import AdminCRM from "./AdminCRM";
import AdminProjects from "./AdminProjects";
import "./admin.css";

export const metadata: Metadata = { title: "Admin workspace", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin("/admin");
  const [businesses, projects] = await Promise.all([listBusinesses(), listPortfolioProjects({ includeUnpublished: true })]);
  return (
    <main className="admin-root">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-logo">LC</Link>
        <nav aria-label="Admin navigation">
          <a href="#overview" className="active"><span>⌂</span>Overview</a>
          <a href="#pipeline"><span>◇</span>Businesses</a>
          <a href="#projects"><span>▦</span>Projects</a>
          <a href="#pipeline"><span>▱</span>Previews</a>
          <a href="#pipeline"><span>↗</span>Outreach</a>
          <a href="#pipeline"><span>✓</span>Approvals</a>
          <a href="#agent-hooks"><span>✦</span>Agent queue <i>0</i></a>
        </nav>
        <div className="admin-sidebar-bottom">
          <Link href="/" target="_blank">View public site ↗</Link>
          <a href={chatGPTSignOutPath("/")}>Sign out</a>
          <div className="admin-user"><b>{(admin.fullName ?? admin.email).slice(0, 2).toUpperCase()}</b><p>{admin.displayName}<span>{admin.email}</span></p></div>
        </div>
      </aside>
      <div className="admin-main" id="overview">
        {admin.localPreview ? <div className="preview-access-note">Local preview mode. Production access stays blocked until <strong>ADMIN_EMAILS</strong> is configured.</div> : null}
        <AdminCRM initialBusinesses={businesses} />
        <div className="admin-content-section"><AdminProjects initialProjects={projects} /></div>
        <section className="agent-hooks" id="agent-hooks">
          <div><p className="admin-kicker">Future workflow hooks</p><h2>Ready for an agent.<br />Waiting for your rules.</h2></div>
          <div className="hook-list">
            <article><span>01</span><div><h3>Business discovery intake</h3><p>An authenticated endpoint can accept researched businesses and create needs-review records.</p></div><b>READY</b></article>
            <article><span>02</span><div><h3>Preview build request</h3><p>The queue model is ready; execution remains blocked behind an approval record.</p></div><b>LOCKED</b></article>
            <article><span>03</span><div><h3>Outreach draft</h3><p>Status and event history are modeled. No mail provider or send action is connected.</p></div><b>LOCKED</b></article>
          </div>
        </section>
      </div>
    </main>
  );
}
