"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Heart, Gift, Droplets, HandCoins, Info, Mail, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
    name: string
    url: string
    icon: LucideIcon
}

interface NavBarProps {
    className?: string
}

const navItems: NavItem[] = [
    { name: 'Accueil', url: '/', icon: Home },
    { name: 'Parrainage', url: '/parrainage', icon: Heart },
    { name: 'Colis', url: '/colis', icon: Gift },
    { name: 'Puits', url: '/puits', icon: Droplets },
    { name: 'Don', url: '/don', icon: HandCoins },
    { name: 'A propos', url: '/apropos', icon: Info },
    { name: 'Contact', url: '/contact', icon: Mail }
]

export function NavBar({ className }: NavBarProps) {
    const pathname = usePathname()
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return (
        <div
            className={cn(
                "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6 pointer-events-none",
                className,
            )}
        >
            <div className="flex items-center justify-between sm:justify-center gap-1 sm:gap-3 bg-white/90 border border-border/40 backdrop-blur-xl py-2 px-1 rounded-full shadow-2xl ring-1 ring-black/5 w-[95vw] sm:w-auto max-w-full overflow-x-auto sm:overflow-visible no-scrollbar pointer-events-auto">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = item.url === '/' ? pathname === '/' : pathname.startsWith(item.url)

                    return (
                        <Link
                            key={item.name}
                            href={item.url}
                            className={cn(
                                "relative cursor-pointer text-sm font-semibold px-3 sm:px-6 py-2 rounded-full transition-colors flex-shrink-0",
                                "text-foreground/80 hover:text-primary",
                                isActive && "bg-muted text-primary",
                            )}
                        >
                            <span className="hidden md:inline">{item.name}</span>
                            <span className="md:hidden">
                                <Icon size={18} strokeWidth={2.5} />
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="lamp"
                                    className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                                    initial={false}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30,
                                    }}
                                >
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                                        <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                                        <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                                        <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                                    </div>
                                </motion.div>
                            )}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
