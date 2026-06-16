import Component from '@glimmer/component';
import {
  autoPlacement,
  hide,
  offset,
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
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import t from 'ember-intl/helpers/t';
import { modifier as eModifier } from 'ember-modifier';
import { getReferenceElementFromSelection } from '#root/components/utils/floating-ui-reference-element.ts';
import { cached, tracked } from '@glimmer/tracking';
import { runTask } from 'ember-lifeline';
import { eq } from 'ember-truth-helpers';

type GroupWithStatus = ContextualActionGroup & {
  isLoading: boolean;
  errorMessage: string | null;
  actions: ContextualAction[] | null;
};

type Args = {
  controller: SayController;
  groups?: GroupWithStatus[];
  isLoading?: boolean;
  errorMessage?: string;
  enableSearch?: boolean;
  searchQuery?: string;

  onActionSelected?: (action: ContextualAction) => void;
  onClose?: () => void;
  onSearch?: (searchQuery: string) => void;
};

function sortByPriority(
  itemA: { priority?: number },
  itemB: { priority?: number },
) {
  if (!itemB.priority) return -1;
  if (!itemA.priority) return 1;

  return itemB.priority - itemA.priority;
}

function sortGroups(
  itemA: { sticky?: 'bottom'; priority?: number },
  itemB: { sticky?: 'bottom'; priority?: number },
) {
  if (itemA.sticky === itemB.sticky) {
    return sortByPriority(itemA, itemB);
  } else if (itemA.sticky) {
    return 1;
  } else {
    return -1;
  }
}

export default class ContextualActionsMenu extends Component<Args> {
  @tracked selectedActionIndex: number = 0;

  actionToElement = new Map<ContextualAction, Element>();

  scrollActionIntoView = (actionIndex: number) => {
    const selectedAction = this.getActionByIndex(actionIndex);
    if (selectedAction !== null && selectedAction !== undefined) {
      const selectedActionElement = this.actionToElement.get(selectedAction);
      selectedActionElement?.scrollIntoView({ block: 'center' });
    }
  };

  setUpListeners = eModifier(() => {
    const handleMousedown = () => {
      this.args.onClose?.();
    };
    const handleKeydown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
        case 'Down':
          if (
            this.actionAmount &&
            this.selectedActionIndex < this.actionAmount - 1
          ) {
            this.selectedActionIndex += 1;
            this.scrollActionIntoView(this.selectedActionIndex);
          }
          event.preventDefault();
          break;
        case 'ArrowUp':
        case 'Up':
          if (this.selectedActionIndex > 0) {
            this.selectedActionIndex -= 1;
            this.scrollActionIntoView(this.selectedActionIndex);
          }
          event.preventDefault();
          break;
        case 'Escape':
          this.args.onClose?.();
          break;
        case 'Enter': {
          event.preventDefault();
          if (this.selectedActionIndex === null) break;
          const selectedAction = this.getActionByIndex(
            this.selectedActionIndex,
          );
          if (selectedAction !== null && selectedAction !== undefined) {
            this.args.onActionSelected?.(selectedAction);
          }
          break;
        }
        case 'Delete':
        case 'Backspace':
          if (!this.args.searchQuery) {
            event.preventDefault();
            this.args.onClose?.();
          }
          break;
        case 'Tab':
          if (this.actionAmount) {
            if (event.shiftKey) {
              this.selectedActionIndex =
                (this.selectedActionIndex - 1 + this.actionAmount) %
                this.actionAmount;
            } else {
              this.selectedActionIndex =
                (this.selectedActionIndex + 1) % this.actionAmount;
            }
            this.scrollActionIntoView(this.selectedActionIndex);
          }
          event.preventDefault();
          break;
      }
    };

    const viewDom = this.controller.mainEditorView.dom;
    viewDom.addEventListener('mousedown', handleMousedown);
    // Hacky but needed because otherwise the editor handles
    // the event first by inserting an enter
    document.addEventListener('keydown', handleKeydown, { capture: true });
    return () => {
      viewDom.removeEventListener('mousedown', handleMousedown);
      document.removeEventListener('keydown', handleKeydown, { capture: true });
    };
  });

  getActionByIndex(index: number) {
    if (!this.groupedActions || this.selectedActionIndex === null) return null;

    let searchIndex = 0;
    for (const group of this.groupedActions) {
      for (const actionIter of group.actions) {
        if (searchIndex === index) {
          return actionIter;
        } else {
          searchIndex += 1;
        }
      }
    }
  }

  getIndexByAction(action: ContextualAction) {
    // Better to return null here but this should never happen
    if (!this.groupedActions || this.selectedActionIndex === null) return 0;

    let searchIndex = 0;
    for (const group of this.groupedActions) {
      for (const actionIter of group.actions) {
        if (action.id === actionIter.id) {
          return searchIndex;
        } else {
          searchIndex += 1;
        }
      }
    }

    return searchIndex;
  }

  get sortedGroups() {
    return this.args.groups?.toSorted(sortGroups);
  }

  @cached
  get groupedActions() {
    return this.sortedGroups
      ?.map((group) => ({
        ...group,
        actions:
          group.actions
            ?.filter((action) => action.group === group.id)
            .toSorted(sortByPriority) ?? [],
      }))
      .filter((group) => group.isLoading || group.actions.length > 0);
  }

  get actionAmount() {
    return this.groupedActions?.reduce(
      (accumulator, current) => accumulator + current.actions.length,
      0,
    );
  }

  get controller() {
    return this.args.controller;
  }

  get referenceElement() {
    return getReferenceElementFromSelection({
      editorState: this.controller.mainEditorState,
      editorView: this.controller.mainEditorView,
    });
  }

  get tooltipMiddleWare(): Middleware[] {
    return [
      offset(10),
      autoPlacement({
        allowedPlacements: this.textIsRightAligned
          ? ['bottom-end', 'top-end']
          : ['bottom-start', 'top-start'],
      }),
      size({
        apply({ availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.max(0, availableHeight)}px`,
          });
        },
      }),
      hide({ strategy: 'referenceHidden' }),
      hide({ strategy: 'escaped' }),
    ];
  }

  // This can be removed once the `:sticky` selector becomes supported
  observeSticky = eModifier(
    (element: HTMLElement, [position]: ['top' | 'bottom']) => {
      const container = element.closest(
        '.say-contextual-actions-menu-entries-container',
      );

      if (!container) return;

      const sentinel =
        position === 'top'
          ? element.previousElementSibling
          : element.nextElementSibling;

      if (!sentinel) return;

      const stuckClass = position === 'top' ? 'is-stuck' : 'is-stuck-bottom';

      const observer = new IntersectionObserver(
        ([entry]) => {
          element.classList.toggle(stuckClass, !entry.isIntersecting);
        },
        {
          root: container,
          threshold: [1],
          // Rootmargin is needed because otherwise the shadow effect is not
          // being applied to stuck groups when the menu is placed
          // above the text
          rootMargin: '0px 0px 1px 0px',
        },
      );

      observer.observe(sentinel);

      return () => observer.disconnect();
    },
  );

  selectAction = (action: ContextualAction) => {
    this.args.onActionSelected?.(action);
  };

  isSelectedAction = (action: ContextualAction) => {
    return this.getIndexByAction(action) === this.selectedActionIndex;
  };

  updateSelectedActionIndex = (action: ContextualAction, event: MouseEvent) => {
    if (event.movementX === 0 && event.movementY === 0) return;
    this.selectedActionIndex = this.getIndexByAction(action);
  };

  addActionElementToMap = eModifier((element, [action]: [ContextualAction]) => {
    this.actionToElement.set(action, element);
    return () => {
      this.actionToElement.delete(action);
    };
  });

  get textIsRightAligned() {
    const parent = this.controller.mainEditorState.selection.$from.parent;
    return parent.attrs['alignment'] === 'right';
  }

  get menuPlacement() {
    return this.textIsRightAligned ? 'bottom-end' : 'bottom-start';
  }

  setSearchQuery = (event: InputEvent) => {
    this.selectedActionIndex = 0;
    this.args.onSearch?.((event.target as HTMLInputElement).value);
  };

  focus = eModifier((element: HTMLElement) => {
    runTask(this, () => element.focus());
  });

  <template>
    <div
      {{floatingUI
        referenceElement=this.referenceElement
        placement=this.menuPlacement
        middleware=this.tooltipMiddleWare
        strategy="fixed"
        useTransform=false
      }}
      class="say-contextual-actions-menu"
      ...attributes
      {{this.setUpListeners}}
    >
      {{#if @enableSearch}}
        <div class="say-contextual-actions-menu-search-bar">
          <AuInput
            {{this.focus}}
            @icon="search"
            @width="block"
            {{on "input" this.setSearchQuery}}
            value={{@searchQuery}}
            placeholder={{t
              "ember-rdfa-editor.contextual-actions.type-to-search"
            }}
          />
        </div>
      {{/if}}
      {{#if @isLoading}}
        <div class="au-u-flex au-u-flex--center au-u-padding">
          <AuLoader>{{t
              "ember-rdfa-editor.contextual-actions.loading-actions"
            }}</AuLoader>
        </div>
      {{else if @errorMessage}}
        <AuAlert
          @size="small"
          @icon="alert-triangle"
          @skin="error"
          class="au-u-margin-tiny"
        >{{@errorMessage}}</AuAlert>
      {{else}}
        <div class="say-contextual-actions-menu-entries-container">
          {{#each this.groupedActions as |group|}}
            <div
              class="say-contextual-actions-menu-group-wrapper
                {{if (eq group.sticky 'bottom') 'sticky-bottom'}}"
              {{! @glint-expect-error type of the modifier helper is incorrect}}
              {{(if
                (eq group.sticky "bottom")
                (modifier this.observeSticky "bottom")
              )}}
            >
              <div class="say-contextual-actions-menu-group-sticky-sentinel" />
              {{#unless group.label}}
                <div class="say-contextual-actions-menu-separator"></div>
              {{/unless}}
              <div
                class="say-contextual-actions-menu-group-header au-u-muted"
                {{this.observeSticky "top"}}
              >
                {{group.label}}
              </div>
              <div class="au-u-padding-left-tiny au-u-padding-right-tiny">
                {{#if group.isLoading}}
                  <div class="au-u-flex au-u-flex--center au-u-padding">
                    <AuLoader>
                      {{#if group.loadingMessage}}
                        {{group.loadingMessage}}
                      {{else}}
                        {{t
                          "ember-rdfa-editor.contextual-actions.loading-actions"
                        }}
                      {{/if}}
                    </AuLoader>
                  </div>
                {{else if group.errorMessage}}
                  <AuAlert
                    @size="small"
                    @icon="alert-triangle"
                    @skin="error"
                    class="au-u-margin-tiny"
                  >{{group.errorMessage}}</AuAlert>
                {{else}}
                  {{#each group.actions as |actionItem|}}
                    <button
                      {{this.addActionElementToMap actionItem}}
                      {{on "click" (fn this.selectAction actionItem)}}
                      {{on
                        "mousemove"
                        (fn this.updateSelectedActionIndex actionItem)
                      }}
                      class="say-contextual-actions-menu-entry au-u-text-left
                        {{if
                          (this.isSelectedAction actionItem)
                          'focused-menu-entry'
                        }}"
                      type="button"
                      title={{actionItem.description}}
                    >
                      <div id="button-content">
                        {{#if actionItem.icon}}
                          <AuIcon @size="large" @icon={{actionItem.icon}} />
                        {{/if}}
                        <span>{{actionItem.label}}</span>
                      </div>
                    </button>
                  {{/each}}
                {{/if}}
              </div>
            </div>
            <div class="say-contextual-actions-menu-group-sticky-sentinel" />
          {{else}}
            <AuAlert
              @size="small"
              @icon="circle-info"
              @skin="info"
              class="au-u-margin-bottom-none au-u-margin-top-tiny au-u-margin-left-tiny au-u-margin-right-tiny"
            >{{t
                "ember-rdfa-editor.contextual-actions.no-actions-found"
              }}</AuAlert>
          {{/each}}
        </div>
      {{/if}}
    </div>
  </template>
}
