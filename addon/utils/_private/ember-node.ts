/**
 * Contains code from https://github.com/ueberdosis/tiptap/blob/d61a621186470ce286e2cecf8206837a1eec7338/packages/core/src/NodeView.ts#L195
 *
 * MIT License
 * Copyright (c) 2023, Tiptap GmbH
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
 *   - `stopEvent`: By default this will stop events which occur inside the ember-node but not inside it's content. Only override if you know what you are doing.
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
  config: EmberNodeConfig;

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
    this.config = emberNodeConfig;
    const { name, componentPath, atom, inline } = emberNodeConfig;
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
      ? document.createElement(inline ? 'span' : 'div', {})
      : undefined;
    if (this.contentDOM) {
      this.contentDOM.dataset.content = 'true';
    }
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

  /**
   *
   * Prevents the editor view from handling events which are inside the ember-node but not inside it's editable content.
   * Based on https://github.com/ueberdosis/tiptap/blob/d61a621186470ce286e2cecf8206837a1eec7338/packages/core/src/NodeView.ts#LL99C6-L99C6
   * @param event The event to check
   */
  stopEvent(event: Event) {
    if (!this.dom) {
      return false;
    }

    if (this.config.stopEvent) {
      return this.config.stopEvent(event);
    }

    const target = event.target as HTMLElement;
    const isInElement =
      this.dom.contains(target) && !this.contentDOM?.contains(target);

    return isInElement;
  }

  /**
   *
   * Determines whether a DOM mutation should be ignored by prosemirror.
   * DOM mutations occuring inside the ember-node which are not inside it's editable content are ignored.
   * Selections are always handled by prosemirror.
   * Taken from https://github.com/ueberdosis/tiptap/blob/d61a621186470ce286e2cecf8206837a1eec7338/packages/core/src/NodeView.ts#L195
   * @param mutation
   * @returns
   */
  ignoreMutation(
    mutation: MutationRecord | { type: 'selection'; target: Element }
  ) {
    if (!this.dom || !this.contentDOM) {
      return true;
    }
    if (this.config.ignoreMutation) {
      return this.config.ignoreMutation(mutation);
    }

    // a leaf/atom node is like a black box for ProseMirror
    // and should be fully handled by the node view
    if (this.node.isLeaf || this.node.isAtom) {
      return true;
    }

    // ProseMirror should handle any selections
    if (mutation.type === 'selection') {
      return false;
    }

    // we will allow mutation contentDOM with attributes
    // so we can for example adding classes within our node view
    if (this.contentDOM === mutation.target && mutation.type === 'attributes') {
      return true;
    }

    // ProseMirror should handle any changes within contentDOM
    if (this.contentDOM.contains(mutation.target)) {
      return false;
    }

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
  stopEvent?: (event: Event) => boolean;
  ignoreMutation?: (
    mutation: MutationRecord | { type: 'selection'; target: Element }
  ) => boolean;
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
