# Structure du projet WildCards

## Organisation des fichiers

```
📁 FlashCard/
├── 📁 .github/                 # Configuration GitHub Actions
├── 📁 assets/                  # Ressources statiques
│   ├── 📁 css/                # Fichiers CSS
│   │   └── styles.css
│   └── 📁 data/               # Données JSON
│       └── data.json
├── 📁 public/                  # Fichiers publics
│   └── index.html             # Page principale
├── 📁 src/                    # Code source JavaScript
│   ├── 📁 modules/            # Modules JavaScript
│   │   ├── config.js          # Configuration et constantes
│   │   └── utils.js           # Fonctions utilitaires
│   └── script.js              # Application principale
├── 📁 node_modules/           # Dépendances npm
├── .eslintrc.json             # Configuration ESLint
├── .gitignore                 # Fichiers ignorés par Git
├── .prettierrc.json           # Configuration Prettier
├── .stylelintrc.json          # Configuration StyleLint
├── package.json               # Configuration npm
├── package-lock.json          # Lock des dépendances
└── README.md                  # Documentation
```

## Commandes de développement

```bash
# Démarrer le serveur de développement
npm start

# Linter le code
npm run lint

# Formater le CSS
npm run format:css

# Valider tout le projet
npm run validate
```

## Points d'entrée

- **Application principale** : `public/index.html`
- **Code source** : `src/script.js`
- **Styles** : `assets/css/styles.css`
- **Données** : `assets/data/data.json`

## Compatibilité GitHub Actions

Cette structure est optimisée pour GitHub Actions :

- Scripts de build et validation dans `package.json`
- Configuration des linters à la racine
- Séparation claire entre code source et assets
- Point d'entrée principal dans `public/`
