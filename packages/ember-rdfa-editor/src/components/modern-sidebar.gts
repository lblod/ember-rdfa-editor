import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { eq } from 'ember-truth-helpers';
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
import { shift, type Middleware } from '@floating-ui/dom';
import t from 'ember-intl/helpers/t';
import type SayController from '#root/core/say-controller.ts';
import floatingUI from '#root/modifiers/_private/floating-ui.ts';

export type ModernSidebarPlacement = 'left' | 'right' | 'top';

type BadgeNumber = NonNullable<AuBadgeSignature['Args']['number']>;

export type ModernSidebarBadge = {
  number: BadgeNumber;
  skin?: AuBadgeSignature['Args']['skin'];
};

export type ModernSidebarTab = {
  title: string;
  icon: AuIconSignature['Args']['icon'];
  paneContent: ComponentLike<{ Args: { controller: SayController } }>;
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

function badgeFor(
  controller: SayController,
  tab: ModernSidebarTab,
): ModernSidebarBadge | undefined {
  return typeof tab.badge === 'function' ? tab.badge(controller) : tab.badge;
}

export default class ModernSidebar extends Component<ModernSidebarSignature> {
  @tracked selectedIndex = -1;

  private readonly uid = guidFor(this);
  private readonly topPaneMiddleware: Middleware[] = [shift({ padding: 8 })];

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

  private tabDomId(uid: string, index: number) {
    return `${uid}-tab-${index}`;
  }
  private panelDomId(uid: string, index: number) {
    return `${uid}-panel-${index}`;
  }

  get selectedTabDomId() {
    return this.tabDomId(this.uid, this.selectedIndex);
  }

  get selectedPanelDomId() {
    return this.panelDomId(this.uid, this.selectedIndex);
  }

  get ribbonDomId() {
    return `${this.uid}-ribbon`;
  }

  get ribbonReference() {
    return `#${this.ribbonDomId}`;
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
        id={{this.ribbonDomId}}
        class="say-modern-sidebar__ribbon"
        role="tablist"
        aria-orientation={{if this.isHorizontal "horizontal" "vertical"}}
      >
        {{#each @tabs as |tab index|}}
          {{#let (eq index this.selectedIndex) as |selected|}}
            <button
              type="button"
              id={{this.tabDomId index}}
              class="say-modern-sidebar__tab {{if selected 'is-active'}}"
              role="tab"
              aria-selected={{if selected "true" "false"}}
              aria-controls={{if selected (this.panelDomId index)}}
              aria-label={{tab.title}}
              title={{tab.title}}
              data-test-modern-sidebar-tab={{index}}
              {{on "click" (fn this.selectTab index)}}
            >
              <span class="say-modern-sidebar__tab-icon" role="presentation">
                <AuIcon
                  @icon={{tab.icon}}
                  @ariaHidden={{true}}
                  @size="large"
                  role="presentation"
                />
                {{#let (badgeFor @controller tab) as |badge|}}
                  {{#if badge}}
                    <AuBadge
                      class="say-modern-sidebar__badge"
                      @number={{badge.number}}
                      @skin={{badge.skin}}
                      @size="small"
                      role="presentation"
                    />
                  {{/if}}
                {{/let}}
              </span>
            </button>
          {{/let}}
        {{/each}}
      </div>

      {{#let this.selectedTab as |selectedTab|}}
        {{#if selectedTab}}
          <section
            id={{this.selectedPanelDomId}}
            class="say-modern-sidebar__pane"
            role="tabpanel"
            aria-labelledby={{this.selectedTabDomId}}
            {{floatingUI
              referenceElement=this.ribbonReference
              enabled=this.isHorizontal
              placement="bottom-start"
              strategy="absolute"
              middleware=this.topPaneMiddleware
            }}
          >
            <header class="say-modern-sidebar__pane-header">
              <div class="say-modern-sidebar__pane-heading">
                <h2
                  class="say-modern-sidebar__pane-title"
                  title={{selectedTab.title}}
                >
                  {{selectedTab.title}}
                </h2>
                {{#let (badgeFor @controller selectedTab) as |badge|}}
                  {{#if badge}}
                    <AuBadge
                      class="say-modern-sidebar__pane-badge"
                      @number={{badge.number}}
                      @skin={{badge.skin}}
                      @size="small"
                    />
                  {{/if}}
                {{/let}}
              </div>
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
