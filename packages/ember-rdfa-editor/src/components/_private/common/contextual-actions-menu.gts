import Component from '@glimmer/component';
import {
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
import { modifier } from 'ember-modifier';
import { getReferenceElementFromSelection } from '#root/components/utils/floating-ui-reference-element.ts';
import { cached, tracked } from '@glimmer/tracking';

type Args = {
  controller: SayController;
  actions?: ContextualAction[];
  groups?: ContextualActionGroup[];
  onActionSelected?: (action: ContextualAction) => void;
  onClose?: () => void;
  isLoading?: boolean;
};

function sortByPriority(
  itemA: { priority?: number },
  itemB: { priority?: number },
) {
  if (!itemB.priority) return -1;
  if (!itemA.priority) return 1;

  return itemB.priority - itemA.priority;
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

  setUpListeners = modifier(() => {
    const handleMousedown = () => {
      this.args.onClose?.();
    };
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'Down') {
        if (
          this.actionAmount &&
          this.selectedActionIndex < this.actionAmount - 1
        ) {
          this.selectedActionIndex += 1;
          this.scrollActionIntoView(this.selectedActionIndex);
        }
        event.preventDefault();
      }
      if (event.key === 'ArrowUp' || event.key === 'Up') {
        if (this.selectedActionIndex > 0) {
          this.selectedActionIndex -= 1;
          this.scrollActionIntoView(this.selectedActionIndex);
        }
        event.preventDefault();
      }
      if (event.key === 'Escape') {
        this.args.onClose?.();
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (this.selectedActionIndex !== null) {
          const selectedAction = this.getActionByIndex(
            this.selectedActionIndex,
          );
          if (selectedAction !== null && selectedAction !== undefined) {
            this.args.onActionSelected?.(selectedAction);
          }
        }
      }
    };

    const handleEnter = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (this.selectedActionIndex !== null) {
          const selectedAction = this.getActionByIndex(
            this.selectedActionIndex,
          );
          if (selectedAction !== null && selectedAction !== undefined) {
            this.args.onActionSelected?.(selectedAction);
            // this.args.onClose?.();
          }
        }
      }
    };

    const viewDom = this.controller.mainEditorView.dom;
    viewDom.addEventListener('mousedown', handleMousedown);
    // Hacky but needed because otherwise the editor handles
    // the event first by inserting an enter
    viewDom.addEventListener('keydown', handleEnter, { capture: true });
    document.addEventListener('keydown', handleKeydown);
    return () => {
      viewDom.removeEventListener('mousedown', handleMousedown);
      viewDom.removeEventListener('keydown', handleEnter, { capture: true });
      document.removeEventListener('keydown', handleKeydown);
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

  @cached
  get groupedActions() {
    return this.args.groups
      ?.map((group) => ({
        ...group,
        actions:
          this.args.actions
            ?.filter((action) => action.group === group.id)
            .toSorted(sortByPriority) ?? [],
      }))
      .filter((group) => group.actions.length > 0)
      .toSorted(sortByPriority);
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
      flip(),
      size({
        apply({ availableWidth, availableHeight, elements }) {
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

  isSelectedAction = (action: ContextualAction) => {
    return this.getIndexByAction(action) === this.selectedActionIndex;
  };

  updateSelectedActionIndex = (action: ContextualAction, event: MouseEvent) => {
    if (event.movementX === 0 && event.movementY === 0) return;
    this.selectedActionIndex = this.getIndexByAction(action);
  };

  addActionElementToMap = modifier((element, [action]: [ContextualAction]) => {
    this.actionToElement.set(action, element);
    return () => {
      this.actionToElement.delete(action);
    };
  });

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
      {{this.setUpListeners}}
    >
      {{#if @isLoading}}
        <div class="au-u-flex au-u-flex--center au-u-padding">
          <AuLoader>{{t
              "ember-rdfa-editor.contextual-actions.loading-actions"
            }}</AuLoader>
        </div>
      {{else}}
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
