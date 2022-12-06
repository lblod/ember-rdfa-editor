import { hbs, TemplateFactory } from 'ember-cli-htmlbars';
import {
  AttributeSpec,
  DOMOutputSpec,
  Node as PNode,
  NodeSpec,
  ParseRule,
} from 'prosemirror-model';
import { EditorView, NodeView, NodeViewConstructor } from 'prosemirror-view';
import { v4 as uuidv4 } from 'uuid';
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';

export interface EmberInlineComponent extends Component, EmberNodeArgs {
  appendTo(selector: string | Element): this;
}

export interface EmberNodeArgs {
  getPos: () => number;
  node: PNode;
  updateAttribute: (attr: string, value: unknown) => void;
}

export function emberComponent(
  name: string,
  inline: boolean,
  template: TemplateFactory,
  props: EmberNodeArgs & {
    atom: boolean;
    componentPath: string;
    contentDOM?: HTMLElement;
  }
): { node: HTMLElement; component: EmberInlineComponent } {
  const instance = window.__APPLICATION;
  const componentName = `${name}-${uuidv4()}`;
  instance.register(
    `component:${componentName}`,
    // eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
    Component.extend({
      layout: template,
      tagName: '',
      ...props,
    })
  );
  const component = instance.lookup(
    `component:${componentName}`
  ) as EmberInlineComponent; // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const node = document.createElement(inline ? 'span' : 'div');
  component.appendTo(node);
  return { node, component };
}

class EmberNodeView implements NodeView {
  node: PNode;
  dom: Element;
  contentDOM?: HTMLElement;
  emberComponent: EmberInlineComponent;
  template: TemplateFactory;

  constructor(
    emberNodeConfig: EmberNodeConfig,
    pNode: PNode,
    view: EditorView,
    getPos: () => number
  ) {
    const { name, componentPath, atom, inline } = emberNodeConfig;
    this.template = hbs`{{#component this.componentPath
                          getPos=this.getPos
                          node=this.node
                          updateAttribute=this.updateAttribute
                        }}
                          {{#unless this.atom}}
                          <EditorComponents::Slot @contentDOM={{this.contentDOM}}/>
                          {{/unless}}
                        {{/component}}`;
    this.node = pNode;
    this.contentDOM = !atom
      ? document.createElement(inline ? 'span' : 'div')
      : undefined;

    const { node, component } = emberComponent(name, inline, this.template, {
      getPos,
      node: pNode,
      updateAttribute: (attr, value) => {
        const transaction = view.state.tr;
        transaction.setNodeAttribute(getPos(), attr, value);
        view.dispatch(transaction);
      },
      contentDOM: this.contentDOM,
      componentPath,
      atom,
    });
    this.dom = node;
    this.emberComponent = component;
  }

  update(node: PNode) {
    if (node.type !== this.node.type) return false;
    this.node = node;
    this.emberComponent.set('node', node);
    return true;
  }

  destroy() {
    this.emberComponent.destroy();
  }

  stopEvent() {
    return true;
  }
}

export type EmberNodeConfig = {
  name: string;
  componentPath: string;
  inline: boolean;
  group: string;
  content?: string;
  atom: boolean;
  attrs?: {
    [name: string]: AttributeSpec & {
      serialize?: (node: PNode) => string;
      parse?: (element: HTMLElement) => unknown;
    };
  };
  parseDOM?: readonly ParseRule[];
  toDOM?: (node: PNode) => DOMOutputSpec;
} & (
  | {
      atom: true;
    }
  | {
      atom: false;
      content: string;
    }
);

export function createEmberNodeSpec(config: EmberNodeConfig): NodeSpec {
  const { name, inline, group, content, atom, attrs, parseDOM, toDOM } = config;
  return {
    inline,
    atom,
    group,
    content,
    attrs,
    parseDOM: parseDOM ?? [
      {
        tag: inline ? 'span' : 'div',
        getAttrs(node: HTMLElement) {
          if (node.dataset.emberNode === name) {
            const result: Record<string, unknown> = {};
            if (attrs) {
              for (const [attributeName, attributeSpec] of Object.entries(
                attrs
              )) {
                if (attributeSpec.parse) {
                  result[attributeName] = attributeSpec.parse(node);
                }
              }
            }

            return result;
          }
          return false;
        },
      },
    ],
    toDOM:
      toDOM ??
      ((node: PNode) => {
        const serializedAttributes: Record<string, string> = {
          'data-ember-node': name,
        };
        if (attrs) {
          for (const [attributeName, attributeSpec] of Object.entries(attrs)) {
            if (attributeSpec.serialize) {
              serializedAttributes[attributeName] =
                attributeSpec.serialize(node);
            }
          }
        }
        return [
          inline ? 'span' : 'div',
          serializedAttributes,
          ...(atom
            ? []
            : [[inline ? 'span' : 'div', { 'data-slot': 'true' }, 0]]),
        ];
      }),
  };
}

export function createEmberNodeView(
  config: EmberNodeConfig
): NodeViewConstructor {
  return function (node, view, getPos) {
    return new EmberNodeView(config, node, view, getPos);
  };
}
