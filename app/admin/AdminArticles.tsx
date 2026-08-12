"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import type { ArticleAnalyticsRecord, BlogArticleRecord } from "../../lib/repository";

type ArticleForm = Pick<BlogArticleRecord, "title" | "slug" | "excerpt" | "body" | "category" | "coverImage" | "coverAlt" | "status" | "seoTitle" | "seoDescription" | "sortOrder" | "publishedAt">;
const blank: ArticleForm = { title: "", slug: "", excerpt: "", body: "", category: "Studio notes", coverImage: null, coverAlt: "", status: "draft", seoTitle: null, seoDescription: null, sortOrder: 0, publishedAt: null };
const orderArticles = (items: BlogArticleRecord[]) => [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
const fromArticle = (article: BlogArticleRecord): ArticleForm => ({ title: article.title, slug: article.slug, excerpt: article.excerpt, body: article.body, category: article.category, coverImage: article.coverImage, coverAlt: article.coverAlt, status: article.status, seoTitle: article.seoTitle, seoDescription: article.seoDescription, sortOrder: article.sortOrder, publishedAt: article.publishedAt });

export default function AdminArticles({ initialArticles, initialAnalytics }: { initialArticles: BlogArticleRecord[]; initialAnalytics: ArticleAnalyticsRecord[] }) {
  const [articles, setArticles] = useState(orderArticles(initialArticles));
  const [selectedId, setSelectedId] = useState(initialArticles[0]?.id ?? "");
  const selected = articles.find((article) => article.id === selectedId) ?? articles[0];
  const [form, setForm] = useState<ArticleForm>(selected ? fromArticle(selected) : blank);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const field = <K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) => setForm((current) => ({ ...current, [key]: value }));

  function choose(article: BlogArticleRecord) { setSelectedId(article.id); setForm(fromArticle(article)); setCreating(false); setMessage(""); }
  function newArticle() { setForm({ ...blank, sortOrder: articles.length }); setCreating(true); setMessage(""); }

  async function create(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/admin/articles", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const payload = await response.json() as { article?: BlogArticleRecord; error?: string };
      if (!response.ok || !payload.article) throw new Error(payload.error ?? "Could not create article.");
      setArticles((current) => orderArticles([...current, payload.article!])); setSelectedId(payload.article.id); setForm(fromArticle(payload.article)); setCreating(false); setMessage("Draft created. It is still private.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not create article."); }
    finally { setSaving(false); }
  }

  async function save() {
    if (!selected) return; setSaving(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/articles/${selected.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const payload = await response.json() as { article?: BlogArticleRecord; error?: string };
      if (!response.ok || !payload.article) throw new Error(payload.error ?? "Could not save article.");
      setArticles((current) => orderArticles(current.map((article) => article.id === selected.id ? payload.article! : article))); setForm(fromArticle(payload.article));
      setMessage(payload.article.status === "published" ? "Article saved and published." : "Draft saved. It remains private.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save article."); }
    finally { setSaving(false); }
  }

  async function changeVisibility(status: "draft" | "published") {
    if (!selected || status === form.status) return;
    setSaving(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/articles/${selected.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status, publishedAt: form.publishedAt }),
      });
      const payload = await response.json() as { article?: BlogArticleRecord; error?: string };
      if (!response.ok || !payload.article) throw new Error(payload.error ?? "Could not change article visibility.");
      setArticles((current) => orderArticles(current.map((article) => article.id === selected.id ? payload.article! : article)));
      setForm(fromArticle(payload.article));
      setMessage(status === "draft" ? "Article is private and has been removed from the public blog." : "Article is now published publicly.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not change article visibility."); }
    finally { setSaving(false); }
  }

  async function uploadCover() {
    if (!selected || !fileRef.current?.files?.[0]) return; setSaving(true); setMessage("");
    const data = new FormData(); data.set("file", fileRef.current.files[0]); data.set("altText", form.coverAlt);
    try {
      const response = await fetch(`/api/admin/articles/${selected.id}/cover`, { method: "POST", body: data });
      const payload = await response.json() as { article?: BlogArticleRecord; error?: string };
      if (!response.ok || !payload.article) throw new Error(payload.error ?? "Could not upload cover image.");
      setArticles((current) => current.map((article) => article.id === selected.id ? payload.article! : article)); setForm(fromArticle(payload.article));
      if (fileRef.current) fileRef.current.value = ""; setMessage("Cover image uploaded and saved.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not upload cover image."); }
    finally { setSaving(false); }
  }

  async function removeCover() {
    if (!selected) return; setSaving(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/articles/${selected.id}/cover`, { method: "DELETE" });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not remove cover image.");
      const updated = { ...selected, coverImage: null, coverObjectKey: null, coverContentType: null, updatedAt: new Date().toISOString() };
      setArticles((current) => current.map((article) => article.id === selected.id ? updated : article)); setForm(fromArticle(updated)); setMessage("Cover image removed.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not remove cover image."); }
    finally { setSaving(false); }
  }

  async function deleteArticle() {
    if (!selected || !window.confirm(`Permanently delete “${selected.title}”?`)) return; setSaving(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/articles/${selected.id}`, { method: "DELETE" }); const payload = await response.json() as { error?: string; objectKey?: string | null };
      if (!response.ok) throw new Error(payload.error ?? "Could not delete article.");
      const remaining = articles.filter((article) => article.id !== selected.id); setArticles(remaining); setSelectedId(remaining[0]?.id ?? ""); setForm(remaining[0] ? fromArticle(remaining[0]) : blank); setMessage("Article deleted.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not delete article."); }
    finally { setSaving(false); }
  }

  async function move(direction: -1 | 1) {
    if (!selected) return; const ordered = orderArticles(articles); const index = ordered.findIndex((article) => article.id === selected.id); const target = ordered[index + direction]; if (!target) return;
    setSaving(true); setMessage("");
    try {
      const [a, b] = await Promise.all([
        fetch(`/api/admin/articles/${selected.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ sortOrder: target.sortOrder }) }),
        fetch(`/api/admin/articles/${target.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ sortOrder: selected.sortOrder }) }),
      ]);
      if (!a.ok || !b.ok) throw new Error("Could not reorder articles.");
      const current = (await a.json()) as { article: BlogArticleRecord }; const other = (await b.json()) as { article: BlogArticleRecord };
      setArticles((items) => orderArticles(items.map((item) => item.id === selected.id ? current.article : item.id === target.id ? other.article : item))); setForm(fromArticle(current.article)); setMessage("Article order updated.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not reorder articles."); }
    finally { setSaving(false); }
  }

  return <section className="pipeline-section admin-articles" id="articles">
    <div className="pipeline-head"><div><p className="admin-kicker">Writing & insights</p><h2>Articles</h2><p className="article-private-note">Drafts are private. They appear on the public blog only after you change their status to Published.</p></div><button type="button" className="admin-primary" onClick={newArticle}>+ New article</button></div>
    {message ? <p className="admin-message" role="status">{message}</p> : null}
    <div className="article-admin-grid">
      <div className="article-admin-list">{articles.map((article) => <button type="button" key={article.id} className={selected?.id === article.id ? "is-selected" : ""} onClick={() => choose(article)}>
        {article.coverImage ? <img src={`${article.coverImage}${article.coverObjectKey ? `?v=${encodeURIComponent(article.updatedAt)}` : ""}`} alt="" /> : <span className="article-cover-empty">A</span>}
        <span><small>{article.category}</small><strong>{article.title}</strong><em>{article.status === "published" ? "Published" : "Draft"}</em></span>
      </button>)}</div>
      {selected && !creating ? <div className="record-panel article-editor">
        {form.coverImage ? <img className="article-cover-preview" src={`${form.coverImage}${selected.coverObjectKey ? `?v=${encodeURIComponent(selected.updatedAt)}` : ""}`} alt={form.coverAlt} /> : <div className="article-cover-preview article-cover-preview--empty">No cover image</div>}
        <div className="media-upload"><div><p>Cover image</p><input ref={fileRef} className="visually-hidden" id="article-cover-file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" /><button className="file-picker" type="button" onClick={() => fileRef.current?.click()}>Choose image</button></div><button type="button" disabled={saving} onClick={uploadCover}>Upload selected</button>{form.coverImage ? <button type="button" className="remove-media" disabled={saving} onClick={removeCover}>Remove</button> : null}<small>JPG, PNG, WebP or AVIF · maximum 8 MB</small></div>
        <div className="article-analytics" aria-label="Private article analytics">
          <div><span>Views</span><strong>{initialAnalytics.find((item) => item.articleId === selected.id)?.views ?? 0}</strong></div>
          <div><span>Reads</span><strong>{initialAnalytics.find((item) => item.articleId === selected.id)?.reads ?? 0}</strong></div>
          <div><span>Shares</span><strong>{initialAnalytics.find((item) => item.articleId === selected.id)?.shares ?? 0}</strong></div>
          <small>Private analytics · refresh Admin for the latest totals</small>
        </div>
        <ArticleFields form={form} field={field} saving={saving} onVisibilityChange={changeVisibility} />
        <div className="reorder-actions"><span>Order</span><button type="button" disabled={saving} onClick={() => move(-1)}>Move up</button><button type="button" disabled={saving} onClick={() => move(1)}>Move down</button></div>
        <div className="editor-actions"><button type="button" className="danger-button" disabled={saving} onClick={deleteArticle}>Delete</button><a className="archive-button" href={`/admin/article-preview/${selected.id}`} target="_blank" rel="noreferrer">Review draft ↗</a><button type="button" className="admin-primary" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save article"}</button></div>
      </div> : null}
    </div>
    {creating ? <div className="admin-modal" role="dialog" aria-modal="true"><form onSubmit={create}><div className="modal-head"><div><p className="admin-kicker">Private by default</p><h2>New article</h2></div><button type="button" onClick={() => setCreating(false)} aria-label="Close">×</button></div><ArticleFields form={form} field={field} /><div className="editor-actions"><button type="button" className="archive-button" onClick={() => setCreating(false)}>Cancel</button><button className="admin-primary" disabled={saving}>{saving ? "Creating…" : "Create draft"}</button></div></form></div> : null}
  </section>;
}

