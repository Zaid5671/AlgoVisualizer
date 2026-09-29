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
    await page.getByRole('button', { name: /practice it yourself/i }).click();
    await expect(page.locator('.practice-prompt')).toContainText(/pass 1/i);
  });

  test('Sorting practice - bubble sort pass by pass with click-to-swap', async ({ page }) => {
    await page.goto('/algorithm?category=sorting');
    await page.locator('.custom-array-input').fill('30, 10, 20');
    await page.locator('.btn-use-this').click();
    await page.getByRole('button', { name: /practice it yourself/i }).click();

    const bars = page.locator('.practice .bar-slot');
    await expect(bars).toHaveCount(3);

    // A wrong Check counts a mistake and keeps the round
    await page.getByRole('button', { name: /^Check$/ }).click();
    await expect(page.locator('.practice-feedback--error')).toBeVisible();
    await expect(page.locator('.practice-score')).toContainText('1');

    // Pass 1 of bubble sort on [30, 10, 20] ends as [10, 20, 30]
    await bars.nth(0).click();
    await bars.nth(1).click(); // [10, 30, 20]
    await bars.nth(1).click();
    await bars.nth(2).click(); // [10, 20, 30]
    await page.getByRole('button', { name: /^Check$/ }).click();
    await expect(page.locator('.practice-feedback--success')).toBeVisible();

    // Pass 2 makes no swaps, so bubble sort stops early
    await page.getByRole('button', { name: /^Check$/ }).click();
    await expect(page.locator('.practice-summary')).toContainText('Sorted!');
  });

  test('Sorting practice - hint ladder and quick sort pivot question', async ({ page }) => {
    await page.goto('/algorithm?category=sorting');
    await page.locator('.custom-array-input').fill('40, 10, 30, 20');
    await page.locator('.btn-use-this').click();
    await page.getByRole('button', { name: /Quick Sort/ }).click();
    await page.getByRole('button', { name: /practice it yourself/i }).click();

    // Pivot 20: only 10 is smaller, so it lands at position 1. Clicking position 3 is wrong.
    await page.locator('.practice .bar-slot').nth(3).click();
    await expect(page.locator('.practice-feedback--error')).toBeVisible();
    await page.locator('.practice .bar-slot').nth(1).click();
    await expect(page.locator('.practice-feedback--success')).toBeVisible();

    // Hint -> Show where -> Show me advances the round
    const before = await page.locator('.status-pill').textContent();
    await page.getByRole('button', { name: /^Hint$/ }).click();
    await expect(page.locator('.practice-prompt__nudge')).toBeVisible();
    await page.getByRole('button', { name: /Show where/ }).click();
    await expect(page.locator('.practice .is-hint')).toHaveCount(1);
    await page.getByRole('button', { name: /Show me/ }).click();
    await expect(page.locator('.status-pill')).not.toHaveText(before);
  });

  test('Pathfinding - draw a wall and run to the end', async ({ page }) => {
    await page.goto('/algorithm?category=pathfinding');
    const cell = page.locator('.path-cell[data-cell="2,2"]');
    await cell.click();
    await expect(cell).toHaveClass(/is-wall/);

    const scrubber = page.locator('.playback__scrubber input[type="range"]');
    const max = await scrubber.getAttribute('max');
    await scrubber.fill(max);
    await expect(page.locator('.path-grid .path-cell.path').first()).toBeVisible();
  });

  test('Pathfinding practice - A* with hints, skip and path tracing', async ({ page }) => {
    await page.goto('/algorithm?category=pathfinding');
    await page.getByRole('button', { name: /^A\* Search/ }).click();
    await page.getByRole('button', { name: /practice it yourself/i }).click();
    await expect(page.locator('.practice-prompt')).toContainText('A*');

    // Mud in the middle of the grid isn't on the frontier yet
    await page.locator('.practice .path-cell.is-mud').first().click();
    await expect(page.locator('.practice-feedback--error')).toBeVisible();

    // Hint -> Show where highlights valid cells; clicking one is correct
    await page.getByRole('button', { name: /^Hint$/ }).click();
    await page.getByRole('button', { name: /Show where/ }).click();
    await page.locator('.practice .path-cell.hint').first().click();
    await expect(page.locator('.practice-feedback--success')).toBeVisible();

    // Skip until the trace phase, then trace back using the highlighted answers
    for (let i = 0; i < 20 && !/trace/i.test(await page.locator('.practice-prompt').textContent()); i++) {
      await page.getByRole('button', { name: /Skip 5/ }).click();
    }
    // Skip stops at the start of the trace phase instead of tracing for you
    await expect(page.locator('.practice-prompt')).toContainText('Now trace the shortest path back');
    await expect(page.getByRole('button', { name: /Skip 5/ })).toHaveCount(0);
    for (let i = 0; i < 40 && (await page.locator('.practice-summary').count()) === 0; i++) {
      await page.getByRole('button', { name: /^Hint$/ }).click();
      await page.getByRole('button', { name: /Show where/ }).click();
      await page.locator('.practice .path-cell.hint').first().click();
    }
    await expect(page.locator('.practice-summary')).toContainText('Target reached!');
  });

  // Presses Hint -> Show where -> Show me (then Check when the round needs it) until the summary shows.
  async function solveWithShowMe(page, limit = 40) {
    for (let i = 0; i < limit && (await page.locator('.practice-summary').count()) === 0; i++) {
      for (const label of [/^Hint$/, /^Show where$/, /^Show me$/]) {
        await page.getByRole('button', { name: label }).click();
      }
      const check = page.getByRole('button', { name: /^Check$/ });
      if (await check.count()) await check.click();
    }
  }

  test('Graph practice - Dijkstra: wrong pick, hint, then finish', async ({ page }) => {
    await page.goto('/algorithm?category=graph');
    await page.getByRole('button', { name: "Dijkstra's Algorithm" }).click();
    await page.getByRole('button', { name: /practice it yourself/i }).click();
    await expect(page.locator('.dist-table')).toBeVisible();

    // Unfinished nodes that are still at infinity can't be picked
    const far = page.locator('.practice .graph-node').filter({ hasText: /^F/ });
    await far.click();
    await expect(page.locator('.practice-feedback--error')).toBeVisible();

    await page.getByRole('button', { name: /^Hint$/ }).click();
    await page.getByRole('button', { name: /Show where/ }).click();
    await page.locator('.practice .graph-node.is-hint').first().click();
    await expect(page.locator('.practice-feedback--success')).toBeVisible();

    await solveWithShowMe(page);
    await expect(page.locator('.practice-summary')).toContainText('Shortest distances found!');
  });

  test('Graph practice - Kruskal, Bellman-Ford and Tarjan run to completion', async ({ page }) => {
    await page.goto('/algorithm?category=graph');

    await page.getByRole('button', { name: "Kruskal's MST" }).click();
    await page.getByRole('button', { name: /practice it yourself/i }).click();
    await expect(page.locator('.edge-list')).toBeVisible();
    await solveWithShowMe(page);
    await expect(page.locator('.practice-summary')).toContainText('Minimum spanning tree built!');

    await page.getByRole('button', { name: 'watch', exact: true }).click();
    await page.locator('.text-input--select').selectOption('negative');
    await page.getByRole('button', { name: 'Bellman-Ford' }).click();
    await page.getByRole('button', { name: /practice it yourself/i }).click();
    await expect(page.locator('.practice .text-input--cell').first()).toBeVisible();
    await solveWithShowMe(page);
    await expect(page.locator('.practice-summary')).toContainText('Shortest distances found!');

    await page.getByRole('button', { name: 'watch', exact: true }).click();
    await page.locator('.text-input--select').selectOption('scc');
    await page.getByRole('button', { name: "Tarjan's SCC" }).click();
    await page.getByRole('button', { name: /practice it yourself/i }).click();
    await solveWithShowMe(page);
    await expect(page.locator('.practice-summary')).toContainText('Components found!');
  });

  test('Graph practice - Dijkstra is blocked on negative weights', async ({ page }) => {
    await page.goto('/algorithm?category=graph');
    await page.locator('.text-input--select').selectOption('negative');
    await page.getByRole('button', { name: "Dijkstra's Algorithm" }).click();
    await page.getByRole('button', { name: /practice it yourself/i }).click();
    await expect(page.locator('.practice .graph-issue')).toContainText('negative');
    await page.getByRole('button', { name: /Load the classic graph/ }).click();
    await expect(page.locator('.dist-table')).toBeVisible();
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
