"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import type { PortfolioProjectRecord } from "../../lib/repository";

type ProjectForm = Pick<PortfolioProjectRecord, "title" | "category" | "summary" | "href" | "image" | "tone" | "published" | "sortOrder">;
const blank: ProjectForm = { title: "", category: "Website", summary: "", href: "", image: null, tone: "lime", published: true, sortOrder: 0 };

export default function AdminProjects({ initialProjects }: { initialProjects: PortfolioProjectRecord[] }) {
  const orderProjects = (items: PortfolioProjectRecord[]) => [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
  const [projects, setProjects] = useState(orderProjects(initialProjects));
  const [selectedId, setSelectedId] = useState(initialProjects[0]?.id ?? "");
  const selected = projects.find((project) => project.id === selectedId) ?? projects[0];
  const [form, setForm] = useState<ProjectForm>(selected ? fromProject(selected) : blank);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function choose(project: PortfolioProjectRecord) { setSelectedId(project.id); setForm(fromProject(project)); setMessage(""); }
  function field<K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) { setForm((current) => ({ ...current, [key]: value })); }

  async function save() {
    if (!selected) return;
    setSaving(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/projects/${selected.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const payload = (await response.json()) as { project?: PortfolioProjectRecord; error?: string };
      if (!response.ok || !payload.project) throw new Error(payload.error ?? "Could not save project.");
      setProjects((current) => orderProjects(current.map((project) => project.id === selected.id ? payload.project! : project)));
      setMessage("Project saved. The public Work page is updated.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save project."); }
    finally { setSaving(false); }
  }

  async function deleteProject() {
    if (!selected || !window.confirm(`Permanently delete ${selected.title} from your portfolio?`)) return;
    setSaving(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/projects/${selected.id}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not delete project.");
      const remaining = projects.filter((project) => project.id !== selected.id);
      setProjects(remaining); setSelectedId(remaining[0]?.id ?? ""); setForm(remaining[0] ? fromProject(remaining[0]) : blank); setMessage("Project deleted.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not delete project."); }
    finally { setSaving(false); }
  }

  async function moveProject(direction: -1 | 1) {
    if (!selected) return;
    const ordered = orderProjects(projects);
    const index = ordered.findIndex((project) => project.id === selected.id);
    const target = ordered[index + direction];
    if (!target) return;
    setSaving(true); setMessage("");
    try {
      const [currentResponse, targetResponse] = await Promise.all([
        fetch(`/api/admin/projects/${selected.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ sortOrder: target.sortOrder }) }),
        fetch(`/api/admin/projects/${target.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ sortOrder: selected.sortOrder }) }),
      ]);
      if (!currentResponse.ok || !targetResponse.ok) throw new Error("Could not reorder projects.");
      const currentPayload = (await currentResponse.json()) as { project: PortfolioProjectRecord };
      const targetPayload = (await targetResponse.json()) as { project: PortfolioProjectRecord };
      setProjects((items) => orderProjects(items.map((project) => project.id === selected.id ? currentPayload.project : project.id === target.id ? targetPayload.project : project)));
      setForm(fromProject(currentPayload.project)); setMessage("Project order updated.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not reorder projects."); }
    finally { setSaving(false); }
  }

  async function create(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/admin/projects", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const payload = (await response.json()) as { project?: PortfolioProjectRecord; error?: string };
      if (!response.ok || !payload.project) throw new Error(payload.error ?? "Could not add project.");
      setProjects((current) => [...current, payload.project!]); setSelectedId(payload.project.id); setForm(fromProject(payload.project)); setCreating(false); setMessage("Project added.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not add project."); }
    finally { setSaving(false); }
  }

  return <section className="pipeline-section admin-projects" id="projects">
    <div className="pipeline-head"><div><p className="admin-kicker">Public portfolio</p><h2>Projects</h2></div><button type="button" className="admin-primary" onClick={() => { setForm(blank); setCreating(true); }}>+ Add project</button></div>
    {message ? <p className="admin-message" role="status">{message}</p> : null}
    <div className="project-admin-grid">
      <div className="project-admin-list">{projects.map((project) => <button type="button" key={project.id} className={selected?.id === project.id ? "is-selected" : ""} onClick={() => choose(project)}>
        {project.image ? <img src={project.image} alt="" /> : <span className={`project-swatch project-swatch--${project.tone}`} />}
        <span><strong>{project.title}</strong><small>{project.category}</small></span><i>{project.published ? "Live" : "Hidden"}</i>
      </button>)}</div>
      {selected && !creating ? <div className="record-panel project-editor"><ProjectFields form={form} field={field} />
        <div className="reorder-actions"><span>Order</span><button type="button" disabled={saving} onClick={() => moveProject(-1)}>Move up</button><button type="button" disabled={saving} onClick={() => moveProject(1)}>Move down</button></div>
        <div className="editor-actions"><button type="button" className="danger-button" disabled={saving} onClick={deleteProject}>Delete project</button><a className="archive-button" href={selected.href} target="_blank" rel="noreferrer">Open ↗</a><button className="admin-primary" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save project"}</button></div>
      </div> : null}
    </div>
    {creating ? <div className="admin-modal" role="dialog" aria-modal="true"><form onSubmit={create}>
      <div className="modal-head"><div><p className="admin-kicker">New portfolio item</p><h2>Add a project</h2></div><button type="button" onClick={() => setCreating(false)} aria-label="Close">×</button></div>
      <ProjectFields form={form} field={field} />
      <div className="editor-actions"><button type="button" className="archive-button" onClick={() => setCreating(false)}>Cancel</button><button className="admin-primary" disabled={saving}>{saving ? "Creating…" : "Create project"}</button></div>
    </form></div> : null}
  </section>;
}

function fromProject(project: PortfolioProjectRecord): ProjectForm { return { title: project.title, category: project.category, summary: project.summary, href: project.href, image: project.image, tone: project.tone, published: project.published, sortOrder: project.sortOrder }; }

function ProjectFields({ form, field }: { form: ProjectForm; field: <K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) => void }) {
  return <div className="listing-form">
    <label className="form-field"><span>Project title</span><input required value={form.title} onChange={(e) => field("title", e.target.value)} /></label>
    <label className="form-field"><span>Category</span><input value={form.category} onChange={(e) => field("category", e.target.value)} /></label>
    <label className="form-field"><span>Project URL</span><input required type="url" value={form.href} onChange={(e) => field("href", e.target.value)} /></label>
    <label className="form-field"><span>Image URL or local path</span><input value={form.image ?? ""} placeholder="/project-name.png" onChange={(e) => field("image", e.target.value || null)} /></label>
    {form.image ? <button type="button" className="remove-media-inline" onClick={() => field("image", null)}>Remove project image</button> : null}
    <label className="form-field"><span>Summary</span><textarea rows={4} value={form.summary} onChange={(e) => field("summary", e.target.value)} /></label>
    <div className="form-pair"><label className="form-field"><span>Colour</span><select value={form.tone} onChange={(e) => field("tone", e.target.value)}><option value="lime">Lime</option><option value="clay">Clay</option><option value="blue">Blue</option><option value="ink">Ink</option></select></label><label className="form-field"><span>Display order</span><input type="number" value={form.sortOrder} onChange={(e) => field("sortOrder", Number(e.target.value))} /></label></div>
    <label className="publish-toggle"><input type="checkbox" checked={form.published} onChange={(e) => field("published", e.target.checked)} /> Show on public website</label>
  </div>;
}
