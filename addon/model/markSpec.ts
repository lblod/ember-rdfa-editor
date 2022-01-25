import HashSet from '@lblod/ember-rdfa-editor/model/util/hash-set';
import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { HtmlTag } from '@lblod/ember-rdfa-editor/model/util/types';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';

export type TagMatch = keyof HTMLElementTagNameMap | '*';
export type AttributeSpec = Record<string, Serializable>;

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

  write(block: Node): Node {
    return renderFromSpec(this._spec.renderSpec(this), block);
  }
}

export const boldMarkSpec: MarkSpec = {
  matchers: [{ tag: 'b' }, { tag: 'strong' }],
  name: 'bold',
  priority: 100,
  renderSpec(): RenderSpec {
    return ['strong', [SLOT]];
  },
};

export const italicMarkSpec: MarkSpec = {
  matchers: [{ tag: 'em' }, { tag: 'i' }],
  priority: 200,
  name: 'italic',
  renderSpec(): RenderSpec {
    return ['em', [SLOT]];
  },
};
export const underlineMarkSpec: MarkSpec = {
  matchers: [{ tag: 'u' }],
  priority: 300,
  name: 'underline',
  renderSpec(): RenderSpec {
    return ['u', [SLOT]];
  },
};

export const strikethroughMarkSpec: MarkSpec = {
  matchers: [{ tag: 's' }, { tag: 'del' }],
  priority: 400,
  name: 'strikethrough',
  renderSpec(): RenderSpec {
    return ['del', [SLOT]];
  },
};
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
  constructor() {
    super({ hashFunc: (mark: Mark) => mark.name });
  }
}

const SLOT: SLOT = 0;
type SLOT = 0;
type HtmlNodeSpec =
  | HtmlTag
  | { tag: HtmlTag; attributes: Record<string, Serializable> };
type RenderSpec = [HtmlNodeSpec, RenderSpec[]] | SLOT;

function renderFromSpec(spec: RenderSpec, block: Node): Node {
  if (spec === SLOT) {
    return block;
  } else {
    const [nodeSpec, children] = spec;
    let result: Node;
    if (typeof nodeSpec === 'string') {
      result = document.createElement(nodeSpec);
    } else {
      result = document.createElement(nodeSpec.tag);
      for (const [key, val] of Object.entries(nodeSpec.attributes)) {
        (result as HTMLElement).setAttribute(key, val.toString());
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
