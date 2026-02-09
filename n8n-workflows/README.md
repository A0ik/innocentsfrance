# Guide d'Importation des Workflows N8N

## Étapes pour importer les workflows dans votre instance N8N

### 1. Connectez-vous à N8N
Ouvrez votre navigateur et allez sur `http://51.210.247.53:5678`

### 2. Importez chaque workflow

Pour chaque fichier JSON dans ce dossier :

#### Workflow Parrainage (`workflow-parrainage.json`)
1. Dans N8N, cliquez sur le bouton **"+"** pour créer un nouveau workflow
2. Cliquez sur les **trois points** (⋮) en haut à droite
3. Sélectionnez **"Import from File"**
4. Choisissez `workflow-parrainage.json`
5. Le workflow sera importé avec tous les nœuds configurés

#### Workflow Puits (`workflow-puits.json`)
Répétez les mêmes étapes avec `workflow-puits.json`

#### Workflow Contact (`workflow-contact.json`)
Répétez les mêmes étapes avec `workflow-contact.json`

### 3. Configuration des workflows

Pour chaque workflow importé :

#### A. Configurer Google Sheets (optionnel)
Si vous souhaitez enregistrer les données dans Google Sheets :
1. Cliquez sur le nœud **"Enregistrer dans Google Sheets"**
2. Connectez votre compte Google
3. Sélectionnez votre feuille de calcul
4. Vérifiez que les colonnes correspondent

**Si vous ne voulez pas utiliser Google Sheets**, vous pouvez :
- Supprimer ce nœud
- Ou le remplacer par un autre système de stockage (Airtable, base de données, etc.)

#### B. Configurer les Emails
Pour chaque nœud d'email :
1. Cliquez sur le nœud email
2. Configurez votre service d'envoi d'emails :
   - **SMTP** : Gmail, Outlook, etc.
   - **SendGrid**
   - **Mailgun**
   - Ou tout autre service supporté par N8N

3. Remplacez les adresses email :
   - `noreply@innocentsfrance.org` → votre adresse d'envoi
   - `contact@innocentsfrance.org` → votre adresse de réception

#### C. Activer les workflows
1. Une fois configuré, cliquez sur le bouton **"Active"** en haut à droite
2. Le workflow est maintenant actif et prêt à recevoir des webhooks

### 4. Récupérer les URLs des webhooks

Pour chaque workflow :
1. Cliquez sur le nœud **"Webhook"** (premier nœud)
2. Copiez l'URL du webhook affichée
3. Vérifiez que les URLs correspondent :
   - Parrainage : `http://51.210.247.53:5678/webhook/parrainage`
   - Puits : `http://51.210.247.53:5678/webhook/puits-stripe`
   - Contact : `http://51.210.247.53:5678/webhook/contact`

### 5. Tester les workflows

Vous pouvez tester chaque workflow avec `curl` ou Postman :

```bash
# Test Contact
curl -X POST http://51.210.247.53:5678/webhook/contact \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "email": "test@example.com",
    "sujet": "Test",
    "message": "Message de test"
  }'

# Test Parrainage
curl -X POST http://51.210.247.53:5678/webhook/parrainage \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean@example.com",
    "telephone": "0612345678",
    "adresse": "123 Rue Test",
    "codePostal": "75001",
    "ville": "Paris",
    "paysParrainage": "Tchad",
    "donorIban": "FR7630006000011234567890189",
    "donorBic": "BNPAFRPPXXX"
  }'
```

### 6. Personnalisation

Vous pouvez personnaliser les workflows selon vos besoins :
- Ajouter des nœuds de notification (Slack, Discord, etc.)
- Modifier les templates d'emails
- Ajouter des conditions de validation
- Intégrer d'autres services (CRM, etc.)

## Notes Importantes

- **Google Sheets** : Vous devez créer les feuilles de calcul avant d'importer les workflows
- **Emails** : Configurez un service d'envoi d'emails fiable pour éviter que vos emails finissent en spam
- **Sécurité** : Les webhooks sont publics. Considérez ajouter une authentification si nécessaire
- **Logs** : N8N garde un historique des exécutions pour déboguer

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs d'exécution dans N8N
2. Testez chaque nœud individuellement
3. Vérifiez que tous les services (Google, Email) sont bien connectés
