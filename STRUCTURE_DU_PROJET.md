# Structure du Projet — Innocents France

## Vue d'ensemble

Site web humanitaire Next.js (App Router) pour l'association Innocents France.
Permet les dons, parrainages d'orphelins, financement de puits et envoi de colis alimentaires.

---

## Arborescence des fichiers

```
InocFrance-main/
│
├── public/                              # Fichiers statiques servis directement
│   ├── images/                          # Toutes les images du site (36 fichiers)
│   │   ├── hero-bg.jpg                  # Fond hero accueil
│   │   ├── parrainage-hero.jpg          # Fond hero parrainage
│   │   ├── don-hero.jpg / about-hero.jpg
│   │   ├── maroc.jpg, senegal.jpg, tchad.jpg, soudan.jpg, gaza.jpg, pakistan.jpg
│   │   ├── enfant-parrainé.jpg, enfant-ecole.jpg
│   │   ├── puits-tchad.jpg, puits-pakistan.png
│   │   ├── puit1.jpeg … puit3.jpeg      # Galerie puits
│   │   ├── colisgaza.jpeg, colismaroc.jpg
│   │   ├── colis-distrib-1.jpg … 4.jpg  # Galerie colis
│   │   └── parrainage-home.jpeg, puithome.jpeg, donlibre.webp, colisali.jpg
│   │
│   ├── logo.jpeg                        # Logo association
│   ├── video.mp4                        # Vidéo hero accueil
│   ├── video2.mp4                       # Vidéo page parrainage
│   ├── madebySociQl.png                # Logo agence
│   └── Flyer Innocents France_NEW.pdf  # Flyer imprimable
│
├── src/
│   ├── app/                             # Next.js App Router
│   │   │
│   │   ├── api/                         # Routes API (serveur uniquement)
│   │   │   │
│   │   │   ├── create-checkout-session/
│   │   │   │   └── route.ts             # Crée une session Stripe Checkout
│   │   │   │                            # - Paiement unique : automatic_payment_methods
│   │   │   │                            #   (CB, PayPal, Apple Pay…)
│   │   │   │                            # - Abonnement mensuel : carte uniquement
│   │   │   │                            # - Propage les métadonnées au subscription
│   │   │   │                            #   pour les renouvellements
│   │   │   │
│   │   │   ├── send-email/
│   │   │   │   └── route.ts             # Envoie un email via Brevo (SMTP v3)
│   │   │   │                            # - Supporte les pièces jointes base64
│   │   │   │                            # - Utilisé pour : contact + mandat SEPA
│   │   │   │
│   │   │   └── stripe-webhook/
│   │   │       └── route.ts             # Reçoit les événements Stripe
│   │   │                                # - checkout.session.completed :
│   │   │                                #   email envoyé pour tous les types
│   │   │                                #   (parrainage, puits, don, colis)
│   │   │                                #   inclut méthode de paiement (CB/PayPal)
│   │   │                                # - invoice.payment_succeeded :
│   │   │                                #   email de renouvellement mensuel parrainage
│   │   │
│   │   ├── apropos/page.tsx             # Page À propos (histoire, globe 3D, zones)
│   │   ├── colis/page.tsx               # Page Colis (Gaza urgent + Maroc)
│   │   ├── contact/page.tsx             # Page Contact (formulaire → Brevo)
│   │   ├── don/page.tsx                 # Page Don libre (montant personnalisé)
│   │   ├── parrainage/page.tsx          # Page Parrainage (50€/mois)
│   │   ├── puits/page.tsx               # Page Puits (Tchad + Pakistan)
│   │   │
│   │   ├── layout.tsx                   # Layout racine (NavBar + Footer + FAQ)
│   │   ├── page.tsx                     # Page d'accueil
│   │   ├── not-found.tsx                # Page 404
│   │   ├── globals.css                  # Styles CSS globaux (Tailwind)
│   │   └── favicon.ico
│   │
│   ├── components/
│   │   ├── parrainage-form.tsx          # Modal formulaire parrainage (7 étapes)
│   │   │                                # Étape 1 : coordonnées (autocomplétion adresse)
│   │   │                                # Étape 2 : choix paiement (CB / virement / SEPA)
│   │   │                                # Étape 3 : IBAN + BIC (validation ibantools)
│   │   │                                # Étape 4 : signature électronique (canvas)
│   │   │                                # Étape 5 : affichage RIB association
│   │   │                                # Étape 6 : loader redirection Stripe
│   │   │                                # Étape 7 : prévisualisation PDF mandat SEPA
│   │   │
│   │   ├── puits-form.tsx               # Modal formulaire puits (2 étapes)
│   │   │                                # Étape 1 : coordonnées + nom bénéficiaire
│   │   │                                # Étape 2 : loader redirection Stripe
│   │   │
│   │   ├── faq.tsx                      # Section FAQ (accordéon)
│   │   ├── floating-logo.tsx            # Logo flottant animé
│   │   ├── footer.tsx                   # Footer (liens, réseaux, légal)
│   │   │
│   │   └── ui/                          # Composants UI réutilisables
│   │       ├── accordion.tsx            # Accordéon FAQ
│   │       ├── country-card.tsx         # Carte pays (page accueil)
│   │       ├── globe.tsx                # Globe 3D (cobe.js) — page À propos
│   │       ├── page-not-found.tsx       # Composant 404
│   │       ├── professional-hero.tsx    # Section hero réutilisable
│   │       ├── scroll-reveal.tsx        # Animation au scroll (Framer Motion)
│   │       ├── scroll-velocity.tsx      # Texte défilant infini
│   │       └── tubelight-navbar.tsx     # Barre de navigation (effet néon)
│   │
│   └── lib/
│       └── utils.ts                     # Utilitaire cn() (clsx + tailwind-merge)
│
├── .env.local                           # Variables d'environnement (NON committé)
├── components.json                      # Config shadcn/ui
├── next.config.ts                       # Config Next.js (React Compiler, images)
├── package.json                         # Dépendances npm
├── postcss.config.mjs                   # Config PostCSS (Tailwind v4)
├── tsconfig.json                        # Config TypeScript
├── eslint.config.mjs                    # Config ESLint
├── STRUCTURE_DU_PROJET.md              # Ce fichier
├── GUIDE_IMAGES.md                      # Guide des images requises
└── test-iban.js                         # Script test validation IBAN
```

