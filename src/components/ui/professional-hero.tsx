"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Heart } from "lucide-react"

export function ProfessionalHero() {
    return (
        <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/hero-bg.jpg" // Placeholder - requires user asset ideally
                    alt="Innocents France Hero"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background/90" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium tracking-wider mb-6">
                        ASSOCIATION HUMANITAIRE
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                        Ensemble pour un <br />
                        <span className="text-secondary">Avenir Meilleur</span>
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Nous œuvrons chaque jour pour apporter aide, espoir et dignité aux populations les plus vulnérables à travers le monde.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/don"
                            className="group bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 shadow-xl flex items-center gap-2"
                        >
                            Faire un don
                            <Heart className="w-5 h-5 group-hover:fill-current transition-colors" />
                        </Link>
                        <Link
                            href="/apropos"
                            className="bg-white/10 backdrop-blur-md border-2 border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all hover:scale-105 shadow-xl"
                        >
                            Découvrir nos actions
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{ delay: 1, duration: 2, repeat: Infinity }}
            >
                <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center p-1">
                    <div className="w-1 h-3 bg-white/50 rounded-full" />
                </div>
            </motion.div>
        </div>
    )
}
