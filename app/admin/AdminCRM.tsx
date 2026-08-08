"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import type { BusinessRecord } from "../../lib/repository";

const labels: Record<string, string> = {
  not_started: "Not started", draft: "Draft", review: "In review", live: "Live preview", archived: "Archived",
  draft_ready: "Draft ready", approved: "Approved", sent: "Sent", replied: "Replied", needs_review: "Needs review",
  approved_for_preview: "Preview approved", approved_for_outreach: "Outreach approved", rejected: "Rejected",
};
const previewOptions = ["not_started", "draft", "review", "live", "archived"];
const outreachOptions = ["not_started", "draft_ready", "approved", "sent", "replied"];
const approvalOptions = ["needs_review", "approved_for_preview", "approved_for_outreach", "rejected"];

type ListingForm = {
  name: string; slug: string; industry: string; city: string; website: string; contactName: string;
  contactEmail: string; contactPhone: string; eyebrow: string; headline: string; summary: string;
  services: string; notes: string; priority: number;
};

const emptyForm: ListingForm = {
  name: "", slug: "", industry: "", city: "", website: "", contactName: "", contactEmail: "",
  contactPhone: "", eyebrow: "", headline: "", summary: "", services: "", notes: "", priority: 2,
};

function toForm(record: BusinessRecord): ListingForm {
  let services = "";
  try { services = (JSON.parse(record.services) as string[]).join(", "); } catch { services = ""; }
  return {
    name: record.name, slug: record.slug, industry: record.industry, city: record.city, website: record.website ?? "",
    contactName: record.contactName ?? "", contactEmail: record.contactEmail ?? "", contactPhone: record.contactPhone ?? "",
    eyebrow: record.eyebrow, headline: record.headline, summary: record.summary, services, notes: record.notes, priority: record.priority,
  };
}

function StatusPill({ value }: { value: string }) {
  return <span className={`status-pill status-pill--${value}`}>{labels[value] ?? value}</span>;
}

