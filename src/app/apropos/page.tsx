"use client"

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Users, Globe as GlobeIcon, Award, Heart, Droplets, Package, Home } from "lucide-react";
import { Globe } from "@/components/ui/globe";

function AnimatedCounter({ target, suffix = "", duration = 2 }: { target: number; suffix?: string; duration?: number }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const step = target / (duration * 60);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 1000 / 60);
        return () => clearInterval(timer);
    }, [inView, target, duration]);

    return (
        <span ref={ref}>
            {count.toLocaleString("fr-FR")}{suffix}
        </span>
    );
}

const stats = [
    { value: 15, suffix: " ans", label: "d'existence", icon: Award },
    { value: 6, suffix: " pays", label: "d'intervention", icon: GlobeIcon },
    { value: 150, suffix: "+", label: "orphelins parrainés", icon: Heart },
    { value: 20, suffix: "+", label: "puits construits", icon: Droplets },
    { value: 72000, suffix: "+", label: "colis alimentaires", icon: Package },
    { value: 500, suffix: "+", label: "familles aidées", icon: Users },
];

const actions = [
    {
        icon: Heart,
        color: "bg-rose-50 text-rose-600",
        title: "Parrainage d'orphelins",
        desc: "Chaque mois, nos parrains soutiennent directement un enfant orphelin. 50€/mois couvre la nourriture, les vêtements, la scolarité et les soins médicaux. Plus de 150 enfants sont actuellement parrainés.",
        countries: ["Maroc", "Sénégal", "Pakistan"],
    },
    {
        icon: Package,
        color: "bg-amber-50 text-amber-600",
        title: "Colis alimentaires",
        desc: "Distribution de colis alimentaires d'urgence pendant le Ramadan et lors des crises humanitaires. Chaque colis nourrit une famille pour 30 jours.",
        countries: ["Gaza", "Maroc", "Soudan"],
    },
    {
        icon: Droplets,
        color: "bg-blue-50 text-blue-600",
        title: "Construction de puits",
        desc: "Nous finançons et construisons des puits dans les zones rurales isolées. Un puits, c'est la santé, l'éducation et la vie pour tout un village.",
        countries: ["Tchad", "Pakistan", "Maroc"],
    },
    {
        icon: Home,
        color: "bg-green-50 text-green-600",
        title: "Aide aux mamans en difficulté",
        desc: "Soutien aux mères isolées et en grande précarité : aide alimentaire, vestimentaire et accompagnement psychologique via nos partenaires locaux.",
        countries: ["Maroc", "Sénégal", "Tchad"],
    },
];

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
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold mb-6 font-outfit"
                    >
                        Qui Sommes-Nous ?
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90"
                    >
                        Une équipe de bénévoles passionnés, unis par la volonté d'aider ceux qui en ont le plus besoin.
                    </motion.p>
                </div>
            </div>

            {/* Stats */}
            <div className="bg-primary text-white py-16">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <stat.icon className="w-8 h-8 mx-auto mb-3 text-secondary" />
                                <div className="text-3xl font-bold font-outfit text-secondary">
                                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className="text-sm opacity-80 mt-1">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-6xl">

                {/* Values */}
                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    {[
                        { icon: Users, title: "Proximité", desc: "Nous travaillons directement avec les populations locales sans intermédiaires inutiles." },
                        { icon: Award, title: "Confiance", desc: "La transparence est notre devise. Chaque don est justifié et tracé." },
                        { icon: GlobeIcon, title: "Universalité", desc: "Nous aidons sans distinction de race ou de religion, là où l'urgence nous appelle." }
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:transform hover:-translate-y-2 transition-transform"
                        >
                            <item.icon className="w-12 h-12 text-secondary mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-primary mb-4">{item.title}</h3>
                            <p className="text-gray-600">{item.desc}</p>
                        </motion.div>
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
                                Aujourd'hui, nous intervenons dans 6 pays, avec toujours la même philosophie :
                                <span className="font-bold text-primary"> chaque vie compte.</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Current Actions */}
                <div className="mb-24">
                    <h2 className="text-3xl font-bold text-primary mb-4 text-center">Ce que nous faisons aujourd'hui</h2>
                    <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">Nos actions concrètes sur le terrain, financées grâce à votre générosité.</p>
                    <div className="grid md:grid-cols-2 gap-8">
                        {actions.map((action, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 hover:-translate-y-1 transition-transform"
                            >
                                <div className={`inline-flex p-3 rounded-xl mb-4 ${action.color}`}>
                                    <action.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-3">{action.title}</h3>
                                <p className="text-gray-600 mb-4 leading-relaxed">{action.desc}</p>
                                <div className="flex flex-wrap gap-2">
                                    {action.countries.map((country) => (
                                        <span key={country} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                                            {country}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
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
                                Maroc • Sénégal • Tchad • Soudan • Gaza • Pakistan
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
