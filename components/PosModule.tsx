"use client";

import { useState } from "react";
import { ShoppingBag, Trash2, Banknote, Smartphone, CheckCircle2 } from "lucide-react";

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
}

const PRODUCTS: Product[] = [
    { id: "1", name: "Baguette Tradition", category: "Pain", price: 150 },
    { id: "2", name: "Pain de mie", category: "Pain", price: 500 },
    { id: "3", name: "Croissant au beurre", category: "Viennoiserie", price: 300 },
    { id: "4", name: "Pain au chocolat", category: "Viennoiserie", price: 350 },
    { id: "5", name: "Éclair au chocolat", category: "Pâtisserie", price: 800 },
    { id: "6", name: "Tartelette Fraise", category: "Pâtisserie", price: 1200 },
    { id: "7", name: "Jus de Fruit 33cl", category: "Boissons", price: 500 },
];

export default function PosModule() {
    const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
    const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);

    const categories = ["Tous", "Pain", "Viennoiserie", "Pâtisserie", "Boissons"];

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
                );
            }
            return [...prev, { product, qty: 1 }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart((prev) => prev.filter((item) => item.product.id !== id));
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);

    const handleCheckout = () => {
        if (cart.length === 0) return;
        setShowSuccess(true);
        setTimeout(() => {
            setCart([]);
            setShowSuccess(false);
        }, 1800);
    };

    const filteredProducts = selectedCategory === "Tous"
        ? PRODUCTS
        : PRODUCTS.filter((p) => p.category === selectedCategory);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-75px)] p-5 bg-slate-50">

            {/* Zone Sélection Produits */}
            <div className="lg:col-span-7 flex flex-col gap-4">
                {/* Filtres par catégorie */}
                <div className="flex gap-2 border-b border-slate-200 pb-3">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${selectedCategory === cat
                                    ? "bg-slate-900 text-white"
                                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grille de cartes produits */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pr-1">
                    {filteredProducts.map((product) => (
                        <button
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-400 text-left flex flex-col justify-between h-28 transition-all hover:shadow-sm"
                        >
                            <div>
                                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                    {product.category}
                                </span>
                                <h3 className="font-medium text-slate-800 text-xs mt-1 line-clamp-1">{product.name}</h3>
                            </div>
                            <p className="text-sm font-semibold text-slate-900">{product.price} FCFA</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Ticket / Encaisser */}
            <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 flex flex-col justify-between overflow-hidden shadow-sm">
                <div className="p-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-slate-600" />
                        <h2 className="text-xs font-semibold text-slate-800">Commande en cours</h2>
                    </div>
                    <span className="text-[10px] bg-slate-200 text-slate-700 font-medium px-2 py-0.5 rounded">
                        Caisse active
                    </span>
                </div>

                {/* Liste items */}
                <div className="p-3.5 flex-1 overflow-y-auto divide-y divide-slate-100">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                            <ShoppingBag className="w-8 h-8 stroke-1 mb-2 opacity-50" />
                            <p>Aucun article sélectionné</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.product.id} className="py-2.5 flex items-center justify-between">
                                <div>
                                    <h4 className="text-xs font-medium text-slate-800">{item.product.name}</h4>
                                    <p className="text-[11px] text-slate-500">{item.product.price} FCFA × {item.qty}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-semibold text-slate-900">
                                        {item.product.price * item.qty} FCFA
                                    </span>
                                    <button
                                        onClick={() => removeFromCart(item.product.id)}
                                        className="text-slate-400 hover:text-red-500"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Total & Action */}
                <div className="p-4 border-t border-slate-200 bg-slate-50/30 space-y-3">
                    <div className="flex justify-between items-center text-sm font-semibold text-slate-900">
                        <span>Total général</span>
                        <span className="text-lg font-bold text-slate-900">{totalAmount} FCFA</span>
                    </div>

                    {showSuccess ? (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-2.5 rounded-md flex items-center justify-center gap-2 text-xs font-medium">
                            <CheckCircle2 className="w-4 h-4" /> Vente enregistrée avec succès
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0}
                                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white py-2.5 rounded-md text-xs font-medium flex items-center justify-center gap-2"
                            >
                                <Banknote className="w-3.5 h-3.5" /> Espèces
                            </button>
                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0}
                                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white py-2.5 rounded-md text-xs font-medium flex items-center justify-center gap-2"
                            >
                                <Smartphone className="w-3.5 h-3.5" /> Mobile Money
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}