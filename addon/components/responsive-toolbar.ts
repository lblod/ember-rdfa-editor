import { action } from '@ember/object';
import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import { tracked } from 'tracked-built-ins';

export default class ResponsiveToolbar extends Component {
  toolbar?: HTMLElement;

  main: {
    toolbar?: HTMLElement;
    dropdown?: HTMLElement;
    enableDropdown: boolean;
    showDropdown: boolean;
  } = tracked({
    enableDropdown: false,
    showDropdown: false,
  });

  side: {
    toolbar?: HTMLElement;
    dropdown?: HTMLElement;
    enableDropdown: boolean;
    showDropdown: boolean;
  } = tracked({
    enableDropdown: false,
    showDropdown: false,
  });

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
      this.main.toolbar = element;
      // Call handleResize to ensure the toolbar is correctly initialized
      this.handleResize();
    },
    { eager: false }
  );

  setUpSideToolbar = modifier(
    (element: HTMLElement) => {
      this.side.toolbar = element;
      // Call handleResize to ensure the toolbar is correctly initialized
      this.handleResize();
    },
    { eager: false }
  );

  setUpMainDropdown = modifier(
    (element: HTMLElement) => {
      this.main.dropdown = element;
      // Call handleResize to ensure the toolbar is correctly initialized
      this.handleResize();
    },
    { eager: false }
  );

  setUpSideDropdown = modifier(
    (element: HTMLElement) => {
      this.side.dropdown = element;
      // Call handleResize to ensure the toolbar is correctly initialized
      this.handleResize();
    },
    { eager: false }
  );

  @action
  toggleMainDropdown() {
    this.main.showDropdown = !this.main.showDropdown;
    if (this.main.showDropdown) {
      this.side.showDropdown = false;
    }
  }

  @action
  toggleSideDropdown() {
    this.side.showDropdown = !this.side.showDropdown;
    if (this.side.showDropdown) {
      this.main.showDropdown = false;
    }
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
      this.main.enableDropdown = false;
      this.side.enableDropdown = false;
      if (this.toolbar) {
        const toolbarChildren = [
          ...(this.side.toolbar?.children ?? []),
          ...(this.main.toolbar?.children ?? []),
        ];
        for (const child of toolbarChildren) {
          if (!child.hasAttribute('data-ignore-resize')) {
            child.removeAttribute('data-hidden');
          }
        }
        const dropdownChildren = [
          ...(this.side.dropdown?.children ?? []),
          ...(this.main.dropdown?.children ?? []),
        ];
        for (const child of dropdownChildren) {
          if (!child.hasAttribute('data-ignore-resize')) {
            child.setAttribute('data-hidden', 'true');
          }
        }
        if (this.side.toolbar && this.side.dropdown) {
          let i = this.side.toolbar.childElementCount - 1;
          while (i >= 0 && this.isOverflowing()) {
            const child = this.side.toolbar.children[i];
            if (!child.hasAttribute('data-ignore-resize')) {
              this.side.enableDropdown = true;
              child.setAttribute('data-hidden', 'true');
              this.side.dropdown.children[i].setAttribute(
                'data-hidden',
                'false'
              );
            }
            i--;
          }
        }
        if (this.main.toolbar && this.main.dropdown) {
          let i = this.main.toolbar.childElementCount - 1;
          while (i >= 0 && this.isOverflowing()) {
            const child = this.main.toolbar.children[i];
            if (!child.hasAttribute('data-ignore-resize')) {
              this.main.enableDropdown = true;
              child.setAttribute('data-hidden', 'true');
              this.main.dropdown.children[i].setAttribute(
                'data-hidden',
                'false'
              );
            }
            i--;
          }
        }
      }
    });
  }
}
