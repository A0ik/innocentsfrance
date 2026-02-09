"use client"

import Image from "next/image";
import { Users, Globe as GlobeIcon, Award } from "lucide-react";
import { Globe } from "@/components/ui/globe";

export default function ProposPage() {
    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero */}
            <div className="bg-gray-900 text-white pt-40 pb-24 relative overflow-hidden">
                <Image
                    src="/images/about-hero.jpg"
                    alt="Équipe"
                    fill
                    className="object-cover opacity-30"
                />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 font-outfit">Qui Sommes-Nous ?</h1>
                    <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
                        Une équipe de bénévoles passionnés, unis par la volonté d'aider ceux qui en ont le plus besoin.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-6xl">

                {/* Mission Section */}
                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    {[
                        { icon: Users, title: "Proximité", desc: "Nous travaillons directement avec les populations locales sans intermédiaires inutiles." },
                        { icon: Award, title: "Confiance", desc: "La transparence est notre devise. Chaque don est justifié et tracé." },
                        { icon: GlobeIcon, title: "Universalité", desc: "Nous aidons sans distinction de race ou de religion, là où l'urgence nous appelle." }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:transform hover:-translate-y-2 transition-transform">
                            <item.icon className="w-12 h-12 text-secondary mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-primary mb-4">{item.title}</h3>
                            <p className="text-gray-600">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Story */}
                <div className="flex flex-col md:flex-row gap-12 items-center mb-24">
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-primary mb-6">Notre Histoire</h2>
                        <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                            <p>
                                Fondée en 2009, Innocents France est née d'un constat simple : l'aide humanitaire doit être rapide, directe et humaine.
                            </p>
                            <p>
                                Tout a commencé par un voyage au Maroc, où nous avons été témoins de la précarité des orphelins dans les villages de l'Atlas.
                                De retour en France, nous avons décidé de ne pas rester les bras croisés.
                            </p>
                            <p>
                                Aujourd'hui, nous intervenons dans 7 pays, avec toujours la même philosophie :
                                <span className="font-bold text-primary"> chaque vie compte.</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="bg-secondary/10 rounded-3xl p-8 md:p-12 text-center mb-20 overflow-hidden">
                    <h2 className="text-3xl font-bold text-primary mb-8">Zones d'Intervention</h2>
                    <div className="relative w-full overflow-visible flex flex-col items-center justify-center bg-primary rounded-3xl py-12 min-h-[300px] md:min-h-[500px]">
                        <div className="absolute inset-0 flex items-center justify-center scale-100 md:scale-150 transform z-10 pointer-events-none">
                            <Globe className="max-w-[1000px]" />
                        </div>
                        <div className="mt-8 z-20 relative pt-[300px]">
                            <p className="bg-white/90 text-primary px-6 py-2 rounded-full font-bold shadow-lg backdrop-blur-sm mx-auto max-w-fit">
                                Maroc • Sénégal • Tchad • Gaza • Soudan • Pakistan • Maroc
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
