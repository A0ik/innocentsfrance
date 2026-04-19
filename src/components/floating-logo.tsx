"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export function FloatingLogo() {
    return (
        <div className="fixed top-6 left-6 z-[100]">
            <Link href="/">
                <motion.div
                    className="relative group cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    {/* Placeholder for Logo - User needs to add logo.jpeg to public folder */}
                    <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3">
                        {/* If user uploads logo.jpeg, uncomment the following line and remove the div below */}
                        <Image src="/logo.jpeg" alt="Logo" width={40} height={40} className="object-contain" />
                        <div className="flex flex-col">
                            <span className="font-bold text-primary text-sm font-outfit leading-none">INNOCENTS</span>
                            <span className="font-bold text-secondary text-xs font-outfit leading-none">FRANCE</span>
                        </div>
                    </div>
                </motion.div>
            </Link>
        </div>
    );
}
