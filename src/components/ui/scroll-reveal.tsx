"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

interface ScrollRevealProps {
    children: React.ReactNode
    className?: string
    width?: "fit-content" | "100%"
    delay?: number
}

export const ScrollReveal = ({ children, className = "", width = "fit-content", delay = 0 }: ScrollRevealProps) => {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-75px" })

    return (
        <div ref={ref} style={{ width }} className={className}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{ duration: 0.8, delay: delay, ease: [0.25, 0.25, 0.25, 0.75] }}
            >
                {children}
            </motion.div>
        </div>
    )
}
