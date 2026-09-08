"use client";

import { useState } from "react";
import { Pencil, Plus, Store, X } from "lucide-react";

import { createSite, updateSite } from "@/app/actions/admin";
import { Badge, Button, Card, CardHeader, ErrorBanner, PageHeader, PageShell, SuccessBanner } from "@/components/ui";
import { useMutate } from "@/components/use-mutate";
import { KIND_LABEL } from "@/components/views/labels";
import type { Site, SiteKind } from "@/lib/types";

export default function AdminSitesView({ sites }: { sites: Site[] }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState<SiteKind>("BOUTIQUE");
  const [isActive, setIsActive] = useState(true);
  const { run, pending, error, success } = useMutate();

  const editing = sites.find((s) => s.id === editingId) ?? null;

  const openCreate = () => {
    setEditingId(null);
    setCode("");
    setName("");
    setKind("BOUTIQUE");
    setIsActive(true);
  };

  const openEdit = (site: Site) => {
    setEditingId(site.id);
    setCode(site.code);
    setName(site.name);
    setKind(site.kind);
    setIsActive(site.is_active);
  };

  const submit = () => {
    if (editingId === null) {
      run(() => createSite({ code, name, kind }).then((r) => ({ ok: r.ok, error: r.ok ? undefined : r.error })));
    } else {
      run(() =>
        updateSite(editingId, { name, kind, is_active: isActive }).then((r) => ({ ok: r.ok, error: r.ok ? undefined : r.error })),
      );
    }
  };

  const toggleActive = (site: Site) => {
    run(() =>
      updateSite(site.id, { is_active: !site.is_active }).then((r) => ({ ok: r.ok, error: r.ok ? undefined : r.error })),
    );
  };

  return (
    <PageShell>
      <PageHeader title="Boutiques & Sites" subtitle="Créer et modifier les magasins (dépôt central et boutiques)" />

      <Card className="p-5 space-y-4">
        <CardHeader
          title={editingId === null ? "Nouveau site" : `Modifier ${editing?.name ?? ""}`}
          right={
            editingId !== null ? (
              <Button variant="ghost" onClick={openCreate}>
                <X className="w-3.5 h-3.5" /> Annuler
              </Button>
            ) : null
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} disabled={editingId !== null} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 disabled:opacity-60" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Nom</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
            <select value={kind} onChange={(e) => setKind(e.target.value as SiteKind)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
              <option value="DEPOT">Dépôt</option>
              <option value="BOUTIQUE">Boutique</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={submit} disabled={pending || !code || !name}>
              <Plus className="w-3.5 h-3.5" /> {pending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>
        {error ? <ErrorBanner message={error} /> : null}
        {success ? <SuccessBanner message={success} /> : null}
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Nom</th>
              <th className="p-3">Type</th>
              <th className="p-3 text-center">Statut</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sites.map((site) => (
              <tr key={site.id} className="hover:bg-slate-50/60">
                <td className="p-3 font-mono text-slate-700">{site.code}</td>
                <td className="p-3 font-semibold text-slate-900">{site.name}</td>
                <td className="p-3 text-slate-600">
                  <span className="inline-flex items-center gap-1"><Store className="w-3 h-3" /> {KIND_LABEL[site.kind]}</span>
                </td>
                <td className="p-3 text-center">
                  <Badge tone={site.is_active ? "green" : "red"}>{site.is_active ? "Actif" : "Inactif"}</Badge>
                </td>
                <td className="p-3 text-right space-x-1">
                  <Button variant="ghost" onClick={() => openEdit(site)}>
                    <Pencil className="w-3.5 h-3.5" /> Modifier
                  </Button>
                  <Button variant="ghost" onClick={() => toggleActive(site)}>
                    {site.is_active ? "Désactiver" : "Activer"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageShell>
  );
}