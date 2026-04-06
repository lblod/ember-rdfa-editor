import Component from '@glimmer/component';
// import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
// import { trackedFunction } from 'reactiveweb/function';
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
import { EditorState } from 'prosemirror-state';
import {
  type ContextualAction,
  type ContextualActionGroup,
} from '#root/plugins/contextual-actions/index.ts';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { trackedFunction } from 'reactiveweb/function';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import { action } from '@ember/object';
import t from 'ember-intl/helpers/t';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import { autoFocus } from '#root/modifiers/auto-focus.ts';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';

type Args = {
  controller: SayController;
  visible: boolean;
  position: 'left' | 'bottom';
  getActions?: ((state: EditorState) => Promise<ContextualAction[]>)[];
  getGroups?: ((state: EditorState) => Promise<ContextualActionGroup[]>)[];
  onActionSelected?: () => void;
};

function isMatch(query: string, searchString: string) {
  return searchString.toLowerCase().includes(query.toLowerCase());
}

export default class ContextualActionsMenu extends Component<Args> {
  @tracked searchQuery: string | null = null;
  getGroupedActions = trackedFunction(this, async () => {
    const getGroups = this.args.getGroups ?? [];
    const getActions = this.args.getActions ?? [];
    const editorState = this.controller.mainEditorState;
    // TODO update intermediate resolves in the UI

    const [groups, actions] = await Promise.all([
      (await Promise.all(getGroups.map((cb) => cb(editorState)))).flatMap(
        (x) => x,
      ),
      (await Promise.all(getActions.map((cb) => cb(editorState)))).flatMap(
        (x) => x,
      ),
    ]);

    const visibleGroups = groups.filter(
      (group: ContextualActionGroup) =>
        !group.isVisible || group.isVisible(editorState),
    );

    return visibleGroups
      .map((group) => ({
        ...group,
        actions: actions.filter((action) => action.group === group.id),
      }))
      .filter((group) => group.actions.length > 0);
  });

  get searchResults() {
    if (!this.getGroupedActions.isResolved || !this.getGroupedActions.value) {
      return null;
    }

    const visibleActionGroups = this.getGroupedActions.value;
    return visibleActionGroups
      .map((group) => {
        const matchingActions = group.actions.filter(
          (action) =>
            !this.searchQuery || isMatch(this.searchQuery, action.label),
        );
        return { ...group, actions: matchingActions };
      })
      .filter((group) => group.actions.length > 0);
  }

  @action
  executeAction(action: ContextualAction) {
    if ('command' in action) {
      this.controller.focus();
      this.controller.doCommand(action.command);
    }

    this.args.onActionSelected?.();
  }

  canExecuteAction = (action: ContextualAction) => {
    if ('command' in action) {
      return this.controller.checkCommand(action.command);
    }

    return false;
  };

  get controller() {
    return this.args.controller;
  }

  get position() {
    return this.args.position ?? 'bottom';
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
      size({
        apply({ availableWidth, availableHeight, elements }) {
          // Change styles, e.g.
          Object.assign(elements.floating.style, {
            maxWidth: `${Math.max(0, availableWidth)}px`,
            maxHeight: `${Math.max(0, availableHeight)}px`,
          });
        },
      }),
      flip({ fallbackStrategy: 'initialPlacement', padding: 5 }),
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
      {{#if this.getGroupedActions.isResolved}}
        {{!-- <div
          class="au-u-padding-top-tiny au-u-padding-left-tiny au-u-padding-right-tiny"
        >
          <AuInput
            {{on "input" this.setSearchQuery}}
            value={{this.searchQuery}}
            {{autoFocus}}
            placeholder={{t
              "ember-rdfa-editor.contextual-actions.type-to-search"
            }}
            class="au-u-1-1"
          />
        </div> --}}
        <div class="say-contextual-actions-menu-entries-container">
          {{#each this.searchResults as |group|}}
            <div class="say-contextual-actions-menu-group-wrapper">
              <div class="say-contextual-actions-menu-group-sticky-sentinel" />
              <div
                class="say-contextual-actions-menu-group-header au-u-muted"
                {{this.observeSticky}}
              >
                {{group.label}}
              </div>
              {{#each group.actions as |actionItem|}}
                <div class="say-floating-plus--actions">
                  <button
                    {{on "click" (fn this.executeAction actionItem)}}
                    class="say-contextual-actions-menu-entry au-u-text-left"
                    type="button"
                    title="Test"
                  >
                    <span>{{actionItem.label}}</span>
                  </button>
                </div>
              {{/each}}
            </div>
          {{else}}
            <AuAlert
              @size="small"
              @icon="circle-info"
              @skin="info"
              class="au-u-margin-bottom-none"
            >{{t
                "ember-rdfa-editor.contextual-actions.no-actions-found"
              }}</AuAlert>
          {{/each}}
        </div>
      {{else if this.getGroupedActions.isLoading}}
        <div class="au-u-flex au-u-flex--center">
          {{! TODO find out why message is not being displayed }}
          <AuLoader
            @message={{t
              "ember-rdfa-editor.contextual-actions.loading-actions"
            }}
            @hideMessage={{false}}
          />
        </div>
      {{/if}}
    </div>
  </template>
}
