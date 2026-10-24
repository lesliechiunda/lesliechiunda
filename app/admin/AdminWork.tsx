"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useRef, useState } from "react";
import type { BusinessRecord, PortfolioProjectRecord } from "../../lib/repository";

type BusinessForm = { name: string; slug: string; industry: string; city: string; summary: string; liveUrl: string; featured: boolean; visible: boolean; notes: string };
type ProjectForm = { title: string; category: string; summary: string; href: string; image: string; tone: string; published: boolean; featured: boolean; sortOrder: number };
type Entry = { key: string; type: "business" | "project"; title: string; category: string; image: string | null; featured: boolean; visible: boolean; url: string };

const blankBusiness: BusinessForm = { name: "", slug: "", industry: "", city: "", summary: "", liveUrl: "", featured: false, visible: true, notes: "" };
const blankProject: ProjectForm = { title: "", category: "Website", summary: "", href: "", image: "", tone: "lime", published: true, featured: false, sortOrder: 0 };
const businessForm = (record: BusinessRecord): BusinessForm => ({ name: record.name, slug: record.slug, industry: record.industry, city: record.city, summary: record.summary, liveUrl: record.previewUrl ?? record.website ?? "", featured: record.featured, visible: record.previewStatus !== "archived", notes: record.notes });
const projectForm = (record: PortfolioProjectRecord): ProjectForm => ({ title: record.title, category: record.category, summary: record.summary, href: record.href, image: record.image ?? "", tone: record.tone, published: record.published, featured: record.featured, sortOrder: record.sortOrder });

