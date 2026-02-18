import { action } from '@ember/object';
import Component from '@glimmer/component';
import SayView from '#root/core/say-view.ts';
import type { EmberNodeArgs } from '#root/utils/ember-node.ts';
import { tracked } from '@glimmer/tracking';
import { editableNodePlugin } from '#root/plugins/_private/editable-node/index.ts';
import leaveOnEnterKey from '#root/modifiers/leave-on-enter-key.ts';
import EmbeddedEditor from './embedded-editor.gts';

export default class InlineRdfaComponent extends Component<EmberNodeArgs> {
  @tracked innerView?: SayView;

  get plugins() {
    return [editableNodePlugin(this.args.getPos)];
  }
  get controller() {
    return this.args.controller;
  }

  @action
  initEditor(view: SayView) {
    this.innerView = view;
  }

  <template>
    <span data-inline-rdfa class="say-inline-rdfa">
      <EmbeddedEditor
        @controller={{@controller}}
        @node={{@node}}
        @view={{@view}}
        @getPos={{@getPos}}
        @selected={{@selected}}
        @initEditor={{this.initEditor}}
        @plugins={{this.plugins}}
        @contentDecorations={{@contentDecorations}}
        @updateAttribute={{@updateAttribute}}
        @selectNode={{@selectNode}}
        {{leaveOnEnterKey this.controller @getPos}}
      />
    </span>
  </template>
}
