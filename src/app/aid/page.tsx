"use client"

import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"
import { AidForm } from "@/components/aid-form"
import { Heart, Globe, CreditCard, CheckCircle, Loader2, Sparkles, AlertCircle, Gift } from "lucide-react"

export default function AidPage() {
    const [formOpen, setFormOpen] = useState(false)
    const [selectedDestination, setSelectedDestination] = useState<"Gaza" | "Maroc">("Gaza")
    const [loading, setLoading] = useState<"Gaza" | "Maroc" | null>(null)

    const openForm = (destination: "Gaza" | "Maroc") => {
        setSelectedDestination(destination)
        setFormOpen(true)
    }

    const handlePayment = async (destination: "Gaza" | "Maroc") => {
        setLoading(destination)
        const amount = destination === "Gaza" ? 85000 : 30000 // 850€ et 300€ en centimes
        const productName = destination === "Gaza" ? "Mouton Aïd Al Adha - Gaza" : "Mouton Aïd Al Adha - Maroc"

        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amount,
                    productName: productName,
                    mode: 'payment',
                    formType: 'aid',
                    formData: {
                        destination: destination,
                        productName: productName,
                        amount: amount
                    }
                }),
            });
            const { url } = await response.json();
            if (url) window.location.href = url;
        } catch (error) {
            console.error("Payment error:", error);
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 pt-32 pb-20 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/aid-hero-bg.jpg')] opacity-10 mix-blend-overlay"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
                            <Gift className="w-5 h-5" />
                            Aïd Al Adha 2026
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 font-outfit">
                            Partagez la joie de l'Aïd
                        </h1>
                        <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                            Cette année, offrez un mouton pour l'Aïd aux familles les plus démunies de Gaza et du Maroc.
                            Votre sacrifice illuminera leur fête.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Destinations Section */}
            <div className="container mx-auto px-4 py-20 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-4">Choisissez votre destination</h2>
                    <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
                        Sélectionnez où vous souhaitez que votre sacrifice soit effectué. Chaque mouton nourrira une famille en difficulté.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 mb-20">
                    {/* Gaza Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-red-100 hover:shadow-2xl transition-shadow"
                    >
                        <div className="relative h-64">
                            <Image
                                src="/images/aid-gaza.jpg"
                                alt="Mouton pour Gaza"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4" />
                                <span>Urgence</span>
                            </div>
                        </div>
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-primary mb-2">Gaza - Palestine</h3>
                            <div className="text-4xl font-black text-red-600 mb-4">
                                850 €
                            </div>
                            <p className="text-gray-700 mb-6 leading-relaxed">
                                En raison de la situation critique, le coût est élevé mais l'impact est immense.
                                Votre sacrifice apportera joie et réconfort aux familles de Gaza.
                            </p>
                            <ul className="space-y-3 mb-8">
                                {["Distribution aux familles déplacées", "Viande fraîche pour le jour de l'Aïd", "Soutien direct sur le terrain"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => openForm("Gaza")}
                                disabled={loading === "Gaza"}
                                className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all hover:scale-[1.02] shadow-lg disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading === "Gaza" ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Chargement...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        Sacrifier à Gaza
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>

                    {/* Maroc Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-green-100 hover:shadow-2xl transition-shadow"
                    >
                        <div className="relative h-64">
                            <Image
                                src="/images/aid-maroc.jpg"
                                alt="Mouton pour le Maroc"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-primary mb-2">Maroc - Atlas</h3>
                            <div className="text-4xl font-black text-green-600 mb-4">
                                300 €
                            </div>
                            <p className="text-gray-700 mb-6 leading-relaxed">
                                Dans les villages reculés de l'Atlas, de nombreuses familles vivent dans la précarité.
                                Votre sacrifice leur offrira un Aïd digne.
                            </p>
                            <ul className="space-y-3 mb-8">
                                {["Familles des villages de l'Atlas", "Veuves et personnes âgées", "Distribution respectueuse des traditions"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => openForm("Maroc")}
                                disabled={loading === "Maroc"}
                                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all hover:scale-[1.02] shadow-lg disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading === "Maroc" ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Chargement...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        Sacrifier au Maroc
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Comment ça marche */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-8 md:p-12 mb-20"
                >
                    <h2 className="text-3xl font-bold text-center text-primary mb-12">Comment ça marche ?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: CreditCard, title: "1. Choisissez", desc: "Sélectionnez votre destination et remplissez le formulaire" },
                            { icon: Heart, title: "2. Payez", desc: "Paiement 100% sécurisé via Stripe" },
                            { icon: Globe, title: "3. Nous sacrifions", desc: "Notre équipe sur le terrain effectue le sacrifice" }
                        ].map((step, i) => (
                            <div key={i} className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full text-white mb-4">
                                    <step.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-2">{step.title}</h3>
                                <p className="text-gray-600">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA Final */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100"
                >
                    <Gift className="w-16 h-16 text-primary mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-primary mb-4">Ne laissez personne seul ce jour de l'Aïd</h2>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        Chaque sacrifice compte. Ensemble, apportons joie et dignité aux familles qui en ont le plus besoin.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => openForm("Gaza")}
                            className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all hover:scale-[1.02] shadow-lg"
                        >
                            Gaza - 850€
                        </button>
                        <button
                            onClick={() => openForm("Maroc")}
                            className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all hover:scale-[1.02] shadow-lg"
                        >
                            Maroc - 300€
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Form Modal */}
            <AidForm
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
                amount={selectedDestination === "Gaza" ? 85000 : 30000}
                productName={selectedDestination === "Gaza" ? "Mouton Aïd Al Adha - Gaza" : "Mouton Aïd Al Adha - Maroc"}
                destination={selectedDestination}
            />
        </div>
    )
}
