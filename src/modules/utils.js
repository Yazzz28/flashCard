/**
 * Fonctions utilitaires pour l'application WildCards
 */

import { ERROR_MESSAGES } from './config.js';

/**
 * Utilitaires pour le stockage local
 */
export class StorageUtils {
    /**
     * Sauvegarde des données dans le sessionStorage
     * @param {string} key - Clé de stockage
     * @param {*} data - Données à sauvegarder
     * @returns {boolean} - Succès de l'opération
     */
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn(ERROR_MESSAGES.STORAGE_SAVE, error);
            return false;
        }
    }

    /**
     * Chargement des données depuis le sessionStorage
     * @param {string} key - Clé de stockage
     * @returns {*|null} - Données chargées ou null
     */
    static load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn(ERROR_MESSAGES.STORAGE_LOAD, error);
            return null;
        }
    }

    /**
     * Suppression des données du sessionStorage
     * @param {string} key - Clé de stockage
     * @returns {boolean} - Succès de l'opération
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn(ERROR_MESSAGES.STORAGE_REMOVE, error);
            return false;
        }
    }

    /**
     * Vérification de la disponibilité du localStorage
     * @returns {boolean} - Disponibilité du localStorage
     */
    static isAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }
}

/**
 * Utilitaires pour les éléments DOM
 */
export class DOMUtils {
    /**
     * Sélectionne un élément par son sélecteur
     * @param {string} selector - Sélecteur CSS
     * @returns {Element|null} - Élément trouvé ou null
     */
    static querySelector(selector) {
        return document.querySelector(selector);
    }

    /**
     * Sélectionne tous les éléments correspondant au sélecteur
     * @param {string} selector - Sélecteur CSS
     * @returns {NodeList} - Liste des éléments trouvés
     */
    static querySelectorAll(selector) {
        return document.querySelectorAll(selector);
    }

    /**
     * Ajoute une classe à un élément
     * @param {Element} element - Élément DOM
     * @param {string} className - Nom de la classe
     */
    static addClass(element, className) {
        if (element && element.classList) {
            element.classList.add(className);
        }
    }

    /**
     * Supprime une classe d'un élément
     * @param {Element} element - Élément DOM
     * @param {string} className - Nom de la classe
     */
    static removeClass(element, className) {
        if (element && element.classList) {
            element.classList.remove(className);
        }
    }

    /**
     * Bascule une classe sur un élément
     * @param {Element} element - Élément DOM
     * @param {string} className - Nom de la classe
     */
    static toggleClass(element, className) {
        if (element && element.classList) {
            element.classList.toggle(className);
        }
    }

    /**
     * Vérifie si un élément a une classe
     * @param {Element} element - Élément DOM
     * @param {string} className - Nom de la classe
     * @returns {boolean} - True si l'élément a la classe
     */
    static hasClass(element, className) {
        return element && element.classList && element.classList.contains(className);
    }

    /**
     * Définit le contenu textuel d'un élément
     * @param {Element} element - Élément DOM
     * @param {string} text - Texte à définir
     */
    static setText(element, text) {
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * Définit le contenu HTML d'un élément
     * @param {Element} element - Élément DOM
     * @param {string} html - HTML à définir
     */
    static setHTML(element, html) {
        if (element) {
            element.innerHTML = html;
        }
    }

    /**
     * Vide le contenu d'un élément
     * @param {Element} element - Élément DOM
     */
    static clearContent(element) {
        if (element) {
            element.innerHTML = '';
        }
    }
}

/**
 * Utilitaires pour les animations et délais
 */
export class AnimationUtils {
    /**
     * Attend un délai spécifié
     * @param {number} ms - Délai en millisecondes
     * @returns {Promise} - Promise qui se résout après le délai
     */
    static delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Ajoute une animation de fondu entrant
     * @param {Element} element - Élément à animer
     * @param {number} duration - Durée de l'animation en ms
     */
    static fadeIn(element, duration = 300) {
        if (!element) return;

        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease-in-out`;

        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
    }

    /**
     * Ajoute une animation de fondu sortant
     * @param {Element} element - Élément à animer
     * @param {number} duration - Durée de l'animation en ms
     * @returns {Promise} - Promise qui se résout quand l'animation est terminée
     */
    static fadeOut(element, duration = 300) {
        return new Promise((resolve) => {
            if (!element) {
                resolve();
                return;
            }

            element.style.transition = `opacity ${duration}ms ease-in-out`;
            element.style.opacity = '0';

            setTimeout(() => {
                resolve();
            }, duration);
        });
    }
}

/**
 * Utilitaires pour la validation et le formatage
 */
export class ValidationUtils {
    /**
     * Vérifie si une chaîne est vide ou ne contient que des espaces
     * @param {string} str - Chaîne à vérifier
     * @returns {boolean} - True si la chaîne est vide
     */
    static isEmpty(str) {
        return !str || str.trim().length === 0;
    }

    /**
     * Échappe les caractères HTML dans une chaîne
     * @param {string} text - Texte à échapper
     * @returns {string} - Texte échappé
     */
    static escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Normalise une chaîne pour la recherche (minuscules, sans accents)
     * @param {string} str - Chaîne à normaliser
     * @returns {string} - Chaîne normalisée
     */
    static normalizeForSearch(str) {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }
}

/**
 * Utilitaires pour les événements
 */
export class EventUtils {
    /**
     * Ajoute un écouteur d'événement avec gestion d'erreur
     * @param {Element} element - Élément DOM
     * @param {string} event - Type d'événement
     * @param {Function} handler - Gestionnaire d'événement
     * @param {object} options - Options pour addEventListener
     */
    static addListener(element, event, handler, options = {}) {
        if (element && typeof handler === 'function') {
            try {
                element.addEventListener(event, handler, options);
            } catch (error) {
                console.warn('Erreur lors de l\'ajout de l\'écouteur:', error);
            }
        }
    }

    /**
     * Supprime un écouteur d'événement
     * @param {Element} element - Élément DOM
     * @param {string} event - Type d'événement
     * @param {Function} handler - Gestionnaire d'événement
     */
    static removeListener(element, event, handler) {
        if (element && typeof handler === 'function') {
            try {
                element.removeEventListener(event, handler);
            } catch (error) {
                console.warn('Erreur lors de la suppression de l\'écouteur:', error);
            }
        }
    }

    /**
     * Crée une fonction de debounce
     * @param {Function} func - Fonction à débouncer
     * @param {number} wait - Délai d'attente en ms
     * @returns {Function} - Fonction débouncée
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

/**
 * Utilitaires pour la gestion des erreurs et logs
 */
export class LogUtils {
    /**
     * Log d'information
     * @param {string} message - Message à logger
     * @param {...*} args - Arguments supplémentaires
     */
    static info(message, ...args) {
        console.info(`[WildCards] ${message}`, ...args);
    }

    /**
     * Log d'avertissement
     * @param {string} message - Message à logger
     * @param {...*} args - Arguments supplémentaires
     */
    static warn(message, ...args) {
        console.warn(`[WildCards] ${message}`, ...args);
    }

    /**
     * Log d'erreur
     * @param {string} message - Message à logger
     * @param {...*} args - Arguments supplémentaires
     */
    static error(message, ...args) {
        console.error(`[WildCards] ${message}`, ...args);
    }
}
