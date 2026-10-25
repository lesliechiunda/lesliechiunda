import type { Metadata } from "next";
import Link from "next/link";
import { chatGPTSignOutPath } from "../chatgpt-auth";
import { requireAdmin } from "../../lib/admin-auth";
import { listArticleAnalytics, listBlogArticles, listBusinesses, listInvoices, listPortfolioProjects } from "../../lib/repository";
import AdminArticles from "./AdminArticles";
import AdminWork from "./AdminWork";
import AdminInvoices from "./AdminInvoices";
import "./admin.css";

export const metadata: Metadata = { title: "Admin workspace", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin("/admin");
  const [businesses, projects, articles, analytics, invoices] = await Promise.all([listBusinesses(), listPortfolioProjects({ includeUnpublished: true }), listBlogArticles({ includeDrafts: true }), listArticleAnalytics(), listInvoices().catch(() => [])]);
  return (
    <main className="admin-root">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-logo">LC</Link>
        <nav aria-label="Admin navigation">
          <a href="#work" className="active"><span>▦</span>Work</a>
          <a href="#articles"><span>¶</span>Articles <i>{articles.filter((article) => article.status === "draft").length}</i></a>
          <a href="#invoices"><span>▤</span>Invoices</a>
        </nav>
        <div className="admin-sidebar-bottom">
          <Link href="/" target="_blank">View public site ↗</Link>
          <a href={chatGPTSignOutPath("/")}>Sign out</a>
          <div className="admin-user"><b>{(admin.fullName ?? admin.email).slice(0, 2).toUpperCase()}</b><p>{admin.displayName}<span>{admin.email}</span></p></div>
        </div>
      </aside>
      <div className="admin-main">
        {admin.localPreview ? <div className="preview-access-note">Local preview mode. Production access stays blocked until <strong>ADMIN_EMAILS</strong> is configured.</div> : null}
        <AdminWork initialBusinesses={businesses} initialProjects={projects} />
        <div className="admin-content-section"><AdminArticles initialArticles={articles} initialAnalytics={analytics} /></div>
        <div className="admin-content-section"><AdminInvoices initialInvoices={invoices} /></div>
      </div>
    </main>
  );
}