function ArticleFields({ form, field, saving = false, onVisibilityChange }: { form: ArticleForm; field: <K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) => void; saving?: boolean; onVisibilityChange?: (status: "draft" | "published") => void }) {
  return <div className="listing-form">
    <label className="form-field"><span>Title</span><input required value={form.title} onChange={(event) => field("title", event.target.value)} /></label>
    <div className="form-pair"><label className="form-field"><span>URL slug</span><input value={form.slug} placeholder="created-from-title-if-empty" onChange={(event) => field("slug", event.target.value)} /></label><label className="form-field"><span>Category</span><input value={form.category} onChange={(event) => field("category", event.target.value)} /></label></div>
    <label className="form-field"><span>Excerpt</span><textarea rows={3} value={form.excerpt} onChange={(event) => field("excerpt", event.target.value)} /></label>
    <label className="form-field"><span>Article body</span><textarea className="article-body-input" rows={18} value={form.body} placeholder="Use ## for section headings." onChange={(event) => field("body", event.target.value)} /></label>
    <label className="form-field"><span>Cover image alt text</span><input value={form.coverAlt} onChange={(event) => field("coverAlt", event.target.value)} /></label>
    <div className="form-pair"><label className="form-field"><span>SEO title</span><input value={form.seoTitle ?? ""} onChange={(event) => field("seoTitle", event.target.value || null)} /></label><label className="form-field"><span>Display order</span><input type="number" value={form.sortOrder} onChange={(event) => field("sortOrder", Number(event.target.value))} /></label></div>
    <label className="form-field"><span>SEO description</span><textarea rows={3} value={form.seoDescription ?? ""} onChange={(event) => field("seoDescription", event.target.value || null)} /></label>
    <label className="form-field"><span>Publication date & time</span><input type="datetime-local" value={toDateTimeLocal(form.publishedAt)} onChange={(event) => field("publishedAt", event.target.value ? new Date(event.target.value).toISOString() : null)} /><small>Set any earlier date and time before publishing, or update it later.</small></label>
    <label className="form-field"><span>Publishing status</span><select disabled={saving} value={form.status} onChange={(event) => { const status = event.target.value as "draft" | "published"; field("status", status); onVisibilityChange?.(status); }}><option value="draft">Draft — private</option><option value="published">Published — public</option></select><small>{onVisibilityChange ? "Visibility changes apply immediately. Other edits still use Save article." : "New articles stay private until you publish them."}</small></label>
  </div>;
}

function toDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
