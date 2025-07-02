# 🎓 WildCards - Application de révision

Une application web moderne de fiches de révision pour les formations **CDA** (Concepteur Développeur d'Applications) et **DWWM** (Développeur Web et Web Mobile) de la Wild Code School.

## ✨ Fonctionnalités

- 📚 **Fiches de révision interactives** avec révélation progressive des réponses
- 🔍 **Recherche en temps réel** avec debounce pour optimiser les performances
- 🏷️ **Filtrage par formation** (CDA/DWWM) et par catégorie technique
- 🌓 **Thème clair/sombre** avec persistance des préférences
- 📊 **Suivi de progression** avec statistiques en temps réel
- ♿ **Accessibilité complète** conforme aux standards WCAG
- 📱 **Design responsive** adapté à tous les appareils
- 💾 **Sauvegarde locale** de la progression utilisateur

## 🚀 Technologies utilisées

- **HTML5** : Structure sémantique avec éléments accessibles
- **CSS3** : Variables CSS, Grid, Flexbox, animations optimisées
- **JavaScript ES6+** : Classes, modules, async/await, architecture modulaire
- **Local Storage** : Persistance des données côté client

## 📁 Structure du projet

```
WildCards/
├── index.html              # Structure HTML principale
├── styles.css              # Styles CSS avec architecture BEM
├── script.js               # Logique JavaScript modulaire
├── data.json               # Base de données des questions/réponses
├── CSS-ARCHITECTURE.md     # Documentation de l'architecture CSS
└── .github/
    └── instructions/
        └── copilote.instructions.md  # Guidelines de développement
```

## 🎨 Architecture CSS

L'application suit une architecture CSS moderne avec :

- **Variables CSS** pour la cohérence des couleurs et espacements
- **Méthodologie BEM** pour une structure claire et maintenable
- **Approche Mobile-First** pour un design responsive optimal
- **Animations performantes** utilisant `transform` et `opacity`
- **Support des thèmes** clair/sombre
- **Accessibilité** avec support des préférences utilisateur

Consultez [CSS-ARCHITECTURE.md](./CSS-ARCHITECTURE.md) pour plus de détails.

## 💻 Installation et utilisation

### Prérequis

- Navigateur moderne supportant ES6+
- Serveur HTTP local (pour le développement)

### Lancement

1. **Cloner le projet**

    ```bash
    git clone [url-du-repo]
    cd WildCards
    ```

2. **Lancer un serveur local**

    ```bash
    # Avec Python
    python -m http.server 8000

    # Avec Node.js
    npx serve .

    # Avec PHP
    php -S localhost:8000
    ```

3. **Accéder à l'application**
   Ouvrir http://localhost:8000 dans votre navigateur

## ♿ Accessibilité

L'application respecte les standards d'accessibilité :

- **Navigation clavier** complète
- **Lecteurs d'écran** supportés avec ARIA appropriés
- **Contrastes** conformes WCAG 2.1 AA
- **Préférences utilisateur** respectées (mouvements réduits, contraste élevé)
- **Structure sémantique** HTML5
- **Focus management** pour la navigation

## 🎯 Fonctionnalités techniques

### Système de cartes

- Révélation progressive avec animations fluides
- États visuels distincts (masqué/révélé)
- Tracking automatique de la progression
- Sauvegarde locale de l'état

### Filtres et recherche

- Recherche textuelle avec debounce (300ms)
- Filtrage par formation et catégorie
- Combinaison de filtres en temps réel
- Performance optimisée pour de gros volumes

### Gestion d'état

- Architecture modulaire avec services dédiés
- Persistance localStorage pour les préférences
- Gestion d'erreurs robuste
- État centralisé et réactif

### Performance

- Lazy loading des images
- Debounce pour la recherche
- Animations CSS optimisées
- Minification en production

## 🔧 Développement

### Structure du code JavaScript

```javascript
// Services principaux
class AppState          // Gestion de l'état global
class StorageService    // Persistance des données
class DataService       // Chargement des questions
class ModalService      // Gestion des modales
class CardService       // Logique des cartes
class UIService         // Interface utilisateur
class FilterService     // Filtres et recherche
class RenderService     // Rendu des composants
```

### Conventions de code

- **CSS** : kebab-case pour les classes (`card-container`)
- **JavaScript** : camelCase pour les variables (`cardContainer`)
- **Constantes** : SNAKE_CASE (`DEFAULT_THEME`)
- **BEM** : Block\_\_Element--Modifier

### Tests et validation

```bash
# Validation HTML
npx html-validate index.html

# Validation CSS
npx stylelint styles.css

# Validation JavaScript
npx eslint script.js
```

## 📝 Données

Les questions sont stockées dans `data.json` avec la structure :

```json
{
    "formation": {
        "category": [
            {
                "question": "Question text",
                "answer": "Answer text"
            }
        ]
    }
}
```

### Formations disponibles

- **CDA** : Concepteur Développeur d'Applications
- **DWWM** : Développeur Web et Web Mobile

### Catégories techniques

- Frontend, Backend, Database
- DevOps, Architecture, Tests
- Security, Design, Project Management
- Tools, Fullstack, Modern Practices

## 🤝 Contribution

1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commiter** les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. **Push** sur la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. **Ouvrir** une Pull Request

### Guidelines

- Respecter l'architecture BEM pour le CSS
- Utiliser les services existants pour le JavaScript
- Tester l'accessibilité avec lecteurs d'écran
- Valider sur différents navigateurs
- Maintenir la performance (Lighthouse > 90)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- **Wild Code School** pour le contexte pédagogique
- **Communauté** des développeurs pour les bonnes pratiques
- **Contributors** pour leurs améliorations

---

Développé avec ❤️ pour la Wild Code School
