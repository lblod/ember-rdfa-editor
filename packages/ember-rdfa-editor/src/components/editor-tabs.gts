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
import { shift, type Middleware } from '@floating-ui/dom';
import t from 'ember-intl/helpers/t';
import type SayController from '#root/core/say-controller.ts';
import floatingUI from '#root/modifiers/_private/floating-ui.ts';

export type TabPanelPlacement = 'left' | 'right' | 'bottom';

type BadgeNumber = NonNullable<AuBadgeSignature['Args']['number']>;

export type EditorTabBadge = {
  number: BadgeNumber;
  skin?: AuBadgeSignature['Args']['skin'];
};

export type EditorTab = {
  title: string;
  icon: AuIconSignature['Args']['icon'];
  panelContent: ComponentLike<{ Args: { controller: SayController } }>;
  badge?:
    | EditorTabBadge
    | ((controller: SayController) => EditorTabBadge | undefined);
};

type EditorTabsSignature = {
  Args: {
    controller: SayController;
    tabs: EditorTab[];
    panelPlacement: TabPanelPlacement;
  };
  Element: HTMLDivElement;
};

function badgeFor(
  controller: SayController,
  tab: EditorTab,
): EditorTabBadge | undefined {
  return typeof tab.badge === 'function' ? tab.badge(controller) : tab.badge;
}

export default class EditorTabs extends Component<EditorTabsSignature> {
  @tracked selectedIndex = -1;

  private readonly uid = guidFor(this);
  private readonly bottomPanelMiddleware: Middleware[] = [
    shift({ padding: 8 }),
  ];

  get panelPlacement(): TabPanelPlacement {
    return this.args.panelPlacement;
  }

  get isBottomPanel() {
    return this.panelPlacement === 'bottom';
  }

  get selectedTab(): EditorTab | undefined {
    return this.selectedIndex >= 0
      ? this.args.tabs[this.selectedIndex]
      : undefined;
  }

  private tabDomId = (index: number) => {
    return `${this.uid}-tab-${index}`;
  };
  private panelDomId = (index: number) => {
    return `${this.uid}-panel-${index}`;
  };

  get selectedTabDomId() {
    return this.tabDomId(this.selectedIndex);
  }

  get selectedPanelDomId() {
    return this.panelDomId(this.selectedIndex);
  }

  get ribbonDomId() {
    return `${this.uid}-ribbon`;
  }

  get ribbonReference() {
    return `#${this.ribbonDomId}`;
  }

  get collapseIcon() {
    return this.panelPlacement === 'right' ? ChevronLeftIcon : ChevronRightIcon;
  }

  @action
  selectTab(index: number) {
    this.selectedIndex = this.selectedIndex === index ? -1 : index;
  }

  @action
  collapse() {
    this.selectedIndex = -1;
  }

  badgeNumberRendered = (badge: EditorTabBadge) => {
    return badge.number <= 9 ? badge.number : `9+`;
  };

  <template>
    <div
      class="say-editor-tabs say-editor-tabs--panel-{{this.panelPlacement}}"
      ...attributes
    >
      <div
        id={{this.ribbonDomId}}
        class="say-editor-tabs__ribbon"
        role="tablist"
        aria-orientation={{if this.isBottomPanel "horizontal" "vertical"}}
      >
        {{#each @tabs as |tab index|}}
          {{#let (eq index this.selectedIndex) as |selected|}}
            <button
              type="button"
              id={{this.tabDomId index}}
              class="say-editor-tabs__tab {{if selected 'is-active'}}"
              role="tab"
              aria-selected={{if selected "true" "false"}}
              aria-controls={{if selected (this.panelDomId index)}}
              aria-label={{tab.title}}
              title={{tab.title}}
              data-test-editor-tabs-tab={{index}}
              {{on "click" (fn this.selectTab index)}}
            >
              <span class="say-editor-tabs__tab-icon" role="presentation">
                <AuIcon
                  @icon={{tab.icon}}
                  @ariaHidden={{true}}
                  @size="large"
                  role="presentation"
                />
                {{#let (badgeFor @controller tab) as |badge|}}
                  {{#if badge}}
                    <AuBadge
                      class="say-editor-tabs__badge"
                      {{! @glint-expect-error au-badge doesn't accept a string }}
                      @number={{this.badgeNumberRendered badge}}
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
            class="say-editor-tabs__panel"
            role="tabpanel"
            aria-labelledby={{this.selectedTabDomId}}
            {{floatingUI
              referenceElement=this.ribbonReference
              enabled=this.isBottomPanel
              placement="bottom-start"
              strategy="absolute"
              middleware=this.bottomPanelMiddleware
            }}
          >
            <header class="say-editor-tabs__panel-header">
              <div class="say-editor-tabs__panel-heading">
                <h2
                  class="say-editor-tabs__panel-title"
                  title={{selectedTab.title}}
                >
                  {{selectedTab.title}}
                </h2>
                {{#let (badgeFor @controller selectedTab) as |badge|}}
                  {{#if badge}}
                    <AuBadge
                      class="say-editor-tabs__panel-badge"
                      @number={{badge.number}}
                      @skin={{badge.skin}}
                      @size="small"
                    />
                  {{/if}}
                {{/let}}
              </div>
              {{#unless this.isBottomPanel}}
                <AuButton
                  class="say-editor-tabs__collapse"
                  @skin="naked"
                  @hideText={{true}}
                  @icon={{this.collapseIcon}}
                  {{on "click" this.collapse}}
                >
                  {{t "ember-rdfa-editor.utils.collapse-sidebar"}}
                </AuButton>
              {{/unless}}
            </header>
            <div class="say-editor-tabs__panel-content">
              {{#let selectedTab.panelContent as |PanelContent|}}
                <PanelContent @controller={{@controller}} />
              {{/let}}
            </div>
          </section>
        {{/if}}
      {{/let}}
    </div>
  </template>
}
