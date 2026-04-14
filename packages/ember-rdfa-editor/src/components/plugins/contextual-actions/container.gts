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
import { on } from '@ember/modifier';
import {
  type ContextualAction,
  type ContextualActionGroup,
} from '#root/plugins/contextual-actions/index.ts';
import { action } from '@ember/object';
import { didCancel, task } from 'ember-concurrency';
import { getSlashCommandsPluginState } from '#root/plugins/slash-commands/index.ts';

type Args = {
  controller: SayController;
  getActions?: ((
    state: EditorState,
  ) => ContextualAction[] | Promise<ContextualAction[]>)[];
  getGroups?: ((state: EditorState) => ContextualActionGroup[])[];
};

export default class ContextualActionsContainer extends Component<Args> {
  @service declare intl: IntlService;

  @tracked actions: ContextualAction[] = [];

  @tracked showActions = false;

  get groups() {
    const state = this.controller.mainEditorState;
    return this.args.getGroups?.flatMap((getGroup) => getGroup(state)) ?? [];
  }

  setUpListeners = modifier(() => {
    const handleMousedown = () => {
      if (this.showActions) {
        this.showActions = false;
        if (this.slashCommandsPluginState) {
          // TODO dispatch a transaction for this!
          this.slashCommandsPluginState.shouldOpenContextActions = false;
        }
        console.log('false in mousedown');
      }
    };
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'Down') {
        event.preventDefault();
      }
      if (event.key === 'ArrowUp' || event.key === 'Up') {
        event.preventDefault();
      }
      if (event.key === 'ArrowLeft' || event.key === 'Left') {
        // event.preventDefault();
      }
      if (event.key === 'ArrowRight' || event.key === 'Right') {
        // event.preventDefault();
      }
      if (event.key === 'Escape') {
        this.showActions = false;
        if (this.slashCommandsPluginState) {
          // TODO this is probably very bad practice because plugins should be immutable?
          // Might be better to move this to the plugin logic
          this.slashCommandsPluginState.shouldOpenContextActions = false;
        }
        console.log('false in keydown');
      }
    };
    const viewDom = this.controller.mainEditorView.dom;
    viewDom.addEventListener('mousedown', handleMousedown);
    document.addEventListener('keydown', handleKeydown);
    return () => {
      viewDom.removeEventListener('mousedown', handleMousedown);
      document.removeEventListener('keydown', handleKeydown);
    };
  });

  get controller() {
    return this.args.controller;
  }

  loadAndShowActions = task(async () => {
    await this.loadActions.perform();
    this.showActions = true;
  });

  get visible() {
    return this.groups.length > 0 && !this.showActions;
  }

  loadActions = task({ restartable: true }, async () => {
    this.actions = [];
    const getActions = this.args.getActions ?? [];
    const editorState = this.controller.mainEditorState;

    const actions = (
      await Promise.all(getActions.map((cb) => cb(editorState)))
    ).flatMap((x) => x);

    this.actions = actions;
  });

  @action
  executeAction(action: ContextualAction) {
    if (this.slashCommandsPluginState?.latestState) {
      this.controller.mainEditorView.updateState(
        this.slashCommandsPluginState.latestState,
      );
    }
    if ('command' in action) {
      this.controller.focus();
      this.controller.doCommand(action.command);
    }
  }

  @action
  selectAction(action: ContextualAction) {
    this.executeAction(action);
    this.showActions = false;
  }

  trackSlashCommandsPluginState = modifier(() => {
    const shouldOpen =
      this.slashCommandsPluginState?.shouldOpenContextActions ?? false;
    if (shouldOpen) {
      console.log(
        `shouldloadplugins: ${this.slashCommandsPluginState?.shouldOpenContextActions}`,
      );
      console.log('modifier loaded the actions');
      this.loadActions.perform().catch((err) => {
        if (!didCancel(err)) return console.error(err);
      });
      this.showActions = true;
    } else {
      this.loadActions.cancelAll().catch((err) => console.error(err));
      this.showActions = false;
    }
    return () => {
      console.log('component was destroyed');
    };
  });

  get slashCommandsPluginState() {
    return getSlashCommandsPluginState(this.controller.mainEditorState);
  }

  get showContextMenu() {
    return (
      this.showActions ||
      this.slashCommandsPluginState?.shouldOpenContextActions
    );
  }

  <template>
    <div {{this.trackSlashCommandsPluginState}}>
      <FloatingPlus @controller={{this.controller}} @visible={{this.visible}}>
        <div class="say-floating-plus-content">
          {{#if this.loadAndShowActions.isRunning}}
            <div class="au-u-padding-tiny au-u-1-1">
              <span class="say-floating-plus-button-loader" />
            </div>
          {{else}}
            <button
              type="button"
              title="Show contextual actions"
              {{on "click" this.loadAndShowActions.perform}}
            >
              <AuIcon @icon="plus" @size="large" />
            </button>
          {{/if}}
        </div>
      </FloatingPlus>
      {{#if this.showContextMenu}}
        <div {{this.setUpListeners}}>
          <ContextualActionsMenu
            @controller={{this.controller}}
            @actions={{this.actions}}
            @groups={{this.groups}}
            @onActionSelected={{this.selectAction}}
            @isLoading={{this.loadActions.isRunning}}
          />
        </div>
      {{/if}}
    </div>
  </template>
}
