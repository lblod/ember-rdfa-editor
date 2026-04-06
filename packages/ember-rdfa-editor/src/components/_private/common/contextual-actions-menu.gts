import Component from '@glimmer/component';
import {
  type VirtualElement,
  flip,
  hide,
  offset,
  shift,
  size,
  type Middleware,
} from '@floating-ui/dom';
import floatingUI from '#root/modifiers/_private/floating-ui.ts';
import type SayController from '#root/core/say-controller.ts';
import {
  type ContextualAction,
  type ContextualActionGroup,
} from '#root/plugins/contextual-actions/index.ts';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import t from 'ember-intl/helpers/t';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import autoFocus from '#root/modifiers/auto-focus.ts';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';

type Args = {
  controller: SayController;
  visible: boolean;
  actions?: ContextualAction[];
  groups?: ContextualActionGroup[];
  onActionSelected?: (action: ContextualAction) => void;
  onClose?: () => void;
  isLoading?: boolean;
  enableSearch?: boolean;
};

export default class ContextualActionsMenu extends Component<Args> {
  @tracked searchQuery: string | null = null;

  get groupedActions() {
    return this.args.groups
      ?.map((group) => ({
        ...group,
        actions:
          this.args.actions?.filter((action) => action.group === group.id) ??
          [],
      }))
      .filter((group) => group.actions.length > 0);
  }

  get controller() {
    return this.args.controller;
  }

  get referenceElement() {
    const { selection } = this.controller.mainEditorState;
    const virtualElement: VirtualElement = {
      getBoundingClientRect: () => {
        const coordsFrom = this.controller.mainEditorView.coordsAtPos(
          selection.from,
          -1,
        );
        const coordsTo = this.controller.mainEditorView.coordsAtPos(
          selection.to,
          -1,
        );
        const left = (coordsFrom.left + coordsTo.left) / 2;
        const right = (coordsFrom.right + coordsTo.right) / 2;
        const bottom = coordsTo.bottom;
        const top = coordsFrom.top;
        return {
          left,
          right,
          bottom,
          top,
          x: left,
          y: top,
          width: 0,
          height: bottom - top,
        };
      },
      contextElement: this.controller.mainEditorView.dom,
    };
    return virtualElement;
  }
  get tooltipMiddleWare(): Middleware[] {
    return [
      offset(10),
      flip(),
      size({
        apply({ availableWidth, availableHeight, elements }) {
          // Change styles, e.g.
          Object.assign(elements.floating.style, {
            maxWidth: `${Math.max(0, availableWidth)}px`,
            maxHeight: `${Math.max(0, availableHeight)}px`,
          });
        },
      }),
      shift(),
      hide({ strategy: 'referenceHidden' }),
      hide({ strategy: 'escaped' }),
    ];
  }

  setSearchQuery = (event: InputEvent) => {
    const searchQuery = (event.target as HTMLInputElement)?.value;
    this.searchQuery = searchQuery;
  };

  // This can be removed once the `:sticky` selector becomes supported
  observeSticky = modifier((element: HTMLElement) => {
    const sentinel = element.previousElementSibling as HTMLElement;
    const container = element.closest(
      '.say-contextual-actions-menu-entries-container',
    );

    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.remove('is-stuck');
        } else {
          element.classList.add('is-stuck');
        }
      },
      {
        root: container,
        threshold: [1],
      },
    );

    observer.observe(sentinel);
  });

  selectAction = (action: ContextualAction) => {
    this.args.onActionSelected?.(action);
  };

  <template>
    <div
      {{floatingUI
        referenceElement=this.referenceElement
        placement="bottom-start"
        middleware=this.tooltipMiddleWare
        strategy="fixed"
        useTransform=false
      }}
      class="say-contextual-actions-menu"
      ...attributes
    >
      {{#if @isLoading}}
        <div class="au-u-flex au-u-flex--center">
          <AuLoader>{{t
              "ember-rdfa-editor.contextual-actions.loading-actions"
            }}</AuLoader>
        </div>
      {{/if}}
      {{#if @enableSearch}}
        <div
          class="au-u-padding-top-tiny au-u-padding-left-tiny au-u-padding-right-tiny"
        >
          <AuInput
            {{on "input" this.setSearchQuery}}
            value={{this.searchQuery}}
            {{autoFocus}}
            placeholder={{t
              "ember-rdfa-editor.contextual-actions.type-to-search"
            }}
            @width="block"
            @icon="search"
          />
        </div>
      {{/if}}
      <div class="say-contextual-actions-menu-entries-container">
        {{#each this.groupedActions as |group|}}
          <div class="say-contextual-actions-menu-group-wrapper">
            <div class="say-contextual-actions-menu-group-sticky-sentinel" />
            <div
              class="say-contextual-actions-menu-group-header au-u-muted"
              {{this.observeSticky}}
            >
              {{group.label}}
            </div>
            <div class="au-u-padding-left-tiny au-u-padding-right-tiny">
              {{#each group.actions as |actionItem|}}
                <button
                  {{on "click" (fn this.selectAction actionItem)}}
                  class="say-contextual-actions-menu-entry au-u-text-left"
                  type="button"
                  title="Test"
                >
                  <span>{{actionItem.label}}</span>
                </button>
              {{/each}}
            </div>
          </div>
        {{else}}
          <AuAlert
            @size="small"
            @icon="circle-info"
            @skin="info"
            class="au-u-margin-bottom-none au-u-margin-top-tiny"
          >{{t
              "ember-rdfa-editor.contextual-actions.no-actions-found"
            }}</AuAlert>
        {{/each}}
      </div>
    </div>
  </template>
}
