import Component from '@glimmer/component';
import ContextualActionsMenu from '../../_private/common/contextual-actions-menu.gts';
import FloatingPlus from '../../_private/common/floating-plus.gts';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type SayController from '#root/core/say-controller.ts';
import type { Command, EditorState } from 'prosemirror-state';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import { on } from '@ember/modifier';
import set from '../../../helpers/set.ts';
import { fn } from '@ember/helper';
import { NodeSelection } from 'prosemirror-state';
import { trackedFunction } from 'reactiveweb/function';

type Args = {
  controller: SayController;
  getActions?: ((state: EditorState) => Promise<ContextualAction[]>)[];
  getGroups?: ((state: EditorState) => Promise<ContextualActionGroup[]>)[];
};

export type ContextualAction = {
  id: string;
  label: string;
  group: string;
  command: Command;
  description?: string;

  isVisible?: (state?: EditorState) => boolean;
  isEnabled?: (state?: EditorState) => boolean;

  priority?: number;
};

export type ContextualActionGroup = {
  id: string;
  label: string;

  isVisible?: (state?: EditorState) => boolean;

  priority?: number;
};

const log = (value) => console.log(value);

export default class FloatingPlusButton extends Component<Args> {
  @service declare intl: IntlService;

  @tracked showActions = false;

  setUpListeners = modifier(() => {
    const handleMouseDown = () => {
      if (this.showActions) {
        this.showActions = false;
      }
    };
    const viewDom = this.controller.mainEditorView.dom;
    viewDom.addEventListener('mousedown', handleMouseDown);
    return () => {
      viewDom.removeEventListener('mousedown', handleMouseDown);
    };
  });

  preventDefault = modifier((element) => {
    const handleMouseDown = (event: MouseEvent) => {
      event.preventDefault();
    };
    element.addEventListener('mousedown', handleMouseDown);
    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
    };
  });

  get controller() {
    return this.args.controller;
  }

  get visible() {
    return true;
  }

  canExecuteAction = (action: ContextualAction) => {
    if ('command' in action) {
      return this.controller.checkCommand(action.command);
    }

    return false;
  };

  @action
  executeAction(action: ContextualAction) {
    if ('command' in action) {
      this.controller.focus();
      this.controller.doCommand(action.command);
    }

    this.showActions = false;
  }

  get floatingPlusIsVisible() {
    return !this.showActions;
  }

  @tracked groupedActions?: (ContextualActionGroup & {
    actions: ContextualAction[];
  })[] = [];

  constructor() {
    // eslint-disable-next-line prefer-rest-params
    super(...arguments);
    void this.setGroupedActions();
  }

  async setGroupedActions() {
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

    await Promise.resolve();
    this.groupedActions = visibleGroups
      .map((group) => ({
        ...group,
        actions: actions.filter((action) => action.group === group.id),
      }))
      .filter((group) => group.actions.length > 0);
  }

  // getGroupedActions = trackedFunction(this, async () => {
  //   // todo fix constant retriggering
  //   debugger;
  //   const getgroups = this.args.getgroups ?? [];
  //   const getactions = this.args.getactions ?? [];
  //   const editorstate = this.controller.maineditorstate;
  //   // todo update intermediate resolves in the ui
  //   const [groups, actions] = await promise.all([
  //     (await promise.all(getgroups.map((cb) => cb(editorstate)))).flatmap(
  //       (x) => x,
  //     ),
  //     (await promise.all(getactions.map((cb) => cb(editorstate)))).flatmap(
  //       (x) => x,
  //     ),
  //   ]);

  //   const visiblegroups = groups.filter(
  //     (group: contextualactiongroup) =>
  //       !group.isvisible || group.isvisible(editorstate),
  //   );

  //   await promise.resolve();
  //   return visiblegroups
  //     .map((group) => ({
  //       ...group,
  //       actions: actions.filter((action) => action.group === group.id),
  //     }))
  //     .filter((group) => group.actions.length > 0);
  // });

  <template>
    {{! @glint-nocheck: not typesafe yet }}
    <div>
      {{#if this.floatingPlusIsVisible}}
        <FloatingPlus
          @controller={{this.controller}}
          @visible={{this.visible}}
          @position="left"
          class="say-floating-plus"
        >
          <div class="say-floating-plus--actions">
            <button
              {{this.preventDefault}}
              class="say-floating-plus-button au-u-flex au-u-flex--center"
              type="button"
              title="Test"
              {{on "click" (set this "showActions" true)}}
            >
              <AuIcon @icon="plus" @size="large" />
            </button>
          </div>
        </FloatingPlus>
      {{/if}}
    </div>
    {{#if this.showActions}}
      <div {{this.setUpListeners}}>
        <ContextualActionsMenu
          @controller={{this.controller}}
          @visible={{this.visible}}
          @position="bottom"
          class="say-contextual-actions-menu"
        >
          {{#if this.groupedActions}}
            {{#each this.groupedActions as |group|}}
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
          {{/if}}
        </ContextualActionsMenu>
      </div>
    {{/if}}
  </template>
}
