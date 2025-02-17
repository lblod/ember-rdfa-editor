import { promises as fs } from 'fs';
import * as path from 'path';

import { type Locator, type Page, expect } from '@playwright/test';

export class EditorPage {
  readonly page: Page;
  readonly editorContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editorContainer = page.locator('.say-editor__inner.say-content');
    this.editorContainer.locator('p');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.click('button:has-text("Empty")');
  }

  async fillEditor(text: string) {
    await this.editorContainer.fill(text);
  }

  async compareEditorSnapshot(name: string) {
    await expect(this.editorContainer).toHaveScreenshot(`${name}.png`, {
      stylePath: path.join(__dirname, 'screenshot.css'),
    });
  }

  async setEditorContentFromHtml(file: string) {
    const html = await fs.readFile(
      path.join(__dirname, '..', 'files', `${file}.html`),
      'utf8',
    );

    await this.page.evaluate((html) => {
      window.__PC.setHtmlContent(html);
    }, html);

    return this;
  }

  async setEditorContentAndCompareSnapshot(file: string, name: string) {
    await this.setEditorContentFromHtml(file);
    await this.compareEditorSnapshot(name);
  }
}
