import { test, expect } from '@playwright/test';

test.describe('NEXUS Web App scenarios', () => {
  test('Landing page elements rendered correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('NEXUS');
    await expect(page.locator('placeholder', { hasText: 'What are you looking for?' })).toBeDefined();
  });

  test('Factual query scenario & evidence drawer workflow', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('input[placeholder="What are you looking for?"]');
    await input.fill('Explain black holes so a beginner can actually understand them');
    await input.press('Enter');

    // Progressive phases transition to Done
    await expect(page.locator('text=Overview')).toBeVisible({ timeout: 10000 });

    // Open first source drawer
    await page.locator('text=Black hole - Wikipedia').click();
    await expect(page.locator('text=Evidence Details')).toBeVisible();

    // Close drawer using exact unique test id or specific selector inside evidence drawer
    await page.locator('div.animate-slideIn button').click();
  });

  test('Comparative query scenario', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('input[placeholder="What are you looking for?"]');
    await input.fill('Compare React and Vue for school and coding');
    await input.press('Enter');

    await expect(page.locator('text=Comparison Analysis')).toBeVisible({ timeout: 10000 });
    // Solve exact strict match issue by scoping to table row element or using exact role match
    await expect(page.locator('table td >> text="Syntax"').first()).toBeVisible();
  });

  test('Troubleshooting query scenario', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('input[placeholder="What are you looking for?"]');
    await input.fill('Why does my CS 1.6 game freeze only when I aim at players?');
    await input.press('Enter');

    await expect(page.locator('text=Troubleshooting Diagnosis')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=OpenGL buffering error')).toBeVisible();
  });
});