---

## Technologies

| Catégorie | Technologie | Usage |
|-----------|-------------|-------|
| Framework | Next.js 16 + React 19 | App Router, SSR |
| Langage | TypeScript | Strict mode |
| Style | Tailwind CSS v4 | Classes utilitaires |
| Animations | Framer Motion | Transitions, révélations scroll |
| Paiement | Stripe SDK v20 | Checkout, abonnements, webhooks |
| Email | Brevo SMTP v3 | Emails transactionnels |
| PDF | jsPDF | Génération mandat SEPA |
| Signature | react-signature-canvas | Signature électronique |
| Validation | ibantools | IBAN + BIC |
| Globe 3D | cobe | Visualisation zones d'intervention |
| Icônes | lucide-react | Toutes les icônes |
| Adresses | api-adresse.data.gouv.fr | Autocomplétion adresses FR |

---

## Variables d'environnement (.env.local)

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...   # Clé publique Stripe (client)
STRIPE_SECRET_KEY=sk_live_...                     # Clé secrète Stripe (serveur)
STRIPE_WEBHOOK_SECRET=whsec_...                   # Secret webhook Stripe
BREVO_API_KEY=xkeysib-...                         # Clé API Brevo (emails)
```

---

## Flux de paiement complet

### Parrainage (50€/mois)

```
Utilisateur → /parrainage
  → Ouvre <ParrainageForm> (modal)
  → Étape 1 : Saisit ses coordonnées
  → Étape 2 : Choisit le mode de paiement

  [CB via Stripe]
    → POST /api/create-checkout-session
       mode: "subscription", payment_method_types: ["card"]
       metadata: { formType: "parrainage", formData: {...} }
       subscription_data.metadata: { formType, formData }  ← pour renouvellements
    → Redirection Stripe Checkout
    → Paiement validé → Stripe envoie webhook
    → POST /api/stripe-webhook
       event: checkout.session.completed
       → Récupère méthode paiement (CB brand + last4)
       → Envoie email Brevo à contact@innocentsfrance.org

  [Renouvellement mensuel automatique]
    → Stripe envoie webhook invoice.payment_succeeded
       billing_reason: "subscription_cycle"
    → Récupère formData depuis subscription.metadata
    → Envoie email de renouvellement à contact@innocentsfrance.org

  [Virement bancaire]
    → Affiche le RIB de l'association (FR74 2004 1010 1239 1969 0Y03 319)
    → Aucun email automatique (manuel)

  [Prélèvement SEPA]
    → Saisit IBAN + BIC (validés par ibantools)
    → Signe électroniquement (canvas)
    → Génère PDF mandat SEPA (jsPDF) avec signature
    → POST /api/send-email avec PDF en pièce jointe base64
    → Email envoyé à contact@innocentsfrance.org
