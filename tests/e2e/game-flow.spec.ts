import { test, expect } from '@playwright/test';

test.describe('Complete Game Flow', () => {
  test('should complete full game workflow', async ({ browser }) => {
    // Create host and player contexts
    const hostContext = await browser.newContext();
    const playerContext = await browser.newContext();
    
    const hostPage = await hostContext.newPage();
    const playerPage = await playerContext.newPage();

    // Host creates room
    await hostPage.goto('/');
    await hostPage.click('[data-testid="create-room"]');
    
    // Get room code
    const roomCodeElement = hostPage.locator('[data-testid="room-code"]');
    const roomCode = await roomCodeElement.textContent();
    expect(roomCode).toBeTruthy();

    // Player joins room
    await playerPage.goto(`/play/${roomCode}`);
    await playerPage.fill('[data-testid="player-name"]', 'TestPlayer');
    await playerPage.click('[data-testid="join-game"]');
    
    // Verify player appears in host lobby
    await expect(hostPage.locator('[data-testid="player-list"]')).toContainText('TestPlayer');

    // Host adds video
    await hostPage.fill('[data-testid="video-url"]', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await hostPage.click('[data-testid="add-video"]');
    
    // Start game
    await hostPage.click('[data-testid="start-game"]');

    // Both should be in parlay phase
    await expect(hostPage.locator('[data-testid="parlay-phase"]')).toBeVisible();
    await expect(playerPage.locator('[data-testid="parlay-entry"]')).toBeVisible();

    // Player submits parlay
    await playerPage.fill('[data-testid="parlay-text"]', 'something amazing happens');
    await playerPage.click('[data-testid="lock-parlay"]');

    // Host locks parlays
    await hostPage.click('[data-testid="lock-parlays"]');

    // Should transition to video phase
    await expect(hostPage.locator('[data-testid="video-player"]')).toBeVisible();
    await expect(playerPage.locator('[data-testid="it-happened-button"]')).toBeVisible();

    // Player calls event
    await playerPage.click('[data-testid="it-happened-button"]');
    await playerPage.click('[data-testid="select-parlay-0"]');

    // Host should see pause screen
    await expect(hostPage.locator('[data-testid="pause-screen"]')).toBeVisible();
    
    console.log('✅ Complete game flow test passed');
  });

  test('should handle reconnection properly', async ({ browser }) => {
    // Test player reconnection during game
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/play/TEST123');
    await page.fill('[data-testid="player-name"]', 'ReconnectTest');
    await page.click('[data-testid="join-game"]');

    // Simulate disconnect and reconnect
    await page.reload();
    
    // Should be able to rejoin
    await page.fill('[data-testid="player-name"]', 'ReconnectTest');
    await page.click('[data-testid="join-game"]');
    
    // Should return to correct game state
    await expect(page.locator('[data-testid="player-lobby"]')).toBeVisible();
    
    console.log('✅ Reconnection test passed');
  });
});
