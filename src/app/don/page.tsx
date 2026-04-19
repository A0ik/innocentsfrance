"use client"


import Image from "next/image";
import { HandCoins, Heart, Smartphone } from "lucide-react";

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

            <div className="container mx-auto px-4 py-16 max-w-5xl">

                {/* Stripe Donation Block */}
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12 border border-gray-100 text-center">
                    <h2 className="text-2xl font-bold text-primary mb-6 flex items-center justify-center gap-3">
                        <HandCoins className="w-8 h-8 text-secondary" />
                        Faire un don en ligne
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

                {/* PayPal QR Code Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-xl p-8 md:p-12 mb-12 border border-blue-100">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="text-center md:text-left order-2 md:order-1">
                            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                                <Smartphone className="w-4 h-4" />
                                Rapide et simple
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-outfit">
                                Donnez via PayPal
                            </h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Scannez simplement ce QR code avec votre application PayPal pour faire un don en quelques secondes.
                                <br /><br />
                                Chaque euro compte et contribue directement à aider les orphelins et les familles en difficulté.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg">
                                    <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
                                    100% de votre don
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg">
                                    <span className="text-green-500 font-bold">✓</span>
                                    Instantané
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center order-1 md:order-2">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl transform rotate-3 scale-105 opacity-20"></div>
                                <div className="relative bg-white rounded-3xl p-6 shadow-2xl">
                                    <div className="relative w-56 h-56">
                                        <Image
                                            src="/images/paypalqrcode.png"
                                            alt="QR Code PayPal pour faire un don à Innocents France"
                                            fill
                                            className="object-contain"
                                            priority
                                        />
                                    </div>
                                    <div className="mt-4 text-center">
                                        <p className="text-xs text-gray-400 mb-1">Scannez pour donner</p>
                                        <div className="flex items-center justify-center gap-1 text-blue-600 font-semibold">
                                            <span className="text-sm">via</span>
                                            <span className="text-lg">PayPal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Impact Section */}
                <div className="bg-primary/5 rounded-3xl p-8 text-center">
                    <h3 className="text-xl font-bold text-primary mb-4">Votre impact</h3>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Avec votre soutien, nous pouvons continuer à fournir de l'eau potable, des colis alimentaires
                        et un parrainage aux enfants qui en ont besoin.
                    </p>
                </div>
            </div>
        </div>
    );
}
