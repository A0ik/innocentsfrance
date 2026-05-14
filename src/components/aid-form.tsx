"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, CreditCard, User, Mail, Phone, Gift } from "lucide-react"
import { cn } from "@/lib/utils"

interface AidFormProps {
    isOpen: boolean
    onClose: () => void
    amount: number // Amount in cents
    productName: string
    destination: "Gaza" | "Maroc"
}

export function AidForm({ isOpen, onClose, amount, productName, destination }: AidFormProps) {
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    const [formData, setFormData] = useState({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
    })

    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" })
        }
    }

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) newErrors.email = "Adresse email invalide"

        const phoneRegex = /^(?:(?:\+|00)33|0)[1-9](?:[\s.-]*\d{2}){4}$/
        if (!phoneRegex.test(formData.telephone)) newErrors.telephone = "Numéro invalide"

        if (!formData.nom) newErrors.nom = "Le nom est requis"
        if (!formData.prenom) newErrors.prenom = "Le prénom est requis"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        setLoading(true)
        setStep(2)

        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    name: `${formData.prenom} ${formData.nom}`,
                    amount: amount,
                    productName: productName,
                    mode: 'payment',
                    formType: 'aid',
                    formData: {
                        prenom: formData.prenom,
                        nom: formData.nom,
                        email: formData.email,
                        telephone: formData.telephone,
                        destination: destination,
                        productName: productName,
                        amount: amount
                    }
                }),
            });

            const { url, error } = await response.json();

            if (url) {
                window.location.href = url;
            } else {
                console.error("Stripe Error:", error);
                alert("Erreur lors de l'initialisation du paiement.");
                setLoading(false);
                setStep(1);
            }
        } catch (err) {
            console.error("Payment Error:", err);
            alert("Une erreur est survenue.");
            setLoading(false);
            setStep(1);
        }
    }

    if (!isOpen || !mounted) return null

    const content = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]"
            >
                {/* Header */}
                <div className="p-4 md:p-6 bg-primary text-white flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold">Sacrifier pour l'Aïd</h2>
                        <p className="text-xs opacity-90">{productName} - {(amount / 100).toFixed(0)}€</p>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-5"
                            >
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3">
                                    <Gift className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <p className="text-sm text-green-800 font-medium">
                                        Votre sacrifice sera réalisé à {destination === "Gaza" ? "Gaza" : "dans les villages du Maroc"}
                                    </p>
                                </div>

                                <h3 className="text-sm font-bold text-gray-500 uppercase">Vos Coordonnées</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            Prénom
                                        </label>
                                        <input
                                            required
                                            name="prenom"
                                            value={formData.prenom}
                                            onChange={handleChange}
                                            className={cn("w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none", errors.prenom ? "border-red-500" : "")}
                                            placeholder="Votre prénom"
                                        />
                                        {errors.prenom && <p className="text-xs text-red-500">{errors.prenom}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            Nom
                                        </label>
                                        <input
                                            required
                                            name="nom"
                                            value={formData.nom}
                                            onChange={handleChange}
                                            className={cn("w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none", errors.nom ? "border-red-500" : "")}
                                            placeholder="Votre nom"
                                        />
                                        {errors.nom && <p className="text-xs text-red-500">{errors.nom}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        Email
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={cn("w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none", errors.email ? "border-red-500" : "")}
                                        placeholder="votre@email.com"
                                    />
                                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        Téléphone
                                    </label>
                                    <input
                                        required
                                        type="tel"
                                        name="telephone"
                                        value={formData.telephone}
                                        onChange={handleChange}
                                        className={cn("w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none", errors.telephone ? "border-red-500" : "")}
                                        placeholder="06 12 34 56 78"
                                    />
                                    {errors.telephone && <p className="text-xs text-red-500">{errors.telephone}</p>}
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-primary text-white py-4 rounded-xl font-bold mt-4 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01]"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    Payer {(amount / 100).toFixed(0)}€ en ligne
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-2">Paiement sécurisé via Stripe</p>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-20"
                            >
                                <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-6" />
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Redirection vers le paiement...</h3>
                                <p className="text-gray-500">Veuillez ne pas fermer cette fenêtre.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );

    return createPortal(content, document.body);
}
