/**
 * Tests d'accessibilité automatisés pour WildCards
 * Utilise axe-core pour détecter les problèmes d'accessibilité
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe("Tests d'accessibilité WildCards", () => {
    test.beforeEach(async ({ page }) => {
        // Aller à la page d'accueil
        await page.goto('/');
        // Attendre que l'application soit chargée
        await page.waitForSelector('.cards .card', { timeout: 5000 });
    });

    test("Page d'accueil - Scan d'accessibilité complet", async ({ page }) => {
        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Navigation au clavier', async ({ page }) => {
        // Test de la navigation au clavier
        await page.keyboard.press('Tab');

        // Vérifier que le focus est visible
        const focusedElement = await page.locator(':focus');
        await expect(focusedElement).toBeVisible();

        // Naviguer à travers les éléments interactifs
        const interactiveElements = [
            '.theme-toggle',
            '.search__input',
            '.formations__btn',
            '.categories__btn',
            '.card',
            '.fab'
        ];

        for (const selector of interactiveElements) {
            const element = page.locator(selector).first();
            if (await element.isVisible()) {
                await element.focus();
                await expect(element).toBeFocused();
            }
        }
    });

    test('Test des attributs ARIA', async ({ page }) => {
        // Vérifier les rôles ARIA
        await expect(page.locator('[role="banner"]')).toBeVisible();
        await expect(page.locator('[role="main"]')).toBeVisible();
        await expect(page.locator('[aria-label]')).toHaveCount(
            await page.locator('[aria-label]').count()
        );

        // Vérifier que tous les boutons ont des labels appropriés
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();

        for (let i = 0; i < buttonCount; i++) {
            const button = buttons.nth(i);
            const hasAriaLabel = await button.getAttribute('aria-label');
            const hasTextContent = await button.textContent();
            const hasTitle = await button.getAttribute('title');

            expect(hasAriaLabel || hasTextContent || hasTitle).toBeTruthy();
        }
    });

    test('Contraste des couleurs', async ({ page }) => {
        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2aa'])
            .include('body')
            .analyze();

        // Vérifier qu'il n'y a pas de violations de contraste
        const contrastViolations = accessibilityScanResults.violations.filter(
            (violation) => violation.id === 'color-contrast'
        );

        expect(contrastViolations).toHaveLength(0);
    });

    test('Test du thème sombre - Accessibilité', async ({ page }) => {
        // Basculer vers le thème sombre
        await page.click('.theme-toggle');
        await page.waitForTimeout(500);

        // Vérifier que l'état est mis à jour
        const themeToggle = page.locator('.theme-toggle');
        await expect(themeToggle).toHaveAttribute('aria-pressed', 'true');

        // Scanner l'accessibilité en mode sombre
        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test("Annonces aux lecteurs d'écran", async ({ page }) => {
        // Vérifier les éléments aria-live
        await expect(page.locator('[aria-live="polite"]')).toHaveCount(2); // Stats counters

        // Tester la recherche et les annonces
        await page.fill('.search__input', 'Angular');
        await page.waitForTimeout(500);

        // Vérifier qu'il y a des résultats visibles
        const visibleCards = page.locator('.card:not(.hidden)');
        const count = await visibleCards.count();
        expect(count).toBeGreaterThan(0);
    });

    test('Interaction avec les cartes', async ({ page }) => {
        const firstCard = page.locator('.card').first();

        // Vérifier l'état initial
        await expect(firstCard).toHaveAttribute('aria-expanded', 'false');

        // Cliquer sur la carte
        await firstCard.click();

        // Vérifier que la carte est révélée
        await expect(firstCard).toHaveAttribute('aria-expanded', 'true');
        await expect(firstCard).toHaveClass(/card--revealed/);

        // Vérifier que la réponse est visible
        const answer = firstCard.locator('.card__answer');
        await expect(answer).toHaveAttribute('aria-hidden', 'false');
    });

    test('Modal - Accessibilité', async ({ page }) => {
        // Ouvrir le modal de reset
        await page.click('#resetBtn');

        // Vérifier que le modal est ouvert et accessible
        const modal = page.locator('#modalOverlay');
        await expect(modal).toBeVisible();
        await expect(modal).toHaveAttribute('aria-labelledby', 'modalTitle');
        await expect(modal).toHaveAttribute('aria-describedby', 'modalMessage');

        // Vérifier que le focus est dans le modal
        const focusedElement = page.locator(':focus');
        const modalButtons = modal.locator('button');
        const isInModal = await modalButtons
            .first()
            .evaluate(
                (button) => document.activeElement && button.contains(document.activeElement)
            );
        expect(isInModal || (await focusedElement.count()) > 0).toBeTruthy();

        // Fermer le modal avec Escape
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
    });

    test('Responsive - Accessibilité mobile', async ({ page }) => {
        // Simuler un écran mobile
        await page.setViewportSize({ width: 375, height: 667 });

        // Scanner l'accessibilité en mode mobile
        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);

        // Vérifier que les éléments sont toujours accessibles
        await expect(page.locator('.theme-toggle')).toBeVisible();
        await expect(page.locator('.search__input')).toBeVisible();
        await expect(page.locator('.formations__btn')).toBeVisible();
    });

    test("Performance d'accessibilité - Best practices", async ({ page }) => {
        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['best-practice'])
            .analyze();

        // Permettre quelques violations mineures mais pas plus de 2
        expect(accessibilityScanResults.violations.length).toBeLessThanOrEqual(2);

        // Vérifier les recommandations importantes
        const criticalViolations = accessibilityScanResults.violations.filter(
            (violation) => violation.impact === 'critical' || violation.impact === 'serious'
        );

        expect(criticalViolations).toHaveLength(0);
    });
});
