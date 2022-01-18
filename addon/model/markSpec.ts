import HashSet from '@lblod/ember-rdfa-editor/model/util/hash-set';
import Handlebars from 'handlebars';
import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';

export type TagMatch = keyof HTMLElementTagNameMap | '*';

export interface MarkSpec<
  A extends Record<string, unknown> = Record<string, unknown>
> {
  name: string;

  priority: number;

  matchers: DomNodeMatcher<A>[];

  write(render: Renderer, mark: Mark<A>): Renderable;
}

export class Mark<A extends Record<string, unknown> = Record<string, unknown>> {
  private readonly _spec: MarkSpec<A>;
  private readonly _attributes: A;

  constructor(spec: MarkSpec<A>, attributes: A) {
    this._spec = spec;
    this._attributes = attributes;
  }

  get attributes(): A {
    return this._attributes;
  }

  get name(): string {
    return this._spec.name;
  }

  get priority(): number {
    return this._spec.priority;
  }

  write(render: Renderer): Renderable {
    return this._spec.write(render, this);
  }
}

export const boldMarkSpec: MarkSpec = {
  matchers: [{ tag: 'b' }, { tag: 'strong' }],
  name: 'bold',
  priority: 100,

  write(render: Renderer): Renderable {
    //language=hbs
    return render('<strong>{{{children}}}</strong>');
  },
};

export const italicMarkSpec: MarkSpec = {
  matchers: [{ tag: 'em' }, { tag: 'i' }],
  priority: 200,
  name: 'italic',

  write(render: Renderer): Renderable {
    return render('<em>{{{children}}}</em>');
  },
};
export const underlineMarkSpec: MarkSpec = {
  matchers: [{ tag: 'u' }],
  priority: 300,
  name: 'underline',
  write(render: Renderer): Renderable {
    return render('<u>{{{children}}}</u>');
  },
};

export const strikethroughMarkSpec: MarkSpec = {
  matchers: [{ tag: 's' }],
  priority: 400,
  name: 'strikethrough',
  write(render: Renderer): Renderable {
    return render('<s>{{{children}}}</s>');
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

  write(render: Renderer): Renderable {
    return render('<span data-editor-highlight="true">{{{children}}}</span>');
  },
};

export const testMarkSpec: MarkSpec<{ color: string }> = {
  name: 'color',
  priority: 1100,
  matchers: [
    {
      tag: 'span',
      attributeBuilder: (node: Node) => {
        if (isElement(node) && node.style.background) {
          return { color: node.style.background };
        }
        return null;
      },
    },
  ],
  write(render: Renderer, mark: Mark<{ color: string }>): Renderable {
    return render(
      `<span style="background: ${mark.attributes.color}">{{{children}}}</span>`
    );
  },
};

export interface DomNodeMatcher<
  A extends Record<string, unknown> = Record<string, unknown>
> {
  tag: TagMatch;
  attributeBuilder?: (node: Node) => A | null;
}

export type Renderer = typeof Handlebars.compile;
export type Renderable = HandlebarsTemplateDelegate;

export class MarkSet extends HashSet<Mark> {
  constructor() {
    super({ hashFunc: (mark: Mark) => mark.name });
  }
}
