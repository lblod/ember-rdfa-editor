import { hbs, TemplateFactory } from 'ember-cli-htmlbars';
import HashSet from '@lblod/ember-rdfa-editor/model/util/hash-set';

export interface Mark {
  name: string;
}

export interface DomNodeMatcher {
  tag?: keyof HTMLElementTagNameMap;
  predicate?: (node: Node) => boolean;
}

export type Renderer = typeof hbs;
export type Renderable = TemplateFactory;

export interface MarkSpec {
  name: string;

  fromHtml(node: Node): DomNodeMatcher[];

  toHtml(mark: Mark): Renderable;
}

const BoldSpec: MarkSpec = {
  name: 'bold',

  fromHtml(): DomNodeMatcher[] {
    return [{ tag: 'strong' }, { tag: 'b' }];
  },

  toHtml(render: Renderer): Renderable {
    //language=hbs
    return render('<strong>{{yield}}</strong>');
  },
};

export class MarkSet extends HashSet<Mark> {
  constructor() {
    super({ hashFunc: (mark: Mark) => mark.name });
  }
}
