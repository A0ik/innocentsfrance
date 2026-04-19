"use client"

import { useState } from "react";
import { Mail, MapPin, MessageSquare, Loader2, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        nom: "",
        email: "",
        sujet: "Demande d'information",
        message: ""
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        if (!formData.nom.trim()) {
            setError("Veuillez entrer votre nom");
            return false;
        }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError("Veuillez entrer un email valide");
            return false;
        }
        if (!formData.message.trim()) {
            setError("Veuillez entrer un message");
            return false;
        }
        setError("");
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError("");

        try {
            const response = await fetch('/api/send-email', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    subject: `[Contact] ${formData.sujet} - ${formData.nom}`,
                    html: `
                        <h2>Nouveau message de contact</h2>
                        <table style="border-collapse: collapse; width: 100%;">
                            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Nom</td><td style="padding: 8px; border: 1px solid #ddd;">${formData.nom}</td></tr>
                            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td><td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${formData.email}">${formData.email}</a></td></tr>
                            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Sujet</td><td style="padding: 8px; border: 1px solid #ddd;">${formData.sujet}</td></tr>
                            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Message</td><td style="padding: 8px; border: 1px solid #ddd;">${formData.message.replace(/\n/g, '<br>')}</td></tr>
                        </table>
                    `,
                }),
            });

            if (response.ok) {
                setSuccess(true);
                setFormData({
                    nom: "",
                    email: "",
                    sujet: "Demande d'information",
                    message: ""
                });
                setTimeout(() => setSuccess(false), 5000);
            } else {
                setError("Une erreur est survenue. Veuillez réessayer.");
            }
        } catch (err) {
            console.error("Error sending contact form:", err);
            setError("Impossible de se connecter au serveur. Veuillez réessayer plus tard.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="bg-primary text-white pt-36 pb-16 text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-outfit">Contactez-nous</h1>
                    <p className="text-xl opacity-90">
                        Une question sur vos dons ou nos actions ? Nous sommes là pour vous répondre.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-5xl">
                <div className="grid md:grid-cols-2 gap-12 bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">

                    {/* Info Side */}
                    <div className="bg-secondary/10 p-12 flex flex-col justify-center">
                        <h2 className="text-2xl font-bold text-primary mb-8">Informations</h2>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="bg-white p-3 rounded-full shadow-sm text-secondary">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Email</h3>
                                    <p className="text-gray-600">contact@innocentsfrance.org</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-white p-3 rounded-full shadow-sm text-secondary">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Adresse</h3>
                                    <p className="text-gray-600">4 RUE DU DOCTEUR SCHWEITZER<br />91430 IGNY</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-white p-3 rounded-full shadow-sm text-secondary">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Réseaux Sociaux</h3>
                                    <p className="text-gray-600 italic">
                                        Nous n'avons pas de réseaux sociaux pour le moment.
                                        Privilégiez l'email ou le formulaire.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 bg-white/50 p-6 rounded-xl border border-white/60">
                            <h3 className="font-bold text-primary mb-2">Devenir Bénévole ?</h3>
                            <p className="text-sm text-gray-600">
                                Envoyez-nous un email avec vos compétences et disponibilités. Nous recherchons toujours des cœurs vaillants.
                            </p>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="p-12">
                        <h2 className="text-2xl font-bold text-primary mb-6">Envoyez un message</h2>

                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800">
                                <CheckCircle2 className="w-5 h-5" />
                                <p className="text-sm font-medium">Message envoyé avec succès ! Nous vous répondrons bientôt.</p>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Votre Nom</label>
                                <input
                                    type="text"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-secondary focus:ring-2 focus:ring-secondary/50 outline-none transition-all"
                                    placeholder="Jean Dupont"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Votre Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-secondary focus:ring-2 focus:ring-secondary/50 outline-none transition-all"
                                    placeholder="jean@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
                                <select
                                    name="sujet"
                                    value={formData.sujet}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-secondary focus:ring-2 focus:ring-secondary/50 outline-none transition-all"
                                >
                                    <option>Demande d'information</option>
                                    <option>Problème technique don</option>
                                    <option>Presse / Partenariat</option>
                                    <option>Autre</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea
                                    rows={4}
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-secondary focus:ring-2 focus:ring-secondary/50 outline-none transition-all"
                                    placeholder="Votre message..."
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Envoi en cours...
                                    </>
                                ) : (
                                    "Envoyer"
                                )}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
