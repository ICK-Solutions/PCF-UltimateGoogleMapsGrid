# Google Maps Grid — PCF pour Dynamics 365

**Vos enregistrements sont dans un tableau.**
**Ils devraient etre sur une carte.**

Google Maps Grid transforme n'importe quelle vue Dynamics 365 en carte Google Maps interactive. Comptes, contacts, leads, entites custom — si vous avez une latitude et une longitude, vous avez une carte.

> Edité par **Frédérick GROBOST** — Consultant Dynamics 365 CE
> [partnr365.fr](https://partnr365.fr) | https://www.linkedin.com/in/frederickgrobost/ | contact@partnr365.fr

---

## Ce que fait ce PCF

**Affichage carte**
- Vos enregistrements affiches en markers sur Google Maps
- Auto-centrage et auto-zoom sur l'ensemble des points
- Clustering automatique quand il y a beaucoup de markers proches
- Fonctionne sur toute entite (Account, Contact, Lead, custom)

**Filtrage dynamique**
- Barre de recherche temps reel (cherche dans toutes les colonnes de la vue)
- Filtres auto-generes pour chaque colonne optionset de votre vue
- Optionsets simples : liste deroulante
- Optionsets a choix multiples : cases a cocher avec "Tout selectionner"
- Zero configuration : ajoutez une colonne optionset à la vue, le filtre apparait

**Couleurs intelligentes**
- Colorez vos markers selon un champ optionset (ex: type de client)
- Les couleurs sont récuperées directement depuis Dynamics 365

**Info-window au clic**
- Cliquez sur un marker : les colonnes de votre vue s'affichent
- Lien direct vers la fiche D365

**Robustesse**
- Format decimal francais (virgule) et anglais (point) géres automatiquement
- Enregistrements sans coordonnees ignores silencieusement
- Chargement automatique, pas besoin de cliquer sur "Actualiser"
- Jusqu'a 5 000 enregistrements par vue

---

## Contenu du package

```
GoogleMapsGrid_PARTNR365/
├── GoogleMapGridSolution_managed.zip   <- A importer dans Dynamics 365
├── README.md                           <- Ce fichier
└── Guide_Cle_API_Google_Maps.pdf       <- Comment creer votre cle Google Maps
```

---

## Prerequis

1. **Dynamics 365 CE** (Sales, Service, ou Custom) — Model-Driven App
2. **Cle API Google Maps** avec l'API Maps JavaScript activee
   - Suivez le PDF fourni (5 etapes, 10 minutes)
   - Google offre 200$/mois de credit gratuit — largement suffisant pour une PME
3. **Champs latitude/longitude** renseignes sur vos enregistrements
   - Champs natifs : `address1_latitude` / `address1_longitude`
   - Ou champs personnalises

---

## Installation (5 minutes)

### Etape 1 — Importer la solution

1. Allez dans **make.powerapps.com** > **Solutions**
2. Cliquez sur **Importer**
3. Selectionnez `GoogleMapGridSolution_managed.zip`
4. Cliquez sur **Suivant** > **Importer**

### Etape 2 — Preparer votre vue

1. Ouvrez la table cible (ex: Comptes)
2. Creez ou modifiez une vue
3. Ajoutez les colonnes :
   - **Latitude** et **Longitude** (obligatoires pour le positionnement)
   - **Nom** (obligatoire, affiche dans l'info-window)
   - Toute autre colonne utile (ville, telephone, type de client...)
   - Les colonnes optionset deviennent automatiquement des filtres
4. Enregistrez et publiez la vue

### Etape 3 — Activer le controle

1. Ouvrez la vue
2. Allez dans **Controles** > **Ajouter un controle**
3. Selectionnez **Google Maps Grid**
4. Activez-le pour **Web**
5. Configurez les proprietes :

| Propriete | Valeur | Obligatoire |
|-----------|--------|-------------|
| Google Maps API Key | Votre cle API | Oui |
| Champ Latitude | `address1_latitude` | Oui |
| Champ Longitude | `address1_longitude` | Oui |
| Champ Titre | `name` | Oui |
| Champ OptionSet Couleur | ex: `customertypecode` | Non |
| Hauteur carte (px) | `0` | Non |

6. Enregistrez et publiez. C'est pret.

---

## Depannage

| Probleme | Solution |
|----------|----------|
| Carte ne s'affiche pas | Verifiez votre cle API Google Maps |
| Pas de markers | Verifiez que vos enregistrements ont des coordonnees |
| Markers mal places | Verifiez le format des coordonnees (le PCF gere FR et EN) |
| Carte grise | Ajoutez `*.dynamics.com/*` dans les restrictions de votre cle API |
| Pas de filtres | Ajoutez des colonnes optionset a votre vue |
| Couleurs identiques | Configurez les couleurs dans la personnalisation de l'optionset D365 |

---

## Besoin d'aide ?

Ce PCF est fourni gratuitement.

Si vous avez besoin d'accompagnement pour :
- L'implementation de Dynamics 365 CE
- La configuration avancee de vos vues et formulaires
- Le geocodage de vos adresses (remplir automatiquement les lat/lng)
- Des developpements PCF sur mesure

**Contactez moi **

- Web : [partnr365.fr](https://partnr365.fr)
- Email : contact@partnr365.fr
- LinkedIn : [Frederick Grobost](https://www.linkedin.com/in/frederickgrobost/)

---

## Informations techniques

| Element | Valeur |
|---------|--------|
| Editeur | PARTNR.365 |
| Nom du controle | Google Maps Grid |
| Type | Dataset (vue / sous-grille) |
| Framework | React, Google Maps JavaScript API |
| Compatibilite | Model-Driven Apps (Dynamics 365 CE) |
| Licence | MIT |

