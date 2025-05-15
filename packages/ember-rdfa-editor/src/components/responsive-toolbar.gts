import { action } from '@ember/object';
import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import { Velcro } from 'ember-velcro';
import { tracked } from 'tracked-built-ins';
import { hash } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { ThreeDotsIcon } from '@appuniversum/ember-appuniversum/components/icons/three-dots';
import { NavDownIcon } from '@appuniversum/ember-appuniversum/components/icons/nav-down';
import ToolbarGroup from '#root/components/toolbar/group.gts';
import ToolbarButton from '#root/components/toolbar/button.ts';
import ToolbarDivider from '#root/components/toolbar/divider.gts';
import type { ComponentLike } from '@glint/template';

type ToolbarSection = {
  reference?: HTMLElement;
  dropdown?: HTMLElement;
  enableDropdown: boolean;
  showDropdown: boolean;
};
interface Sig {
  Blocks: {
    main: [{ Group: ComponentLike; Divider: ComponentLike }];
    side: [{ Group: ComponentLike; Divider: ComponentLike }];
  };
}

export default class ResponsiveToolbar extends Component<Sig> {
  toolbar?: HTMLElement;

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

  <template>
    <div class="say-toolbar" {{this.setUpToolbar}}>
      {{#if (has-block "main")}}
        <div class="say-toolbar__main" {{this.setUpMainToolbar}}>
          {{yield (hash Group=ToolbarGroup Divider=ToolbarDivider) to="main"}}
          <Velcro
            @placement="bottom-end"
            @offsetOptions={{hash mainAxis=10}}
            @strategy="absolute"
            as |velcro|
          >
            {{#if this.main.enableDropdown}}
              <ToolbarGroup data-ignore-resize {{velcro.hook}}>
                <ToolbarButton
                  @icon={{ThreeDotsIcon}}
                  title={{t "ember-rdfa-editor.utils.more-options"}}
                  {{on "click" this.toggleMainDropdown}}
                  @active={{this.main.showDropdown}}
                />
              </ToolbarGroup>
            {{/if}}
            <div
              class="say-toolbar__main-dropdown"
              data-ignore-resize
              data-hidden={{if this.main.showDropdown "false" "true"}}
              {{velcro.loop}}
              {{this.setUpMainDropdown}}
            >
              {{yield
                (hash Group=ToolbarGroup Divider=ToolbarDivider)
                to="main"
              }}
            </div>
          </Velcro>
        </div>
      {{/if}}
      {{#if (has-block "side")}}
        <div class="say-toolbar__side" {{this.setUpSideToolbar}}>
          {{yield (hash Group=ToolbarGroup Divider=ToolbarDivider) to="side"}}
          <Velcro
            @placement="bottom-end"
            @offsetOptions={{hash mainAxis=10}}
            @strategy="absolute"
            as |velcro|
          >
            {{#if this.side.enableDropdown}}
              <ToolbarGroup data-ignore-resize {{velcro.hook}}>
                <ToolbarButton
                  @icon={{NavDownIcon}}
                  title={{t "ember-rdfa-editor.utils.more-options"}}
                  {{on "click" this.toggleSideDropdown}}
                  @active={{this.side.showDropdown}}
                />
              </ToolbarGroup>
            {{/if}}
            <div
              class="say-toolbar__side-dropdown"
              data-ignore-resize
              data-hidden={{if this.side.showDropdown "false" "true"}}
              {{velcro.loop}}
              {{this.setUpSideDropdown}}
            >
              {{yield
                (hash Group=ToolbarGroup Divider=ToolbarDivider)
                to="side"
              }}
            </div>
          </Velcro>
        </div>
      {{/if}}
    </div>
  </template>
}
