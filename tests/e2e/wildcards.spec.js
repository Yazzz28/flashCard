import { test, expect } from '@playwright/test';

test.describe('WildCards E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should load the application successfully', async ({ page }) => {
        await expect(page).toHaveTitle(/WildCards/);
        await expect(page.locator('h1')).toContainText('WildCards');
        await expect(page.locator('.subtitle')).toContainText('Fiches de révision');
    });

    test('should display question cards', async ({ page }) => {
        await page.waitForSelector('.card', { timeout: 10000 });

        const cards = page.locator('.card');
        await expect(cards).not.toHaveCount(0);

        const firstCard = cards.first();
        await expect(firstCard.locator('.question')).toBeVisible();
        await expect(firstCard.locator('.answer')).toBeHidden();
    });

    test('should reveal answer when clicking on a card', async ({ page }) => {
        await page.waitForSelector('.card');

        const firstCard = page.locator('.card').first();
        const answer = firstCard.locator('.answer');

        await expect(answer).not.toHaveClass(/visible/);

        await firstCard.click();

        await expect(answer).toHaveClass(/visible/);
        await expect(firstCard).toHaveClass(/revealed/);
    });

    test('should filter cards by formation', async ({ page }) => {
        await page.waitForSelector('.card');

        const allCardsCount = await page.locator('.card').count();

        await page.click('[data-formation="CDA"]');
        await page.waitForTimeout(500);

        const cdaCards = page.locator('.card[data-formation="CDA"]');
        const visibleCards = page.locator('.card:not(.u-hidden)');

        await expect(visibleCards).toHaveCount(await cdaCards.count());

        await page.click('[data-formation="all"]');
        await page.waitForTimeout(500);

        await expect(page.locator('.card')).toHaveCount(allCardsCount);
    });

    test('should filter cards by category', async ({ page }) => {
        await page.waitForSelector('.card');
        await page.waitForSelector('.category-btn');

        const frontendButton = page.locator('.category-btn[data-category="frontend"]');
        if ((await frontendButton.count()) > 0) {
            await frontendButton.click();
            await page.waitForTimeout(500);

            const visibleCards = page.locator('.card:not(.u-hidden)');
            const frontendCards = page.locator('.card[data-category="frontend"]');

            await expect(visibleCards).toHaveCount(await frontendCards.count());
        }
    });

    test('should search cards by content', async ({ page }) => {
        await page.waitForSelector('.card');

        const searchBox = page.locator('#searchBox');
        await searchBox.fill('HTML');

        await page.waitForTimeout(500);

        const visibleCards = page.locator('.card:not(.u-hidden)');
        const hiddenCards = page.locator('.card.u-hidden');

        expect(await visibleCards.count()).toBeGreaterThan(0);
        expect(await hiddenCards.count()).toBeGreaterThan(0);

        await searchBox.clear();
        await page.waitForTimeout(500);

        await expect(page.locator('.card.u-hidden')).toHaveCount(0);
    });

    test('should update statistics when revealing cards', async ({ page }) => {
        await page.waitForSelector('.card');

        const totalCount = page.locator('#totalCount');
        const revealedCount = page.locator('#revealedCount');
        const progressFill = page.locator('#progressFill');

        const initialTotal = parseInt(await totalCount.textContent());
        expect(initialTotal).toBeGreaterThan(0);

        await expect(revealedCount).toHaveText('0');

        await page.locator('.card').first().click();
        await page.waitForTimeout(200);

        await expect(revealedCount).toHaveText('1');

        const progressWidth = await progressFill.evaluate((el) => el.style.width);
        expect(progressWidth).not.toBe('0%');
    });

    test('should reveal all visible cards with FAB button', async ({ page }) => {
        await page.waitForSelector('.card');

        const fab = page.locator('#fab');
        await fab.click();

        await page.waitForSelector('#modalOverlay.show');
        await page.click('button:has-text("Confirmer")');

        await page.waitForTimeout(2000);

        const revealedCards = page.locator('.card.revealed');
        const totalCards = page.locator('.card:not(.u-hidden)');

        await expect(revealedCards).toHaveCount(await totalCards.count());
    });

    test('should reset revealed cards', async ({ page }) => {
        await page.waitForSelector('.card');

        await page.locator('.card').first().click();
        await page.waitForTimeout(200);

        await expect(page.locator('.card.revealed')).toHaveCount(1);

        await page.click('#resetBtn');
        await page.waitForSelector('#modalOverlay.show');
        await page.click('button:has-text("Confirmer")');

        await page.waitForTimeout(500);

        await expect(page.locator('.card.revealed')).toHaveCount(0);
    });

    test('should toggle theme', async ({ page }) => {
        const themeToggle = page.locator('.theme-toggle');

        const initialTheme = await page.evaluate(() =>
            document.documentElement.getAttribute('data-theme')
        );

        await themeToggle.click();

        const newTheme = await page.evaluate(() =>
            document.documentElement.getAttribute('data-theme')
        );

        expect(newTheme).not.toBe(initialTheme);
    });

    test('should be responsive on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForSelector('.card');

        await expect(page.locator('.container')).toBeVisible();
        await expect(page.locator('.card')).toBeVisible();

        const card = page.locator('.card').first();
        await card.click();

        await expect(card.locator('.answer')).toHaveClass(/visible/);
    });

    test('should handle keyboard navigation', async ({ page }) => {
        await page.waitForSelector('.card');

        const searchBox = page.locator('#searchBox');
        await searchBox.focus();

        await page.keyboard.type('JavaScript');
        await page.waitForTimeout(500);

        await expect(page.locator('.card:not(.u-hidden)')).not.toHaveCount(0);

        await page.keyboard.press('Escape');
        await searchBox.clear();

        await expect(page.locator('.card.u-hidden')).toHaveCount(0);
    });

    test('should persist revealed cards in localStorage', async ({ page }) => {
        await page.waitForSelector('.card');

        await page.locator('.card').first().click();
        await page.waitForTimeout(200);

        await page.reload();
        await page.waitForSelector('.card');

        await expect(page.locator('.card.revealed')).toHaveCount(1);
    });
});
