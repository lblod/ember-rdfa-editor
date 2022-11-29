import { EditorState, Plugin } from 'prosemirror-state';
import { Fragment, Node as PNode, NodeSpec } from 'prosemirror-model';
import { Decoration, DecorationSet, NodeView } from 'prosemirror-view';
import { PLACEHOLDER_CLASS } from '@lblod/ember-rdfa-editor/utils/constants';
import RdfaEditorPlugin, {
  NodeConfig,
} from '@lblod/ember-rdfa-editor/core/rdfa-editor-plugin';
import { getRdfaAttrs, rdfaAttrs } from '@lblod/ember-rdfa-editor/core/schema';

const placeholderSpec: NodeSpec = {
  inline: true,
  content: 'inline*',
  group: 'inline',
  attrs: {
    ...rdfaAttrs,
    placeholderText: { default: 'placeholder' },
  },
  selectable: false,

  parseDOM: [
    {
      tag: 'span',

      getContent() {
        return Fragment.empty;
      },
      getAttrs(node: HTMLElement) {
        if (node.classList.contains(PLACEHOLDER_CLASS)) {
          return { placeholderText: node.innerText, ...getRdfaAttrs(node) };
        }
        return false;
      },
    },
  ],
  toDOM(node: PNode) {
    if (node.childCount > 0) {
      return ['span', { ...node.attrs }, 0];
    } else {
      return [
        'span',
        { class: PLACEHOLDER_CLASS, ...node.attrs },
        node.attrs.placeholderText,
      ];
    }
  },
};
class PlaceholderView implements NodeView {
  dom: HTMLElement;
  contentDOM: HTMLElement;
  clean = true;

  constructor(node: PNode) {
    this.dom = document.createElement('span');
    if (node.content.size === 0) {
      this.dom.classList.add(PLACEHOLDER_CLASS);
    }

    this.contentDOM = this.dom;
  }

  update(node: PNode): boolean {
    if (node.type.name !== 'placeholder') {
      return false;
    }

    if (node.content.size === 0) {
      this.dom.classList.add(PLACEHOLDER_CLASS);
    } else {
      this.dom.classList.remove(PLACEHOLDER_CLASS);
    }
    return true;
  }
}

function placeholder(): Plugin {
  const placeholder: Plugin<DecorationSet> = new Plugin<DecorationSet>({
    props: {
      nodeViews: {
        placeholder(node: PNode) {
          return new PlaceholderView(node);
        },
      },
      decorations: ({ doc }: EditorState) => {
        const active = true;
        const decorations: Decoration[] = [];

        if (!active) {
          return null;
        }

        // only calculate isEmpty once due to its performance impacts (see issue #3360)
        // const emptyDocInstance = doc.type.createAndFill();

        doc.descendants((node, pos) => {
          if (node.type.name !== 'placeholder') {
            return true;
          }
          const isEmpty = node.childCount === 0;

          if (isEmpty) {
            const decoration = Decoration.widget(
              pos + 1,
              () => {
                return new Text(node.attrs.placeholderText);
              },
              { side: -1 }
            );

            decorations.push(decoration);
          }

          return false;
        });

        return DecorationSet.create(doc, decorations);
      },
    },
  });

  return placeholder;
}

export class PlaceHolderPlugin extends RdfaEditorPlugin {
  nodes(): NodeConfig[] {
    return [
      {
        name: 'placeholder',
        spec: placeholderSpec,
        view: (node) => new PlaceholderView(node),
      },
    ];
  }

  proseMirrorPlugins(): Plugin[] {
    return [placeholder()];
  }
}
