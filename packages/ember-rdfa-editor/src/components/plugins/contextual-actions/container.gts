import Component from '@glimmer/component';
import ContextualActionsMenu from '../../_private/common/contextual-actions-menu.gts';
import FloatingPlus from '../../_private/common/floating-plus.gts';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type SayController from '#root/core/say-controller.ts';
import type { EditorState } from 'prosemirror-state';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import { on } from '@ember/modifier';
import {
  type ContextualAction,
  type ContextualActionGroup,
} from '#root/plugins/contextual-actions/index.ts';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import t from 'ember-intl/helpers/t';

type Args = {
  controller: SayController;
  getActions?: ((
    state: EditorState,
  ) => ContextualAction[] | Promise<ContextualAction[]>)[];
  getGroups?: ((
    state: EditorState,
  ) => ContextualAction[] | Promise<ContextualActionGroup[]>)[];
};

export default class ContextualActionsContainer extends Component<Args> {
  @service declare intl: IntlService;

  @tracked groups: ContextualActionGroup[] = [];
  @tracked actions: ContextualAction[] = [];

  @tracked showActions = false;

  setUpListeners = modifier(() => {
    const handleMouseDown = () => {
      if (this.showActions) {
        this.showActions = false;
      }
    };
    const handleKeydown = (event: KeyboardEvent) => {
      if (this.showActions && event.key === 'Escape') {
        this.showActions = false;
      }
    };
    const viewDom = this.controller.mainEditorView.dom;
    viewDom.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeydown);
    return () => {
      viewDom.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeydown);
    };
  });

  get controller() {
    return this.args.controller;
  }

  get visible() {
    return !this.showActions;
  }

  loadAndShowActions = task(async () => {
    const getGroups = this.args.getGroups ?? [];
    const getActions = this.args.getActions ?? [];
    const editorState = this.controller.mainEditorState;

    const [groups, actions] = await Promise.all([
      (await Promise.all(getGroups.map((cb) => cb(editorState)))).flatMap(
        (x) => x,
      ),
      (await Promise.all(getActions.map((cb) => cb(editorState)))).flatMap(
        (x) => x,
      ),
    ]);
    this.groups = groups;
    this.actions = actions;
    this.showActions = true;
  });

  @action
  executeAction(action: ContextualAction) {
    if ('command' in action) {
      this.controller.focus();
      this.controller.doCommand(action.command);
    }
  }

  canExecuteAction = (action: ContextualAction) => {
    if ('command' in action) {
      return this.controller.checkCommand(action.command);
    }

    return false;
  };

  @action
  selectAction(action: ContextualAction) {
    this.executeAction(action);
    this.showActions = false;
  }

  <template>
    {{! @glint-nocheck: not typesafe yet }}
    <div>
      <FloatingPlus
        @controller={{this.controller}}
        @visible={{this.visible}}
        @position="left"
        class="say-floating-plus"
      >
        <div class="say-floating-plus-content">
          {{#if this.loadAndShowActions.isRunning}}
            {{!-- <AuLoader
              @inline={{true}}
              @hideMessage={{true}}
              class="au-u-padding-bottom-tiny au-u-padding-top-tiny"
            >
              {{t "ember-rdfa-editor.utils.loading"}}</AuLoader> --}}
            <div class="au-u-padding-tiny au-u-1-1">
              <span class="say-floating-plus-button-loader" />
            </div>
          {{else}}
            <button
              class="say-floating-plus-button au-u-flex au-u-flex--center"
              type="button"
              title="Show contextual actions"
              {{on "click" this.loadAndShowActions.perform}}
            >
              <AuIcon @icon="plus" @size="large" />
            </button>
          {{/if}}
        </div>
      </FloatingPlus>
    </div>
    {{#if this.showActions}}
      <div {{this.setUpListeners}}>
        <ContextualActionsMenu
          @controller={{this.controller}}
          @position="bottom"
          @actions={{this.actions}}
          @groups={{this.groups}}
          @onActionSelected={{this.selectAction}}
          @isLoading={{this.loadAndShowActions.isRunning}}
        />
      </div>
    {{/if}}
  </template>
}
