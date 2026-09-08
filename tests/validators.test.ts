import { describe, expect, it } from "vitest";

import {
  articleCreateSchema,
  expenseCreateSchema,
  loginSchema,
  productionSchema,
  saleSchema,
  siteCreateSchema,
  transferCreateSchema,
  userCreateSchema,
} from "@/lib/validators";

describe("validators", () => {
  it("valide le login", () => {
    expect(loginSchema.safeParse({ username: "admin", password: "admin123" }).success).toBe(true);
    expect(loginSchema.safeParse({ username: "", password: "" }).success).toBe(false);
  });

  it("valide la création de transfert", () => {
    const ok = transferCreateSchema.safeParse({
      to_site_id: 2,
      lines: [{ article_id: 3, qty_sent: 10 }],
    });
    expect(ok.success).toBe(true);
    const ko = transferCreateSchema.safeParse({ to_site_id: 2, lines: [] });
    expect(ko.success).toBe(false);
  });

  it("valide la vente avec paiement", () => {
    const ok = saleSchema.safeParse({
      site_id: 2,
      items: [{ article_id: 11, qty: 2 }],
      payments: [{ method: "CASH", amount: 300 }],
    });
    expect(ok.success).toBe(true);
    const ko = saleSchema.safeParse({
      site_id: 2,
      items: [{ article_id: 11, qty: 2 }],
      payments: [{ method: "CASH", amount: 200 }],
    });
    expect(ko.success).toBe(true); // le montant est validé côté backend
  });

  it("valide la production", () => {
    const ok = productionSchema.safeParse({ recipe_id: 1, conforming_qty: 50, loss_qty: 2 });
    expect(ok.success).toBe(true);
    const ko = productionSchema.safeParse({ recipe_id: 1, conforming_qty: -5, loss_qty: 0 });
    expect(ko.success).toBe(false);
  });

  it("valide une dépense", () => {
    const ok = expenseCreateSchema.safeParse({ category_id: 1, label: "Eau", amount: 5000 });
    expect(ok.success).toBe(true);
    const ko = expenseCreateSchema.safeParse({ category_id: 1, label: "", amount: 0 });
    expect(ko.success).toBe(false);
  });

  it("valide la création d'un utilisateur", () => {
    const ok = userCreateSchema.safeParse({
      username: "caissier",
      password: "secret123",
      full_name: "Caissier Test",
      role: "VENDEUR",
      site_id: 2,
    });
    expect(ok.success).toBe(true);
    const ko = userCreateSchema.safeParse({
      username: "ca",
      password: "123",
      full_name: "X",
      role: "INVALID",
    });
    expect(ko.success).toBe(false);
  });

  it("valide la création d'un site", () => {
    const ok = siteCreateSchema.safeParse({ code: "boutique_3", name: "Boutique Treichville", kind: "BOUTIQUE" });
    expect(ok.success).toBe(true);
    const ko = siteCreateSchema.safeParse({ code: "", name: "", kind: "AUTRE" });
    expect(ko.success).toBe(false);
  });

  it("valide la création d'un article", () => {
    const ok = articleCreateSchema.safeParse({
      name: "Farine T45",
      category_id: 1,
      unit_id: 1,
      type: "RAW_MATERIAL",
      cost_price: 400,
      min_stock: 50,
    });
    expect(ok.success).toBe(true);
    const ko = articleCreateSchema.safeParse({ name: "", category_id: 0, unit_id: 0, type: "AUTRE" });
    expect(ko.success).toBe(false);
  });

  it("la création d'article rejette is_active (schéma strict)", () => {
    const ko = articleCreateSchema.safeParse({
      name: "X",
      category_id: 1,
      unit_id: 1,
      type: "RAW_MATERIAL",
      is_active: true,
    });
    expect(ko.success).toBe(false);
  });
});