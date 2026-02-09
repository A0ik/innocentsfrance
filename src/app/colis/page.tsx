"use client"

import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

function ProgressBar({ current, target, colorClass = "bg-green-500" }: { current: number, target: number, colorClass?: string }) {
    const percentage = Math.min((current / target) * 100, 100);

    return (
        <div className="w-full mt-4">
            <div className="flex justify-between text-sm font-semibold mb-2">
                <span>{current} financés</span>
                <span>Objectif: {target}</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
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

export default function ColisPage() {
    const handlePayment = async (amount: number, productName: string) => {
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    productName,
                    mode: 'payment'
                }),
            });
            const { url } = await response.json();
            if (url) window.location.href = url;
        } catch (error) {
            console.error("Payment error:", error);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="bg-secondary/10 pt-36 pb-16 text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Colis Alimentaires</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Offrez un mois de nourriture à une famille démunie pour le Ramadan ou les urgences humanitaires.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-6xl space-y-24">

                {/* Gaza Section */}
                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl order-2 md:order-1">
                        <Image
                            src="/images/colis-gaza.jpg"
                            alt="Colis Gaza"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-1 rounded-full font-bold shadow-lg">
                            URGENCE
                        </div>
                    </div>
                    <div className="order-1 md:order-2">
                        <h2 className="text-3xl font-bold text-primary mb-4">Colis Ramadan Gaza</h2>
                        <div className="text-4xl font-bold text-secondary mb-6">60 € <span className="text-lg text-gray-500 font-normal">/ colis</span></div>
                        <p className="text-gray-700 mb-6 leading-relaxed">
                            La situation à Gaza est critique. Votre don permet de fournir un colis alimentaire complet (farine, huile, riz, sucre, dattes) permettant à une famille de se nourrir dignement pendant un mois.
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-3">
                                <Check className="text-green-500 w-5 h-5 flex-shrink-0" />
                                <span>1 repas pour 1 à 3 personnes</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="text-green-500 w-5 h-5 flex-shrink-0" />
                                <span>Distribution immédiate sur le terrain</span>
                            </li>
                        </ul>

                        <ProgressBar current={0} target={1000} colorClass="bg-red-500" />

                        <div className="mt-8">
                            <button
                                onClick={() => handlePayment(6000, "Colis Gaza")}
                                className="block w-full text-center bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-transform hover:scale-[1.02] shadow-lg"
                            >
                                Offrir un colis à Gaza (60€)
                            </button>
                        </div>
                    </div>
                </section>

                {/* Maroc Section */}
                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-1">
                        <h2 className="text-3xl font-bold text-primary mb-4">Colis Ramadan Maroc</h2>
                        <div className="text-4xl font-bold text-secondary mb-6">50 € <span className="text-lg text-gray-500 font-normal">/ colis</span></div>
                        <p className="text-gray-700 mb-6 leading-relaxed">
                            Dans les villages reculés de l'Atlas, de nombreuses familles et veuves vivent dans une grande précarité. Ce colis apporte joie et soulagement pour le mois sacré.
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-3">
                                <Check className="text-green-500 w-5 h-5 flex-shrink-0" />
                                <span>Colis complet pour une famille entière</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="text-green-500 w-5 h-5 flex-shrink-0" />
                                <span>Soutien aux veuves et personnes âgées</span>
                            </li>
                        </ul>

                        <ProgressBar current={0} target={150} colorClass="bg-green-500" />

                        <div className="mt-8">
                            <button
                                onClick={() => handlePayment(5000, "Colis Maroc")}
                                className="block w-full text-center bg-secondary text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg hover:bg-secondary/90 transition-transform hover:scale-[1.02] shadow-lg"
                            >
                                Offrir un colis au Maroc (50€)
                            </button>
                        </div>
                    </div>
                    <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl order-2">
                        <Image
                            src="/images/colis-maroc.jpg"
                            alt="Colis Maroc"
                            fill
                            className="object-cover"
                        />
                    </div>
                </section>

                {/* Gallery Preview */}
                <div className="pt-8">
                    <h3 className="text-2xl font-bold text-center text-primary mb-8">Distributions Précédentes</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="relative h-48 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                                <Image
                                    src={`https://placehold.co/400x400/ccc/777?text=Photo+${i}`}
                                    alt={`Distribution ${i}`}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
