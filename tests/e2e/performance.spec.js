import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
    test('should load the application within performance budget', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('/public/');
        await page.waitForSelector('.card');

        const loadTime = Date.now() - startTime;

        // L'application doit se charger en moins de 3 secondes
        expect(loadTime).toBeLessThan(3000);
    });

    test('should handle large number of cards efficiently', async ({ page }) => {
        await page.goto('/public/');
        await page.waitForSelector('.card');

        // Mesurer le temps de révélation de toutes les cartes
        const startTime = Date.now();

        await page.click('#fab');
        await page.waitForSelector('#modalOverlay.show');
        await page.click('button:has-text("Confirmer")');

        // Attendre que toutes les cartes soient révélées
        await page.waitForFunction(
            () => {
                const cards = document.querySelectorAll('.card');
                const revealedCards = document.querySelectorAll('.card.revealed');
                return cards.length === revealedCards.length;
            },
            { timeout: 10000 }
        );

        const revealTime = Date.now() - startTime;

        // La révélation doit prendre moins de 5 secondes
        expect(revealTime).toBeLessThan(5000);
    });

    test('should search efficiently with many cards', async ({ page }) => {
        await page.goto('/public/');
        await page.waitForSelector('.card');

        const searchBox = page.locator('#searchBox');

        // Mesurer le temps de recherche
        const startTime = Date.now();

        await searchBox.fill('JavaScript');

        // Attendre que le filtrage soit appliqué
        await page.waitForTimeout(500);

        const searchTime = Date.now() - startTime;

        // La recherche doit être quasi-instantanée (< 1 seconde)
        expect(searchTime).toBeLessThan(1000);
    });

    test('should maintain smooth animations', async ({ page }) => {
        await page.goto('/public/');
        await page.waitForSelector('.card');

        // Tester l'animation de révélation
        const card = page.locator('.card').first();

        await card.click();

        // Vérifier que l'animation se déroule sans blocage
        const answer = card.locator('.answer');
        await expect(answer).toHaveClass(/visible/, { timeout: 2000 });
    });

    test('should handle rapid interactions without blocking', async ({ page }) => {
        await page.goto('/public/');
        await page.waitForSelector('.card');

        const cards = page.locator('.card');
        const cardCount = await cards.count();

        // Cliquer rapidement sur plusieurs cartes
        const startTime = Date.now();

        for (let i = 0; i < Math.min(5, cardCount); i++) {
            await cards.nth(i).click();
        }

        const interactionTime = Date.now() - startTime;

        // Les interactions doivent être fluides
        expect(interactionTime).toBeLessThan(2000);

        // Vérifier que toutes les cartes sont révélées
        const revealedCards = page.locator('.card.revealed');
        await expect(revealedCards).toHaveCount(Math.min(5, cardCount));
    });

    test('should handle localStorage operations efficiently', async ({ page }) => {
        await page.goto('/public/');
        await page.waitForSelector('.card');

        // Révéler quelques cartes
        const cards = page.locator('.card');
        const cardCount = Math.min(3, await cards.count());

        for (let i = 0; i < cardCount; i++) {
            await cards.nth(i).click();
        }

        // Mesurer le temps de sauvegarde (via reload)
        const startTime = Date.now();

        await page.reload();
        await page.waitForSelector('.card');

        const reloadTime = Date.now() - startTime;

        // Le rechargement avec restauration doit être rapide
        expect(reloadTime).toBeLessThan(4000);

        // Vérifier que les cartes sont toujours révélées
        const revealedCards = page.locator('.card.revealed');
        await expect(revealedCards).toHaveCount(cardCount);
    });
});
