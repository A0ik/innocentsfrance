"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, CreditCard, Landmark, PenTool, Copy, Phone, Mail, MapPin, Search, FileDown, CheckCircle2, FileText, AlertTriangle } from "lucide-react"
import SignatureCanvas from "react-signature-canvas"
import { cn } from "@/lib/utils"
import jsPDF from "jspdf"
import * as ibantools from "ibantools"

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
        paymentMethod: "", // "stripe", "virement", "prelevement"
        donorIban: "", // For Mandat de Prélèvement
        donorBic: "", // NEW: BIC code
    })
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)

    const sigCanvas = useRef<SignatureCanvas>(null)
    const [signatureData, setSignatureData] = useState<string | null>(null)

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

    const validateMandat = () => {
        const newErrors: { [key: string]: string } = {}
        const ibanClean = formData.donorIban.replace(/\s/g, '').toUpperCase();

        // Strict IBAN Validation using ibantools
        if (!ibantools.isValidIBAN(ibanClean)) {
            newErrors.donorIban = "IBAN invalide. Veuillez vérifier votre saisie."
        } else if (!ibanClean.startsWith('FR')) {
            newErrors.donorIban = "Seuls les IBAN français (FR) sont acceptés pour le moment."
        }

        const bicClean = formData.donorBic.replace(/\s/g, '').toUpperCase();
        if (!ibantools.isValidBIC(bicClean)) {
            newErrors.donorBic = "BIC invalide. Veuillez vérifier votre code BIC."
        }

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

    const generateSEPA = () => {
        if (!signatureData) return;

        const doc = new jsPDF();

        // --- Header ---
        doc.setFontSize(10);
        doc.text(`Créancier : Association Innocents France`, 15, 15);
        doc.text(`Identifiant Créancier SEPA (ICS) : FRXXXXXXXXXXXXXXXX`, 110, 15); // Placeholder ICS

        doc.text(`4 RUE DU DOCTEUR SCHWEITZER`, 15, 20);
        doc.text(`91430 IGNY`, 15, 25);

        // --- Title Box ---
        doc.setFillColor(230, 230, 230);
        doc.rect(15, 35, 180, 20, "F");
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("MANDAT DE PRÉLÈVEMENT SEPA", 105, 45, { align: "center" });
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Référence Unique du Mandat (RUM) : À compléter par le créancier", 105, 52, { align: "center" });

        // --- Debtor Info (Left) ---
        doc.setFillColor(245, 245, 245);
        doc.rect(15, 65, 85, 40, "F");
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Identification du débiteur", 15, 62);

        doc.setFont("helvetica", "normal");
        doc.text(`${formData.prenom} ${formData.nom}`, 57, 80, { align: "center" });
        doc.text(`${formData.adresse}`, 57, 85, { align: "center" });
        doc.text(`${formData.codePostal} ${formData.ville}`, 57, 90, { align: "center" });

        // --- Bank Info (Right) ---
        doc.setFont("helvetica", "bold");
        doc.text("Identification du compte bancaire", 110, 62);

        // IBAN Box
        doc.rect(110, 68, 90, 10);
        doc.setFontSize(9);
        doc.text("IBAN (Identifiant international de compte)", 112, 66);
        doc.setFont("courier", "bold");
        doc.setFontSize(11);
        doc.text(formData.donorIban.toUpperCase(), 115, 75);

        // BIC Box
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("BIC (Identifiant international de l'établissement)", 112, 85);
        doc.rect(110, 88, 50, 10); // Standardized height
        doc.setFont("courier", "bold"); // Monospace for bank codes
        doc.setFontSize(11);
        doc.text(formData.donorBic.toUpperCase(), 115, 95);

        // --- Legal Text Box ---
        doc.rect(110, 105, 90, 60);
        doc.setFontSize(8);
        doc.text("En signant ce formulaire de mandat, vous autorisez (A) [ASSOCIATION INNOCENTS FRANCE] à envoyer des instructions à votre banque pour débiter votre compte, et (B) votre banque à débiter votre compte conformément aux instructions de [ASSOCIATION INNOCENTS FRANCE]. Vous bénéficiez du droit d'être remboursé par votre banque selon les conditions décrites dans la convention que vous avez passée avec elle. Une demande de remboursement doit être présentée dans les 8 semaines suivant la date de débit de votre compte pour un prélèvement autorisé.", 112, 110, { maxWidth: 86, align: "justify" });

        // --- Signature Section ---
        doc.setFillColor(245, 245, 245);
        doc.rect(15, 120, 85, 45, "F");
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Date et signature :", 20, 128);
        doc.setFont("helvetica", "normal");
        doc.text(`Fait le ${new Date().toLocaleDateString("fr-FR")}`, 20, 133);

        // Add Signature Image
        if (signatureData) {
            doc.addImage(signatureData, "PNG", 30, 135, 40, 20);
        }

        // Output
        const pdfOutput = doc.output("blob");
        setPdfBlob(pdfOutput);
        const pdfUrl = URL.createObjectURL(pdfOutput);
        setPdfPreviewUrl(pdfUrl);
    }

    const handleSignatureEnd = () => {
        if (sigCanvas.current) {
            setSignatureData(sigCanvas.current.toDataURL("image/png"));
        }
    };

    const handleSubmit = async () => {
        setLoading(true)

        try {
            // Convert PDF blob to base64 for attachment
            let pdfBase64: string | null = null
            if (pdfBlob) {
                pdfBase64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader()
                    reader.readAsDataURL(pdfBlob)
                    reader.onloadend = () => {
                        // Remove the data:application/pdf;base64, prefix
                        const result = reader.result as string
                        resolve(result.split(',')[1])
                    }
                })
            }

            const emailPayload: any = {
                subject: `[PARRAINAGE SEPA] Nouveau mandat - ${formData.prenom} ${formData.nom}`,
                html: `
                    <h2>Nouveau mandat de pr\u00e9l\u00e8vement SEPA</h2>
                    <p>Un nouveau mandat SEPA a \u00e9t\u00e9 sign\u00e9 et valid\u00e9. Le document PDF est en pi\u00e8ce jointe.</p>
                    <table style="border-collapse: collapse; width: 100%;">
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Nom</td><td style="padding: 8px; border: 1px solid #ddd;">${formData.prenom} ${formData.nom}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td><td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${formData.email}">${formData.email}</a></td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">T\u00e9l\u00e9phone</td><td style="padding: 8px; border: 1px solid #ddd;">${formData.telephone}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Adresse</td><td style="padding: 8px; border: 1px solid #ddd;">${formData.adresse}, ${formData.codePostal} ${formData.ville}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">IBAN</td><td style="padding: 8px; border: 1px solid #ddd; font-family: monospace;">${formData.donorIban.toUpperCase()}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">BIC</td><td style="padding: 8px; border: 1px solid #ddd; font-family: monospace;">${formData.donorBic.toUpperCase()}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Montant</td><td style="padding: 8px; border: 1px solid #ddd;">50\u20ac / mois</td></tr>
                    </table>
                `,
            }

            if (pdfBase64) {
                emailPayload.attachments = [{
                    filename: `mandat-sepa-${formData.nom}-${formData.prenom}.pdf`,
                    content: pdfBase64,
                }]
            }

            const response = await fetch('/api/send-email', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(emailPayload),
            })

            if (response.ok) {
                onClose()
                setLoading(false)
                alert("Merci ! Votre mandat a \u00e9t\u00e9 valid\u00e9 et envoy\u00e9.")
            } else {
                throw new Error("Erreur serveur")
            }
        } catch (error) {
            console.error("Error sending email:", error)
            setLoading(false)
            alert("Erreur lors de l'envoi. Veuillez r\u00e9essayer.")
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

                                <button
                                    onClick={() => {
                                        setFormData({ ...formData, paymentMethod: "stripe" })
                                        setStep(6) // Stripe Loading Step
                                        handleStripePayment() // Trigger Payment
                                    }}
                                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
                                >
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-800">Paiement en ligne (CB)</p>
                                        <p className="text-xs text-gray-500">Sécurisé via Stripe</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setFormData({ ...formData, paymentMethod: "virement" })
                                        setStep(5) // IBAN Display Step
                                    }}
                                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
                                >
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Landmark className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-800">Virement Bancaire</p>
                                        <p className="text-xs text-gray-500">Afficher le RIB de l'association</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setFormData({ ...formData, paymentMethod: "prelevement" })
                                        setStep(3) // Mandat Step
                                    }}
                                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
                                >
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <PenTool className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-800">Prélèvement Automatique</p>
                                        <p className="text-xs text-gray-500">Mandat SEPA et signature</p>
                                    </div>
                                </button>

                                <button onClick={() => setStep(1)} className="text-gray-400 text-sm hover:text-gray-600 block mx-auto mt-4">Retour</button>
                            </motion.div>
                        )}

                        {step === 3 && ( // Mandat SEPA Step (IBAN Input)
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="text-center space-y-2 mb-6">
                                    <Landmark className="w-10 h-10 text-primary mx-auto" />
                                    <h3 className="text-lg font-bold">Mandat de Prélèvement SEPA</h3>
                                    <p className="text-sm text-gray-500">Veuillez renseigner vos coordonnées bancaires.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Votre IBAN</label>
                                    <input
                                        required
                                        name="donorIban"
                                        value={formData.donorIban}
                                        onChange={handleChange}
                                        className={cn("w-full p-3 border rounded-lg focus:ring-2 focus:ring-secondary outline-none font-mono uppercase", errors.donorIban ? "border-red-500" : "")}
                                        placeholder="FR76 ...."
                                    />
                                    {errors.donorIban && (
                                        <div className="flex items-center gap-2 text-red-500 text-xs mt-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            <p>{errors.donorIban}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Votre Code BIC</label>
                                    <input
                                        required
                                        name="donorBic"
                                        value={formData.donorBic}
                                        onChange={handleChange}
                                        className={cn("w-full p-3 border rounded-lg focus:ring-2 focus:ring-secondary outline-none font-mono uppercase", errors.donorBic ? "border-red-500" : "")}
                                        placeholder="EX: BNP PARIBAS..."
                                    />
                                    {errors.donorBic && (
                                        <div className="flex items-center gap-2 text-red-500 text-xs mt-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            <p>{errors.donorBic}</p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => {
                                        if (validateMandat()) setStep(4)
                                    }}
                                    className="w-full bg-primary text-white py-3 rounded-xl font-bold mt-4 hover:bg-primary/90 transition-colors"
                                >
                                    Continuer vers la signature
                                </button>
                                <button onClick={() => setStep(2)} className="text-gray-400 text-sm hover:text-gray-600 block mx-auto">Retour</button>
                            </motion.div>
                        )}


                        {step === 4 && ( // Signature Step
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="text-center space-y-2">
                                    <PenTool className="w-10 h-10 text-primary mx-auto" />
                                    <h3 className="text-lg font-bold">Signature du Mandat</h3>
                                    <p className="text-sm text-gray-500">Signez dans le cadre ci-dessous.</p>
                                </div>

                                <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                                    <SignatureCanvas
                                        ref={sigCanvas}
                                        onEnd={handleSignatureEnd}
                                        penColor="black"
                                        canvasProps={{ className: "w-full h-40" }}
                                    />
                                </div>
                                <button onClick={() => sigCanvas.current?.clear()} className="text-xs text-red-500 hover:underline block w-full text-right px-2">Effacer</button>

                                <button
                                    onClick={() => {
                                        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
                                            handleSignatureEnd() // ensure state captures
                                            generateSEPA() // Generate PDF
                                            setStep(7) // Go to Preview Step
                                        } else {
                                            alert("Veuillez signer avant de continuer.")
                                        }
                                    }}
                                    className="w-full bg-primary text-white py-3 rounded-xl font-bold mt-4 hover:bg-primary/90 transition-colors"
                                >
                                    Prévisualiser le Mandat
                                </button>
                                <button onClick={() => setStep(3)} className="text-gray-400 text-sm hover:text-gray-600 block mx-auto">Retour</button>
                            </motion.div>
                        )}

                        {step === 7 && ( // PDF Preview Step
                            <motion.div
                                key="step7"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4 h-full flex flex-col"
                            >
                                <h3 className="text-lg font-bold text-center text-primary">Vérification du Mandat</h3>
                                <p className="text-sm text-center text-gray-600 mb-4">Veuillez vérifier les informations ci-dessous avant de valider.</p>

                                <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden relative">
                                    {pdfPreviewUrl ? (
                                        <iframe src={pdfPreviewUrl} className="w-full h-full" title="Aperçu du Mandat"></iframe>
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="animate-spin w-8 h-8 text-primary" />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4 shrink-0">
                                    <button
                                        onClick={() => setStep(3)} // Go back to edit (IBAN step)
                                        className="w-full border border-primary text-primary py-3 rounded-xl font-bold hover:bg-primary/5 transition-colors"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : "Valider et Envoyer"}
                                    </button>
                                </div>
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
