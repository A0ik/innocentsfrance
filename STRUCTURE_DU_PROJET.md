# 🏗️ Structure du Projet INOC France

## 📋 Vue d'ensemble
Site web humanitaire Next.js 14 avec App Router pour INOC France, permettant les dons, parrainages et projets de puits.

---

## 📂 Structure des Dossiers

```
InocFrance-main/
├── public/                          # Fichiers statiques
│   ├── images/                      # Images du site
│   │   ├── hero-bg.jpg             # Image d'arrière-plan principale
│   │   ├── about-hero.jpg          # Image page À propos
│   │   ├── don-hero.jpg            # Image page Dons
│   │   ├── parrainage-hero.jpg     # Image page Parrainage
│   │   ├── puits-tchad.jpg         # Image puits Tchad
│   │   ├── puits-pakistan.jpg      # Image puits Pakistan
│   │   ├── enfant-ecole.JPG        # Photo enfant à l'école
│   │   ├── gaza.jpg                # Image Gaza
│   │   ├── maroc.jpg               # Image Maroc
│   │   ├── pakistan.jpg            # Image Pakistan
│   │   ├── senegal.jpg             # Image Sénégal
│   │   ├── soudan.jpg              # Image Soudan
│   │   └── tchad.jpg               # Image Tchad
│   ├── logo.jpeg                    # Logo INOC France
│   ├── file.svg                     # Icône fichier
│   ├── globe.svg                    # Icône globe
│   ├── next.svg                     # Logo Next.js
│   ├── vercel.svg                   # Logo Vercel
│   └── window.svg                   # Icône fenêtre
│
├── src/
│   ├── app/                         # App Router Next.js 14
│   │   ├── api/                     # Routes API
│   │   │   └── create-checkout-session/
│   │   │       └── route.ts        # API Stripe Checkout
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
│   │   │   ├── country-card.tsx    # Carte pays avec effet hover
│   │   │   ├── globe.tsx           # Animation globe terrestre
│   │   │   ├── page-not-found.tsx  # Composant 404
│   │   │   ├── professional-hero.tsx # Hero professionnel avec image
│   │   │   ├── scroll-reveal.tsx   # Animation révélation au scroll
│   │   │   ├── scroll-velocity.tsx # Scroll infini avec vélocité
│   │   │   └── tubelight-navbar.tsx # Navigation avec effet néon
│   │   │
│   │   ├── faq.tsx                 # Section FAQ
│   │   ├── floating-logo.tsx       # Logo flottant fixe
│   │   ├── footer.tsx              # Footer du site
│   │   ├── parrainage-form.tsx     # Formulaire parrainage
│   │   └── puits-form.tsx          # Formulaire puits
│   │
│   └── lib/                        # Utilitaires et helpers
│       └── utils.ts                # Fonctions utilitaires (classNames, etc.)
│
├── components.json                  # Configuration shadcn/ui
├── eslint.config.mjs               # Configuration ESLint
├── next.config.ts                  # Configuration Next.js
├── package.json                    # Dépendances du projet
├── package-lock.json               # Lock des dépendances
├── postcss.config.mjs              # Configuration PostCSS
├── tsconfig.json                   # Configuration TypeScript
├── test-iban.js                    # Script de test IBAN
├── build_log.txt                   # Log de build
├── GUIDE_IMAGES.md                 # Guide pour les images
├── README.md                       # Documentation du projet
└── STRUCTURE_DU_PROJET.md          # Ce fichier
```

---

## 🎨 Technologies Utilisées

### Framework & Core
- **Next.js 14.2.22** - Framework React avec App Router
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique

### Styling
- **Tailwind CSS 3.4.1** - Framework CSS utilitaire
- **PostCSS** - Transformation CSS
- **clsx / tailwind-merge** - Gestion des classes CSS conditionnelles

### Animations
- **Framer Motion 11.15.0** - Animations fluides et interactives
- **Aceternity UI** - Composants UI animés

### Paiement & APIs
- **Stripe** - Paiements en ligne sécurisés
- **API Adresse Gouv** - Autocomplétion d'adresses françaises

### UI Components
- **Lucide React** - Icônes modernes
- **Radix UI** - Composants accessibles (Accordion)
- **shadcn/ui** - Composants UI réutilisables

### Outils
- **ESLint** - Linter JavaScript/TypeScript
- **IBAN** - Validation des numéros IBAN

---

## 📄 Pages du Site

### 🏠 Page d'accueil (`/`)
- Hero avec animation
- Présentation des missions
- Carte interactive des pays d'intervention
- Défilement infini de témoignages
- Section FAQ
- Appel à l'action pour les dons

### 👥 À propos (`/apropos`)
- Histoire de l'association
- Valeurs et mission
- Équipe
- Impact et réalisations

### 💸 Dons (`/don`)
- Formulaire de don avec montants prédéfinis
- Options de paiement (carte, virement, chèque)
- Information sur la déductibilité fiscale
- Redirection Stripe pour paiement CB

