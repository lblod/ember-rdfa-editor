import Component from '@glimmer/component';
import floatingUI from '#root/modifiers/_private/floating-ui.ts';
import SayController from '#root/core/say-controller.ts';
import { Selection } from 'prosemirror-state';
import { getReferenceElementFromSelection } from '#root/components/utils/floating-ui-reference-element.ts';
import {
  autoPlacement,
  hide,
  offset,
  size,
  type Middleware,
} from '@floating-ui/dom';
import { modifier } from 'ember-modifier';

type Signature = {
  Args: {
    controller: SayController;
    forSelection: Selection;
    maxHeightPx?: number;

    onClose?: () => void;
  };
  Blocks: {
    default: [];
  };
  Element: HTMLElement;
};

export default class FloatingWindow extends Component<Signature> {
  setUpListeners = modifier(() => {
    const handleMousedown = () => {
      this.args.onClose?.();
    };

    const handleKeydown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          this.args.onClose?.();
          break;
      }
    };

    const viewDom = this.controller.mainEditorView.dom;
    viewDom.addEventListener('mousedown', handleMousedown);
    // Hacky but needed because otherwise the editor handles
    // the event first by inserting an enter
    document.addEventListener('keydown', handleKeydown, { capture: true });
    return () => {
      viewDom.removeEventListener('mousedown', handleMousedown);
      document.removeEventListener('keydown', handleKeydown, { capture: true });
    };
  });

  get controller() {
    return this.args.controller;
  }

  get referenceElement() {
    return getReferenceElementFromSelection({
      editorState: this.controller.mainEditorState,
      editorView: this.controller.mainEditorView,
      selection: this.args.forSelection,
    });
  }

  get textIsRightAligned() {
    const parent = this.controller.mainEditorState.selection.$from.parent;
    return parent.attrs['alignment'] === 'right';
  }

  get windowPlacement() {
    return this.textIsRightAligned ? 'bottom-end' : 'bottom-start';
  }

  get floatingUIMiddleware(): Middleware[] {
    const args = this.args;
    return [
      offset(10),
      autoPlacement({
        allowedPlacements: this.textIsRightAligned
          ? ['bottom-end', 'top-end']
          : ['bottom-start', 'top-start'],
      }),
      size({
        apply({ availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.min(args.maxHeightPx ?? Infinity, availableHeight)}px`,
          });
        },
      }),
      hide({ strategy: 'referenceHidden' }),
      hide({ strategy: 'escaped' }),
    ];
  }

  <template>
    <div
      {{floatingUI
        referenceElement=this.referenceElement
        placement=this.windowPlacement
        middleware=this.floatingUIMiddleware
        strategy="fixed"
        useTransform=false
      }}
      class="say-floating-element"
      {{this.setUpListeners}}
      ...attributes
    >
      {{yield}}
    </div>
  </template>
}
