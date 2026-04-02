import Component from '@glimmer/component';
// import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
// import { trackedFunction } from 'reactiveweb/function';
import {
  type VirtualElement,
  flip,
  hide,
  offset,
  shift,
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
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

type Args = {
  controller: SayController;
  visible: boolean;
  position: 'left' | 'bottom';
  getActions?: ((state: EditorState) => Promise<ContextualAction[]>)[];
  getGroups?: ((state: EditorState) => Promise<ContextualActionGroup[]>)[];
  onActionSelected?: () => void;
};
export default class ContextualActionsMenu extends Component<Args> {
  @tracked groups = [];
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

  get groupedActions() {

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
      flip(),
      shift({ padding: 5 }),
      hide({ strategy: 'referenceHidden' }),
      hide({ strategy: 'escaped' }),
    ];
  }
  <template>
    <div
      {{floatingUI
        referenceElement=this.referenceElement
        placement="bottom-start"
        middleware=this.tooltipMiddleWare
        strategy="fixed"
        useTransform=true
      }}
      ...attributes
    >
      {{#if this.getGroupedActions.isResolved}}
        {{#each this.getGroupedActions.value as |group|}}
          <div
            class="say-contextual-actions-menu-group-header au-u-muted au-u-padding-left-tiny au-u-padding-right-tiny"
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
        {{else}}
          <p>No actions found</p>
        {{/each}}
      {{else if this.getGroupedActions.isLoading}}
        <div class="au-u-flex au-u-flex--center">
          <AuLoader />
        </div>
      {{/if}}
    </div>
  </template>
}
