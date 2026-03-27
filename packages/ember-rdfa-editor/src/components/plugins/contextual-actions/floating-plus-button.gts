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
import { on } from '@ember/modifier';
import set from '../../../helpers/set.ts';
import { fn } from '@ember/helper';
import { NodeSelection } from 'prosemirror-state';

type Args = {
  controller: SayController;
};

export type ContextualAction = {
  id: string;
  label: string;
  group: string;
  command: Command;
  description?: string;

  isVisible?: (state: EditorState) => boolean;
  isEnabled?: (state: EditorState) => boolean;

  priority?: number;
};

export type ContextualActionGroup = {
  id: string;
  label: string;

  isVisible?: (state: EditorState) => boolean;

  priority?: number;
};

export default class TableTooltip extends Component<Args> {
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

  @tracked groups = [
    {
      id: 'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
      label: 'Plaatsbepaling',
    },
    {
      id: 'insert-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
      label: 'Invoegen',
    },
  ];

  @tracked actions: ContextualAction[] = [
    {
      id: 'dummy-action-1',
      label: 'Op het kruispunt van de … met de … geldt',
      group: 'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
    {
      id: 'dummy-action-2',
      label: 'Op alle wegen die uitkomen op … geldt',
      group: 'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
    {
      id: 'dummy-action-3',
      label: 'Op de … ter hoogte van … geldt',
      group: 'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
    {
      id: 'dummy-action-4',
      label: 'Op het kruispunt van de … met de … geldt',
      group: 'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
    {
      id: 'dummy-action-5',
      label: 'Op … vanaf … tot … geldt',
      group: 'plaatsbepaling-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
    {
      id: 'dummy-action-5',
      label: 'Datum invoegen',
      group: 'insert-1d8563d6-bfd8-487f-a2a0-6d7a6ab01cb5',
    },
  ].map((action) => {
    const node = this.controller.schema.nodes.block_rdfa.create(
      {
        rdfaNodeType: 'literal',
        label: `Plaatsbepaling`,
      },
      [
        this.controller.schema.nodes.paragraph.create(null, [
          this.controller.schema.text(action.label),
        ]),
      ],
    );

    return {
      ...action,
      command: (state: EditorState, dispatch) => {
        if (dispatch) {
          const tr = state.tr;
          tr.replaceSelectionWith(node);
          if (tr.selection.$anchor.nodeBefore) {
            const resolvedPos = tr.doc.resolve(
              tr.selection.anchor - tr.selection.$anchor.nodeBefore?.nodeSize,
            );
            tr.setSelection(new NodeSelection(resolvedPos));
          }
          dispatch(tr);
        }
        return true;
      },
    };
  });

  get groupedActions() {
    const visibleGroups = this.groups.filter(
      (group: ContextualActionGroup) =>
        !group.isVisible || group.isVisible(this.controller.mainEditorState),
    );

    return visibleGroups
      .map((group) => ({
        ...group,
        actions: this.actions.filter((action) => action.group === group.id),
      }))
      .filter((group) => group.actions.length > 0);
  }

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
        </ContextualActionsMenu>
      </div>
    {{/if}}
  </template>
}