export default function AdminWork({ initialBusinesses, initialProjects }: { initialBusinesses: BusinessRecord[]; initialProjects: PortfolioProjectRecord[] }) {
  const [businesses, setBusinesses] = useState(initialBusinesses);
  const [projects, setProjects] = useState(initialProjects);
  const [selectedKey, setSelectedKey] = useState(initialBusinesses[0] ? `business:${initialBusinesses[0].id}` : initialProjects[0] ? `project:${initialProjects[0].id}` : "");
  const [businessDraft, setBusinessDraft] = useState(initialBusinesses[0] ? businessForm(initialBusinesses[0]) : blankBusiness);
  const [projectDraft, setProjectDraft] = useState(initialProjects[0] ? projectForm(initialProjects[0]) : blankProject);
  const [creating, setCreating] = useState<"business" | "project" | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const entries = useMemo<Entry[]>(() => [
    ...businesses.map((record) => ({ key: `business:${record.id}`, type: "business" as const, title: record.name, category: record.industry, image: record.heroAssetId ? `/api/media/${record.heroAssetId}` : null, featured: record.featured, visible: record.previewStatus !== "archived", url: record.previewUrl ?? record.website ?? "" })),
    ...projects.map((record) => ({ key: `project:${record.id}`, type: "project" as const, title: record.title, category: record.category, image: record.image, featured: record.featured, visible: record.published, url: record.href })),
  ].sort((a, b) => a.title.localeCompare(b.title)), [businesses, projects]);
  const selected = entries.find((entry) => entry.key === selectedKey) ?? entries[0];
  const selectedBusiness = selected?.type === "business" ? businesses.find((record) => `business:${record.id}` === selected.key) : undefined;
  const selectedProject = selected?.type === "project" ? projects.find((record) => `project:${record.id}` === selected.key) : undefined;
  const filtered = entries.filter((entry) => `${entry.title} ${entry.category}`.toLowerCase().includes(query.toLowerCase()));

  function choose(entry: Entry) {
    setSelectedKey(entry.key);
    if (entry.type === "business") { const record = businesses.find((item) => `business:${item.id}` === entry.key); if (record) setBusinessDraft(businessForm(record)); }
    else { const record = projects.find((item) => `project:${item.id}` === entry.key); if (record) setProjectDraft(projectForm(record)); }
    setMessage("");
  }

  async function request<T>(url: string, method: string, body?: unknown): Promise<T> {
    const response = await fetch(url, { method, headers: body ? { "content-type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
    const payload = await response.json() as T & { error?: string };
    if (!response.ok) throw new Error(payload.error ?? "Could not save changes.");
    return payload;
  }

  async function save() {
    if (!selected) return;
    setBusy(true); setMessage("");
    try {
      if (selectedBusiness) {
        const payload = await request<{ business: BusinessRecord }>(`/api/admin/businesses/${selectedBusiness.id}`, "PATCH", {
          name: businessDraft.name, slug: businessDraft.slug, industry: businessDraft.industry, city: businessDraft.city,
          summary: businessDraft.summary, previewUrl: businessDraft.liveUrl || null, featured: businessDraft.featured,
          previewStatus: businessDraft.visible ? "live" : "archived", notes: businessDraft.notes,
        });
        setBusinesses((items) => items.map((item) => item.id === selectedBusiness.id ? payload.business : item));
      } else if (selectedProject) {
        const payload = await request<{ project: PortfolioProjectRecord }>(`/api/admin/projects/${selectedProject.id}`, "PATCH", { ...projectDraft, image: projectDraft.image || null });
        setProjects((items) => items.map((item) => item.id === selectedProject.id ? payload.project : item));
      }
      setMessage("Saved. Public Work and the homepage will reflect this selection.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save."); }
    finally { setBusy(false); }
  }

  async function toggleFeatured(entry: Entry) {
    setBusy(true); setMessage("");
    try {
      if (entry.type === "business") {
        const payload = await request<{ business: BusinessRecord }>(`/api/admin/businesses/${entry.key.slice(9)}`, "PATCH", { featured: !entry.featured });
        setBusinesses((items) => items.map((item) => item.id === payload.business.id ? payload.business : item));
        if (entry.key === selectedKey) setBusinessDraft((form) => ({ ...form, featured: payload.business.featured }));
      } else {
        const payload = await request<{ project: PortfolioProjectRecord }>(`/api/admin/projects/${entry.key.slice(8)}`, "PATCH", { featured: !entry.featured });
        setProjects((items) => items.map((item) => item.id === payload.project.id ? payload.project : item));
        if (entry.key === selectedKey) setProjectDraft((form) => ({ ...form, featured: payload.project.featured }));
      }
      setMessage("Homepage selection updated.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not update feature selection."); }
    finally { setBusy(false); }
  }

  async function create(event: React.FormEvent) {
    event.preventDefault();
    if (!creating) return;
    setBusy(true); setMessage("");
    try {
      if (creating === "business") {
        const payload = await request<{ business: BusinessRecord }>("/api/admin/businesses", "POST", { ...businessDraft, previewUrl: businessDraft.liveUrl || null });
        setBusinesses((items) => [...items, payload.business]); setSelectedKey(`business:${payload.business.id}`); setBusinessDraft(businessForm(payload.business));
      } else {
        const payload = await request<{ project: PortfolioProjectRecord }>("/api/admin/projects", "POST", { ...projectDraft, image: projectDraft.image || null });
        setProjects((items) => [...items, payload.project]); setSelectedKey(`project:${payload.project.id}`); setProjectDraft(projectForm(payload.project));
      }
      setCreating(null); setMessage("Work item added.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not create work item."); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!selected || !window.confirm(`Permanently delete ${selected.title}?`)) return;
    setBusy(true); setMessage("");
    try {
      await request(selected.type === "business" ? `/api/admin/businesses/${selected.key.slice(9)}` : `/api/admin/projects/${selected.key.slice(8)}`, "DELETE");
      const next = entries.find((entry) => entry.key !== selected.key);
      if (selected.type === "business") setBusinesses((items) => items.filter((item) => `business:${item.id}` !== selected.key));
      else setProjects((items) => items.filter((item) => `project:${item.id}` !== selected.key));
      setSelectedKey(next?.key ?? "");
      if (next?.type === "business") { const record = businesses.find((item) => `business:${item.id}` === next.key); if (record) setBusinessDraft(businessForm(record)); }
      if (next?.type === "project") { const record = projects.find((item) => `project:${item.id}` === next.key); if (record) setProjectDraft(projectForm(record)); }
      setMessage("Work item deleted.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not delete work item."); }
    finally { setBusy(false); }
  }

  async function upload(file: File) {
    if (!selectedBusiness) return;
    setBusy(true); setMessage(`Uploading ${file.name}…`);
    try {
      const form = new FormData(); form.set("file", file); form.set("altText", `${selectedBusiness.name} website screenshot`);
      const response = await fetch(`/api/admin/businesses/${selectedBusiness.id}/media`, { method: "POST", body: form });
      const payload = await response.json() as { asset?: { id: string }; error?: string };
      if (!response.ok || !payload.asset) throw new Error(payload.error ?? "Upload failed.");
      const assetId = payload.asset.id;
      setBusinesses((items) => items.map((item) => item.id === selectedBusiness.id ? { ...item, heroAssetId: assetId } : item));
      setMessage("Image saved to this work item.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Image upload failed."); }
    finally { if (fileInput.current) fileInput.current.value = ""; setBusy(false); }
  }

  async function removeImage() {
    if (!selectedBusiness?.heroAssetId || !window.confirm("Remove this image?")) return;
    setBusy(true); setMessage("");
    try {
      await request(`/api/admin/businesses/${selectedBusiness.id}/media?assetId=${encodeURIComponent(selectedBusiness.heroAssetId)}`, "DELETE");
      setBusinesses((items) => items.map((item) => item.id === selectedBusiness.id ? { ...item, heroAssetId: null } : item));
      setMessage("Image removed.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not remove image."); }
    finally { setBusy(false); }
  }

  const setBusiness = <K extends keyof BusinessForm>(key: K, value: BusinessForm[K]) => setBusinessDraft((form) => ({ ...form, [key]: value }));
  const setProject = <K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) => setProjectDraft((form) => ({ ...form, [key]: value }));

  return <section className="simple-section" id="work">
    <div className="simple-heading"><div><p className="admin-kicker">Your portfolio</p><h1>Work</h1><p>Manage every website and project in one place. Choose what appears on the homepage.</p></div><div className="simple-actions"><button type="button" className="admin-primary" onClick={() => { setBusinessDraft(blankBusiness); setCreating("business"); }}>+ Add business website</button><button type="button" className="archive-button" onClick={() => { setProjectDraft(blankProject); setCreating("project"); }}>+ Add other project</button></div></div>
    {message ? <p className="admin-message" role="status">{message}</p> : null}
    <div className="simple-search"><input type="search" placeholder="Search work" aria-label="Search work" value={query} onChange={(event) => setQuery(event.target.value)} /><span>{filtered.length} items</span></div>
    <div className="simple-grid">
      <div className="work-list">{filtered.map((entry) => <div key={entry.key} className={`work-list-row ${selected?.key === entry.key ? "is-selected" : ""}`}><button type="button" className="work-select" onClick={() => choose(entry)}>{entry.image ? <img src={entry.image} alt="" /> : <span className="work-empty-image">LC</span>}<span><strong>{entry.title}</strong><small>{entry.category} · {entry.visible ? "Public" : "Hidden"}</small></span></button><label className="work-feature"><input type="checkbox" checked={entry.featured} disabled={busy} onChange={() => void toggleFeatured(entry)} /><span>Featured</span></label></div>)}{!filtered.length ? <p className="simple-empty">No work matches your search.</p> : null}</div>
      {selected && !creating ? <div className="record-panel simple-editor">
        <div className="record-panel-head"><div><p className="admin-kicker">Edit work</p><h3>{selected.title}</h3></div>{selected.url ? <a href={selected.url} target="_blank" rel="noreferrer">Open website ↗</a> : null}</div>
        {selectedBusiness ? <div className="listing-form">
          <div className="form-pair"><Field label="Name" value={businessDraft.name} onChange={(value) => setBusiness("name", value)} /><Field label="Slug" value={businessDraft.slug} onChange={(value) => setBusiness("slug", value)} /></div>
          <div className="form-pair"><Field label="Industry" value={businessDraft.industry} onChange={(value) => setBusiness("industry", value)} /><Field label="City" value={businessDraft.city} onChange={(value) => setBusiness("city", value)} /></div>
          <Field label="Live website URL" value={businessDraft.liveUrl} type="url" onChange={(value) => setBusiness("liveUrl", value)} />
          <TextField label="Short description" value={businessDraft.summary} onChange={(value) => setBusiness("summary", value)} />
          <TextField label="Private notes" value={businessDraft.notes} onChange={(value) => setBusiness("notes", value)} />
          <label className="publish-toggle"><input type="checkbox" checked={businessDraft.visible} onChange={(event) => setBusiness("visible", event.target.checked)} /> Show on public Work page</label>
          <label className="publish-toggle"><input type="checkbox" checked={businessDraft.featured} onChange={(event) => setBusiness("featured", event.target.checked)} /> Feature on homepage</label>
          {selectedBusiness.heroAssetId ? <img className="listing-thumb" src={`/api/media/${selectedBusiness.heroAssetId}`} alt={`${selectedBusiness.name} screenshot`} /> : null}
          <div className="work-image-actions"><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" aria-label="Upload work image" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} /><small>JPG, PNG, WebP or AVIF · up to 8 MB</small>{selectedBusiness.heroAssetId ? <button className="remove-media-inline" type="button" disabled={busy} onClick={removeImage}>Remove image</button> : null}</div>
        </div> : null}
        {selectedProject ? <div className="listing-form">
          <Field label="Title" value={projectDraft.title} onChange={(value) => setProject("title", value)} />
          <Field label="Category" value={projectDraft.category} onChange={(value) => setProject("category", value)} />
          <Field label="Live website URL" value={projectDraft.href} type="url" onChange={(value) => setProject("href", value)} />
          <Field label="Image URL or local path" value={projectDraft.image} onChange={(value) => setProject("image", value)} />
          {projectDraft.image ? <><img className="listing-thumb" src={projectDraft.image} alt={`${projectDraft.title} screenshot`} /><button type="button" className="remove-media-inline" onClick={() => setProject("image", "")}>Remove image</button></> : null}
          <TextField label="Short description" value={projectDraft.summary} onChange={(value) => setProject("summary", value)} />
          <div className="form-pair"><label className="form-field">Colour<select value={projectDraft.tone} onChange={(event) => setProject("tone", event.target.value)}><option value="lime">Lime</option><option value="clay">Clay</option><option value="blue">Blue</option><option value="ink">Ink</option></select></label><label className="form-field">Display order<input type="number" value={projectDraft.sortOrder} onChange={(event) => setProject("sortOrder", Number(event.target.value))} /></label></div>
          <label className="publish-toggle"><input type="checkbox" checked={projectDraft.published} onChange={(event) => setProject("published", event.target.checked)} /> Show on public Work page</label>
          <label className="publish-toggle"><input type="checkbox" checked={projectDraft.featured} onChange={(event) => setProject("featured", event.target.checked)} /> Feature on homepage</label>
        </div> : null}
        <div className="editor-actions"><button type="button" className="danger-button" disabled={busy} onClick={remove}>Delete</button><button type="button" className="admin-primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save changes"}</button></div>
      </div> : null}
    </div>
    {creating ? <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="create-work-title"><form onSubmit={create}><div className="modal-head"><div><p className="admin-kicker">New work</p><h2 id="create-work-title">{creating === "business" ? "Add a business website" : "Add a project"}</h2></div><button type="button" onClick={() => setCreating(null)} aria-label="Close">×</button></div>
      {creating === "business" ? <><Field label="Business name" value={businessDraft.name} required onChange={(value) => setBusinessDraft((form) => ({ ...form, name: value, slug: !form.slug || form.slug === form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ? value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : form.slug }))} /><Field label="Slug" value={businessDraft.slug} required onChange={(value) => setBusiness("slug", value)} /><Field label="Industry" value={businessDraft.industry} onChange={(value) => setBusiness("industry", value)} /><Field label="Live website URL" value={businessDraft.liveUrl} type="url" onChange={(value) => setBusiness("liveUrl", value)} /><TextField label="Short description" value={businessDraft.summary} onChange={(value) => setBusiness("summary", value)} /><label className="publish-toggle"><input type="checkbox" checked={businessDraft.featured} onChange={(event) => setBusiness("featured", event.target.checked)} /> Feature on homepage</label></> : <><Field label="Project title" value={projectDraft.title} required onChange={(value) => setProject("title", value)} /><Field label="Category" value={projectDraft.category} onChange={(value) => setProject("category", value)} /><Field label="Live website URL" value={projectDraft.href} required type="url" onChange={(value) => setProject("href", value)} /><Field label="Image URL or local path" value={projectDraft.image} onChange={(value) => setProject("image", value)} /><TextField label="Short description" value={projectDraft.summary} onChange={(value) => setProject("summary", value)} /><label className="publish-toggle"><input type="checkbox" checked={projectDraft.featured} onChange={(event) => setProject("featured", event.target.checked)} /> Feature on homepage</label></>}
      <div className="editor-actions"><button type="button" className="archive-button" onClick={() => setCreating(null)}>Cancel</button><button className="admin-primary" disabled={busy}>{busy ? "Creating…" : "Add work"}</button></div>
    </form></div> : null}
  </section>;
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="form-field"><span>{label}</span><input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="form-field"><span>{label}</span><textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
