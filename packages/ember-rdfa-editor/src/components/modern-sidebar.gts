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
  'number' | 'icon' | 'skin'
>;

export type ModernSidebarTab = {
  /** Stable identifier used to track the selected tab. */
  id: string;
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
  @tracked selectedTabId?: string;

  private readonly uid = guidFor(this);

  get placement(): ModernSidebarPlacement {
    return this.args.placement ?? 'left';
  }

  get isHorizontal() {
    return this.placement === 'top';
  }

  get selectedIndex() {
    return this.args.tabs.findIndex((tab) => tab.id === this.selectedTabId);
  }

  get selectedTab(): ModernSidebarTab | undefined {
    const index = this.selectedIndex;
    return index >= 0 ? this.args.tabs[index] : undefined;
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
        badge,
        showBadge: this.hasBadge(badge),
        selected,
        tabDomId: this.tabDomId(index),
        panelDomId: this.panelDomId(index),
      };
    });
  }

  private badgeFor(tab: ModernSidebarTab) {
    if (!tab.badge) {
      return undefined;
    }

    return typeof tab.badge === 'function'
      ? tab.badge(this.args.controller)
      : tab.badge;
  }

  private hasBadge(badge: ModernSidebarBadge) {
    return Boolean(badge.number || badge.icon || badge.skin);
  }

  private tabDomId(index: number) {
    return `${this.uid}-tab-${index}`;
  }

  private panelDomId(index: number) {
    return `${this.uid}-panel-${index}`;
  }

  @action
  selectTab(id: string) {
    this.selectedTabId = this.selectedTabId === id ? undefined : id;
  }

  @action
  collapse() {
    this.selectedTabId = undefined;
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
            data-test-modern-sidebar-tab={{entry.tab.id}}
            {{on "click" (fn this.selectTab entry.tab.id)}}
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
                  @icon={{entry.badge.icon}}
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
        {{#if selectedTab}}
          <section
            id={{this.selectedPanelDomId}}
            class="say-modern-sidebar__pane"
            role="tabpanel"
            aria-labelledby={{this.selectedTabDomId}}
          >
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
          </section>
        {{/if}}
      {{/let}}
    </div>
  </template>
}