### 👶 Parrainage (`/parrainage`)
- Présentation du programme de parrainage
- Formulaire avec sélection de pays
- Montant de parrainage mensuel
- Informations personnelles du parrain
- Validation et redirection Stripe

### 💧 Puits (`/puits`)
- Présentation des projets de puits
- **Tchad** - 1000€ par puits
- **Pakistan** - 400€ par puits
- Formulaire avec nom du bénéficiaire (dédicace)
- Galerie de puits réalisés
- FAQ spécifique aux puits

### 📦 Colis (`/colis`)
- Service d'envoi de colis humanitaires
- Informations sur les destinations et tarifs

### 📞 Contact (`/contact`)
- Formulaire de contact
- Coordonnées de l'association
- Carte de localisation

---

## 🧩 Composants Principaux

### Navigation
- **TubelightNavbar** - Barre de navigation avec effet néon
- **FloatingLogo** - Logo fixe en haut à gauche

### Formulaires
- **ParrainageForm** - Formulaire de parrainage avec modal
- **PuitsForm** - Formulaire de financement de puits avec modal
- Autocomplétion d'adresse (API Gouv)
- Validation des champs (email, téléphone, IBAN)
- Intégration Stripe Checkout

### UI/UX
- **ProfessionalHero** - Section hero avec image et overlay
- **CountryCard** - Carte pays avec effet hover 3D
- **ScrollReveal** - Animations au scroll
- **ScrollVelocity** - Défilement infini
- **Globe** - Globe terrestre 3D interactif
- **FAQ** - Section questions fréquentes avec accordéon

### Layout
- **Footer** - Footer avec liens et informations légales

---

## 🔌 API Routes

### `/api/create-checkout-session` (POST)
Crée une session Stripe Checkout

**Body:**
```json
{
  "email": "string",
  "name": "string",
  "amount": number,  // en centimes
  "productName": "string"
}
```

**Response:**
```json
{
  "url": "string"  // URL de redirection Stripe
}
```

---

## 🎨 Thème & Design

### Couleurs principales
```css
--primary: #1e40af (Bleu foncé)
--secondary: #facc15 (Jaune/Or)
--background: #ffffff (Blanc)
--foreground: #1f2937 (Gris foncé)
```

### Typographie
- Font principale: System fonts (San Francisco, Segoe UI, etc.)
- Tailles: de text-xs (0.75rem) à text-5xl (3rem)

### Espacements
- Padding conteneur: `container mx-auto px-4`
- Sections: `py-16` à `py-20`
- Grilles: `gap-4` à `gap-8`

---

## 🚀 Fonctionnalités Clés

### Paiements
- **Stripe Checkout** pour dons et parrainages
- Montants en centimes (ex: 1000€ = 100000)
- Redirection automatique après paiement

### Formulaires
- Validation côté client avec messages d'erreur
- Autocomplétion d'adresse française
- États de chargement avec animations

### Animations
- Révélations au scroll
- Hover effects 3D
- Transitions fluides avec Framer Motion
- Globe terrestre interactif

### Responsive Design
- Mobile-first approach
- Grilles adaptatives (grid-cols-1 md:grid-cols-2)
- Images optimisées avec Next.js Image

---

## 🛠️ Configuration

### Variables d'environnement requises
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
```

### Scripts disponibles
```bash
npm run dev         # Démarre le serveur de développement
npm run build       # Build de production
npm run start       # Démarre le serveur de production
npm run lint        # Vérifie le code avec ESLint
```

---

## 🐛 Problèmes Résolus

### ❌ Problème: Le formulaire de puits ne s'affichait pas
**Cause:** Le composant `<PuitsForm />` était importé mais jamais rendu dans le JSX

**Solution:** Ajouter le composant à la fin du return statement de `/src/app/puits/page.tsx`:
```tsx
<PuitsForm 
    isOpen={isFormOpen}
    onClose={() => setIsFormOpen(false)}
    amount={selectedAmount}
    productName={selectedProduct}
/>
```

---

## 📝 Notes de Développement

### Best Practices
- Utiliser `"use client"` pour les composants avec interactivité
- Optimiser les images avec `next/image`
- Valider les données avant envoi API
- Gérer les erreurs avec try/catch
- Afficher des états de chargement

### Structure de données
- Montants en centimes (int)
- Dates en ISO format
- Emails validés par regex
- Téléphones au format français

### Sécurité
- Validation côté serveur ET client
- Variables d'environnement pour clés API
- HTTPS obligatoire en production
- Pas de clés secrètes côté client

---

## 🔄 Workflow de Contribution

1. Créer une branche feature
2. Développer avec TypeScript strict
3. Tester localement
4. Commit avec messages clairs
5. Pull request avec description détaillée

---

## 📞 Support

Pour toute question sur la structure du projet, consulter:
- **README.md** - Guide de démarrage
- **GUIDE_IMAGES.md** - Guide pour les images
- **build_log.txt** - Logs de build

---

**Dernière mise à jour:** Février 2026  
**Version:** 1.0  
**Maintenu par:** Équipe Dev INOC France
