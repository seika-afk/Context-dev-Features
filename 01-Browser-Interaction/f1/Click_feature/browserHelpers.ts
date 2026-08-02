import { chromium } from "playwright";

export const startBrowser = async () => {
  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(10000);
  await page.addInitScript(() => {
    (window as any).__name = (fn: unknown) => fn;
  });
  return { browser, page };
};

export const clickByText = async (page: import('playwright').Page, text: string) => {
  const roles = [
    'link',
    'button',
    'menuitem',
    'tab',
    'option',
    'checkbox',
    'radio',
    'switch',
    'treeitem',
    'gridcell',
    'menuitemcheckbox',
    'menuitemradio',
  ] as const;

  for (const role of roles) {
    const locator = page.getByRole(role, { name: text });
    const count = await locator.count();
    if (count > 0) {
      await locator.first().click({ force: true });
      return;
    }
  }

  const exactText = page.getByText(text, { exact: true });
  if (await exactText.count() > 0) {
    await exactText.first().click({ force: true });
    return;
  }

  //loose text match
  await page.getByText(text).first().click({ force: true });
};
