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

    // Open the text editor
    const configBtn = page.getByRole('button', { name: /edit as text/i });
    await expect(configBtn).toBeVisible();
    await configBtn.click();

    // Modal appears
    await expect(page.getByRole('heading', { name: /Configure Graph Manually/i })).toBeVisible();

    // Set Nodes to 4
    const nodesInput = page.locator('.modal input[type="number"]');
    await nodesInput.fill('4');

    // Set Edges
    const edgesTextarea = page.locator('.modal textarea');
    await edgesTextarea.fill('A-B\nA-C\nB-D');

    // Render Graph
    await page.getByRole('button', { name: /Render Graph/i }).click();

    // Modal closes
    await expect(page.getByRole('heading', { name: /Configure Graph Manually/i })).not.toBeVisible();

    // Wait a moment for SVG to render
    await page.waitForTimeout(500);

    // Verify exactly 4 nodes and 3 edges
    await expect(page.locator('.graph-canvas .graph-node')).toHaveCount(4);
    await expect(page.locator('.graph-canvas .graph-edge')).toHaveCount(3);
  });

  test('Graph editor - text import reports bad lines and keeps negative weights', async ({ page }) => {
    await page.goto('/algorithm?category=graph');
    await page.getByRole('button', { name: /Bellman-Ford/i }).click();
    await page.getByRole('button', { name: /edit as text/i }).click();

    await page.locator('.modal input[type="number"]').fill('3');
    await page.locator('.modal textarea').fill('A-B--3\nB-C-2\nnot an edge');
    await page.getByRole('button', { name: /Render Graph/i }).click();

    // Invalid line keeps the dialog open with an error
    await expect(page.locator('.field__errors')).toContainText('Line 3');

    await page.locator('.modal textarea').fill('A-B--3\nB-C-2');
    await page.getByRole('button', { name: /Render Graph/i }).click();
    await expect(page.locator('.modal')).toHaveCount(0);
    await expect(page.locator('.graph-edge__weight text')).toHaveText(['-3', '2']);
  });

  test('Graph editor - dragging a node follows the pointer', async ({ page }) => {
    await page.goto('/algorithm?category=graph');
    const node = page.locator('.graph-canvas .graph-node').first();
    const before = await node.boundingBox();
    const cx = before.x + before.width / 2;
    const cy = before.y + before.height / 2;

    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 120, cy + 40, { steps: 6 });
    await page.mouse.up();

    const after = await node.boundingBox();
    expect(Math.abs(after.x - before.x - 120)).toBeLessThan(4);
    expect(Math.abs(after.y - before.y - 40)).toBeLessThan(4);
  });

  test('Graph editor - add nodes and an edge with the tools', async ({ page }) => {
    await page.goto('/algorithm?category=graph');
    await page.getByRole('button', { name: /clear/i }).click();
    await expect(page.locator('.graph-canvas .graph-node')).toHaveCount(0);

    // Clear switches to the Node tool; click twice on empty canvas
    const canvas = page.locator('.graph-canvas svg');
    const box = await canvas.boundingBox();
    await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.5);
    await page.mouse.click(box.x + box.width * 0.7, box.y + box.height * 0.5);
    await expect(page.locator('.graph-canvas .graph-node')).toHaveCount(2);

    // Edge tool: click A then B
    await page.getByRole('button', { name: /^Edge$/ }).click();
    await page.locator('.graph-canvas .graph-node').nth(0).click();
    await page.locator('.graph-canvas .graph-node').nth(1).click();
    await expect(page.locator('.graph-canvas .graph-edge')).toHaveCount(1);
  });

  test('Pseudocode button is globally consistent and renders correctly', async ({ page }) => {
    // Check Sorting (Bubble Sort now has pseudocode)
    await page.goto('/algorithm?category=sorting');
    let pseudocodeBtn = page.locator('.btn-pseudocode');
    await expect(pseudocodeBtn).toBeVisible();
    await pseudocodeBtn.click();
    let pseudocodeModal = page.locator('.pseudocode-modal');
    await expect(pseudocodeModal).toBeVisible();
    await page.locator('.pseudocode-modal button').click(); // Close it

    // Check Graph
    await page.goto('/algorithm?category=graph');
    pseudocodeBtn = page.locator('.btn-pseudocode');
    await expect(pseudocodeBtn).toBeVisible();

    // Check Backtracking
    await page.goto('/algorithm?category=backtracking');
    pseudocodeBtn = page.locator('.btn-pseudocode');
    await expect(pseudocodeBtn).toBeVisible();
  });
});
