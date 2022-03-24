import HashSet from '@lblod/ember-rdfa-editor/model/util/hash-set';
import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { HtmlTag } from '@lblod/ember-rdfa-editor/model/util/types';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import { CORE_OWNER } from '@lblod/ember-rdfa-editor/model/util/constants';

export type TagMatch = keyof HTMLElementTagNameMap | '*';
export type AttributeSpec = { setBy?: string } & Record<string, Serializable>;

export interface MarkSpec<A extends AttributeSpec = AttributeSpec> {
  name: string;

  priority: number;

  matchers: DomNodeMatcher<A>[];

  renderSpec(mark: Renderable<A>): RenderSpec;
}

export class Mark<A extends AttributeSpec = AttributeSpec> {
  private readonly _spec: MarkSpec<A>;
  private readonly _attributes: A;
  private readonly _node: ModelText;

  constructor(spec: MarkSpec<A>, attributes: A, node: ModelText) {
    this._spec = spec;
    this._attributes = attributes;
    this._node = node;
  }

  get attributes(): A {
    return this._attributes;
  }

  get name(): string {
    return this._spec.name;
  }

  get node(): ModelText {
    return this._node;
  }

  get priority(): number {
    return this._spec.priority;
  }

  get spec(): MarkSpec {
    return this._spec;
  }

  write(block: Node): Node {
    const rendered = renderFromSpec(this._spec.renderSpec(this), block);
    if (isElement(rendered)) {
      rendered.dataset['__setBy'] = this.attributes.setBy || CORE_OWNER;
    }
    return rendered;
  }
}

export const highlightMarkSpec: MarkSpec = {
  matchers: [
    {
      tag: 'span',
      attributeBuilder: (node: Node) => {
        if (
          isElement(node) &&
          Object.prototype.hasOwnProperty.call(
            node.dataset,
            'editorHighlight'
          ) &&
          node.dataset.editorHighlight !== 'false'
        ) {
          return {};
        }
        return null;
      },
    },
  ],
  priority: 1000,
  name: 'highlighted',

  renderSpec(): RenderSpec {
    return [
      { tag: 'span', attributes: { 'data-editor-highlight': true } },
      [SLOT],
    ];
  },
};

export interface DomNodeMatcher<
  A extends Record<string, Serializable> | void = void
> {
  tag: TagMatch;
  attributeBuilder?: (node: Node) => A | null;
}

export interface Serializable {
  toString(): string;
}

export interface Renderable<A extends Record<string, Serializable> | void> {
  name: string;
  attributes: A;
}

export class MarkSet extends HashSet<Mark> {
  constructor(init?: Iterable<Mark>) {
    super({
      hashFunc: (mark: Mark) =>
        `${mark.name}-${mark.attributes.setBy || CORE_OWNER}`,
      init,
    });
  }

  hasMarkName(markName: string): boolean {
    for (const mark of this.items.values()) {
      if (mark.name === markName) {
        return true;
      }
    }
    return false;
  }

  clone(): this {
    return new MarkSet(this.values()) as this;
  }
}

export const SLOT: SLOT = 0;
type SLOT = 0;
type HtmlNodeSpec =
  | HtmlTag
  | { tag: HtmlTag; attributes: Record<string, Serializable> };
export type RenderSpec = [HtmlNodeSpec, RenderSpec[]] | SLOT;

function renderFromSpec(spec: RenderSpec, block: Node): Node {
  if (spec === SLOT) {
    return block;
  } else {
    const [nodeSpec, children] = spec;
    let result: HTMLElement;
    if (typeof nodeSpec === 'string') {
      result = document.createElement(nodeSpec);
    } else {
      result = document.createElement(nodeSpec.tag);
      for (const [key, val] of Object.entries(nodeSpec.attributes)) {
        if (val !== undefined) {
          result.setAttribute(key, val.toString());
        }
      }
    }

    for (const child of children) {
      if (child === SLOT) {
        result.appendChild(block);
      } else {
        result.appendChild(renderFromSpec(child, block));
      }
    }
    return result;
  }
}
