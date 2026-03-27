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

  @tracked _justClicked = false;
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

  @tracked actions = [
    {
      id: 'dummy-action-1',
      label: 'Op het kruispunt van de … met de … geldt',
    },
    {
      id: 'dummy-action-2',
      label: 'Op alle wegen die uitkomen op … geldt',
    },
    {
      id: 'dummy-action-3',
      label: 'Op de … ter hoogte van … geldt',
    },
    {
      id: 'dummy-action-4',
      label: 'Op het kruispunt van de … met de … geldt',
    },
    {
      id: 'dummy-action-5',
      label: 'Op … vanaf … tot … geldt',
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
      group: 'plaatsbepaling',
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
          class="say-floating-plus"
        >
          {{#each this.actions as |actionItem|}}
            <div class="say-floating-plus--actions">
              <button
                {{on "click" (fn this.executeAction actionItem)}}
                class="say-floating-plus-button au-u-text-left"
                type="button"
                title="Test"
              >
                <span>{{actionItem.label}}</span>
              </button>
            </div>
          {{/each}}
        </ContextualActionsMenu>
      </div>
    {{/if}}
  </template>
}
