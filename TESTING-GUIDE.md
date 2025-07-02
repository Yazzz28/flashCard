# 🧪 Guide des Tests - WildCards

## Vue d'ensemble

Ce projet utilise une stratégie de test complète avec trois niveaux :

- **Tests unitaires** : Jest + @testing-library/dom
- **Tests d'intégration** : Jest avec simulation DOM
- **Tests E2E** : Playwright

## 📁 Structure des tests

```
tests/
├── unit/                   # Tests unitaires
│   ├── config.test.js     # Tests des constantes et configuration
│   ├── utils.test.js      # Tests des utilitaires
│   └── app-state.test.js  # Tests de l'état de l'application
├── integration/           # Tests d'intégration
│   ├── app.test.js       # Tests de l'application complète
│   └── persistence.test.js # Tests de persistance des données
├── e2e/                   # Tests end-to-end
│   └── wildcards.spec.js # Tests E2E complets
├── fixtures/              # Données de test
│   └── sample-data.json  # Données d'exemple
└── helpers/               # Utilitaires de test
    ├── setup.js          # Configuration Jest
    └── dom-helpers.js    # Helpers pour les tests DOM
```

## 🛠️ Configuration

### Jest (Tests unitaires et d'intégration)

- Environnement jsdom pour simulation navigateur
- Support modules ES6 avec Babel
- Couverture de code automatique
- Mocks pour localStorage et fetch

### Playwright (Tests E2E)

- Tests multi-navigateurs (Chrome, Firefox, Safari)
- Tests mobile (responsive)
- Captures d'écran en cas d'échec
- Serveur automatique pour les tests

## 🚀 Commands disponibles

```bash
# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration

# Tests E2E
npm run test:e2e
npm run test:e2e-ui          # Interface graphique

# Tests avec surveillance
npm run test:watch

# Couverture de code
npm run test:coverage

# Tous les tests
npm run test:all

# Validation complète
npm run validate
```

## 📊 Couverture de code

### Objectifs de couverture

- **Branches** : 80%
- **Fonctions** : 80%
- **Lignes** : 80%
- **Déclarations** : 80%

### Rapport de couverture

```bash
npm run test:coverage
# Ouvre coverage/lcov-report/index.html dans le navigateur
```

## 🧪 Types de tests

### 1. Tests unitaires

#### StorageUtils (`tests/unit/utils.test.js`)

- ✅ Sauvegarde en localStorage
- ✅ Chargement depuis localStorage
- ✅ Suppression de données
- ✅ Gestion des erreurs
- ✅ Vérification de disponibilité

#### Config (`tests/unit/config.test.js`)

- ✅ Validation des constantes
- ✅ Structure des boutons de catégorie
- ✅ Configuration par défaut
- ✅ Délais d'animation

#### AppState (`tests/unit/app-state.test.js`)

- ✅ Initialisation
- ✅ Réinitialisation
- ✅ Changement de formation
- ✅ Changement de catégorie

### 2. Tests d'intégration

#### Application complète (`tests/integration/app.test.js`)

- ✅ Initialisation et chargement
- ✅ Interactions avec les cartes
- ✅ Filtrage par formation/catégorie
- ✅ Recherche en temps réel
- ✅ Réinitialisation des cartes
- ✅ Basculement de thème

#### Persistance (`tests/integration/persistence.test.js`)

- ✅ Sauvegarde des cartes révélées
- ✅ Restauration depuis localStorage
- ✅ Gestion des erreurs de stockage
- ✅ Performance avec gros volumes

### 3. Tests E2E

#### Interface utilisateur (`tests/e2e/wildcards.spec.js`)

- ✅ Chargement de l'application
- ✅ Affichage des cartes
- ✅ Révélation des réponses
- ✅ Filtrage et recherche
- ✅ Statistiques en temps réel
- ✅ Fonctions révéler tout/reset
- ✅ Thème clair/sombre
- ✅ Responsive mobile
- ✅ Navigation clavier
- ✅ Persistance des données

## 🎯 Stratégie de test

### Pyramid de tests

```
       E2E Tests
     (User flows)

   Integration Tests
  (Component interaction)

    Unit Tests
 (Individual functions)
```

### Couverture par type

- **Unitaires** : Logique métier, utilitaires, état
- **Intégration** : Interactions composants, DOM, stockage
- **E2E** : Parcours utilisateur, workflows complets

## 🔧 Mocks et stubs

### Globals mocks (setup.js)

```javascript
// localStorage simulation
global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};

// fetch simulation
global.fetch = jest.fn();

// Console silencieux en tests
console.error = jest.fn();
```

### Helpers de test

```javascript
// Création DOM de test
createMockDOM();

// Simulation de données
mockFetchSuccess(data);
mockFetchError(error);

// Interaction avec cartes
createTestCard(question, answer);
simulateCardClick(card);
```

## 📈 Métriques et rapports

### Exécution des tests

- **Temps d'exécution** : < 30 secondes pour la suite complète
- **Parallélisation** : Tests unitaires et intégration en parallèle
- **Retry** : 2 tentatives en cas d'échec en CI

### Rapports générés

- **Jest** : Rapport texte + HTML de couverture
- **Playwright** : Rapport HTML avec captures d'écran
- **CI/CD** : Intégration dans GitHub Actions

## 🚨 Debugging des tests

### Tests qui échouent

```bash
# Mode verbose pour plus de détails
npm run test:unit -- --verbose

# Tests spécifiques
npm run test:unit -- --testNamePattern="StorageUtils"

# Mode debug
npm run test:unit -- --detectOpenHandles
```

### Tests E2E qui échouent

```bash
# Mode headed (voir le navigateur)
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Traces et captures
npx playwright show-report
```

## ✅ Bonnes pratiques

### Tests unitaires

- Un test = une responsabilité
- Arrange-Act-Assert pattern
- Noms descriptifs explicites
- Isolation complète (mocks)

### Tests d'intégration

- Scénarios réalistes
- État initial propre
- Vérification des effets de bord
- Performance et timeout

### Tests E2E

- Parcours utilisateur complets
- Attente explicite (waitFor)
- Sélecteurs stables
- Données de test cohérentes

---

**🎯 L'objectif est d'avoir une couverture de test complète garantissant la fiabilité et la maintenabilité de l'application WildCards.**
