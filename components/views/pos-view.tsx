"use client";

import { useState } from "react";
import { Banknote, CheckCircle2, ShoppingBag, Smartphone, Trash2 } from "lucide-react";

import { createSale } from "@/app/actions/pos";
import { Button, Card, ErrorBanner, cn, formatFCFA, PageShell, SuccessBanner } from "@/components/ui";
import { useMutate } from "@/components/use-mutate";
import type { PosProduct, SaleTicket } from "@/lib/types";

interface CartLine {
  article_id: number;
  qty: number;
}

export default function PosView({
  products,
  siteId,
  siteName,
}: {
  products: PosProduct[];
  siteId: number;
  siteName: string;
}) {
  const [category, setCategory] = useState("Tous");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [payment, setPayment] = useState<"CASH" | "MOBILE_MONEY">("CASH");
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
  const [lastTicket, setLastTicket] = useState<SaleTicket | null>(null);
  const { run, pending, error } = useMutate();

  const categories = ["Tous", ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = category === "Tous" ? products : products.filter((p) => p.category === category);

  const qtyOf = (articleId: number) => cart.find((line) => line.article_id === articleId)?.qty ?? 0;
  const availableOf = (articleId: number) => products.find((p) => p.article_id === articleId)?.qty_available ?? 0;

  const addToCart = (product: PosProduct) => {
    if (availableOf(product.article_id) <= qtyOf(product.article_id)) return;
    if (!idempotencyKey) setIdempotencyKey(crypto.randomUUID());
    setCart((prev) => {
      const existing = prev.find((line) => line.article_id === product.article_id);
      if (existing) {
        return prev.map((line) =>
          line.article_id === product.article_id ? { ...line, qty: line.qty + 1 } : line,
        );
      }
      return [...prev, { article_id: product.article_id, qty: 1 }];
    });
  };

  const removeFromCart = (articleId: number) => {
    const next = cart.filter((line) => line.article_id !== articleId);
    setCart(next);
    if (next.length === 0) setIdempotencyKey(null);
  };

  const total = cart.reduce((acc, line) => {
    const price = products.find((p) => p.article_id === line.article_id)?.sale_price ?? 0;
    return acc + price * line.qty;
  }, 0);

  const checkout = () => {
    if (cart.length === 0 || !idempotencyKey) return;
    run(() =>
      createSale(
        {
          site_id: siteId,
          items: cart,
          payments: [{ method: payment, amount: total }],
        },
        idempotencyKey,
      ).then((result) => {
        if (result.ok) {
          setLastTicket(result.data);
          setIdempotencyKey(null);
          setCart([]);
        }
        return { ok: result.ok, error: result.ok ? undefined : result.error };
      }),
    );
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Caisse (POS)</h2>
          <p className="text-xs text-slate-500">{siteName} · vente rapide avec mise à jour automatique du stock</p>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md">Caisse active</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex gap-2 border-b border-slate-200 pb-3 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  category === cat ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((product) => {
              const disabled = availableOf(product.article_id) === 0;
              return (
                <button
                  key={product.article_id}
                  onClick={() => addToCart(product)}
                  disabled={disabled}
                  className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-400 text-left flex flex-col justify-between h-28 transition-all disabled:opacity-40"
                >
                  <div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{product.category}</span>
                    <h3 className="font-medium text-slate-800 text-xs mt-1 line-clamp-1">{product.name}</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{product.sale_price} FCFA</p>
                    <span className="text-[10px] text-slate-400">{availableOf(product.article_id)} dispo</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <Card className="lg:col-span-5 flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-slate-600" />
              <h2 className="text-xs font-semibold text-slate-800">Commande en cours</h2>
            </div>
            <span className="text-[10px] bg-slate-200 text-slate-700 font-medium px-2 py-0.5 rounded">Ticket auto</span>
          </div>

          <div className="p-3.5 flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[40vh]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-8">
                <ShoppingBag className="w-8 h-8 stroke-1 mb-2 opacity-50" />
                <p>Aucun article sélectionné</p>
              </div>
            ) : (
              cart.map((line) => {
                const product = products.find((p) => p.article_id === line.article_id);
                return (
                  <div key={line.article_id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-medium text-slate-800">{product?.name}</h4>
                      <p className="text-[11px] text-slate-500">{product?.sale_price} FCFA × {line.qty}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-900">{(product?.sale_price ?? 0) * line.qty} FCFA</span>
                      <button onClick={() => removeFromCart(line.article_id)} className="text-slate-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50/30 space-y-3">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-900">
              <span>Total général</span>
              <span className="text-lg font-bold">{formatFCFA(total)}</span>
            </div>

            {lastTicket ? (
              <SuccessBanner message={`Vente enregistrée · Ticket ${lastTicket.ref} · ${formatFCFA(lastTicket.total_amount)}`} />
            ) : null}
            {error ? <ErrorBanner message={error} /> : null}

            <div className="flex gap-2">
              <Button
                variant="secondary"
                className={cn("flex-1", payment === "CASH" && "ring-2 ring-slate-500")}
                onClick={() => setPayment("CASH")}
                disabled={cart.length === 0}
              >
                <Banknote className="w-3.5 h-3.5" /> Espèces
              </Button>
              <Button
                variant="secondary"
                className={cn("flex-1", payment === "MOBILE_MONEY" && "ring-2 ring-slate-500")}
                onClick={() => setPayment("MOBILE_MONEY")}
                disabled={cart.length === 0}
              >
                <Smartphone className="w-3.5 h-3.5" /> Mobile Money
              </Button>
            </div>
            <Button onClick={checkout} disabled={pending || cart.length === 0} className="w-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> {pending ? "Encaissement..." : `Encaisser ${formatFCFA(total)}`}
            </Button>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}