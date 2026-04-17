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
  type GetContextualActionGroups,
  type GetContextualActions,
} from '#root/plugins/contextual-actions/index.ts';
import { action } from '@ember/object';
import {
  getSlashCommandsPluginState,
  slashCommandsStateChanged,
} from '#root/plugins/slash-commands/index.ts';
import { trackedFunction } from 'reactiveweb/function';
import { or } from 'ember-truth-helpers';

type Args = {
  controller: SayController;
  getActions?: GetContextualActions;
  getGroups?: GetContextualActionGroups;
};

export default class ContextualActionsContainer extends Component<Args> {
  @service declare intl: IntlService;

  /**
   * Set to true when the button is clicked
   */
  @tracked showActions = false;

  /**
   * We use this instead of this.controller.mainEditorState
   * because we want to control the tracking behavior ourselves.
   * Otherwise the invisibles plugin interferes with the contextual
   * actions menu because it changes the editor state onBlur
   * which we want to ignore
   */
  @tracked localEditorState: EditorState | null = null;

  editorStateListener = (oldState: EditorState, newState: EditorState) => {
    const docChanged = !oldState.doc.eq(newState.doc);
    const selectionChanged = !oldState.selection.eq(newState.selection);
    const oldPluginState = getSlashCommandsPluginState(oldState);
    const newPluginState = getSlashCommandsPluginState(newState);
    const pluginStateChanged = slashCommandsStateChanged(
      oldPluginState,
      newPluginState,
    );

    if (docChanged || selectionChanged || pluginStateChanged) {
      this.localEditorState = newState;
    }
  };

  registerStateListener = modifier(() => {
    this.controller.mainEditorView.addStateListener(this.editorStateListener);
    return () => {
      this.controller.mainEditorView.removeStateListener(
        this.editorStateListener,
      );
    };
  });

  get groups() {
    return (
      this.args.getGroups?.flatMap((getGroup) =>
        getGroup(this.localEditorState ?? undefined),
      ) ?? []
    );
  }

  closeContextMenu = () => {
    this.showActions = false;
    const tr = this.controller.mainEditorState.tr;
    tr.setMeta('SLASH_COMMANDS_PLUGIN', 'close_context_menu');
    this.controller.mainEditorView.dispatch(tr);
  };

  get controller() {
    return this.args.controller;
  }

  get visible() {
    return this.groups.length > 0 && !this.showContextMenu;
  }

  actions = trackedFunction(this, async () => {
    if (!this.showContextMenu) return [];
    const getActions = this.args.getActions ?? [];

    return (
      await Promise.all(
        getActions.map((cb) => cb(this.localEditorState ?? undefined)),
      )
    ).flatMap((x) => x);
  });

  @action
  executeAction(action: ContextualAction) {
    if (
      this.slashCommandsPluginState?.shouldOpenContextActions && // Menu was opened by a slash
      this.slashCommandsPluginState?.latestState
    ) {
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

  get slashCommandsPluginState() {
    if (!this.localEditorState) return null;
    return getSlashCommandsPluginState(this.localEditorState);
  }

  get showContextMenu() {
    return (
      this.showActions ||
      this.slashCommandsPluginState?.shouldOpenContextActions
    );
  }

  setShowActions = () => {
    this.showActions = true;
  };

  <template>
    <div {{this.registerStateListener}}>
      <FloatingPlus @controller={{this.controller}} @visible={{this.visible}}>
        <div class="say-floating-plus-content">
          {{#if this.actions.isLoading}}
            <div class="au-u-padding-tiny au-u-1-1">
              <span class="say-floating-plus-button-loader" />
            </div>
          {{else}}
            <button
              type="button"
              title="Show contextual actions"
              {{on "click" this.setShowActions}}
            >
              <AuIcon @icon="plus" @size="large" />
            </button>
          {{/if}}
        </div>
      </FloatingPlus>
      {{#if this.showContextMenu}}
        <ContextualActionsMenu
          @controller={{this.controller}}
          @actions={{or this.actions.value this.actions.value undefined}}
          @groups={{this.groups}}
          @onActionSelected={{this.selectAction}}
          @onClose={{this.closeContextMenu}}
          @isLoading={{this.actions.isLoading}}
        />
      {{/if}}
    </div>
  </template>
}
