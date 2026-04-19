"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, CreditCard, Landmark, Copy, MapPin, Search, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"

interface ParrainageFormProps {
    isOpen: boolean
    onClose: () => void
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

export function ParrainageForm({ isOpen, onClose }: ParrainageFormProps) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        nom: "",
        prenom: "",
        adresse: "",
        codePostal: "",
        ville: "",
        email: "",
        telephone: "",
        paymentMethod: "", // "stripe", "sepa", "virement"
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

        const timer = setTimeout(fetchAddresses, 300) // Debounce
        return () => clearTimeout(timer)
    }, [formData.adresse, showSuggestions])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (e.target.name === "adresse") setShowSuggestions(true)
        // Clear error when user types
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

        // Clear address related errors
        const newErrors = { ...errors }
        delete newErrors.adresse
        delete newErrors.codePostal
        delete newErrors.ville
        setErrors(newErrors)
    }

    const validateStep1 = () => {
        const newErrors: { [key: string]: string } = {}

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            newErrors.email = "Adresse email invalide"
        }

        // Phone Validation (French formats: 06, 07, 09, +33...)
        const phoneRegex = /^(?:(?:\+|00)33|0)[1-9](?:[\s.-]*\d{2}){4}$/
        if (!phoneRegex.test(formData.telephone)) {
            newErrors.telephone = "Numéro invalide (ex: 06 12 34 56 78)"
        }

        if (!formData.nom) newErrors.nom = "Le nom est requis"
        if (!formData.prenom) newErrors.prenom = "Le prénom est requis"
        if (!formData.adresse) newErrors.adresse = "L'adresse est requise"
        if (!formData.codePostal) newErrors.codePostal = "Le code postal est requis"
        if (!formData.ville) newErrors.ville = "La ville est requise"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleStripePayment = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    name: `${formData.prenom} ${formData.nom}`,
                    amount: 5000, // 50.00 EUR
                    productName: "Parrainage Orphelin (Mensuel)",
                    mode: "subscription",
                    formType: "parrainage",
                    formData: {
                        nom: formData.nom,
                        prenom: formData.prenom,
                        email: formData.email,
                        adresse: formData.adresse,
                        codePostal: formData.codePostal,
                        ville: formData.ville,
                        telephone: formData.telephone,
                        paymentMethod: "stripe"
                    }
                }),
            });

            const { url, error } = await response.json();

            if (url) {
                window.location.href = url;
            } else {
                console.error("Stripe Error:", error);
                alert("Erreur lors de l'initialisation du paiement Stripe.");
                setLoading(false);
                setStep(2); // Go back to payment choice
            }
        } catch (err) {
            console.error("Payment Error:", err);
            alert("Une erreur est survenue.");
            setLoading(false);
            setStep(2);
        }
    }

    const handleStripeSepaPayment = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    amount: 5000,
                    productName: "Parrainage Orphelin (Mensuel — Prélèvement SEPA)",
                    mode: "subscription",
                    formType: "parrainage",
                    paymentMethodType: "sepa_debit",
                    formData: {
                        nom: formData.nom,
                        prenom: formData.prenom,
                        email: formData.email,
                        adresse: formData.adresse,
                        codePostal: formData.codePostal,
                        ville: formData.ville,
                        telephone: formData.telephone,
                        paymentMethod: "sepa"
                    }
                }),
            });
            const { url, error } = await response.json();
            if (url) {
                window.location.href = url;
            } else {
                console.error("Stripe SEPA Error:", error);
                alert("Erreur lors de l'initialisation du paiement SEPA.");
                setLoading(false);
                setStep(2);
            }
        } catch (err) {
            console.error("SEPA Payment Error:", err);
            alert("Une erreur est survenue.");
            setLoading(false);
            setStep(2);
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        alert("Copié !")
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                    "bg-white w-full overflow-hidden shadow-2xl flex flex-col max-h-[95vh] transition-all duration-300",
                    step === 7 ? "max-w-5xl h-[90vh]" : "max-w-lg rounded-2xl"
                )}
                style={step === 7 ? { borderRadius: "1rem" } : {}}
            >
                {/* Header */}
                <div className="p-4 md:p-6 bg-primary text-white flex justify-between items-center shrink-0">
                    <h2 className="text-lg md:text-xl font-bold">Parrainer un orphelin</h2>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                        <X className="w-6 h-6" /> {/* Larger icon for mobile */}
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
                                    <label className="text-sm font-medium text-gray-700">Adresse (Numéro et voie)</label>
                                    <div className="relative">
                                        <input
                                            name="adresse"
                                            value={formData.adresse}
                                            onChange={handleChange}
                                            className={cn("w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-secondary outline-none", errors.adresse ? "border-red-500" : "")}
                                            placeholder="Commencez à taper votre adresse..."
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
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">{suggestion.properties.label}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Code Postal</label>
                                        <input required name="codePostal" value={formData.codePostal} onChange={handleChange} className={cn("w-full p-3 border rounded-lg focus:ring-2 focus:ring-secondary outline-none bg-gray-50", errors.codePostal ? "border-red-500" : "")} placeholder="Code Postal" />
                                        {errors.codePostal && <p className="text-xs text-red-500">{errors.codePostal}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Ville</label>
                                        <input required name="ville" value={formData.ville} onChange={handleChange} className={cn("w-full p-3 border rounded-lg focus:ring-2 focus:ring-secondary outline-none bg-gray-50", errors.ville ? "border-red-500" : "")} placeholder="Ville" />
                                        {errors.ville && <p className="text-xs text-red-500">{errors.ville}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Email</label>
                                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className={cn("w-full p-3 border rounded-lg focus:ring-2 focus:ring-secondary outline-none", errors.email ? "border-red-500" : "")} placeholder="exemple@email.com" />
                                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Téléphone</label>
                                    <input required type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className={cn("w-full p-3 border rounded-lg focus:ring-2 focus:ring-secondary outline-none", errors.telephone ? "border-red-500" : "")} placeholder="06 12 34 56 78" />
                                    {errors.telephone && <p className="text-xs text-red-500">{errors.telephone}</p>}
                                </div>

                                <button
                                    onClick={() => {
                                        if (validateStep1()) setStep(2)
                                    }}
                                    className="w-full bg-primary text-white py-3 rounded-xl font-bold mt-4 hover:bg-primary/90 transition-colors"
                                >
                                    Continuer
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <h3 className="text-lg font-semibold text-center text-gray-800 mb-4">Choisissez votre mode de paiement</h3>

                                {/* CB + Apple Pay + Google Pay */}
                                <button
                                    onClick={() => {
                                        setFormData({ ...formData, paymentMethod: "stripe" })
                                        setStep(6)
                                        handleStripePayment()
                                    }}
                                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
                                >
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-bold text-gray-800">Carte bancaire (CB)</p>
                                        <p className="text-xs text-gray-500">Sécurisé via Stripe</p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {/* Apple Pay */}
                                        <span className="bg-black text-white text-[10px] font-semibold px-2 py-0.5 rounded-md leading-4"> Pay</span>
                                        {/* Google Pay */}
                                        <span className="bg-white border border-gray-200 text-[10px] font-semibold px-2 py-0.5 rounded-md leading-4 text-gray-700">G Pay</span>
                                    </div>
                                </button>

                                {/* Prélèvement SEPA via Stripe (automatique) */}
                                <button
                                    onClick={() => {
                                        setFormData({ ...formData, paymentMethod: "sepa" })
                                        setStep(6)
                                        handleStripeSepaPayment()
                                    }}
                                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
                                >
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                                        <Smartphone className="w-5 h-5" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-bold text-gray-800">Prélèvement SEPA</p>
                                        <p className="text-xs text-gray-500">Débit automatique mensuel · Sécurisé via Stripe</p>
                                    </div>
                                    <span className="bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-md leading-4 shrink-0">SEPA</span>
                                </button>

                                {/* Virement Bancaire manuel */}
                                <button
                                    onClick={() => {
                                        setFormData({ ...formData, paymentMethod: "virement" })
                                        setStep(5)
                                    }}
                                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
                                >
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                                        <Landmark className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-800">Virement Bancaire</p>
                                        <p className="text-xs text-gray-500">Afficher le RIB de l'association</p>
                                    </div>
                                </button>

                                <button onClick={() => setStep(1)} className="text-gray-400 text-sm hover:text-gray-600 block mx-auto mt-4">Retour</button>
                            </motion.div>
                        )}

                        {step === 5 && ( // IBAN Display Step (Association Info)
                            <motion.div
                                key="step5"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 text-center"
                            >
                                <h3 className="text-lg font-bold text-primary">Coordonnées Bancaires</h3>

                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 text-left">
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">IBAN</p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono text-sm md:text-base font-bold text-gray-800 break-all">FR74 2004 1010 1239 1969 0Y03 319</p>
                                            <button onClick={() => copyToClipboard("FR74 2004 1010 1239 1969 0Y03 319")} className="text-secondary hover:text-primary"><Copy className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Bénéficiaire</p>
                                        <p className="font-bold text-gray-800">Innocents France</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        onClose()
                                        alert("Merci !")
                                    }}
                                    className="w-full bg-primary text-white py-3 rounded-xl font-bold mt-2 hover:bg-primary/90 transition-colors"
                                >
                                    J'ai noté les informations
                                </button>
                                <button onClick={() => setStep(2)} className="text-gray-400 text-sm hover:text-gray-600 block mx-auto">Retour</button>
                            </motion.div>
                        )}

                        {step === 6 && ( // Stripe Loading State
                            <motion.div
                                key="step6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-20"
                            >
                                <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-6" />
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Redirection sécurisée...</h3>
                                <p className="text-gray-500">Veuillez patienter pendant que nous vous redirigeons vers Stripe.</p>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}
