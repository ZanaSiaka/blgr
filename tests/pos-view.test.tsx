import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSale } from "@/app/actions/pos";
import PosView from "@/components/views/pos-view";
import type { PosProduct } from "@/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/app/actions/pos", () => ({
  createSale: vi.fn(async () => ({
    ok: true,
    data: { id: 1, ref: "TKT-TEST-1", total_amount: 150, status: "PAID", sale_date: "2026-09-08", seq: 1, site_id: 2, created_at: new Date().toISOString(), lines: [], payments: [] },
  })),
  openClosure: vi.fn(),
  closeClosure: vi.fn(),
}));

const mockedCreateSale = vi.mocked(createSale);

const PRODUCTS: PosProduct[] = [
  { article_id: 11, article_code: "PRD-001", name: "Baguette Tradition", category: "Pain", sale_price: 150, qty_available: 100 },
  { article_id: 13, article_code: "PRD-003", name: "Croissant au beurre", category: "Viennoiserie", sale_price: 300, qty_available: 20 },
];

describe("PosView", () => {
  beforeEach(() => {
    mockedCreateSale.mockClear();
    render(<PosView products={PRODUCTS} siteId={2} siteName="Boutique Riviera" />);
  });

  it("affiche les produits disponibles", () => {
    expect(screen.getByText("Baguette Tradition")).toBeInTheDocument();
    expect(screen.getByText("Croissant au beurre")).toBeInTheDocument();
  });

  it("ajoute un article au panier et met à jour le total", () => {
    fireEvent.click(screen.getAllByText("Baguette Tradition")[0]);
    expect(screen.getByText(/150 FCFA × 1/)).toBeInTheDocument();
    expect(screen.getAllByText(/Total général/).length).toBeGreaterThan(0);
  });

  it("génère une nouvelle clé d'idempotence après un encaissement", async () => {
    fireEvent.click(screen.getAllByText("Baguette Tradition")[0]);
    fireEvent.click(screen.getAllByText(/Encaisser/)[0]);
    await waitFor(() => expect(mockedCreateSale).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getAllByText("Baguette Tradition")[0]);
    fireEvent.click(screen.getAllByText(/Encaisser/)[0]);
    await waitFor(() => expect(mockedCreateSale).toHaveBeenCalledTimes(2));

    const keys = mockedCreateSale.mock.calls.map((call) => call[1]);
    expect(keys[0]).toBeDefined();
    expect(keys[1]).toBeDefined();
    expect(keys[1]).not.toBe(keys[0]);
  });
});