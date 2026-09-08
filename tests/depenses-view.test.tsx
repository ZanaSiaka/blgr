import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DepensesView from "@/components/views/depenses-view";
import type { Expense, ExpenseCategory } from "@/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/app/actions/expenses", () => ({
  createExpense: vi.fn(async () => ({ ok: true, data: {} })),
  deleteExpense: vi.fn(async () => ({ ok: true, data: null })),
}));

const CATEGORIES: ExpenseCategory[] = [{ id: 1, name: "Eau" }];

const EXPENSES: Expense[] = [
  {
    id: 1,
    site_id: 2,
    site_name: "Boutique Riviera",
    category_id: 1,
    category_name: "Eau",
    expense_date: "2026-09-08",
    label: "Facture eau",
    amount: 5000,
    note: null,
    created_at: "2026-09-08T08:00:00",
  },
];

describe("DepensesView", () => {
  it("affiche les dépenses enregistrées", () => {
    render(<DepensesView categories={CATEGORIES} expenses={EXPENSES} siteName="Boutique Riviera" />);
    expect(screen.getByText("Facture eau")).toBeInTheDocument();
    expect(screen.getAllByText(/5.{0,2}000 FCFA/).length).toBeGreaterThan(0);
  });
});