import Component from '@glimmer/component';
import ContextualActionsMenu from '../../_private/common/contextual-actions-menu.gts';
import FloatingPlus from '../../_private/common/floating-plus.gts';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type SayController from '#root/core/say-controller.ts';
import { NodeSelection, type EditorState } from 'prosemirror-state';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import { on } from '@ember/modifier';
import {
  type ContextualAction,
  type GetContextualActionGroups,
} from '#root/plugins/contextual-actions/index.ts';
import { action } from '@ember/object';
import { runTask } from 'ember-lifeline';
import {
  getSlashCommandsPluginState,
  slashCommandsStateChanged,
} from '#root/plugins/slash-commands/index.ts';
import { localCopy } from 'tracked-toolbox';
import { restartableTask, timeout } from 'ember-concurrency';

type Args = {
  controller: SayController;
  getGroups?: GetContextualActionGroups;
};

const SEARCH_TIMEOUT_MS = 500;

export default class ContextualActionsContainer extends Component<Args> {
  @service declare intl: IntlService;

  @tracked loadActionsError: string | null = null;
  @tracked searchQuery: string = '';

  // Local copy because we want to control openness of context menu (by setting this to null to close)
  @localCopy('selectedEditorNode', null) selectedEditorNodeLocal = null;

  /**
   * We use this instead of this.controller.mainEditorState
   * because we want to control the tracking behavior ourselves.
   * Otherwise the invisibles plugin interferes with the contextual
   * actions menu because it changes the editor state onBlur
   * which we want to ignore
   */
  @tracked localEditorState: EditorState | null = null;
  @tracked plusButtonClicked = false;

  @tracked contextualActions: ContextualAction[] = [];

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

  /**
   * Returns the node to display the menu for
   */
  get selectedEditorNode() {
    const selection = this.controller.mainEditorState.selection;
    if (selection instanceof NodeSelection) {
      return selection.node;
    }
  }

  registerStateListener = modifier(() => {
    this.controller.mainEditorView.addStateListener(this.editorStateListener);
    return () => {
      this.controller.mainEditorView.removeStateListener(
        this.editorStateListener,
      );
    };
  });

  get groups() {
    const state = this.localEditorState;
    if (!state) return [];

    return (
      this.args.getGroups?.flatMap((getGroup) =>
        getGroup(state, this.searchQuery),
      ) ?? []
    );
  }

  closeContextMenu = () => {
    const tr = this.controller.mainEditorState.tr;
    tr.setMeta('SLASH_COMMANDS_PLUGIN', 'close_context_menu');
    this.controller.mainEditorView.dispatch(tr);
    this.plusButtonClicked = false;
    this.searchQuery = '';
    this.selectedEditorNodeLocal = null;
    runTask(this, () => this.controller.mainEditorView.focus());
  };

  openContextMenu = () => {
    // Send a transaction to signal the slash commands plugin (if present) that
    // the menu is open. This hides the placeholder text
    const tr = this.controller.mainEditorState.tr;
    tr.setMeta('SLASH_COMMANDS_PLUGIN', 'open_context_menu');
    this.controller.mainEditorView.dispatch(tr);

    // Opening the menu cannot rely on the slash commands plugin
    // to be present, thats why we keep the openness state locally as well
    this.plusButtonClicked = true;
  };

  get controller() {
    return this.args.controller;
  }

  get visible() {
    return this.groups.length > 0 && !this.showContextMenu;
  }

  // We don't use a trackedfunction because it causes the menu to reload
  // after the first load (after the debounce time)
  // See https://discord.com/channels/480462759797063690/1501197288603910266
  getActionsTask = restartableTask(async () => {
    if (this.searchQuery) {
      await timeout(SEARCH_TIMEOUT_MS);
    }
    const state = this.localEditorState;
    if (!this.showContextMenu || !state || this.loadActionsError) return [];
    const getActions = this.groups?.flatMap((group) => group.getActions) ?? [];

    try {
      this.contextualActions = (
        await Promise.all(getActions.map((cb) => cb(state, this.searchQuery)))
      ).flat();
    } catch (error) {
      if (error instanceof Error) {
        this.loadActionsError = error.message;
      } else if (typeof error === 'string') {
        this.loadActionsError = error;
      } else {
        this.loadActionsError = this.intl.t(
          'ember-rdfa-editor.utils.something-went-wrong',
        );
      }
    }
  });

  @action
  executeAction(action: ContextualAction) {
    const menuWasOpenedBySlash =
      !this.plusButtonClicked && this.slashCommandsPluginState?.menuOpen;
    if (
      menuWasOpenedBySlash &&
      this.slashCommandsPluginState?.latestEditorState
    ) {
      this.controller.mainEditorView.updateState(
        this.slashCommandsPluginState.latestEditorState,
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
    this.closeContextMenu();
  }

  get slashCommandsPluginState() {
    if (!this.localEditorState) return null;
    return getSlashCommandsPluginState(this.localEditorState);
  }

  get showContextMenu() {
    const menuOpen = this.slashCommandsPluginState?.menuOpen ?? false;
    const { plusButtonClicked, selectedEditorNodeLocal } = this;
    const hasGroups = this.groups.length > 0;

    return (
      hasGroups && (menuOpen || plusButtonClicked || selectedEditorNodeLocal)
    );
  }

  setSearchQuery = (query: string) => {
    this.searchQuery = query;
    void this.getActionsTask.perform();
  };

  startGetActionsTask = modifier(() => {
    void this.getActionsTask.perform();
  });

  <template>
    <div {{this.registerStateListener}}>
      <FloatingPlus @controller={{this.controller}} @visible={{this.visible}}>
        <div class="say-floating-plus-content">
          <button
            type="button"
            title="Show contextual actions"
            {{on "click" this.openContextMenu}}
          >
            <AuIcon @icon="plus" @size="large" />
          </button>
        </div>
      </FloatingPlus>
      {{#if this.showContextMenu}}
        <ContextualActionsMenu
          {{this.startGetActionsTask}}
          @enableSearch={{true}}
          @controller={{this.controller}}
          @actions={{if
            this.contextualActions
            this.contextualActions
            undefined
          }}
          @groups={{this.groups}}
          @onActionSelected={{this.selectAction}}
          @onClose={{this.closeContextMenu}}
          @onSearch={{this.setSearchQuery}}
          @searchQuery={{this.searchQuery}}
          @isLoading={{this.getActionsTask.isRunning}}
          @errorMessage={{if
            this.loadActionsError
            this.loadActionsError
            undefined
          }}
        />
      {{/if}}
    </div>
  </template>
}
