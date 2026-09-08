"use client";

import { useState } from "react";
import { Plus, Trash2, Wallet } from "lucide-react";

import { createExpense, deleteExpense } from "@/app/actions/expenses";
import { Badge, Button, Card, CardHeader, ErrorBanner, formatFCFA, PageHeader, PageShell, SuccessBanner } from "@/components/ui";
import { useMutate } from "@/components/use-mutate";
import type { Expense, ExpenseCategory } from "@/lib/types";

export default function DepensesView({
  categories,
  expenses,
  siteName,
}: {
  categories: ExpenseCategory[];
  expenses: Expense[];
  siteName: string;
}) {
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id ?? 0);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState(0);
  const { run: runCreate, pending: createPending, error: createError, success: createSuccess } = useMutate();
  const { run: runDelete, pending: deletePending, error: deleteError } = useMutate();

  const today = new Date().toISOString().slice(0, 10);
  const grouped = new Map<string, Expense[]>();
  for (const expense of expenses) {
    const list = grouped.get(expense.expense_date) ?? [];
    list.push(expense);
    grouped.set(expense.expense_date, list);
  }
  const total = expenses.reduce((acc, e) => acc + e.amount, 0);

  const submit = () => {
    runCreate(() =>
      createExpense({ category_id: categoryId, expense_date: expenseDate, label, amount }).then((result) => ({
        ok: result.ok,
        error: result.ok ? undefined : result.error,
      })),
    );
  };

  const remove = (expenseId: number) => {
    runDelete(() =>
      deleteExpense(expenseId).then((result) => ({ ok: result.ok, error: result.ok ? undefined : result.error })),
    );
  };

  return (
    <PageShell>
      <PageHeader
        title="Dépenses"
        subtitle="Enregistrez les dépenses quotidiennes de la boutique"
        badge={
          <span className="text-xs font-medium px-2.5 py-1 bg-slate-900 text-white rounded-md flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" /> {siteName} · {formatFCFA(total)}
          </span>
        }
      />

      <Card className="p-5 space-y-4">
        <CardHeader title="Nouvelle dépense" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Catégorie</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">Libellé</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex. Emballages du jour"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Montant (FCFA)</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-right font-semibold"
            />
          </div>
        </div>

        {createError ? <ErrorBanner message={createError} /> : null}
        {createSuccess ? <SuccessBanner message={createSuccess} /> : null}
        <Button onClick={submit} disabled={createPending || !label || amount <= 0}>
          <Plus className="w-3.5 h-3.5" /> {createPending ? "Enregistrement..." : "Enregistrer la dépense"}
        </Button>
      </Card>

      <div className="space-y-5">
        {Array.from(grouped.entries()).map(([date, dayExpenses]) => {
          const dayTotal = dayExpenses.reduce((acc, e) => acc + e.amount, 0);
          const isToday = date === today;
          return (
            <Card key={date} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {new Date(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                  {isToday ? <Badge tone="blue">Aujourd&apos;hui</Badge> : null}
                </p>
                <span className="text-xs font-bold text-slate-900">{formatFCFA(dayTotal)}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {dayExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between py-2 text-xs">
                    <div>
                      <p className="font-medium text-slate-800">{expense.label}</p>
                      <span className="text-[11px] text-slate-400">{expense.category_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">{formatFCFA(expense.amount)}</span>
                      <button
                        onClick={() => remove(expense.id)}
                        disabled={deletePending}
                        className="text-slate-400 hover:text-red-500"
                        aria-label={`Supprimer ${expense.label}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
        {expenses.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 text-xs">
            <p className="font-semibold text-slate-600 mb-1">Aucune dépense enregistrée</p>
          </Card>
        ) : null}
        {deleteError ? <ErrorBanner message={deleteError} /> : null}
      </div>
    </PageShell>
  );
}