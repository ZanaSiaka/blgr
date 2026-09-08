"use client";

import { useState } from "react";
import { Pencil, Plus, UserPlus, X } from "lucide-react";

import { createUser, updateUser } from "@/app/actions/admin";
import { Badge, Button, Card, CardHeader, ErrorBanner, PageHeader, PageShell, SuccessBanner } from "@/components/ui";
import { useMutate } from "@/components/use-mutate";
import { ROLE_LABEL } from "@/components/views/labels";
import type { Role, Site, User } from "@/lib/types";

const ROLES = ["ADMIN", "RESP_DEPOT", "RESP_BOUTIQUE", "BOULANGER", "VENDEUR"] as Role[];

export default function AdminUsersView({ users, sites }: { users: User[]; sites: Site[] }) {
  const boutiques = sites.filter((site) => site.kind === "BOUTIQUE" && site.is_active);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("VENDEUR");
  const [siteId, setSiteId] = useState<string>("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const { run, pending, error, success } = useMutate();

  const editing = users.find((u) => u.id === editingId) ?? null;

  const openCreate = () => {
    setEditingId(null);
    setUsername("");
    setFullName("");
    setRole("VENDEUR");
    setSiteId("");
    setPassword("");
    setIsActive(true);
  };

  const openEdit = (user: User) => {
    setEditingId(user.id);
    setUsername(user.username);
    setFullName(user.full_name);
    setRole(user.role);
    setSiteId(user.site_id ? String(user.site_id) : "");
    setPassword("");
    setIsActive(user.is_active);
  };

  const submit = () => {
    if (editingId === null) {
      run(() =>
        createUser({ username, full_name: fullName, role, password, site_id: siteId ? Number(siteId) : null }).then(
          (r) => ({ ok: r.ok, error: r.ok ? undefined : r.error }),
        ),
      );
    } else {
      const payload: Record<string, unknown> = { full_name: fullName, role, site_id: siteId ? Number(siteId) : null, is_active: isActive };
      if (password) payload.password = password;
      run(() =>
        updateUser(editingId, payload).then((r) => ({ ok: r.ok, error: r.ok ? undefined : r.error })),
      );
    }
  };

  const toggleActive = (user: User) => {
    run(() =>
      updateUser(user.id, { is_active: !user.is_active }).then((r) => ({ ok: r.ok, error: r.ok ? undefined : r.error })),
    );
  };

  return (
    <PageShell>
      <PageHeader title="Utilisateurs" subtitle="Créer, modifier et activer/désactiver les comptes du système" />

      <Card className="p-5 space-y-4">
        <CardHeader
          title={editingId === null ? "Nouvel utilisateur" : `Modifier ${editing?.username ?? ""}`}
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
            <label className="block text-xs font-medium text-slate-700 mb-1">Nom d&apos;utilisateur</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={editingId !== null}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Nom complet</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Rôle</label>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABEL[r]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Boutique</label>
            <select value={siteId} onChange={(e) => setSiteId(e.target.value)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
              <option value="">— Aucune (globale) —</option>
              {boutiques.map((site) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Mot de passe {editingId !== null ? "(laisser vide pour conserver)" : ""}
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2" />
          </div>
          {editingId !== null ? (
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-slate-900" />
                Compte actif
              </label>
            </div>
          ) : null}
          <div className="flex items-end">
            <Button onClick={submit} disabled={pending || !username || !fullName || (editingId === null && !password)}>
              {editingId === null ? <UserPlus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />} {pending ? "Enregistrement..." : "Enregistrer"}
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
              <th className="p-3">Utilisateur</th>
              <th className="p-3">Nom</th>
              <th className="p-3">Rôle</th>
              <th className="p-3">Boutique</th>
              <th className="p-3 text-center">Statut</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/60">
                <td className="p-3 font-mono text-slate-700">{user.username}</td>
                <td className="p-3 font-semibold text-slate-900">{user.full_name}</td>
                <td className="p-3 text-slate-600">{ROLE_LABEL[user.role]}</td>
                <td className="p-3 text-slate-600">{sites.find((s) => s.id === user.site_id)?.name ?? "—"}</td>
                <td className="p-3 text-center">
                  <Badge tone={user.is_active ? "green" : "red"}>{user.is_active ? "Actif" : "Inactif"}</Badge>
                </td>
                <td className="p-3 text-right space-x-1">
                  <Button variant="ghost" onClick={() => openEdit(user)}>
                    <Pencil className="w-3.5 h-3.5" /> Modifier
                  </Button>
                  <Button variant="ghost" onClick={() => toggleActive(user)}>
                    {user.is_active ? "Désactiver" : "Activer"}
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