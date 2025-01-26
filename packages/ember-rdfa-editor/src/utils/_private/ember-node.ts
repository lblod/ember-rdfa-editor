/**
 * Contains code from https://github.com/ueberdosis/tiptap/blob/d61a621186470ce286e2cecf8206837a1eec7338/packages/core/src/NodeView.ts#L195
 *
 * MIT License
 * Copyright (c) 2023, Tiptap GmbH
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**

 */

import { hbs, type TemplateFactory } from 'ember-cli-htmlbars';
import type {
  AttributeSpec,
  DOMOutputSpec,
  TagParseRule,
  Node as PNode,
  Attrs,
} from 'prosemirror-model';
import {
  Decoration,
  type DecorationSource,
  type NodeView,
} from 'prosemirror-view';
import { v4 as uuidv4 } from 'uuid';
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import type Owner from '@ember/owner';
import type { ComponentLike } from '@glint/template';
import SayController from '#root/core/say-controller.ts';
import type SayNodeSpec from '#root/core/say-node-spec.ts';
import type { NodeSerializer } from '#root/core/say-serializer.ts';
import type SayView from '#root/core/say-view.ts';
import { NodeSelection } from 'prosemirror-state';

export interface EmberInlineComponent extends Component, EmberNodeArgs {
  appendTo(selector: string | Element): this;
}

export interface EmberNodeArgs {
  getPos: () => number | undefined;
  node: PNode;
  /**
   *  Util method to help with keeping state in `attrs` of the node.
   *    Instead of a tracked property, you'll often use the following logic to keep state inside the node:
   *    `get someText() { return this.args.node.attrs.someText; }`
   *    `set someText(value) { return this.args.updateAttribute('someText', value); }`
   */
  updateAttribute: (
    attr: string,
    value: unknown,
    ignoreHistory?: boolean,
  ) => void;
  /**
   * Util method which selects the node within the editor
   */
  selectNode: () => void;
  controller: SayController;
  view: SayView;
  selected: boolean;
  contentDecorations?: DecorationSource;
}

function emberComponent(
  owner: Owner,
  name: string,
  inline: boolean,
  template: TemplateFactory,
  props: EmberNodeArgs & {
    atom: boolean;
    component: ComponentLike<{ Args: EmberNodeArgs }>;
    contentDOM?: HTMLElement;
  },
): { node: HTMLElement; component: EmberInlineComponent } {
  // const instance = window.__APPLICATION;
  const componentName = `${name}-${uuidv4()}`;
  owner.register(
    `component:${componentName}`,
    // eslint-disable-next-line ember/no-classic-classes
    Component.extend({
      layout: template,
      tagName: '',
      ...props,
    }),
  );
  const component = owner.lookup(
    `component:${componentName}`,
  ) as EmberInlineComponent;  
  const node = document.createElement(inline ? 'span' : 'div');
  node.classList.add('ember-node');
  component.appendTo(node);
  return { node, component };
}

