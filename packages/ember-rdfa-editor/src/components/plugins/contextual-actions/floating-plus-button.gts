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
import set from '../../../helpers/set.ts';
import {
  type ContextualAction,
  type ContextualActionGroup,
} from '#root/plugins/contextual-actions/index.ts';

type Args = {
  controller: SayController;
  getActions?: ((
    state: EditorState,
  ) => ContextualAction[] | Promise<ContextualAction[]>)[];
  getGroups?: ((
    state: EditorState,
  ) => ContextualAction[] | Promise<ContextualActionGroup[]>)[];
};

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
    // TODO we want to allow to keep typing after the floating plus is pressed
    // The below code break clicking on an action in the contextual actions menu
    // const handleMouseDown = (event: MouseEvent) => {
    //   event.preventDefault();
    // };
    // element.addEventListener('mousedown', handleMouseDown);
    // return () => {
    //   element.removeEventListener('mousedown', handleMouseDown);
    // };
  });

  get controller() {
    return this.args.controller;
  }

  get visible() {
    return !this.showActions;
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
        <div class="say-floating-plus--actions">
          <button
            {{this.preventDefault}}
            class="say-floating-plus-button au-u-flex au-u-flex--center"
            type="button"
            title="Show contextual actions"
            {{on "click" (set this "showActions" true)}}
          >
            <AuIcon @icon="plus" @size="large" />
          </button>
        </div>
      </FloatingPlus>
    </div>
    {{#if this.showActions}}
      <div {{this.setUpListeners}}>
        <ContextualActionsMenu
          @controller={{this.controller}}
          @position="bottom"
          class="say-contextual-actions-menu"
          @getActions={{@getActions}}
          @getGroups={{@getGroups}}
          @onActionSelected={{set this "showActions" false}}
        />
      </div>
    {{/if}}
  </template>
}
