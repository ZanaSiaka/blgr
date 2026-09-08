import { apiGet } from "@/lib/api";
import type { Supplier } from "@/lib/types";
import AdminSuppliersView from "@/components/views/admin-suppliers-view";

export default async function AdminFournisseursPage() {
  const suppliers = await apiGet<Supplier[]>("/suppliers");
  return <AdminSuppliersView suppliers={suppliers} />;
}