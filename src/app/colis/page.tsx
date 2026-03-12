"use client"

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Minus, Plus, ShoppingBasket, Loader2, Package } from "lucide-react";

// ─── Barre de progression ────────────────────────────────────────────────────

function ProgressBar({ current, target, colorClass = "bg-green-500" }: { current: number, target: number, colorClass?: string }) {
    const percentage = Math.min((current / target) * 100, 100);
    return (
        <div className="w-full mt-4">
            <div className="flex justify-between text-sm font-semibold mb-2">
                <span>{current} financés</span>
                <span>Objectif : {target}</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${colorClass}`}
                />
            </div>
            <p className="text-right text-xs text-gray-500 mt-1">{Math.round(percentage)}% atteint</p>
        </div>
    );
}

// ─── Sélecteur de quantité ───────────────────────────────────────────────────

function QuantitySelector({
    qty,
    onChange,
    unitPrice,
    accentClass = "text-primary",
    badgeClass = "bg-primary/10 text-primary",
}: {
    qty: number;
    onChange: (n: number) => void;
    unitPrice: number;
    accentClass?: string;
    badgeClass?: string;
}) {
    const total = qty * unitPrice;

    return (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 my-6 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Combien de colis offrir ?</p>

            <div className="flex items-center justify-between gap-4">
                {/* Contrôles − / qty / + */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onChange(Math.max(1, qty - 1))}
                        disabled={qty <= 1}
                        className="w-10 h-10 rounded-xl border-2 border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <Minus className="w-4 h-4" />
                    </button>

                    <div className="relative w-14 h-10 flex items-center justify-center">
                        <AnimatePresence mode="popLayout" initial={false}>
                            <motion.span
                                key={qty}
                                initial={{ y: -16, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 16, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className={`absolute text-3xl font-black ${accentClass}`}
                            >
                                {qty}
                            </motion.span>
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={() => onChange(Math.min(50, qty + 1))}
                        disabled={qty >= 50}
                        className="w-10 h-10 rounded-xl border-2 border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {/* Total dynamique */}
                <div className="text-right">
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.p
                            key={total}
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className={`text-3xl font-black ${accentClass}`}
                        >
                            {total}€
                        </motion.p>
                    </AnimatePresence>
                    <p className="text-xs text-gray-500 mt-0.5">{unitPrice}€ × {qty} colis</p>
                </div>
            </div>

            {/* Badges récapitulatifs */}
            <div className="flex flex-wrap gap-2 pt-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                    <Package className="w-3.5 h-3.5" />
                    {qty} colis alimentaire{qty > 1 ? "s" : ""}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    <Check className="w-3.5 h-3.5" />
                    {qty} famille{qty > 1 ? "s" : ""} nourrie{qty > 1 ? "s" : ""}
                </span>
            </div>
        </div>
    );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function ColisPage() {
    const [qtyGaza, setQtyGaza] = useState(1);
    const [qtyMaroc, setQtyMaroc] = useState(1);
    const [loadingGaza, setLoadingGaza] = useState(false);
    const [loadingMaroc, setLoadingMaroc] = useState(false);

    const handlePayment = async (
        unitAmount: number,
        productName: string,
        qty: number,
        setLoading: (v: boolean) => void
    ) => {
        setLoading(true);
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: unitAmount,
                    productName,
                    mode: 'payment',
                    formType: 'colis',
                    quantity: qty,
                    formData: { productName, quantity: String(qty) },
                }),
            });
            const { url } = await response.json();
            if (url) window.location.href = url;
            else setLoading(false);
        } catch (error) {
            console.error("Payment error:", error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">

            {/* Hero */}
            <div className="bg-secondary/10 pt-36 pb-16 text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Colis Alimentaires</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Offrez un mois de nourriture à une famille dans le besoin. Choisissez le nombre de colis que vous souhaitez financer.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-6xl space-y-24">

                {/* ── Gaza ─────────────────────────────────────────────────── */}
                <section className="grid md:grid-cols-2 gap-12 items-start">
                    <div className="relative h-[420px] rounded-2xl overflow-hidden shadow-xl order-2 md:order-1">
                        <Image src="/images/colisgaza.jpeg" alt="Colis Gaza" fill className="object-cover" />
                        <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            URGENCE
                        </div>
                    </div>

                    <div className="order-1 md:order-2">
                        <div className="flex items-center gap-2 mb-3">
                            <ShoppingBasket className="w-5 h-5 text-red-500" />
                            <span className="text-sm font-semibold text-red-500 uppercase tracking-wide">Situation critique</span>
                        </div>
                        <h2 className="text-3xl font-bold text-primary mb-2">Colis Ramadan </h2>
                        <div className="text-4xl font-bold text-secondary mb-5">
                            60 € <span className="text-base text-gray-400 font-normal">/ colis</span>
                        </div>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                            Votre don permet de fournir un colis alimentaire complet (farine, huile, riz, sucre, dattes) pour qu'une famille se nourrisse dignement pendant un mois.
                        </p>
                        <ul className="space-y-2 mb-2">
                            {["1 colis = 1 mois de nourriture pour une famille", "Distribution immédiate sur le terrain"].map(item => (
                                <li key={item} className="flex items-center gap-3">
                                    <Check className="text-green-500 w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{item}</span>
                                </li>
                            ))}
                        </ul>

                        <ProgressBar current={2154} target={3500} colorClass="bg-red-500" />

                        <QuantitySelector
                            qty={qtyGaza}
                            onChange={setQtyGaza}
                            unitPrice={60}
                            accentClass="text-primary"
                            badgeClass="bg-primary/10 text-primary"
                        />

                        <button
                            onClick={() => handlePayment(6000, "Colis Ramadan Gaza", qtyGaza, setLoadingGaza)}
                            disabled={loadingGaza}
                            className="w-full flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-lg disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed"
                        >
                            {loadingGaza ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Redirection…
                                </>
                            ) : (
                                <>
                                    <ShoppingBasket className="w-5 h-5" />
                                    Offrir {qtyGaza} colis — {qtyGaza * 60}€
                                </>
                            )}
                        </button>
                    </div>
                </section>

                {/* ── Maroc ────────────────────────────────────────────────── */}
                <section className="grid md:grid-cols-2 gap-12 items-start">
                    <div className="order-1">
                        <div className="flex items-center gap-2 mb-3">
                            <ShoppingBasket className="w-5 h-5 text-secondary" />
                            <span className="text-sm font-semibold text-secondary uppercase tracking-wide">Villages de l'Atlas</span>
                        </div>
                        <h2 className="text-3xl font-bold text-primary mb-2">Colis Ramadan Maroc</h2>
                        <div className="text-4xl font-bold text-secondary mb-5">
                            50 € <span className="text-base text-gray-400 font-normal">/ colis</span>
                        </div>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                            Dans les villages reculés de l'Atlas, de nombreuses familles et veuves vivent dans une grande précarité. Ce colis apporte joie et soulagement pour le mois sacré.
                        </p>
                        <ul className="space-y-2 mb-2">
                            {["Colis complet pour une famille entière", "Soutien aux veuves et personnes âgées"].map(item => (
                                <li key={item} className="flex items-center gap-3">
                                    <Check className="text-green-500 w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{item}</span>
                                </li>
                            ))}
                        </ul>

                        <ProgressBar current={12} target={150} colorClass="bg-green-500" />

                        <QuantitySelector
                            qty={qtyMaroc}
                            onChange={setQtyMaroc}
                            unitPrice={50}
                            accentClass="text-secondary"
                            badgeClass="bg-secondary/15 text-secondary"
                        />

                        <button
                            onClick={() => handlePayment(5000, "Colis Ramadan Maroc", qtyMaroc, setLoadingMaroc)}
                            disabled={loadingMaroc}
                            className="w-full flex items-center justify-center gap-3 bg-secondary text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg hover:bg-secondary/90 transition-all hover:scale-[1.02] shadow-lg disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed"
                        >
                            {loadingMaroc ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Redirection…
                                </>
                            ) : (
                                <>
                                    <ShoppingBasket className="w-5 h-5" />
                                    Offrir {qtyMaroc} colis au Maroc — {qtyMaroc * 50}€
                                </>
                            )}
                        </button>
                    </div>

                    <div className="relative h-[420px] rounded-2xl overflow-hidden shadow-xl order-2">
                        <Image src="/images/colismaroc.jpg" alt="Colis Maroc" fill className="object-cover" />
                    </div>
                </section>

                {/* ── Galerie ──────────────────────────────────────────────── */}
                <div className="pt-8">
                    <h3 className="text-2xl font-bold text-center text-primary mb-8">Distributions Précédentes</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="relative h-48 rounded-xl overflow-hidden cursor-pointer group">
                                <Image src={`/images/colis-distrib-${i}.jpeg`} alt={`Distribution ${i}`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
