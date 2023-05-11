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

/**
 * An EmberNode is a node with a custom Node View defined by an ember template.
 * First define your EmberNodeConfig, which should contain the information for:
 * - Prosemirror NodeSpec
 * - Prosemirror NodeView e.g.:
 *   - `ignoreMutation`: Use this to avoid rerendering a component for every change.
 *        Already as a default implementation. Only override if you know what you are doing.
 *   - `stopEvent`: defaults to true (stopping all event bubbling). Implement this if you need events to bubble up.
 * - Custom values for EmberNode, e.g.:
 *   - `componentPath`: path to the ember component to render as a Node View
 *
 * Afterwards use `createEmberNodeSpec(config)` and `createEmberNodeView(config)` to insert them in the schema.
 *
 * Special notes for EmberNode components:
 *   - Prosemirror nodes are immutable by design. Any change to a node will create a new node that is loaded in.
 *     - A rerender is avoided as much as possible here
 *     - An ember component might still rerender because of other reasons (-> not yet known which reasons and if they exist)
 *     - This means EmberNode components might lose their state at any time. *Don't save state in components properties*. @tracked properties will most likely not work as wanted.
 *     - Keep state in `attrs` of the node.
 *       Instead of a tracked property, you'll often use the following logic to keep state inside the node:
 *       `get someText() { return this.args.node.attrs.someText; }`
 *       `set someText(value) { return this.args.updateAttribute('someText', value); }`
 */

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
  ignoreMutation: (mutation: MutationRecord) => boolean;

  constructor(
    controller: SayController,
    emberNodeConfig: EmberNodeConfig,
    pNode: PNode,
    view: SayView,
    getPos: () => number | undefined
  ) {
    // when a node gets updated, `update()` is called.
    // We set the new node here and pass it to the component to render it.
    // However, this will create a DOM mutation, which prosemirror will catch and use to rerender.
    // to avoid a NodeView rerendering when we already handled the state change, we pass true to `ignoreMutation` (by default).
    const {
      name,
      componentPath,
      atom,
      inline,
      stopEvent = () => true,
      ignoreMutation = (_) => true,
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
    this.ignoreMutation = ignoreMutation;

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
  ignoreMutation?: (mutation: MutationRecord) => boolean;
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
