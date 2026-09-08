"use client";

import { useState } from "react";
import { Pencil, Truck, X } from "lucide-react";

import { createSupplier, updateSupplier } from "@/app/actions/admin";
import { Badge, Button, Card, CardHeader, ErrorBanner, PageHeader, PageShell, SuccessBanner } from "@/components/ui";
import { useMutate } from "@/components/use-mutate";
import type { Supplier } from "@/lib/types";

export default function AdminSuppliersView({ suppliers }: { suppliers: Supplier[] }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const { run, pending, error, success } = useMutate();

  const editing = suppliers.find((s) => s.id === editingId) ?? null;

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setContactName("");
    setPhone("");
    setEmail("");
    setAddress("");
  };

  const openEdit = (supplier: Supplier) => {
    setEditingId(supplier.id);
    setName(supplier.name);
    setContactName(supplier.contact_name ?? "");
    setPhone(supplier.phone ?? "");
    setEmail(supplier.email ?? "");
    setAddress(supplier.address ?? "");
  };

  const submit = () => {
    const payload = { name, contact_name: contactName || null, phone: phone || null, email: email || null, address: address || null };
    if (editingId === null) {
      run(() => createSupplier(payload).then((r) => ({ ok: r.ok, error: r.ok ? undefined : r.error })));
    } else {
      run(() => updateSupplier(editingId, payload).then((r) => ({ ok: r.ok, error: r.ok ? undefined : r.error })));
    }
  };

  const toggleActive = (supplier: Supplier) => {
    run(() =>
      updateSupplier(supplier.id, { is_active: !supplier.is_active }).then((r) => ({ ok: r.ok, error: r.ok ? undefined : r.error })),
    );
  };

  return (
    <PageShell>
      <PageHeader title="Fournisseurs" subtitle="Créer, modifier et activer/désactiver les fournisseurs" />

      <Card className="p-5 space-y-4">
        <CardHeader
          title={editingId === null ? "Nouveau fournisseur" : `Modifier ${editing?.name ?? ""}`}
          right={
            editingId !== null ? (
              <Button variant="ghost" onClick={openCreate}>
                <X className="w-3.5 h-3.5" /> Annuler
              </Button>
            ) : null
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Nom</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Contact</label>
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Téléphone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
          </div>
          <div className="lg:col-span-3">
            <label className="block text-xs font-medium text-slate-700 mb-1">Adresse</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
          </div>
          <div className="flex items-end">
            <Button onClick={submit} disabled={pending || !name}>
              <Truck className="w-3.5 h-3.5" /> {pending ? "Enregistrement..." : "Enregistrer"}
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
              <th className="p-3">Nom</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Téléphone</th>
              <th className="p-3">Email</th>
              <th className="p-3 text-center">Statut</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-slate-50/60">
                <td className="p-3 font-semibold text-slate-900">{supplier.name}</td>
                <td className="p-3 text-slate-600">{supplier.contact_name ?? "—"}</td>
                <td className="p-3 text-slate-600">{supplier.phone ?? "—"}</td>
                <td className="p-3 text-slate-600">{supplier.email ?? "—"}</td>
                <td className="p-3 text-center">
                  <Badge tone={supplier.is_active ? "green" : "red"}>{supplier.is_active ? "Actif" : "Inactif"}</Badge>
                </td>
                <td className="p-3 text-right space-x-1">
                  <Button variant="ghost" onClick={() => openEdit(supplier)}>
                    <Pencil className="w-3.5 h-3.5" /> Modifier
                  </Button>
                  <Button variant="ghost" onClick={() => toggleActive(supplier)}>
                    {supplier.is_active ? "Désactiver" : "Activer"}
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