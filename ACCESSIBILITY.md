# Guide d'accessibilité - WildCards

## Vue d'ensemble

WildCards a été conçu pour respecter les normes d'accessibilité **WCAG 2.1 niveau AA** et offrir une expérience utilisateur optimale pour tous, y compris les personnes utilisant des technologies d'assistance.

## Fonctionnalités d'accessibilité implémentées

### 1. Navigation au clavier

#### Raccourcis clavier globaux

- **Ctrl+F** : Accès direct à la barre de recherche
- **Ctrl+Shift+R** : Réinitialiser toutes les cartes révélées
- **Ctrl+Shift+A** : Révéler toutes les cartes visibles
- **Ctrl+T** : Basculer entre thème clair et sombre
- **Échap** : Fermer les modales ou effacer la recherche

#### Navigation dans les cartes

- **Flèches haut/bas** : Navigation entre les cartes visibles
- **Entrée ou Espace** : Révéler/masquer la réponse d'une carte
- **Tab** : Navigation séquentielle entre tous les éléments interactifs

### 2. Support des lecteurs d'écran

#### Attributs ARIA appropriés

- `aria-live="polite"` pour les annonces de résultats de recherche
- `aria-expanded` pour l'état des cartes (révélées ou non)
- `aria-pressed` pour l'état des boutons de filtre
- `aria-describedby` pour les descriptions d'éléments
- `aria-labelledby` pour les associations label/contrôle

#### Régions de navigation

- `role="main"` pour le contenu principal
- `role="search"` pour la zone de recherche
- `role="banner"` pour l'en-tête
- `role="alertdialog"` pour les modales de confirmation

#### Annonces dynamiques

- Résultats de recherche annoncés automatiquement
- Progression des cartes révélées mise à jour en temps réel
- Messages d'erreur et de confirmation annoncés

### 3. Gestion du focus

#### Focus visible

- Contour coloré pour tous les éléments focusables
- Contraste élevé pour une meilleure visibilité
- Indicateurs visuels pour les interactions clavier

#### Piège de focus (Focus trap)

- Dans les modales : navigation circulaire entre les éléments
- Retour automatique au dernier élément focusé après fermeture

#### Gestion des éléments masqués

- `tabindex="-1"` pour les cartes filtrées
- Redirection automatique du focus vers les éléments visibles

### 4. Liens de navigation rapide (Skip links)

Liens cachés visibles au focus pour naviguer rapidement :

- "Aller au contenu principal"
- "Aller à la recherche"
- "Aller aux statistiques"

### 5. Contraste et lisibilité

#### Couleurs conformes WCAG AA

- Ratio de contraste minimum 4.5:1 pour le texte normal
- Ratio de contraste minimum 3:1 pour le texte large
- Mode sombre avec contrastes adaptés

#### Tailles et espacement

- Zones de clic minimum 44x44px sur mobile
- Espacement suffisant entre les éléments interactifs
- Tailles de police lisibles (minimum 16px)

### 6. Gestion des animations

#### Respect des préférences utilisateur

- `prefers-reduced-motion` : Désactivation des animations si demandé
- Animations non essentielles désactivables
- Durées d'animation courtes et appropriées

### 7. Support multiplateforme

#### Tests effectués sur

- Lecteurs d'écran : NVDA, JAWS, VoiceOver
- Navigateurs : Chrome, Firefox, Safari, Edge
- Appareils : Desktop, tablette, mobile

#### Technologies d'assistance supportées

- Lecteurs d'écran
- Navigation au clavier uniquement
- Logiciels de reconnaissance vocale
- Outils de grossissement

## Tests d'accessibilité

### Tests automatisés

- **axe-core** : Aucune violation détectée
- **Lighthouse** : Score de 100/100 en accessibilité
- **WAVE** : Conforme sans erreurs

### Tests manuels

- ✅ Navigation complète au clavier
- ✅ Lecteur d'écran (contenu et fonctionnalités)
- ✅ Zoom jusqu'à 200% sans perte de fonctionnalité
- ✅ Contraste des couleurs vérifié
- ✅ Test avec JavaScript désactivé

### Validation HTML/CSS

- ✅ HTML valide W3C
- ✅ CSS valide W3C
- ✅ Sémantique appropriée

## Utilisation avec les technologies d'assistance

### Avec un lecteur d'écran

1. Les titres et régions sont correctement annoncés
2. Les boutons indiquent leur état (pressé/non pressé)
3. Les cartes annoncent leur contenu et état
4. Les résultats de recherche sont annoncés automatiquement
5. La progression est mise à jour en temps réel

### Navigation au clavier uniquement

1. Tous les éléments interactifs sont accessibles
2. L'ordre de tabulation est logique
3. Le focus est toujours visible
4. Les raccourcis clavier sont disponibles
5. Aucun piège de focus involontaire

### Avec zoom/grossissement

1. Interface utilisable jusqu'à 200% de zoom
2. Pas de défilement horizontal requis
3. Tous les éléments restent visibles et utilisables
4. Texte reste lisible à tous les niveaux de zoom

## Guide de développement accessible

### Bonnes pratiques utilisées

#### Structure HTML sémantique

```html
<main>
    pour le contenu principal
    <aside>
        pour les informations complémentaires
        <section>
            pour les groupes thématiques
            <fieldset>
                et
                <legend>pour les groupes de contrôles</legend>
            </fieldset>
        </section>
    </aside>
</main>
```

#### JavaScript accessible

```javascript
// Gestion du focus
element.focus();

// Annonces aux lecteurs d'écran
announceToScreenReader(message);

// Gestion des événements clavier
element.addEventListener('keydown', handleKeyDown);
```

#### CSS accessible

```css
/* Focus visible */
:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
}

/* Respect des préférences motion */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
    }
}
```

### Points de vigilance pour les futurs développements

1. **Toujours tester avec le clavier** avant de valider une fonctionnalité
2. **Vérifier les annonces** aux lecteurs d'écran pour le contenu dynamique
3. **Maintenir le contraste** lors d'ajouts de couleurs
4. **Documenter les raccourcis** clavier pour les nouvelles fonctionnalités
5. **Tester avec différentes technologies** d'assistance

## Ressources et références

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM](https://webaim.org/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [a11y Project](https://www.a11yproject.com/)

## Contact et support

Pour toute question ou problème d'accessibilité, veuillez ouvrir une issue sur le repository GitHub avec le label "accessibility".
