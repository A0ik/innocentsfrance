# 🏗️ Structure du Projet INOC France

## 📋 Vue d'ensemble
Site web humanitaire Next.js 14 avec App Router pour INOC France, permettant les dons, parrainages et projets de puits.

---

## 📂 Structure des Dossiers

```
InocFrance-main/
├── public/                          # Fichiers statiques
│   ├── images/                      # Images du site
│   ├── logo.jpeg                    # Logo INOC France
│   ├── madebySociQl.png            # Logo Agence
│   ├── video.mp4                    # Vidéo d'introduction
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── src/
│   ├── app/                         # App Router Next.js 14
│   │   ├── api/                     # Routes API
│   │   │   ├── create-checkout-session/
│   │   │   │   └── route.ts         # API Stripe Checkout
│   │   │   └── stripe-webhook/
│   │   │       └── route.ts         # Webhook Stripe (Paiements réussis)
│   │   │
│   │   ├── apropos/                # Page À propos
│   │   │   └── page.tsx
│   │   │
│   │   ├── colis/                  # Page Envoi de colis
│   │   │   └── page.tsx
│   │   │
│   │   ├── contact/                # Page Contact
│   │   │   └── page.tsx
│   │   │
│   │   ├── don/                    # Page Dons
│   │   │   └── page.tsx
│   │   │
│   │   ├── parrainage/             # Page Parrainage
│   │   │   └── page.tsx
│   │   │
│   │   ├── puits/                  # Page Puits
│   │   │   └── page.tsx
│   │   │
│   │   ├── layout.tsx              # Layout global
│   │   ├── page.tsx                # Page d'accueil
│   │   ├── not-found.tsx           # Page 404 personnalisée
│   │   ├── globals.css             # Styles CSS globaux
│   │   └── favicon.ico             # Favicon du site
│   │
│   ├── components/                  # Composants réutilisables
│   │   ├── ui/                     # Composants UI de base
│   │   │   ├── accordion.tsx       # Composant accordéon
│   │   │   ├── country-card.tsx    # Carte pays
│   │   │   ├── globe.tsx           # Animation globe terrestre
│   │   │   ├── page-not-found.tsx  # Composant 404
│   │   │   ├── professional-hero.tsx # Hero professionnel
│   │   │   ├── scroll-reveal.tsx   # Animation révélation
│   │   │   ├── scroll-velocity.tsx # Scroll infini
│   │   │   └── tubelight-navbar.tsx # Navigation avec effet néon
│   │   │
│   │   ├── faq.tsx                 # Section FAQ
│   │   ├── floating-logo.tsx       # Logo flottant
│   │   ├── footer.tsx              # Footer
│   │   ├── parrainage-form.tsx     # Formulaire parrainage (avec signature)
│   │   └── puits-form.tsx          # Formulaire puits
│   │
│   └── lib/                        # Utilitaires
│       └── utils.ts                # Fonctions utilitaires
│
├── components.json                  # Config shadcn
├── eslint.config.mjs               # Config ESLint
├── next.config.ts                  # Config Next.js
├── package.json                    # Dépendances
├── postcss.config.mjs              # Config PostCSS
├── tsconfig.json                   # Config TypeScript
└── STRUCTURE_DU_PROJET.md          # Ce fichier
```

---

## 🎨 Technologies Utilisées

### Framework & Core
- **Next.js 14**
- **React 18**
- **TypeScript**

### Styling
- **Tailwind CSS 3.4**
- **Framer Motion** (Animations)

### Paiement & Email
- **Stripe** (Paiements Carte Bancaire)
- **Brevo** (Envoi d'emails transactionnels)
- **API Adresse Gouv** (Autocomplétion adresses)

### Outils
- **jspdf** (Génération PDF Mandat SEPA)
- **react-signature-canvas** (Signature électronique)
- **ibantools** (Validation IBAN/BIC)

---

## 📄 Fonctionnalités Clés

### 1. Parrainage
- Deux modes de paiement :
    - **CB (Stripe)** : Paiement récurrent mensuel (50€). Email envoyé après validation du paiement via webhook Stripe.
    - **Prélèvement (SEPA)** : Génération d'un mandat PDF signé électroniquement, envoyé par email en pièce jointe.
- Emails envoyés à contact@innocentsfrance.org via **Brevo**.

### 2. Puits & Dons
- Paiement unique via Stripe.
- Webhook Stripe envoie un email de confirmation avec les données du formulaire après validation du paiement.

### 3. Contact
- Formulaire envoyé par email via **Brevo** à contact@innocentsfrance.org.
