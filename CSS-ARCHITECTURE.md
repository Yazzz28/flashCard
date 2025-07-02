# Architecture CSS - WildCards

## Vue d'ensemble

L'architecture CSS de WildCards suit les principes modernes de développement front-end avec une approche **mobile-first**, l'utilisation extensive de **variables CSS** et une structure organisée selon la méthodologie **BEM**.

## Structure des fichiers

```
styles.css
├── Variables CSS (:root)
├── Reset/Normalize
├── Base styles (body, container)
├── Components
│   ├── Header
│   ├── Controls
│   ├── Stats Panel
│   ├── Cards
│   ├── Modal
│   └── UI Elements
├── Utilities
├── Accessibility
└── Media queries
```

## Variables CSS

### Palette de couleurs

```css
:root {
    /* Couleurs primaires */
    --primary: #6366f1;
    --primary-dark: #4f46e5;
    --secondary: #10b981;
    --accent: #f59e0b;
    --danger: #ef4444;

    /* Couleurs neutres */
    --dark: #0f172a;
    --gray-50: #f8fafc;
    --gray-100: #f1f5f9;
    --gray-200: #e2e8f0;
    --gray-300: #cbd5e1;
    --gray-600: #475569;
    --gray-700: #334155;
    --gray-800: #1e293b;
    --gray-900: #0f172a;
}
```

### Système de thèmes

Le système de thèmes utilise l'attribut `data-theme` pour basculer entre les modes clair et sombre :

```css
/* Thème clair (par défaut) */
:root {
    --body-bg: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    --bg-primary: #ffffff;
    --text-primary: #1e293b;
}

/* Thème sombre */
[data-theme='dark'] {
    --body-bg: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
    --bg-primary: #1e293b;
    --text-primary: #f1f5f9;
}
```

## Méthodologie BEM

### Structure

- **Block** : Composant principal (`.card`, `.modal`, `.stats-panel`)
- **Element** : Partie d'un block (`.card__header`, `.modal__body`)
- **Modifier** : Variante d'un block/element (`.card--revealed`, `.button--primary`)

### Exemples d'implémentation

```css
/* Block */
.card {
    background: var(--bg-card);
    border-radius: 1.5rem;
    transition: all 0.4s ease;
}

/* Element */
.card__header {
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
}

/* Modifier */
.card--revealed {
    border-color: var(--secondary);
    box-shadow: 0 0 0 2px var(--secondary);
}
```

## Approche Mobile-First

### Breakpoints

```css
/* Base styles (mobile) */
.container {
    padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
    .container {
        padding: 2rem;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .container {
        max-width: 1400px;
        margin: 0 auto;
    }
}
```

### Grille responsive

```css
.cards-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

@media (min-width: 768px) {
    .cards-container {
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 2rem;
    }
}
```

## Animations et performances

### Principes

- Utiliser uniquement `transform` et `opacity` pour les animations
- Éviter les propriétés qui causent des reflows/repaints
- Utiliser `will-change` avec parcimonie

### Exemples

```css
.card {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
}

.card:hover {
    transform: translateY(-8px) scale(1.02);
}

/* Animation d'apparition */
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

## Accessibilité

### Contraste et lisibilité

- Ratio de contraste minimum 4.5:1 pour le texte normal
- Ratio de contraste minimum 3:1 pour le texte large
- Support des préférences utilisateur (`prefers-reduced-motion`)

### Focus et navigation

```css
.card:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
}
```

## Composants principaux

### Cards

- Structure flexible avec header/content/footer
- États : normal, hover, revealed
- Animations fluides pour les interactions

### Modal

- Overlay avec backdrop-filter
- Centrage avec flexbox
- Animation d'apparition/disparition
- Gestion du focus pour l'accessibilité

### Stats Panel

- Position fixe responsive
- Barre de progression native
- Mise à jour en temps réel

### Controls

- Fieldsets pour le groupement logique
- Boutons avec états pressed/active
- Recherche avec feedback visuel

## Bonnes pratiques

### Performance

- Utilisation de `backdrop-filter` avec fallbacks
- Optimisation des sélecteurs CSS
- Lazy loading des styles non critiques

### Maintenance

- Variables CSS pour la cohérence
- Commentaires pour les sections complexes
- Structure modulaire et réutilisable

### Responsive Design

- Images responsive avec `object-fit`
- Unités relatives (rem, em, %)
- Test sur différentes tailles d'écran

## Guidelines de contribution

### Nouvelles fonctionnalités

1. Utiliser les variables CSS existantes
2. Suivre la méthodologie BEM
3. Implémenter mobile-first
4. Tester l'accessibilité
5. Documenter les nouveaux composants

### Modifications

1. Maintenir la compatibilité des thèmes
2. Préserver les animations existantes
3. Respecter les breakpoints définis
4. Valider le contraste des couleurs

---

Cette architecture garantit une base solide, maintenable et accessible pour l'évolution future de WildCards.
