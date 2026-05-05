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
  type GetContextualActions,
} from '#root/plugins/contextual-actions/index.ts';
import { action } from '@ember/object';
import {
  getSlashCommandsPluginState,
  slashCommandsStateChanged,
} from '#root/plugins/slash-commands/index.ts';
import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';
import { debounce } from 'reactiveweb/debounce';
import { localCopy } from 'tracked-toolbox';

type Args = {
  controller: SayController;
  getActions?: GetContextualActions;
  getGroups?: GetContextualActionGroups;
};

export default class ContextualActionsContainer extends Component<Args> {
  @service declare intl: IntlService;

  @tracked loadActionsError: string | null = null;
  @tracked searchQuery: string = '';

  // Local copy because we want to control openness of context menu (by setting this to null to close)
  @localCopy('selectedEditorNode', null) selectedEditorNodeLocal = null;

  // TODO: fix problem where it automatically rerenders after a second
  @use debouncedQuery = debounce(1000, () => this.searchQuery, '');

  /**
   * We use this instead of this.controller.mainEditorState
   * because we want to control the tracking behavior ourselves.
   * Otherwise the invisibles plugin interferes with the contextual
   * actions menu because it changes the editor state onBlur
   * which we want to ignore
   */
  @tracked localEditorState: EditorState | null = null;
  @tracked plusButtonClicked = false;

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

  actions = trackedFunction(this, async () => {
    const state = this.localEditorState;
    if (!this.showContextMenu || !state || this.loadActionsError) return [];
    const getActions = this.args.getActions ?? [];

    try {
      return (
        await Promise.all(
          getActions.map((cb) => cb(state, this.debouncedQuery)),
        )
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
    if (
      !this.plusButtonClicked &&
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
    this.closeContextMenu();
  }

  get slashCommandsPluginState() {
    if (!this.localEditorState) return null;
    return getSlashCommandsPluginState(this.localEditorState);
  }

  get showContextMenu() {
    return (
      this.slashCommandsPluginState?.shouldOpenContextActions ||
      this.plusButtonClicked ||
      this.selectedEditorNodeLocal
    );
  }

  setSearchQuery = (query: string) => {
    this.searchQuery = query;
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
              {{on "click" this.openContextMenu}}
            >
              <AuIcon @icon="plus" @size="large" />
            </button>
          {{/if}}
        </div>
      </FloatingPlus>
      {{#if this.showContextMenu}}
        <ContextualActionsMenu
          @enableSearch={{true}}
          @controller={{this.controller}}
          @actions={{if this.actions.value this.actions.value undefined}}
          @groups={{this.groups}}
          @onActionSelected={{this.selectAction}}
          @onClose={{this.closeContextMenu}}
          @onSearch={{this.setSearchQuery}}
          @searchQuery={{this.searchQuery}}
          @isLoading={{this.actions.isLoading}}
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
