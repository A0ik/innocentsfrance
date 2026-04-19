"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, MapPin, Search, CheckCircle2, User, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

interface PuitsFormProps {
    isOpen: boolean
    onClose: () => void
    amount: number // Amount in cents
    productName: string
}

interface AddressSuggestion {
    properties: {
        label: string
        name: string
        postcode: string
        city: string
        context: string
    }
}

export function PuitsForm({ isOpen, onClose, amount, productName }: PuitsFormProps) {
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1) // 1: Info, 2: Loading/Redirect
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    const [formData, setFormData] = useState({
        nom: "",
        prenom: "",
        adresse: "",
        codePostal: "",
        ville: "",
        email: "",
        telephone: "",
        beneficiaire: "", // Dedicace name
    })

    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)

    // Address Autocomplete
    useEffect(() => {
        const fetchAddresses = async () => {
            if (formData.adresse.length > 3 && showSuggestions) {
                try {
                    const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(formData.adresse)}&limit=5`)
                    const data = await response.json()
                    setAddressSuggestions(data.features || [])
                } catch (error) {
                    console.error("Error fetching addresses:", error)
                }
            } else {
                setAddressSuggestions([])
            }
        }

        const timer = setTimeout(fetchAddresses, 300)
        return () => clearTimeout(timer)
    }, [formData.adresse, showSuggestions])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (e.target.name === "adresse") setShowSuggestions(true)
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" })
        }
    }

    const selectAddress = (suggestion: AddressSuggestion) => {
        setFormData({
            ...formData,
            adresse: suggestion.properties.name,
            codePostal: suggestion.properties.postcode,
            ville: suggestion.properties.city
        })
        setShowSuggestions(false)
        setAddressSuggestions([])

        const newErrors = { ...errors }
        delete newErrors.adresse
        delete newErrors.codePostal
        delete newErrors.ville
        setErrors(newErrors)
    }

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) newErrors.email = "Adresse email invalide"

        const phoneRegex = /^(?:(?:\+|00)33|0)[1-9](?:[\s.-]*\d{2}){4}$/
        if (!phoneRegex.test(formData.telephone)) newErrors.telephone = "Numéro invalide"

        if (!formData.nom) newErrors.nom = "Le nom est requis"
        if (!formData.prenom) newErrors.prenom = "Le prénom est requis"
        if (!formData.adresse) newErrors.adresse = "L'adresse est requise"
        if (!formData.codePostal) newErrors.codePostal = "Le code postal est requis"
        if (!formData.ville) newErrors.ville = "La ville est requise"

        // Beneficiary Name is CRITICAL for Puits
        if (!formData.beneficiaire) newErrors.beneficiaire = "Le nom du bénéficiaire (au nom de qui ?) est OBLIGATOIRE."

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        setLoading(true)
        setStep(2)

        // Redirect to Stripe with form data in metadata
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    name: `${formData.prenom} ${formData.nom}`,
                    amount: amount,
                    productName: `${productName} - Au nom de : ${formData.beneficiaire}`,
                    mode: 'payment',
                    formType: 'puits',
                    formData: {
                        prenom: formData.prenom,
                        nom: formData.nom,
                        email: formData.email,
                        telephone: formData.telephone,
                        adresse: formData.adresse,
                        codePostal: formData.codePostal,
                        ville: formData.ville,
                        beneficiaire: formData.beneficiaire,
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
                <div className="p-4 md:p-6 bg-secondary text-primary-foreground flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold">Financer un Puits</h2>
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
                                className="space-y-4"
                            >
                                {/* Beneficiary Field - Highlighted */}
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className="w-5 h-5 text-primary" />
                                        <label className="text-sm font-bold text-primary">Au nom de qui ? (Bénéficiaire)</label>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">Ce nom sera inscrit sur la plaque du puits.</p>
                                    <input
                                        required
                                        name="beneficiaire"
                                        value={formData.beneficiaire}
                                        onChange={handleChange}
                                        className={cn("w-full p-3 border rounded-lg focus:ring-2 focus:ring-secondary outline-none font-bold text-lg", errors.beneficiaire ? "border-red-500" : "")}
                                        placeholder="Ex: Défunt Grand-père..."
                                    />
                                    {errors.beneficiaire && <p className="text-xs text-red-500 mt-1">{errors.beneficiaire}</p>}
                                </div>

                                <div className="h-px bg-gray-200 my-4" />
                                <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Vos Coordonnées</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Nom</label>
                                        <input required name="nom" value={formData.nom} onChange={handleChange} className={cn("w-full p-3 border rounded-lg focus:ring-2 focus:ring-secondary outline-none", errors.nom ? "border-red-500" : "")} placeholder="Votre nom" />
                                        {errors.nom && <p className="text-xs text-red-500">{errors.nom}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Prénom</label>
                                        <input required name="prenom" value={formData.prenom} onChange={handleChange} className={cn("w-full p-3 border rounded-lg focus:ring-2 focus:ring-secondary outline-none", errors.prenom ? "border-red-500" : "")} placeholder="Votre prénom" />
                                        {errors.prenom && <p className="text-xs text-red-500">{errors.prenom}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2 relative">
                                    <label className="text-sm font-medium text-gray-700">Adresse</label>
                                    <div className="relative">
                                        <input
                                            name="adresse"
                                            value={formData.adresse}
                                            onChange={handleChange}
                                            className={cn("w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-secondary outline-none", errors.adresse ? "border-red-500" : "")}
                                            placeholder="Votre adresse..."
                                            autoComplete="off"
                                        />
                                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                                    </div>
                                    {errors.adresse && <p className="text-xs text-red-500">{errors.adresse}</p>}

                                    {addressSuggestions.length > 0 && showSuggestions && (
                                        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                                            {addressSuggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => selectAddress(suggestion)}
                                                    className="w-full text-left p-3 hover:bg-gray-50 flex items-start gap-2 border-b last:border-0"
                                                >
                                                    <MapPin className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                                                    <span className="text-sm text-gray-800">{suggestion.properties.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Code Postal</label>
                                        <input required name="codePostal" value={formData.codePostal} onChange={handleChange} className={cn("w-full p-3 border rounded-lg bg-gray-50", errors.codePostal ? "border-red-500" : "")} />
                                        {errors.codePostal && <p className="text-xs text-red-500">{errors.codePostal}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Ville</label>
                                        <input required name="ville" value={formData.ville} onChange={handleChange} className={cn("w-full p-3 border rounded-lg bg-gray-50", errors.ville ? "border-red-500" : "")} />
                                        {errors.ville && <p className="text-xs text-red-500">{errors.ville}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Email</label>
                                        <input required type="email" name="email" value={formData.email} onChange={handleChange} className={cn("w-full p-3 border rounded-lg focus:ring-2 focus:ring-secondary outline-none", errors.email ? "border-red-500" : "")} />
                                        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Téléphone</label>
                                        <input required type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className={cn("w-full p-3 border rounded-lg focus:ring-2 focus:ring-secondary outline-none", errors.telephone ? "border-red-500" : "")} />
                                        {errors.telephone && <p className="text-xs text-red-500">{errors.telephone}</p>}
                                    </div>
                                </div>


                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-secondary text-primary-foreground py-4 rounded-xl font-bold mt-6 hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01]"
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
                                <Loader2 className="w-12 h-12 animate-spin mx-auto text-secondary mb-6" />
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
