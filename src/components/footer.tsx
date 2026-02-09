"use client";

import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-primary text-white py-12 pb-24 border-t border-white/10">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-2">
                    <h3 className="text-2xl font-bold mb-4 font-outfit">INNOCENTS FRANCE</h3>
                    <p className="opacity-80 max-w-sm">Association humanitaire d'aide aux orphelins et aux mamans en difficulté.</p>
                    <p className="mt-4 text-sm opacity-60">Reçu fiscal disponible sur demande (pas automatique).</p>
                </div>
                <div>
                    <h4 className="font-bold mb-4">Liens Rapides</h4>
                    <ul className="space-y-2 opacity-80">
                        <li><Link href="/" className="hover:text-secondary">Accueil</Link></li>
                        <li><Link href="/apropos" className="hover:text-secondary">À propos</Link></li>
                        <li><Link href="/don" className="hover:text-secondary">Faire un don</Link></li>
                        <li><Link href="/contact" className="hover:text-secondary">Contact</Link></li>
                        <li><Link href="/parrainage" className="hover:text-secondary">Parrainage</Link></li>
                        <li><Link href="/colis" className="hover:text-secondary">Colis</Link></li>
                        <li><Link href="/puits" className="hover:text-secondary">Puits</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-4">Contact</h4>
                    <ul className="space-y-2 opacity-80">
                        <li>Contactez-nous via le formulaire</li>
                        <li>Pas de réseaux sociaux</li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}
