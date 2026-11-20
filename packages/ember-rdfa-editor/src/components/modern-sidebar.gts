import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import type { ComponentLike } from '@glint/template';
import AuBadge, {
  type AuBadgeSignature,
} from '@appuniversum/ember-appuniversum/components/au-badge';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuIcon, {
  type AuIconSignature,
} from '@appuniversum/ember-appuniversum/components/au-icon';
import { ChevronLeftIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-left';
import { ChevronRightIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-right';
import { ChevronUpIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-up';
import t from 'ember-intl/helpers/t';
import type SayController from '#root/core/say-controller.ts';

export type ModernSidebarPlacement = 'left' | 'right' | 'top';

export type ModernSidebarBadge = Pick<
  AuBadgeSignature['Args'],
  'number' | 'skin'
>;

export type ModernSidebarTab = {
  /** Used for the tab tooltip and the pane title. */
  title: string;
  icon: AuIconSignature['Args']['icon'];
  /** Rendered in the shared pane when this tab is selected. */
  paneContent: ComponentLike<{ Args: { controller: SayController } }>;
  /**
   * Optional badge shown on the tab.
   *
   * Pass an object for static badges, or a function to derive the badge from
   * controller state. Returning `undefined` hides the badge.
   */
  badge?:
    | ModernSidebarBadge
    | ((controller: SayController) => ModernSidebarBadge | undefined);
};

type ModernSidebarSignature = {
  Args: {
    controller: SayController;
    tabs: ModernSidebarTab[];
    /** @default 'left' */
    placement?: ModernSidebarPlacement;
  };
  Element: HTMLDivElement;
};

export default class ModernSidebar extends Component<ModernSidebarSignature> {
  @tracked selectedIndex = -1;

  private readonly uid = guidFor(this);

  get placement(): ModernSidebarPlacement {
    return this.args.placement ?? 'left';
  }

  get isHorizontal() {
    return this.placement === 'top';
  }

  get selectedTab(): ModernSidebarTab | undefined {
    return this.selectedIndex >= 0
      ? this.args.tabs[this.selectedIndex]
      : undefined;
  }

  get selectedTabDomId() {
    return this.tabDomId(this.selectedIndex);
  }

  get selectedPanelDomId() {
    return this.panelDomId(this.selectedIndex);
  }

  get collapseIcon() {
    switch (this.placement) {
      case 'left':
        return ChevronLeftIcon;
      case 'top':
        return ChevronUpIcon;
      default:
        return ChevronRightIcon;
    }
  }

  get renderedTabs() {
    const selectedIndex = this.selectedIndex;

    return this.args.tabs.map((tab, index) => {
      const badge: ModernSidebarBadge = this.badgeFor(tab) ?? {};
      const selected = index === selectedIndex;

      return {
        tab,
        index,
        badge,
        showBadge: this.hasBadge(badge),
        selected,
        tabDomId: this.tabDomId(index),
        panelDomId: this.panelDomId(index),
      };
    });
  }

  private badgeFor(tab: ModernSidebarTab) {
    return typeof tab.badge === 'function'
      ? tab.badge(this.args.controller)
      : tab.badge;
  }

  private hasBadge(badge: ModernSidebarBadge) {
    return Boolean(badge.number || badge.skin);
  }

  private tabDomId(index: number) {
    return `${this.uid}-tab-${index}`;
  }

  private panelDomId(index: number) {
    return `${this.uid}-panel-${index}`;
  }

  @action
  selectTab(index: number) {
    this.selectedIndex = this.selectedIndex === index ? -1 : index;
  }

  @action
  collapse() {
    this.selectedIndex = -1;
  }

  <template>
    <div
      class="say-modern-sidebar say-modern-sidebar--{{this.placement}}"
      ...attributes
    >
      <div
        class="say-modern-sidebar__ribbon"
        role="tablist"
        aria-orientation={{if this.isHorizontal "horizontal" "vertical"}}
      >
        {{#each this.renderedTabs as |entry|}}
          <button
            type="button"
            id={{entry.tabDomId}}
            class="say-modern-sidebar__tab {{if entry.selected 'is-active'}}"
            role="tab"
            aria-selected={{entry.selected}}
            aria-controls={{if entry.selected entry.panelDomId}}
            aria-label={{entry.tab.title}}
            title={{entry.tab.title}}
            data-test-modern-sidebar-tab={{entry.index}}
            {{on "click" (fn this.selectTab entry.index)}}
          >
            <span class="say-modern-sidebar__tab-icon" role="presentation">
              <AuIcon
                @icon={{entry.tab.icon}}
                @ariaHidden={{true}}
                @size="large"
                role="presentation"
              />
              {{#if entry.showBadge}}
                <AuBadge
                  class="say-modern-sidebar__badge"
                  @number={{entry.badge.number}}
                  @skin={{entry.badge.skin}}
                  @size="small"
                  role="presentation"
                />
              {{/if}}
            </span>
          </button>
        {{/each}}
      </div>

      {{#let this.selectedTab as |selectedTab|}}
        <section
          id={{if selectedTab this.selectedPanelDomId}}
          class="say-modern-sidebar__pane {{if selectedTab 'is-open'}}"
          role="tabpanel"
          aria-hidden={{unless selectedTab "true"}}
          aria-labelledby={{if selectedTab this.selectedTabDomId}}
          inert={{unless selectedTab true}}
        >
          {{#if selectedTab}}
            <header class="say-modern-sidebar__pane-header">
              <h2
                class="say-modern-sidebar__pane-title"
                title={{selectedTab.title}}
              >
                {{selectedTab.title}}
              </h2>
              <AuButton
                class="say-modern-sidebar__collapse"
                @skin="naked"
                @hideText={{true}}
                @icon={{this.collapseIcon}}
                {{on "click" this.collapse}}
              >
                {{t "ember-rdfa-editor.utils.collapse-sidebar"}}
              </AuButton>
            </header>
            <div class="say-modern-sidebar__pane-content">
              {{#let selectedTab.paneContent as |PaneContent|}}
                <PaneContent @controller={{@controller}} />
              {{/let}}
            </div>
          {{/if}}
        </section>
      {{/let}}
    </div>
  </template>
}
