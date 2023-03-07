import { action } from '@ember/object';
import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import { tracked } from 'tracked-built-ins';

export default class ResponsiveToolbar extends Component {
  toolbar?: HTMLElement;
  mainToolbar?: HTMLElement;
  sideToolbar?: HTMLElement;

  @tracked showSideOptionsButton = false;
  @tracked showMainOptionsButton = false;

  @tracked showMainOptionsDropdown = false;

  setUpToolbar = modifier(
    (element: HTMLElement) => {
      const observer = new ResizeObserver(this.handleResize.bind(this));
      observer.observe(element);
      this.toolbar = element;
    },
    { eager: false }
  );

  setUpMainToolbar = modifier(
    (element: HTMLElement) => {
      this.mainToolbar = element;
      // Call handleResize to ensure the toolbar is correctly initialized
      this.handleResize();
    },
    { eager: false }
  );

  setUpSideToolbar = modifier(
    (element: HTMLElement) => {
      this.sideToolbar = element;
      // Call handleResize to ensure the toolbar is correctly initialized
      this.handleResize();
    },
    { eager: false }
  );

  @action
  toggleMainOptions() {
    this.showMainOptionsDropdown = !this.showMainOptionsDropdown;
  }

  isOverflowing = () => {
    if (this.toolbar) {
      return this.toolbar?.scrollWidth > this.toolbar?.offsetWidth;
    } else {
      return false;
    }
  };

  handleResize() {
    requestAnimationFrame(() => {
      this.showSideOptionsButton = false;
      this.showMainOptionsButton = false;
      if (this.toolbar) {
        if (this.sideToolbar) {
          for (const child of this.sideToolbar.children) {
            if (!child.hasAttribute('data-ignore-resize')) {
              child.removeAttribute('data-hidden');
            }
          }
        }
        if (this.mainToolbar) {
          for (const child of this.mainToolbar.children) {
            if (!child.hasAttribute('data-ignore-resize')) {
              child.removeAttribute('data-hidden');
            }
          }
        }
        if (this.sideToolbar) {
          let i = this.sideToolbar.childElementCount - 1;
          while (i >= 0 && this.isOverflowing()) {
            const child = this.sideToolbar.children[i];
            if (!child.hasAttribute('data-ignore-resize')) {
              this.showSideOptionsButton = true;
              child.setAttribute('data-hidden', 'true');
            }
            i--;
          }
        }
        if (this.mainToolbar) {
          let i = this.mainToolbar.childElementCount - 1;
          while (i >= 0 && this.isOverflowing()) {
            const child = this.mainToolbar.children[i];
            if (!child.hasAttribute('data-ignore-resize')) {
              this.showMainOptionsButton = true;
              child.setAttribute('data-hidden', 'true');
            }
            i--;
          }
        }
      }
    });
  }
}