/**
 * An EmberNode is a node with a custom Node View defined by an ember template.
 * First define your EmberNodeConfig, which should contain the information for:
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
 *
 *   - when defining an ember-node using these utility functions, nested contenteditable attributes should be prevented.
 *     Ember nodes which can contain editable content should never be `contenteditable: false` as a whole,
 *     but only the parts which are `contenteditable: false` should be marked as so.
 *     E.g.: It's preferred to write:
 *
 *     ```
 *     <div>
 *     <header contenteditable="false">
 *      <p>header</p>
 *     </header>
 *     <content>
 *      {{yield}}
 *     </content>
 *     </div>
 *     ```
 *     instead of
 *     ```
 *     <div contenteditable="false">
 *     <header>
 *      <p>header</p>
 *     </header>
 *     <content contenteditable="true">
 *      {{yield}}
 *     </content>
 *     </div>
 *     ```
 */
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
    getPos: () => number | undefined,
  ) {
    // when a node gets updated, `update()` is called.
    // We set the new node here and pass it to the component to render it.
    this.config = emberNodeConfig;
    const { name, component: componentClass, atom, inline } = emberNodeConfig;

    // @ts-expect-error not typesafe yet
    this.template = hbs`<this.component
                          @getPos={{this.getPos}}
                          @node={{this.node}}
                          @updateAttribute={{this.updateAttribute}}
                          @controller={{this.controller}}
                          @view={{this.view}}
                          @selected={{this.selected}}
                          @contentDecorations={{this.contentDecorations}}
                          @selectNode={{this.selectNode}}
                        >
                          {{#unless this.atom}}
                            {{! @glint-expect-error: not typesafe yet }}
                            <EmberNode::Slot @contentDOM={{this.contentDOM}}/>
                          {{/unless}}
                        </this.component>`;
    this.node = pNode;
    this.contentDOM = !atom
      ? document.createElement(inline ? 'span' : 'div', {})
      : undefined;
    // Note `this.contentDOM` needs an attribute to prevent chromium-based browsers from deleting it when it is empty/only has empty children.
    if (this.contentDOM) {
      this.contentDOM.dataset['emberNodeContent'] = 'true';
    }
    const { node, component } = emberComponent(
      controller.owner,
      name,
      inline,
      this.template,
      {
        getPos,
        node: pNode,
        updateAttribute: (attr, value, ignoreHistory) => {
          const pos = getPos();
          if (pos !== undefined) {
            const transaction = view.state.tr;
            if (ignoreHistory) {
              transaction.setMeta('addToHistory', false);
            }
            transaction.setNodeAttribute(pos, attr, value);
            view.dispatch(transaction);
          }
        },
        selectNode: () => {
          const pos = getPos();
          if (pos !== undefined) {
            const tr = controller.activeEditorState.tr;
            tr.setSelection(
              NodeSelection.create(controller.activeEditorState.doc, pos),
            );
            controller.activeEditorView.dispatch(tr);
          }
        },
        controller,
        contentDOM: this.contentDOM,
        component: componentClass,
        atom,
        view,
        selected: false,
      },
    );
    this.dom = node;
    this.emberComponent = component;
  }

  update(
    node: PNode,
    _decorations: readonly Decoration[],
    innerDecorations: DecorationSource,
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
   * Based on https://github.com/ueberdosis/tiptap/blob/d61a621186470ce286e2cecf8206837a1eec7338/packages/core/src/NodeView.ts#LL99C6-L99C6
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
   * Taken from https://github.com/ueberdosis/tiptap/blob/d61a621186470ce286e2cecf8206837a1eec7338/packages/core/src/NodeView.ts#L195
   */
  ignoreMutation(
    mutation: MutationRecord | { type: 'selection'; target: Element },
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

interface AtomConfig {
  /** Is an atom if is not a leaf node */
  atom: true;
  /**
   * ProseMissor content expression
   * @see {@link https://prosemirror.net/docs/guide/#schema.content_expressions|ProseMirror schema guide}
   */
  content?: string;
}
interface NonAtomConfig {
  /** Is an atom if is not a leaf node */
  atom: false;
  /**
   * ProseMissor content expression
   * @see {@link https://prosemirror.net/docs/guide/#schema.content_expressions|ProseMirror schema guide}
   */
  content: string;
}

// Maybe this should be split so that a different one exists for each of the 2 functions which takes
// it as an argument
export type EmberNodeConfig = {
  name: string;
  /** ember component to render as a Node View */
  component: ComponentLike<{ Args: EmberNodeArgs }>;
  inline: boolean;
  /** ProseMirror 'group' property for the created node */
  group: string;
  draggable?: boolean;
  /** @see {@link https://prosemirror.net/docs/ref/#model.NodeSpec.defining} */
  defining?: boolean;
  /**
   * @deprecated
   */
  recreateUri?: boolean;
  /**
   * @deprecated
   */
  uriAttributes?: [string];
  /** Generate a new URI when pasting the node? */
  recreateUriFunction?: (attrs: Attrs) => Attrs;
  /** A map of attributes to assign to this node */
  attrs?: {
    [name: string]: AttributeSpec & {
      editable?: boolean;
      serialize?: (node: PNode) => string;
      parse?: (element: HTMLElement) => unknown;
    };
  };
  /** @see {@link https://prosemirror.net/docs/ref/#model.NodeSpec.parseDOM} */
  parseDOM?: readonly TagParseRule[];
  /** @see {@link https://prosemirror.net/docs/ref/#model.NodeSpec.toDOM} */
  toDOM?: (node: PNode) => DOMOutputSpec;
  /**
   * Allows creating a serialized version based on the node itself
   * @see {@link SayNodeSpec}
   */
  serialize?: NodeSerializer;
  /**
   * Prevents the editor view from handling events which are inside the ember-node but not inside it's editable content.
   * By default this will stop events which occur inside the ember-node but not inside it's content.
   * Only override if you know what you are doing.
   * @param event The event to check
   */
  stopEvent?: (event: Event) => boolean;
  /**
   * Determines whether a DOM mutation should be ignored by prosemirror.
   * Use this to avoid rerendering a component for every change.
   * DOM mutations occuring inside the ember-node which are not inside it's editable content are ignored.
   * Selections are always handled by prosemirror.
   * Already has a default implementation. Only override if you know what you are doing.
   * @param mutation
   * @returns whether to ignore the mutation
   */
  ignoreMutation?: (
    mutation: MutationRecord | { type: 'selection'; target: Element },
  ) => boolean;
  /** Do we need to workaround cursor problems on Firefox */
  needsFFKludge?: boolean;
  /** Do we need to workaround cursor problems on Chrome */
  needsChromeCursorFix?: boolean;
} & (AtomConfig | NonAtomConfig) & {
    /** This is so we can use custom node config specs */
    [key: string]: unknown;
  };

/**
 * Generate the {@link SayNodeSpec} for the {@link EmberNodeView} with the passed config
 */
export function createEmberNodeSpec(config: EmberNodeConfig): SayNodeSpec {
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
    recreateUriFunction,
    attrs,
    parseDOM,
    toDOM,
    serialize,
    ...passthrough
  } = config;
  return {
    inline,
    atom,
    group,
    content,
    recreateUri,
    uriAttributes,
    recreateUriFunction,
    attrs,
    draggable,
    defining,
    parseDOM: parseDOM ?? [
      {
        tag: inline ? 'span' : 'div',
        getAttrs(node: string | HTMLElement) {
          if (typeof node === 'string') {
            return false;
          }
          if (node.dataset['emberNode'] === name) {
            const result: Record<string, unknown> = {};
            if (attrs) {
              for (const [attributeName, attributeSpec] of Object.entries(
                attrs,
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
    serialize,
    ...passthrough,
  };
}

export type SayNodeViewConstructor = (
  node: PNode,
  view: SayView,
  getPos: () => number | undefined,
) => NodeView;
/**
 * Creates a constructor for EmberNodeViews according to the passed config
 * @see {@link EmberNodeView}
 */
export function createEmberNodeView(config: EmberNodeConfig) {
  return function (controller: SayController): SayNodeViewConstructor {
    return function (node, view: SayView, getPos) {
      return new EmberNodeView(controller, config, node, view, getPos);
    };
  };
}
