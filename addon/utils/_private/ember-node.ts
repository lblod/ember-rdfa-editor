import { hbs, TemplateFactory } from 'ember-cli-htmlbars';
import {
  AttributeSpec,
  DOMOutputSpec,
  Node as PNode,
  NodeSpec,
  ParseRule,
} from 'prosemirror-model';
import {
  Decoration,
  DecorationSource,
  NodeView,
  NodeViewConstructor,
} from 'prosemirror-view';
import { v4 as uuidv4 } from 'uuid';
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import Owner from '@ember/owner';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import { SayView } from '@lblod/ember-rdfa-editor';

export interface EmberInlineComponent extends Component, EmberNodeArgs {
  appendTo(selector: string | Element): this;
}

export interface EmberNodeArgs {
  getPos: () => number | undefined;
  node: PNode;
  updateAttribute: (attr: string, value: unknown) => void;
  controller: SayController;
  view: SayView;
  selected: boolean;
  contentDecorations?: DecorationSource;
}

export function emberComponent(
  owner: Owner,
  name: string,
  inline: boolean,
  template: TemplateFactory,
  props: EmberNodeArgs & {
    atom: boolean;
    componentPath: string;
    contentDOM?: HTMLElement;
  }
): { node: HTMLElement; component: EmberInlineComponent } {
  // const instance = window.__APPLICATION;
  const componentName = `${name}-${uuidv4()}`;
  owner.register(
    `component:${componentName}`,
    // eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
    Component.extend({
      layout: template,
      tagName: '',
      ...props,
    })
  );
  const component = owner.lookup(
    `component:${componentName}`
  ) as EmberInlineComponent; // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const node = document.createElement(inline ? 'span' : 'div');
  node.classList.add('ember-node');
  component.appendTo(node);
  return { node, component };
}

class EmberNodeView implements NodeView {
  node: PNode;
  dom: Element;
  contentDOM?: HTMLElement;
  emberComponent: EmberInlineComponent;
  template: TemplateFactory;
  stopEvent: (event: InputEvent) => boolean;

  constructor(
    controller: SayController,
    emberNodeConfig: EmberNodeConfig,
    pNode: PNode,
    view: SayView,
    getPos: () => number | undefined
  ) {
    const {
      name,
      componentPath,
      atom,
      inline,
      stopEvent = () => true,
    } = emberNodeConfig;
    this.template = hbs`{{#component this.componentPath
                          getPos=this.getPos
                          node=this.node
                          updateAttribute=this.updateAttribute
                          controller=this.controller
                          view=this.view
                          selected=this.selected
                          contentDecorations=this.contentDecorations
                        }}
                          {{#unless this.atom}}
                          <EmberNode::Slot @contentDOM={{this.contentDOM}}/>
                          {{/unless}}
                        {{/component}}`;
    this.node = pNode;
    this.contentDOM = !atom
      ? document.createElement(inline ? 'span' : 'div')
      : undefined;
    this.stopEvent = stopEvent;

    const { node, component } = emberComponent(
      controller.owner,
      name,
      inline,
      this.template,
      {
        getPos,
        node: pNode,
        updateAttribute: (attr, value) => {
          const pos = getPos();
          if (pos !== undefined) {
            const transaction = view.state.tr;
            transaction.setNodeAttribute(pos, attr, value);
            view.dispatch(transaction);
          }
        },
        controller,
        contentDOM: this.contentDOM,
        componentPath,
        atom,
        view,
        selected: false,
      }
    );
    this.dom = node;
    this.emberComponent = component;
  }

  update(
    node: PNode,
    _decorations: Decoration[],
    innerDecorations: DecorationSource
  ) {
    if (node.type !== this.node.type) return false;
    this.node = node;
    this.emberComponent.set('node', node);
    this.emberComponent.set('contentDecorations', innerDecorations);
    return true;
  }

  selectNode() {
    this.dom.classList.add('ProseMirror-selectednode');
    this.emberComponent.set('selected', true);
  }

  deselectNode() {
    this.dom.classList.remove('ProseMirror-selectednode');
    this.emberComponent.set('selected', false);
  }

  destroy() {
    this.emberComponent.destroy();
  }
}

export type EmberNodeConfig = {
  name: string;
  componentPath: string;
  inline: boolean;
  group: string;
  content?: string;
  atom: boolean;
  draggable?: boolean;
  defining?: boolean;
  recreateUri?: boolean;
  uriAttributes?: string[];
  attrs?: {
    [name: string]: AttributeSpec & {
      serialize?: (node: PNode) => string;
      parse?: (element: HTMLElement) => unknown;
    };
  };
  parseDOM?: readonly ParseRule[];
  toDOM?: (node: PNode) => DOMOutputSpec;
  stopEvent?: (event: InputEvent) => boolean;
} & (
  | {
      atom: true;
    }
  | {
      atom: false;
      content: string;
    }
) & {
    // This is so we can use custom node config specs, like `needsFFKludge`
    [key: string]: unknown;
  };

export function createEmberNodeSpec(config: EmberNodeConfig): NodeSpec {
  const {
    name,
    inline,
    group,
    content,
    atom,
    draggable,
    defining,
    recreateUri,
    uriAttributes,
    attrs,
    parseDOM,
    toDOM,
    ...passthrough
  } = config;
  return {
    inline,
    atom,
    group,
    content,
    recreateUri,
    uriAttributes,
    attrs,
    draggable,
    defining,
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
    ...passthrough,
  };
}

export function createEmberNodeView(config: EmberNodeConfig) {
  return function (controller: SayController): NodeViewConstructor {
    return function (node, view: SayView, getPos) {
      return new EmberNodeView(controller, config, node, view, getPos);
    };
  };
}
