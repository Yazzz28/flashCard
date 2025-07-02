/**
 * Configuration et constantes pour l'application WildCards
 */

// Clés de stockage
export const STORAGE_KEYS = {
    REVEALED_CARDS: 'revealedCards',
    THEME: 'theme',
    CURRENT_FORMATION: 'currentFormation',
    CURRENT_CATEGORY: 'currentCategory'
};

// Délais d'animation
export const ANIMATION_DELAYS = {
    LOADING: 500,
    CARD_REVEAL: 300,
    MODAL_TRANSITION: 300
};

// Messages d'erreur
export const ERROR_MESSAGES = {
    LOAD_DATA: 'Erreur lors du chargement des données',
    NO_DATA: '❌ Aucune donnée disponible. Vérifiez le fichier data.json',
    STORAGE_SAVE: 'Erreur lors de la sauvegarde',
    STORAGE_LOAD: 'Erreur lors du chargement',
    STORAGE_REMOVE: 'Erreur lors de la suppression',
    INITIALIZATION: 'Erreur d\'initialisation'
};

// Configuration des boutons de catégories
export const CATEGORY_BUTTONS = [
    { key: 'all', icon: '📚', label: 'Toutes' },
    { key: 'frontend', icon: '🖥️', label: 'Frontend' },
    { key: 'backend', icon: '⚙️', label: 'Backend' },
    { key: 'database', icon: '🗄️', label: 'Base de données' },
    { key: 'devops', icon: '🚀', label: 'DevOps' },
    { key: 'architecture', icon: '🏗️', label: 'Architecture' },
    { key: 'tests', icon: '🧪', label: 'Tests' },
    { key: 'security', icon: '🔒', label: 'Sécurité' },
    { key: 'design', icon: '🎨', label: 'Conception' },
    { key: 'project', icon: '📋', label: 'Gestion de projet' },
    { key: 'tools', icon: '🛠️', label: 'Outils' },
    { key: 'fullstack', icon: '🔄', label: 'Fullstack' },
    { key: 'modern_practices', icon: '✨', label: 'Pratiques modernes' }
];

// Sélecteurs DOM
export const DOM_SELECTORS = {
    CARDS_CONTAINER: '#cardsContainer',
    STATS_PANEL: '#statsPanel',
    REVEALED_COUNT: '#revealedCount',
    TOTAL_COUNT: '#totalCount',
    PROGRESS_FILL: '#progressFill',
    RESET_BTN: '#resetBtn',
    SEARCH_BOX: '#searchBox',
    FAB: '#fab',
    THEME_TOGGLE: '.theme-toggle',
    MODAL_OVERLAY: '#modalOverlay',
    MODAL_ICON: '#modalIcon',
    MODAL_TITLE: '#modalTitle',
    MODAL_SUBTITLE: '#modalSubtitle',
    MODAL_MESSAGE: '#modalMessage',
    MODAL_ACTIONS: '#modalActions',
    FORMATION_BTNS: '.formation-btn',
    CATEGORY_BTNS: '.category-btn',
    CATEGORIES_CONTAINER: '.categories',
    CARDS: '.card',
    CARD_REVEALED: '.card.revealed'
};

// Classes CSS
export const CSS_CLASSES = {
    ACTIVE: 'active',
    REVEALED: 'revealed',
    VISIBLE: 'visible',
    HIDDEN: 'hidden',
    SHOW: 'show',
    LOADING: 'loading',
    SPINNER: 'spinner',
    ERROR_MESSAGE: 'error-message',
    CARD: 'card',
    FLASHCARD: 'flashcard',
    QUESTION: 'question',
    QUESTION_ICON: 'question-icon',
    QUESTION_TEXT: 'question-text',
    ANSWER: 'answer',
    REVEAL_HINT: 'reveal-hint',
    CLICK_ICON: 'click-icon',
    CATEGORY_BTN: 'category-btn',
    FORMATION_BTN: 'formation-btn'
};

// Configuration par défaut
export const DEFAULT_CONFIG = {
    FORMATION: 'all',
    CATEGORY: 'all',
    QUESTION_COUNTER_START: 1,
    THEME: 'light'
};
