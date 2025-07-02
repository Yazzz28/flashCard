# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

## [2.0.1] - 2025-07-02

### 🧹 Nettoyé

- **Suppression des fichiers inutiles** : Fichiers dupliqués, temporaires et obsolètes
    - `jest.config.new.js` (configuration Jest dupliquée)
    - `script_modular.js` (ancienne version du script principal)
    - `index_redirect.html` (fichier de redirection temporaire)
    - `tests/unit/utils-simple.test.js` (version simplifiée temporaire)
    - `tests/unit/utils.test.js.bak` (fichier de sauvegarde)
    - `coverage/` (dossier généré automatiquement, déjà ignoré par Git)

## [2.0.0] - 2025-07-02

### ✨ Ajouté

- **Structure modulaire** : Organisation en dossiers `src/`, `assets/`, `public/`
- **Architecture JavaScript** : Modules ES6 avec séparation des responsabilités
- **Configuration CI/CD** : Pipeline GitHub Actions pour l'intégration continue
- **Scripts npm** : Automatisation des tâches de développement et déploiement
- **Documentation** : README complet et structure détaillée

### 🔄 Modifié

- **Refactorisation** : Code JavaScript organisé en modules (`config.js`, `utils.js`)
- **Conformité linting** : Correction de toutes les erreurs ESLint, Prettier, HTML Validate
- **Chemins de fichiers** : Adaptation à la nouvelle structure de dossiers
- **Configuration** : Prettier unifié avec ESLint (single quotes)
- **Point d'entrée** : Application servie depuis le dossier `public/`

### 📁 Structure finale

```
FlashCard/
├── .github/workflows/      # GitHub Actions
├── assets/                 # Ressources statiques
│   ├── css/               # Styles CSS
│   └── data/              # Données JSON
├── public/                 # Fichiers publics
├── src/                   # Code source
│   └── modules/           # Modules JavaScript
├── package.json           # Configuration npm
└── README.md              # Documentation
```

### 🛠️ Outils et qualité

- ESLint : 0 erreurs
- Prettier : Format uniforme
- HTML Validate : Validation complète
- Responsive design : Compatible tous appareils
- Accessibilité : Standards WCAG

### 🚀 Déploiement

- Serveur de développement : `npm start`
- Validation complète : `npm run validate`
- Compatible GitHub Pages
- Pipeline CI/CD automatisé

---

## [1.0.0] - Version initiale

### Fonctionnalités de base

- Fiches de révision interactives CDA/DWWM
- Filtrage par formation et catégorie
- Recherche en temps réel
- Suivi de progression
- Thème clair/sombre
- Interface responsive
