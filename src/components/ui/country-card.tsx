"use client"

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface CountryCardProps {
    country: string;
    image: string;
    description: string;
    href?: string;
}

export function CountryCard({ country, image, description, href = "/don" }: CountryCardProps) {
    return (
        <Link href={href} className="block h-full">
            <motion.div
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="relative group overflow-hidden rounded-xl border border-white/10 shadow-lg aspect-[4/3] h-full"
            >
                <Image
                    src={image}
                    alt={country}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl font-bold text-white mb-2">{country}</h3>
                    <p className="text-white/90 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                        {description}
                    </p>
                </div>
            </motion.div>
        </Link>
    );
}
