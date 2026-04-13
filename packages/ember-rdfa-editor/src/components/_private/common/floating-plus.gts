import {
  flip,
  hide,
  offset,
  shift,
  type Middleware,
} from '@floating-ui/dom';
import Component from '@glimmer/component';
import floatingUI from '#root/modifiers/_private/floating-ui.ts';
import type SayController from '#root/core/say-controller.ts';
import { getReferenceElementFromSelection } from '#root/components/utils/floating-ui-reference-element.ts';

type Args = {
  controller: SayController;
  visible: boolean;
  position: 'left' | 'bottom';
};

export default class FloatingPlus extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get visible() {
    return this.args.visible;
  }

  get position() {
    return this.args.position ?? 'bottom';
  }

  get referenceElement() {
    const editorState = this.controller.mainEditorState;
    const editorView = this.controller.mainEditorView;
    return getReferenceElementFromSelection({
      editorState,
      editorView,
      getLeft: () => editorView.dom.getBoundingClientRect().left,
    });
  }

  get tooltipMiddleWare(): Middleware[] {
    return [
      offset(-10),
      flip(),
      shift({ padding: 5 }),
      hide({ strategy: 'referenceHidden' }),
      hide({ strategy: 'escaped' }),
    ];
  }

  <template>
    {{! @glint-nocheck: not typesafe yet }}
    {{#if this.visible}}
      <div
        {{floatingUI
          referenceElement=this.referenceElement
          placement=this.position
          middleware=this.tooltipMiddleWare
          strategy="fixed"
          useTransform=true
        }}
        ...attributes
      >
        {{yield}}
      </div>
    {{/if}}
  </template>
}
