import type { Metadata } from "next";
import Link from "next/link";
import { chatGPTSignOutPath } from "../chatgpt-auth";
import { requireAdmin } from "../../lib/admin-auth";
import { listAgentJobs, listBlogArticles, listBusinesses, listPortfolioProjects } from "../../lib/repository";
import AdminCRM from "./AdminCRM";
import AdminArticles from "./AdminArticles";
import AdminProjects from "./AdminProjects";
import "./admin.css";

export const metadata: Metadata = { title: "Admin workspace", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin("/admin");
  const [businesses, projects, articles, jobs] = await Promise.all([listBusinesses(), listPortfolioProjects({ includeUnpublished: true }), listBlogArticles({ includeDrafts: true }), listAgentJobs()]);
  return (
    <main className="admin-root">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-logo">LC</Link>
        <nav aria-label="Admin navigation">
          <a href="#overview" className="active"><span>⌂</span>Overview</a>
          <a href="#pipeline"><span>◇</span>Businesses</a>
          <a href="#projects"><span>▦</span>Projects</a>
          <a href="#articles"><span>¶</span>Articles <i>{articles.filter((article) => article.status === "draft").length}</i></a>
          <a href="#pipeline"><span>▱</span>Previews</a>
          <a href="#pipeline"><span>↗</span>Outreach</a>
          <a href="#pipeline"><span>✓</span>Approvals</a>
          <a href="#agent-hooks"><span>✦</span>Agent queue <i>{jobs.length}</i></a>
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
        <div className="admin-content-section"><AdminArticles initialArticles={articles} /></div>
        <section className="agent-hooks" id="agent-hooks">
          <div><p className="admin-kicker">Workflow foundation</p><h2>Queue work now.<br />Automate later.</h2><p className="queue-count">{jobs.length} internal {jobs.length === 1 ? "item" : "items"} waiting for your review.</p></div>
          <div className="hook-list">
            <article><span>01</span><div><h3>Business discovery intake</h3><p>An authenticated endpoint can accept researched businesses and create needs-review records.</p></div><b>READY</b></article>
            <article><span>02</span><div><h3>Preview build request</h3><p>Queue a request from any listing. It creates an internal item and never publishes automatically.</p></div><b>READY</b></article>
            <article><span>03</span><div><h3>Outreach draft</h3><p>Create a stored draft from any listing. No mail provider or send action is connected.</p></div><b>READY</b></article>
          </div>
        </section>
      </div>
    </main>
  );
}
