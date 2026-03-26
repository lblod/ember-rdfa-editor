import Component from '@glimmer/component';
import SelectionTooltip from '../../_private/common/selection-tooltip.gts';
import ContextualActionsMenu from '../../_private/common/contextual-actions-menu.gts';
import FloatingPlus from '../../_private/common/floating-plus.gts';
import { action as eAction } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type { ComponentLike } from '@glint/template';
import type SayController from '#root/core/say-controller.ts';
import type { Command } from 'prosemirror-state';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import { not } from 'ember-truth-helpers';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import set from '../../../helpers/set.ts';

type Args = {
  controller: SayController;
};

type Action =
  | { title: string; icon?: ComponentLike; label?: string; command: Command }
  | { component: ComponentLike };

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

const dummyActions: ContextualAction[] = [
  {
    id: 'dummy-action-1',
    label: 'Op het kruispunt van de … met de … geldt',
    group: 'plaatsbepaling',
    command: () => false,
  },
  {
    id: 'dummy-action-2',
    label: 'Op alle wegen die uitkomen op … geldt',
    group: 'plaatsbepaling',
    command: () => false,
  },
  {
    id: 'dummy-action-3',
    label: 'Op de … ter hoogte van … geldt',
    group: 'plaatsbepaling',
    command: () => false,
  },
  {
    id: 'dummy-action-4',
    label: 'Op het kruispunt van de … met de … geldt',
    group: 'plaatsbepaling',
    command: () => false,
  },
  {
    id: 'dummy-action-5',
    label: 'Op … vanaf … tot … geldt',
    group: 'plaatsbepaling',
    command: () => false,
  },
];

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

  canExecuteAction = (action: Action) => {
    if ('command' in action) {
      return this.controller.checkCommand(action.command);
    }

    return false;
  };

  @eAction
  executeAction(action: Action) {
    if ('command' in action) {
      this.controller.focus();
      this.controller.doCommand(action.command);
    }

    return;
  }

  get floatingPlusIsVisible() {
    return !this.showActions;
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
          class="say-floating-plus"
        >
          {{#each dummyActions as |action|}}
            <div class="say-floating-plus--actions">
              <button
                class="say-floating-plus-button au-u-text-left"
                type="button"
                title="Test"
              >
                <span>{{action.label}}</span>
              </button>
            </div>
          {{/each}}
        </ContextualActionsMenu>
      </div>
    {{/if}}
  </template>
}
