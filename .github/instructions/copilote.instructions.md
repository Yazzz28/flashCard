# Instructions pour l'Assistant IA - WildCards

## Contexte du Projet

Tu travailles sur **WildCards**, une application web de fiches de révision pour les formations CDA et DWWM de la Wild Code School. L'application est construite avec du HTML/CSS/JavaScript vanilla, sans framework.

## Architecture et Structure

### Fichiers Principaux

- `index.html` : Structure HTML principale
- `script.js` : Logique JavaScript de l'application
- `styles.css` : Styles CSS principaux
- `data.json` : Données des fiches de révision
- `CSS-ARCHITECTURE.md` : Documentation de l'architecture CSS

### Technologies

- **HTML5** : Structure sémantique
- **CSS3** : Variables CSS, Grid, Flexbox, animations
- **JavaScript ES6+** : Vanilla JS, modules ES6, async/await
- **Local Storage** : Persistance des données utilisateur

## Principes de Développement

### CSS

- **Architecture BEM** : Respecter la nomenclature Block\_\_Element--Modifier
- **Variables CSS** : Utiliser les custom properties définies dans `:root`
- **Mobile First** : Approche responsive mobile d'abord
- **Animations fluides** : Utiliser `transform` et `opacity` pour les performances

### JavaScript

- **Code modulaire** : Séparer les fonctionnalités en modules logiques
- **ES6+** : Utiliser const/let, arrow functions, destructuring
- **Gestion d'état** : État centralisé pour les données de l'application
- **Performance** : Éviter les reflows/repaints inutiles

### Accessibilité

- **ARIA** : Labels et rôles appropriés
- **Navigation clavier** : Support complet
- **Contraste** : Respect des ratios WCAG
- **Sémantique** : HTML sémantique correct

## Fonctionnalités Clés

### Système de Cartes

- Révélation progressive des réponses
- Animations de flip/transition
- États visuels (masqué/révélé)
- Tracking de progression

### Filtres et Recherche

- Recherche textuelle en temps réel
- Filtrage par formation (CDA/DWWM)
- Filtrage par catégorie technique
- Combinaison de filtres

### Thèmes

- Mode clair/sombre
- Persistance du choix utilisateur
- Transition fluide entre thèmes

### Données et État

- Chargement asynchrone depuis `data.json`
- Sauvegarde locale de la progression
- Gestion d'état réactive

## Guidelines de Code

### Conventions de Nommage

- **CSS** : kebab-case pour les classes (`card-container`)
- **JavaScript** : camelCase pour les variables (`cardContainer`)
- **Constantes** : SNAKE_CASE (`DEFAULT_THEME`)

### Structure des Commits

- `feat:` nouvelles fonctionnalités
- `fix:` corrections de bugs
- `style:` modifications CSS/UI
- `refactor:` refactoring sans changement fonctionnel
- `docs:` documentation

### Tests et Validation

- Tester sur Chrome, Firefox, Safari, Edge
- Vérifier la responsivité (mobile, tablet, desktop)
- Valider l'accessibilité
- Performance : scores Lighthouse > 90

## Bonnes Pratiques

### Performance

- Lazy loading des images si nécessaire
- Debounce pour la recherche
- Optimisation des animations CSS
- Minification en production

### Maintenance

- Code commenté pour les logiques complexes
- Documentation des APIs dans le code
- Gestion d'erreurs appropriée
- Logs de développement

### UX/UI

- Feedback visuel immédiat
- États de chargement
- Messages d'erreur explicites
- Animations significatives

## Commandes Utiles

### Développement Local

```bash
# Serveur local simple
python -m http.server 8000
# ou
npx serve .
```

### Validation

```bash
# Validation HTML
npx html-validate index.html

# Validation CSS
npx stylelint styles.css

# Validation JS
npx eslint script.js
```

## Points d'Attention

### Sécurité

- Validation côté client ET serveur (si backend ajouté)
- Échappement des données utilisateur
- CSP headers si applicable

### Évolutivité

- Structure modulaire pour faciliter l'ajout de fonctionnalités
- API prête pour une migration vers un backend
- État centralisé pour faciliter les modifications

### Compatibilité

- Support des navigateurs modernes (ES6+)
- Fallbacks CSS appropriés
- Progressive enhancement

## Ressources

- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [JavaScript ES6+ Features](https://github.com/lukehoban/es6features)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Note importante** : Toujours tester les modifications sur plusieurs navigateurs et tailles d'écran avant de finaliser.