export default function AdminCRM({ initialBusinesses }: { initialBusinesses: BusinessRecord[] }) {
  const [records, setRecords] = useState(initialBusinesses);
  const [selectedId, setSelectedId] = useState(initialBusinesses[0]?.id ?? "");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [form, setForm] = useState<ListingForm>(initialBusinesses[0] ? toForm(initialBusinesses[0]) : emptyForm);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [workflowRunning, setWorkflowRunning] = useState(false);
  const [message, setMessage] = useState("");
  const selected = records.find((record) => record.id === selectedId) ?? records[0];

  const visible = useMemo(() => records.filter((record) => {
    const matchesQuery = `${record.name} ${record.industry} ${record.city}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (filter === "all" || record.approvalStatus === filter);
  }), [filter, query, records]);

  function setField<K extends keyof ListingForm>(field: K, value: ListingForm[K], target: "edit" | "create" = "edit") {
    const setter = target === "edit" ? setForm : setCreateForm;
    setter((current) => ({ ...current, [field]: value }));
  }

  function selectRecord(record: BusinessRecord) {
    setSelectedId(record.id);
    setForm(toForm(record));
    setMessage("");
    setUploadFile(null);
  }

  async function patchBusiness(id: string, values: Record<string, string | number | null>) {
    setSaving(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/businesses/${id}`, {
        method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(values),
      });
      const payload = (await response.json()) as { business?: BusinessRecord; error?: string };
      if (!response.ok || !payload.business) throw new Error(payload.error ?? "Update failed");
      setRecords((current) => current.map((record) => record.id === id ? payload.business! : record));
      setMessage("Changes saved.");
      return payload.business;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save changes.");
      return null;
    } finally { setSaving(false); }
  }

  async function saveListing() {
    if (!selected) return;
    await patchBusiness(selected.id, {
      ...form,
      website: form.website || null,
      contactName: form.contactName || null,
      contactEmail: form.contactEmail || null,
      contactPhone: form.contactPhone || null,
      services: JSON.stringify(form.services.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 8)),
    });
  }

  async function createListing(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/admin/businesses", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(createForm),
      });
      const payload = (await response.json()) as { business?: BusinessRecord; error?: string };
      if (!response.ok || !payload.business) throw new Error(payload.error ?? "Could not create listing.");
      setRecords((current) => [payload.business!, ...current]);
      setSelectedId(payload.business.id); setForm(toForm(payload.business)); setShowCreate(false); setCreateForm(emptyForm); setMessage("Listing created.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not create listing."); }
    finally { setSaving(false); }
  }

  async function uploadImage() {
    if (!selected || !uploadFile) return;
    setUploading(true); setMessage(`Uploading ${uploadFile.name}…`);
    const data = new FormData(); data.set("file", uploadFile); data.set("altText", `${selected.name} listing image`);
    try {
      const response = await fetch(`/api/admin/businesses/${selected.id}/media`, { method: "POST", body: data });
      const payload = (await response.json()) as { asset?: { id: string }; error?: string };
      if (!response.ok || !payload.asset) throw new Error(payload.error ?? "Upload failed.");
      setRecords((current) => current.map((record) => record.id === selected.id ? { ...record, heroAssetId: payload.asset!.id } : record));
      setUploadFile(null); setMessage("Image uploaded and attached.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Upload failed."); }
    finally { setUploading(false); }
  }

  async function queueWorkflow(jobType: "preview_build_request" | "outreach_draft") {
    if (!selected) return;
    setWorkflowRunning(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/businesses/${selected.id}/workflow`, {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jobType }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not add workflow item.");
      setMessage(jobType === "preview_build_request" ? "Preview request added to the queue. It will not publish automatically." : "Outreach draft created. It will not be sent automatically.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not add workflow item."); }
    finally { setWorkflowRunning(false); }
  }

  const counts = {
    total: records.length,
    review: records.filter((record) => record.approvalStatus === "needs_review").length,
    previews: records.filter((record) => ["review", "live"].includes(record.previewStatus)).length,
    drafts: records.filter((record) => record.outreachStatus === "draft_ready").length,
  };

  return (
    <div className="crm-shell">
      <section className="crm-overview">
        <div className="crm-title-row">
          <div><p className="admin-kicker">Workspace overview</p><h1>Good morning, Leslie.</h1></div>
          <div className="foundation-badge"><i /> Admin phase 2 <span>External actions off</span></div>
        </div>
        <div className="metric-grid">
          <article><p>Businesses tracked</p><strong>{counts.total.toString().padStart(2, "0")}</strong><span>Editable listings</span></article>
          <article><p>Needs your review</p><strong>{counts.review.toString().padStart(2, "0")}</strong><span>Human decision required</span></article>
          <article><p>Active previews</p><strong>{counts.previews.toString().padStart(2, "0")}</strong><span>Draft or review</span></article>
          <article><p>Outreach drafts</p><strong>{counts.drafts.toString().padStart(2, "0")}</strong><span>Nothing has been sent</span></article>
        </div>
      </section>

      <section className="pipeline-section" id="pipeline">
        <div className="pipeline-head">
          <div><p className="admin-kicker">Business pipeline</p><h2>Opportunities</h2></div>
          <div className="pipeline-tools">
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search businesses" aria-label="Search businesses" />
            <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter approvals"><option value="all">All approvals</option>{approvalOptions.map((option) => <option key={option} value={option}>{labels[option]}</option>)}</select>
            <button type="button" className="admin-primary" onClick={() => setShowCreate(true)}>+ Add business</button>
          </div>
        </div>
        {message ? <p className="admin-message" role="status">{message}</p> : null}
        <div className="pipeline-layout pipeline-layout--editor">
          <div className="pipeline-table-wrap">
            <table className="pipeline-table">
              <thead><tr><th>Business</th><th>Preview</th><th>Outreach</th><th>Approval</th><th /></tr></thead>
              <tbody>{visible.map((record) => (
                <tr key={record.id} className={selected?.id === record.id ? "is-selected" : ""} onClick={() => selectRecord(record)}>
                  <td><strong>{record.name}</strong><span>{record.industry} · {record.city}</span></td>
                  <td><StatusPill value={record.previewStatus} /></td><td><StatusPill value={record.outreachStatus} /></td>
                  <td><StatusPill value={record.approvalStatus} /></td><td><button type="button" aria-label={`Edit ${record.name}`}>→</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>

          {selected ? <aside className="record-panel record-panel--editor">
            <div className="record-panel-head"><div><p className="admin-kicker">Listing editor</p><h3>{selected.name}</h3></div><a href={selected.previewUrl ?? `/preview/${selected.slug}`} target="_blank" rel="noreferrer">Preview ↗</a></div>
            {selected.heroAssetId ? <img className="listing-thumb" src={`/api/media/${selected.heroAssetId}`} alt={`${selected.name} listing`} /> : <div className="listing-thumb listing-thumb--empty">No listing image yet</div>}
            <div className="listing-form">
              <div className="form-pair"><Field label="Business name" value={form.name} onChange={(v) => setField("name", v)} /><Field label="URL slug" value={form.slug} onChange={(v) => setField("slug", v)} /></div>
              <div className="form-pair"><Field label="Industry" value={form.industry} onChange={(v) => setField("industry", v)} /><Field label="City" value={form.city} onChange={(v) => setField("city", v)} /></div>
              <Field label="Website" value={form.website} onChange={(v) => setField("website", v)} type="url" />
              <Field label="Preview eyebrow" value={form.eyebrow} onChange={(v) => setField("eyebrow", v)} />
              <Field label="Headline" value={form.headline} onChange={(v) => setField("headline", v)} />
              <TextField label="Summary" value={form.summary} onChange={(v) => setField("summary", v)} />
              <Field label="Services (comma separated)" value={form.services} onChange={(v) => setField("services", v)} />
              <div className="form-pair"><Field label="Contact name" value={form.contactName} onChange={(v) => setField("contactName", v)} /><Field label="Contact email" value={form.contactEmail} onChange={(v) => setField("contactEmail", v)} type="email" /></div>
              <Field label="Contact phone" value={form.contactPhone} onChange={(v) => setField("contactPhone", v)} />
              <TextField label="Internal notes" value={form.notes} onChange={(v) => setField("notes", v)} />
            </div>
            <div className="media-upload"><label>Listing image<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)} /></label><button type="button" disabled={!uploadFile || uploading} onClick={uploadImage}>{uploading ? "Uploading…" : "Upload image"}</button><small>{uploadFile ? `${uploadFile.name} ready to upload` : "JPG, PNG, WebP or AVIF · maximum 8 MB"}</small></div>
            <div className="workflow-actions"><p className="admin-kicker">Safe workflow actions</p><button type="button" disabled={workflowRunning} onClick={() => queueWorkflow("preview_build_request")}>{workflowRunning ? "Working…" : "Queue preview request"}</button><button type="button" disabled={workflowRunning} onClick={() => queueWorkflow("outreach_draft")}>Create outreach draft</button><small>These create internal queue items only. They do not publish a site or send email.</small></div>
            <div className="workflow-controls workflow-controls--row">
              <label>Preview<select disabled={saving} value={selected.previewStatus} onChange={(event) => patchBusiness(selected.id, { previewStatus: event.target.value })}>{previewOptions.map((option) => <option key={option} value={option}>{labels[option]}</option>)}</select></label>
              <label>Outreach<select disabled={saving} value={selected.outreachStatus} onChange={(event) => patchBusiness(selected.id, { outreachStatus: event.target.value })}>{outreachOptions.map((option) => <option key={option} value={option}>{labels[option]}</option>)}</select></label>
              <label>Approval<select disabled={saving} value={selected.approvalStatus} onChange={(event) => patchBusiness(selected.id, { approvalStatus: event.target.value })}>{approvalOptions.map((option) => <option key={option} value={option}>{labels[option]}</option>)}</select></label>
            </div>
            <div className="editor-actions"><button type="button" className="archive-button" disabled={saving} onClick={() => patchBusiness(selected.id, { previewStatus: "archived" })}>Archive listing</button><button type="button" className="admin-primary" disabled={saving} onClick={saveListing}>{saving ? "Saving…" : "Save changes"}</button></div>
          </aside> : null}
        </div>
      </section>

      {showCreate ? <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="create-title"><form onSubmit={createListing}>
        <div className="modal-head"><div><p className="admin-kicker">New listing</p><h2 id="create-title">Add a business</h2></div><button type="button" onClick={() => setShowCreate(false)} aria-label="Close">×</button></div>
        <Field label="Business name" value={createForm.name} onChange={(v) => { setField("name", v, "create"); if (!createForm.slug) setField("slug", v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), "create"); }} required />
        <Field label="URL slug" value={createForm.slug} onChange={(v) => setField("slug", v, "create")} required />
        <div className="form-pair"><Field label="Industry" value={createForm.industry} onChange={(v) => setField("industry", v, "create")} /><Field label="City" value={createForm.city} onChange={(v) => setField("city", v, "create")} /></div>
        <Field label="Preview headline" value={createForm.headline} onChange={(v) => setField("headline", v, "create")} />
        <TextField label="Short summary" value={createForm.summary} onChange={(v) => setField("summary", v, "create")} />
        <div className="editor-actions"><button type="button" className="archive-button" onClick={() => setShowCreate(false)}>Cancel</button><button className="admin-primary" disabled={saving}>{saving ? "Creating…" : "Create listing"}</button></div>
      </form></div> : null}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string | number; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="form-field"><span>{label}</span><input type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} /></label>;
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="form-field"><span>{label}</span><textarea value={value} rows={3} onChange={(event) => onChange(event.target.value)} /></label>;
}
