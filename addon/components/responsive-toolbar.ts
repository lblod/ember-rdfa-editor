import { action } from '@ember/object';
import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import { Velcro } from 'ember-velcro';
import { tracked } from 'tracked-built-ins';
import { dependencySatisfies, macroCondition } from '@embroider/macros';
import { importSync } from '@embroider/macros';
const ThreeDotsIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/three-dots')
      .ThreeDotsIcon
  : 'three-dots';
const NavDownIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/nav-down')
      .NavDownIcon
  : 'nav-down';

type ToolbarSection = {
  reference?: HTMLElement;
  dropdown?: HTMLElement;
  enableDropdown: boolean;
  showDropdown: boolean;
};

export default class ResponsiveToolbar extends Component {
  ThreeDotsIcon = ThreeDotsIcon;
  NavDownIcon = NavDownIcon;

  toolbar?: HTMLElement;
  Velcro = Velcro;

  main: ToolbarSection = tracked({
    enableDropdown: false,
    showDropdown: false,
  });

  side: ToolbarSection = tracked({
    enableDropdown: false,
    showDropdown: false,
  });

  setUpToolbar = modifier((element: HTMLElement) => {
    const observer = new ResizeObserver(this.handleResize.bind(this));
    observer.observe(element);
    this.toolbar = element;
    return () => {
      observer.disconnect();
    };
  });

  setUpMainToolbar = modifier((element: HTMLElement) => {
    const observer = new ResizeObserver(this.handleResize.bind(this));
    observer.observe(element);
    if (element.children.length) {
      const childs = element.children;
      for (const child of childs) {
        observer.observe(child);
      }
    }
    this.main.reference = element;
    // Call handleResize to ensure the toolbar is correctly initialized
    this.handleResize();
    return () => {
      observer.disconnect();
    };
  });

  setUpSideToolbar = modifier((element: HTMLElement) => {
    const observer = new ResizeObserver(this.handleResize.bind(this));
    observer.observe(element);
    if (element.children.length) {
      const childs = element.children;
      for (const child of childs) {
        observer.observe(child);
      }
    }
    this.side.reference = element;
    // Call handleResize to ensure the toolbar is correctly initialized
    this.handleResize();
    return () => {
      observer.disconnect();
    };
  });

  setUpMainDropdown = modifier((element: HTMLElement) => {
    this.main.dropdown = element;
    // Call handleResize to ensure the toolbar is correctly initialized
    this.handleResize();
  });

  setUpSideDropdown = modifier((element: HTMLElement) => {
    this.side.dropdown = element;
    // Call handleResize to ensure the toolbar is correctly initialized
    this.handleResize();
  });

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

  get isOverflowing() {
    if (this.toolbar) {
      return this.toolbar?.scrollWidth > this.toolbar?.offsetWidth;
    } else {
      return false;
    }
  }

  handleResize() {
    requestAnimationFrame(() => {
      this.main.enableDropdown = false;
      this.side.enableDropdown = false;
      if (this.toolbar) {
        const toolbarChildren = [
          ...(this.side.reference?.children ?? []),
          ...(this.main.reference?.children ?? []),
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
          child.setAttribute('data-hidden', 'true');
        }
        if (this.side.reference && this.side.dropdown) {
          let i = this.side.reference.childElementCount - 1;
          while (i >= 0 && this.isOverflowing) {
            const toolbarChild = this.side.reference.children[i];
            if (!toolbarChild.hasAttribute('data-ignore-resize')) {
              const dropdownChild = this.side.dropdown.children[i];
              this.side.enableDropdown = true;
              toolbarChild.setAttribute('data-hidden', 'true');
              dropdownChild.setAttribute('data-hidden', 'false');
            }
            i--;
          }
        }
        if (this.main.reference && this.main.dropdown) {
          let i = this.main.reference.childElementCount - 1;
          while (i >= 0 && this.isOverflowing) {
            const toolbarChild = this.main.reference.children[i];
            if (!toolbarChild.hasAttribute('data-ignore-resize')) {
              const dropdownChild = this.main.dropdown.children[i];
              this.main.enableDropdown = true;
              toolbarChild.setAttribute('data-hidden', 'true');
              dropdownChild.setAttribute('data-hidden', 'false');
            }
            i--;
          }
        }
      }
    });
  }
}
