"use client"


import Image from "next/image";
import { HandCoins, PieChart } from "lucide-react";

export default function DonPage() {


    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="bg-primary text-white pt-32 pb-16 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/don-hero.jpg')] opacity-20 mix-blend-overlay"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-outfit">Soutenez Nos Actions</h1>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        Chaque don compte. Votre générosité permet de financer les urgences et d'assurer nos missions quotidiennes.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-4xl">

                {/* Simplified Donation Block */}
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-16 border border-gray-100 text-center">
                    <h2 className="text-2xl font-bold text-primary mb-6 flex items-center justify-center gap-3">
                        <HandCoins className="w-8 h-8 text-secondary" />
                        Faire un don
                    </h2>

                    <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                        Choisissez le montant de votre don pour soutenir nos actions.
                    </p>

                    <div className="max-w-xs mx-auto space-y-4">
                        <div className="relative">
                            <input
                                type="number"
                                min="1"
                                placeholder="Montant (ex: 50)"
                                className="w-full text-center text-xl p-4 border rounded-xl"
                                id="custom-amount"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</span>
                        </div>

                        <button
                            onClick={async () => {
                                const input = document.getElementById('custom-amount') as HTMLInputElement;
                                const amount = parseInt(input.value);
                                if (!amount || amount <= 0) return alert("Veuillez entrer un montant valide.");

                                try {
                                    const response = await fetch('/api/create-checkout-session', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            amount: amount * 100, // Convert to cents
                                            productName: "Don Libre",
                                            mode: 'payment',
                                            formType: 'don',
                                            formData: {
                                                productName: "Don Libre",
                                            }
                                        }),
                                    });
                                    const { url } = await response.json();
                                    if (url) window.location.href = url;
                                } catch (err) {
                                    console.error(err);
                                }
                            }}
                            className="inline-block w-full bg-primary text-white px-12 py-4 rounded-xl text-xl font-bold hover:bg-primary/90 transition-transform hover:scale-[1.01] shadow-xl"
                        >
                            Faire un don
                        </button>
                    </div>

                    <p className="text-sm text-gray-400 mt-4 flex items-center justify-center gap-1">
                        Paiement 100% sécurisé via Stripe
                    </p>
                </div>
            </div>
        </div>
    );
}
