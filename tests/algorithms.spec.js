import { test, expect } from '@playwright/test';

test.describe('Algorithm Visualizer E2E', () => {
  test('Landing page and routing', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SPIT Algo Visualizer/);
    await page.getByRole('button', { name: /EXPLORE ALGORITHMS/i }).first().click();
    await expect(page).toHaveURL(/.*algorithm/);
  });

  test('Sorting Features (Bubble Sort) - Sliders and Custom Arrays', async ({ page }) => {
    await page.goto('/algorithm?category=sorting');
    await expect(page.locator('.main-content h1')).toHaveText(/Bubble Sort/i);

    // Test Play button
    const playButton = page.locator('button.btn-play');
    await expect(playButton).toBeVisible();
    await playButton.click();
    await page.waitForTimeout(500);
    
    // Pause
    const pauseButton = page.getByRole('button', { name: /PAUSE/i });
    if (await pauseButton.isVisible()) await pauseButton.click();

    // Custom array
    const customInput = page.locator('.custom-array-input');
    await customInput.fill('10, 20, 30, 40, 50');
    await page.locator('.btn-use-this').click();

    // Verify there are exactly 5 bars
    const bars = page.locator('.bar-chart .bar');
    await expect(bars).toHaveCount(5);

    // Array size slider
    const arraySizeInput = page.locator('.array-size-control input[type="range"]');
    await arraySizeInput.fill('10'); // Use playwright's built-in fill for range inputs

    // Wait for state update
    await page.waitForTimeout(500);
    await expect(bars).toHaveCount(10);

    // Proceed to Practice Mode
    const practiceBtn = page.getByRole('button', { name: /practice it yourself/i });
    await practiceBtn.click();
    
    // Tutorial overlay
    const tutorialText = page.getByText(/click anywhere to start/i);
    await expect(tutorialText).toBeVisible();
    await tutorialText.click();
    await expect(tutorialText).not.toBeVisible();
    
    // Check if practice text appears
    await expect(page.getByText(/your turn/i)).toBeVisible();
  });

  test('Graph Features - Build Your Own Graph', async ({ page }) => {
    await page.goto('/algorithm?category=graph');
    await expect(page.locator('.main-content h1')).not.toBeEmpty();

    // Click 'configure graph manually'
    const configBtn = page.getByRole('button', { name: /- configure graph manually/i });
    await expect(configBtn).toBeVisible();
    await configBtn.click();

    // Modal appears
    await expect(page.getByRole('heading', { name: /Configure Graph Manually/i })).toBeVisible();

    // Set Nodes to 4
    const nodesInput = page.locator('input[type="number"]');
    await nodesInput.fill('4');

    // Set Edges
    const edgesTextarea = page.locator('textarea');
    await edgesTextarea.fill('A-B\nA-C\nB-D');

    // Render Graph
    await page.getByRole('button', { name: /Render Graph/i }).click();

    // Modal closes
    await expect(page.getByRole('heading', { name: /Configure Graph Manually/i })).not.toBeVisible();

    // Wait a moment for SVG to render
    await page.waitForTimeout(500);

    // Verify exactly 4 nodes (circles) and 3 edges (lines)
    const circles = page.locator('svg circle');
    await expect(circles).toHaveCount(4);

    const lines = page.locator('svg line');
    await expect(lines).toHaveCount(3);
  });
});
