# Architecture du projet WildCards

## Vue d'ensemble

Ce projet utilise une **architecture en dossiers par domaine** (Domain-Driven Design). Chaque fonctionnalité est organisée avec son code JavaScript et ses styles CSS associés.

## Structure des dossiers

```
src/
├── core/                       # Logique métier centrale
│   ├── constants.js           # Constantes globales
│   └── AppState.js            # État de l'application
│
├── services/                   # Services transversaux
│   ├── StorageService.js      # Gestion du localStorage
│   ├── DataService.js         # Chargement des données
│   └── ModalService.js        # Gestion des modales
│
├── components/                 # Composants fonctionnels
│   ├── cards/                 # Gestion des cartes
│   │   ├── CardService.js    # Logique des cartes
│   │   └── cards.css         # Styles des cartes
│   │
│   ├── ui/                    # Interface utilisateur
│   │   ├── UIService.js      # Mise à jour UI
│   │   └── ui.css            # Styles UI (stats, loading, etc.)
│   │
│   ├── filters/               # Filtres et recherche
│   │   ├── FilterService.js  # Logique de filtrage
│   │   └── filters.css       # Styles des filtres
│   │
│   └── render/                # Rendu des composants
│       └── RenderService.js  # Logique de rendu
│
├── styles/                     # Styles globaux et layout
│   ├── base/                  # Styles de base
│   │   ├── variables.css     # Variables CSS et thèmes
│   │   ├── base.css          # Reset CSS et body
│   │   ├── animations.css    # Keyframes
│   │   └── utilities.css     # Classes utilitaires
│   │
│   ├── layout/                # Disposition
│   │   ├── header.css        # En-tête
│   │   └── responsive.css    # Media queries
│   │
│   ├── components/            # Composants globaux
│   │   ├── modal.css         # Modales
│   │   ├── theme-toggle.css  # Changement de thème
│   │   └── fab.css           # Floating Action Button
│   │
│   └── main.css               # Point d'entrée CSS
│
├── WildCardsApp.js             # Classe principale
└── app.js                      # Point d'entrée JS
```

## Principes d'organisation

### 1. Séparation par domaine
Chaque fonctionnalité (cartes, filtres, UI) a son propre dossier avec :
- Son service JavaScript
- Ses styles CSS spécifiques

### 2. Dépendances claires
```javascript
// Les imports montrent explicitement les dépendances
import { CardService } from "./components/cards/CardService.js";
import { STORAGE_KEY } from "./core/constants.js";
```

### 3. Styles colocalisés
```
components/
  cards/
    CardService.js    ← Logique
    cards.css         ← Styles associés
```

### 4. Hiérarchie claire
```
core/        → Logique métier fondamentale
services/    → Services réutilisables
components/  → Fonctionnalités spécifiques
styles/      → Styles globaux
```

## Flux de données

```
index.html
    ↓
app.js (point d'entrée)
    ↓
WildCardsApp (orchestrateur)
    ↓
    ├→ AppState (état)
    ├→ Services (storage, data, modal)
    └→ Components
         ├→ CardService
         ├→ UIService
         ├→ FilterService
         └→ RenderService
```

## Avantages de cette architecture

### ✅ Maintenabilité
- Facile de trouver le code d'une fonctionnalité
- Un dossier = une fonctionnalité complète

### ✅ Scalabilité
- Ajout facile de nouvelles fonctionnalités
- Pas de pollution du namespace global

### ✅ Testabilité
- Services isolés et testables unitairement
- Dépendances explicites via injection

### ✅ Compréhension
- Structure intuitive qui reflète les fonctionnalités
- Couplage faible entre les modules

### ✅ Réutilisabilité
- Services indépendants et réutilisables
- Composants découplés

## Comment ajouter une nouvelle fonctionnalité ?

### Exemple : Ajouter un système de tags

1. **Créer le dossier du composant**
```bash
mkdir -p src/components/tags
```

2. **Créer le service**
```javascript
// src/components/tags/TagService.js
export class TagService {
    constructor(appState) {
        this.appState = appState;
    }

    // Votre logique ici
}
```

3. **Créer les styles**
```css
/* src/components/tags/tags.css */
.tag {
    /* Vos styles ici */
}
```

4. **Importer dans main.css**
```css
@import url('../components/tags/tags.css');
```

5. **Utiliser dans WildCardsApp**
```javascript
import { TagService } from "./components/tags/TagService.js";

constructor() {
    // ...
    this.tagService = new TagService(this.appState);
}
```

## Migration depuis l'ancienne structure

### Avant
```
js/
  ├── constants.js
  ├── AppState.js
  ├── CardService.js
  └── ... (tous mélangés)

css/
  ├── variables.css
  ├── cards.css
  └── ... (tous mélangés)
```

### Après
```
src/
  ├── core/ (logique centrale)
  ├── services/ (services transversaux)
  ├── components/ (par fonctionnalité, JS + CSS)
  └── styles/ (styles globaux)
```

## Prochaines évolutions possibles

1. **TypeScript** pour le typage statique
2. **Tests unitaires** (Jest, Vitest)
3. **Build system** (Vite, Webpack)
4. **CSS Modules** pour l'encapsulation
5. **Web Components** pour plus d'isolation
6. **State management** (Redux, Zustand)
