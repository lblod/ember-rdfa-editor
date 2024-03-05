import {
  type VirtualElement,
  flip,
  hide,
  offset,
  shift,
  type Middleware,
} from '@floating-ui/dom';
import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import floatingUI from '@lblod/ember-rdfa-editor/modifiers/_private/floating-ui';

type Args = {
  controller: SayController;
  visible: boolean;
};
export default class SelectionTooltip extends Component<Args> {
  floatingUI = floatingUI;

  get controller() {
    return this.args.controller;
  }

  get visible() {
    return this.args.visible;
  }

  get referenceElement() {
    const { selection } = this.controller.mainEditorState;
    const virtualElement: VirtualElement = {
      getBoundingClientRect: () => {
        const coordsFrom = this.controller.mainEditorView.coordsAtPos(
          selection.from,
          -1,
        );
        const coordsTo = this.controller.mainEditorView.coordsAtPos(
          selection.to,
          -1,
        );
        const left = (coordsFrom.left + coordsTo.left) / 2;
        const right = (coordsFrom.right + coordsTo.right) / 2;
        const bottom = coordsTo.bottom;
        const top = coordsFrom.top;
        return {
          left,
          right,
          bottom,
          top,
          x: left,
          y: top,
          width: 0,
          height: bottom - top,
        };
      },
      contextElement: this.controller.mainEditorView.dom,
    };
    return virtualElement;
  }
  get tooltipMiddleWare(): Middleware[] {
    return [
      offset(10),
      flip(),
      shift({ padding: 5 }),
      hide({ strategy: 'referenceHidden' }),
      hide({ strategy: 'escaped' }),
    ];
  }
}