```

### Puits (paiement unique)

```
Utilisateur → /puits
  → Ouvre <PuitsForm> (modal)
  → Saisit coordonnées + nom bénéficiaire (plaque)
  → POST /api/create-checkout-session
     mode: "payment", automatic_payment_methods: { enabled: true }
     (accepte CB, PayPal, Apple Pay…)
     formType: "puits", formData: { beneficiaire, ... }
  → Redirection Stripe Checkout
  → Paiement validé → webhook → email Brevo avec :
     - Nom du bénéficiaire (plaque)
     - Méthode de paiement utilisée (CB, PayPal…)
     - Lien direct dashboard Stripe
```

### Don libre

```
Utilisateur → /don
  → Saisit le montant
  → POST /api/create-checkout-session
     mode: "payment", automatic_payment_methods: { enabled: true }
  → Redirection Stripe → webhook → email Brevo
```

### Colis alimentaires

```
Même flux que Puits (paiement unique Stripe, webhook → email)
```

### Contact

```
Utilisateur → /contact
  → Remplit le formulaire (nom, email, sujet, message)
  → POST /api/send-email
  → Email envoyé directement à contact@innocentsfrance.org via Brevo
```

---

## Webhook Stripe — Configuration requise

Pour que les emails fonctionnent après un paiement Stripe :

1. **En développement** — lancer en parallèle :
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```

2. **En production (Vercel)** — dans le dashboard Stripe :
   - Aller dans Développeurs → Webhooks → Ajouter un endpoint
   - URL : `https://votre-domaine.com/api/stripe-webhook`
   - Événements à écouter :
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
   - Copier le **Signing secret** (`whsec_...`) dans `STRIPE_WEBHOOK_SECRET`

3. **PayPal via Stripe** — dans le dashboard Stripe :
   - Aller dans Paramètres → Méthodes de paiement
   - Activer PayPal
   - Automatiquement disponible pour tous les paiements uniques (puits, don, colis)
   - Non disponible pour les abonnements (limitation Stripe)

---

## Emails envoyés

| Déclencheur | Sujet | Contenu |
|-------------|-------|---------|
| Paiement Stripe validé (don/puits/colis) | `[PUITS] Paiement validé — Prénom Nom` | Montant, méthode, coordonnées, lien Stripe |
| Parrainage CB initial | `[PARRAINAGE] Paiement validé — Prénom Nom` | Montant, méthode, coordonnées, lien Stripe |
| Renouvellement parrainage | `[PARRAINAGE] Renouvellement mensuel — Prénom Nom` | Montant prélevé, coordonnées parrain |
| Mandat SEPA signé | `[PARRAINAGE SEPA] Nouveau mandat — Prénom Nom` | Tableau infos + PDF mandat en pièce jointe |
| Formulaire contact | Sujet saisi par l'utilisateur | Nom, email, sujet, message |

Tous les emails sont envoyés de `association@innocentsfrance.org` vers `contact@innocentsfrance.org`.
