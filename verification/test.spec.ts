import { test, expect } from '@playwright/test';

test('take screenshots', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('http://localhost:3000');
  await page.screenshot({ path: 'verification/welcome_screen.png' });

  await page.goto('http://localhost:3000/onboarding/avatar');
  await page.screenshot({ path: 'verification/onboarding_avatar.png' });

  await page.goto('http://localhost:3000/onboarding/confirm');
  await page.screenshot({ path: 'verification/onboarding_confirm.png' });

  await page.goto('http://localhost:3000/feed');
  await page.screenshot({ path: 'verification/feed.png' });

  await page.goto('http://localhost:3000/profile');
  await page.screenshot({ path: 'verification/profile.png' });

  await page.goto('http://localhost:3000/chat');
  await page.screenshot({ path: 'verification/chat.png' });
});
