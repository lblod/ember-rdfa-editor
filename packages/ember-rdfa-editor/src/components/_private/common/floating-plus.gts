import { flip, hide, offset, shift, type Middleware } from '@floating-ui/dom';
import Component from '@glimmer/component';
import floatingUI from '#root/modifiers/_private/floating-ui.ts';
import type SayController from '#root/core/say-controller.ts';
import { getReferenceElementFromSelection } from '#root/components/utils/floating-ui-reference-element.ts';

type Signature = {
  Args: {
    controller: SayController;
    visible: boolean;
  };
  Blocks: {
    default: [];
  };
};

export default class FloatingPlus extends Component<Signature> {
  get controller() {
    return this.args.controller;
  }

  get visible() {
    return this.args.visible;
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
    {{#if this.visible}}
      <div
        {{floatingUI
          referenceElement=this.referenceElement
          placement="left"
          middleware=this.tooltipMiddleWare
          strategy="fixed"
          useTransform=true
        }}
        class="say-floating-plus"
      >
        {{yield}}
      </div>
    {{/if}}
  </template>
}
