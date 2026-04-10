# Google Maps Grid — PCF pour Dynamics 365

**Vos enregistrements sont dans un tableau.**
**Ils devraient être sur une carte.**

![Comptes Comptes actifs (Map) - Dynamics 365 et 6 pages de plus - Travail  Microsoft Edge](https://github.com/user-attachments/assets/638df0c8-15cf-4690-852a-6a14aa7481f9)

Google Maps Grid transforme n'importe quelle vue Dynamics 365 en carte Google Maps interactive. Comptes, contacts, leads, entités custom — si vous avez une latitude et une longitude, vous avez une carte.

> Édité par **Frédérick GROBOST** — Consultant Dynamics 365 CE
> [partnr365.fr](https://partnr365.fr) | [LinkedIn](https://www.linkedin.com/in/frederickgrobost/) | contact@partnr365.fr

---

## Ce que fait ce PCF

**Affichage carte**
- Enregistrements affichés en markers sur Google Maps
- Auto-centrage et auto-zoom sur l'ensemble des points
- Clustering automatique quand les markers sont proches
- Fonctionne sur toute entité (Account, Contact, Lead, custom)

**13 shapes de markers**
- Choisissez la forme de vos markers : `pin`, `diamond`, `circle`, `square`, `star`, `store`, `building`, `person`, `question`, `target`, `distributor`, `truck`, `wrench`

**Mapping shape + couleur par valeur optionset**
- Associez une shape et une couleur à chaque valeur d'un optionset via un JSON de configuration
- Mode mixte : shape pilotée par un optionset, couleur pilotée par un autre

**Filtrage dynamique**
- Barre de recherche temps réel (cherche dans toutes les colonnes de la vue)
- Filtres auto-générés pour chaque colonne optionset de votre vue
- Optionsets simples : liste déroulante
- Optionsets à choix multiples : cases à cocher avec "Tout sélectionner"
- Filtres lookup : liste déroulante sur les champs de relation
- Zéro configuration : ajoutez une colonne à la vue, le filtre apparaît

**Couleurs intelligentes**
- Colorez vos markers selon un champ optionset (ex : type de client)
- Couleurs récupérées directement depuis Dynamics 365

**Info-window au clic**
- Cliquez sur un marker : les colonnes de votre vue s'affichent
- Lien direct vers la fiche Dynamics 365

**Robustesse**
- Format décimal français (virgule) et anglais (point) gérés automatiquement
- Enregistrements sans coordonnées ignorés silencieusement
- Chargement automatique, pas besoin de cliquer sur "Actualiser"
- Jusqu'à 5 000 enregistrements par vue (pagination automatique)

---

## Contenu du package

```
GoogleMapsGrid_PARTNR365/
├── GoogleMapGridSolution_managed.zip   <- À importer dans Dynamics 365
├── README.md                           <- Ce fichier
└── Guide_Cle_API_Google_Maps.pdf       <- Comment créer votre clé Google Maps
```

---

## Prérequis

1. **Dynamics 365 CE** (Sales, Service, ou Custom) — Model-Driven App
2. **Clé API Google Maps** avec l'API Maps JavaScript activée
   - Suivez le guide PDF fourni (5 étapes, 10 minutes)
   - Google offre 200 $/mois de crédit gratuit — largement suffisant pour une PME
3. **Champs latitude/longitude** renseignés sur vos enregistrements
   - Champs natifs : `address1_latitude` / `address1_longitude`
   - Ou champs personnalisés

---

## Installation (5 minutes)

### Étape 1 — Importer la solution

1. Allez dans **make.powerapps.com** > **Solutions**
2. Cliquez sur **Importer**
3. Sélectionnez `GoogleMapGridSolution_managed.zip`
4. Cliquez sur **Suivant** > **Importer**

### Étape 2 — Préparer votre vue

1. Ouvrez la table cible (ex : Comptes)
2. Créez ou modifiez une vue
3. Ajoutez les colonnes :
   - **Latitude** et **Longitude** (obligatoires)
   - **Nom** (obligatoire, affiché dans l'info-window)
   - Toute autre colonne utile (ville, téléphone, type de client…)
   - Les colonnes optionset et lookup deviennent automatiquement des filtres

![0 Create view with mandatory columns and specific ones](https://github.com/user-attachments/assets/17fe23c2-621e-46cb-a147-cede96fe0a1b)

4. Enregistrez et publiez la vue

### Étape 3 — Activer le contrôle

1. Ouvrez la vue
2. Allez dans **Contrôles** > **Ajouter un contrôle**

![1 In View Open Components](https://github.com/user-attachments/assets/bafd5f4b-6a57-42de-ab23-a721b2aa59b8)
![2  Add a componant](https://github.com/user-attachments/assets/b9e89f48-6655-4dd7-830b-6072a645b97d)
![3  Get More Components](https://github.com/user-attachments/assets/b7382ef8-0f54-4318-a4d0-00c4775b8fdb)

3. Sélectionnez **Google Maps Grid**

![4  Google Maps](https://github.com/user-attachments/assets/df6393f1-1c9c-486c-8e6b-77c8b1139c2a)

4. Activez-le pour **Web**
5. Configurez les propriétés :

![5  Fill data](https://github.com/user-attachments/assets/79d1fe14-bf3e-43b1-ab31-e3c69669ef80)

| Propriété | Description | Obligatoire |
|-----------|-------------|-------------|
| Google Maps API Key | Votre clé API Google Maps | Oui |
| Latitude Field | Nom logique du champ latitude (ex : `address1_latitude`) | Oui |
| Longitude Field | Nom logique du champ longitude (ex : `address1_longitude`) | Oui |
| Title Field | Nom logique du champ titre (ex : `name`) | Oui |
| Primary Marker Shape | Shape des markers (défaut : `pin`) | Non |
| Marker Style Mapping (JSON) | JSON pour mapper les valeurs optionset à un shape et une couleur | Non |
| Color Option Set Field | Champ optionset pour colorier les markers (ex : `customertypecode`) | Non |
| Map Height (px) | Hauteur de la carte en pixels (défaut : `500`, `0` = automatique) | Non |

6. Enregistrez et publiez.

---

## Configuration avancée

### Shapes de markers disponibles

| Shape | Description |
|-------|-------------|
| `pin` | Épingle classique (défaut) |
| `diamond` | Losange |
| `circle` | Cercle |
| `square` | Carré |
| `star` | Étoile |
| `store` | Magasin |
| `building` | Bâtiment |
| `person` | Personne |
| `question` | Point d'interrogation |
| `target` | Cible |
| `distributor` | Diable/transpalette |
| `truck` | Camion |
| `wrench` | Clé à molette |

### Marker Style Mapping (JSON)

Associez une shape et une couleur à chaque valeur d'un optionset :

```json
{
  "fieldName": "customertypecode",
  "mappings": [
    { "value": 1, "shape": "star",     "color": "#E53935", "label": "Client clé" },
    { "value": 2, "shape": "circle",   "color": "#1E88E5", "label": "Prospect" },
    { "value": 3, "shape": "building", "color": "#43A047", "label": "Partenaire" }
  ],
  "default": { "shape": "pin", "color": "#9E9E9E" }
}
```

---

## Utilisation sur un formulaire (sous-grille)

Le PCF fonctionne aussi sur une sous-grille dans un formulaire :

1. Ajoutez une sous-grille sur le formulaire
2. Pointez-la vers une vue contenant lat/lng
3. Ajoutez le contrôle Google Maps Grid sur la sous-grille
4. Même configuration que sur une vue

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Carte ne s'affiche pas | Vérifiez votre clé API Google Maps |
| Carte grise | Ajoutez `*.dynamics.com/*` dans les restrictions de votre clé API |
| Pas de markers | Vérifiez que vos enregistrements ont des coordonnées renseignées |
| Markers mal placés | Vérifiez le format des coordonnées (FR virgule et EN point sont gérés) |
| Pas de filtres | Ajoutez des colonnes optionset ou lookup à votre vue |
| Couleurs identiques | Configurez les couleurs dans la personnalisation de l'optionset Dynamics 365 |

---

## Fonctionnalités avancées

Vous avez besoin de superposer plusieurs entités sur la même carte (comptes + contacts + leads), d'un cercle de rayon au clic, ou d'autres fonctionnalités terrain ?

Ces fonctionnalités sont disponibles dans **Google Maps Grid Premium** par PARTNR.365.

👉 [partnr365.fr](https://partnr365.fr) | contact@partnr365.fr

---

## Besoin d'aide ?

Ce PCF est fourni gratuitement.

Si vous avez besoin d'accompagnement pour :
- L'implémentation de Dynamics 365 CE
- La configuration avancée de vos vues et formulaires
- Le géocodage de vos adresses (remplir automatiquement les lat/lng)
- Des développements PCF sur mesure

**Contactez-moi**

- Web : [partnr365.fr](https://partnr365.fr)
- Email : contact@partnr365.fr
- LinkedIn : [Frédérick Grobost](https://www.linkedin.com/in/frederickgrobost/)

---

## Informations techniques

| Élément | Valeur |
|---------|--------|
| Éditeur | PARTNR.365 |
| Version | 3.0.14 |
| Nom du contrôle | Google Maps Grid |
| Type | Dataset (vue / sous-grille) |
| Framework | React, Google Maps JavaScript API |
| Compatibilité | Model-Driven Apps (Dynamics 365 CE) |
| Licence | MIT |

---

*PARTNR.365 — L'humain et le process avant l'outil.*
