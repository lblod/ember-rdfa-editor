import HashSet from '@lblod/ember-rdfa-editor/model/util/hash-set';
import Handlebars from 'handlebars';

export type TagMatch = keyof HTMLElementTagNameMap | '*';

export interface Mark {
  name: string;

  priority: number;

  matchers: DomNodeMatcher[];

  write(render: Renderer): Renderable;
}

export class BoldMark implements Mark {
  matchers: DomNodeMatcher[] = [{ tag: 'b' }, { tag: 'strong' }];
  name = 'bold';
  priority = 100;

  write(render: Renderer): Renderable {
    //language=hbs
    return render('<strong>{{{children}}}</strong>');
  }
}

export class ItalicMark implements Mark {
  matchers: DomNodeMatcher[] = [{ tag: 'em' }, { tag: 'i' }];
  priority = 200;
  name = 'italic';

  write(render: Renderer): Renderable {
    return render('<em>{{{children}}}</em>');
  }
}

export interface DomNodeMatcher {
  tag: TagMatch;
  predicate?: (node: Node) => boolean;
}

export type Renderer = typeof Handlebars.compile;
export type Renderable = HandlebarsTemplateDelegate;

export class MarkSet extends HashSet<Mark> {
  constructor() {
    super({ hashFunc: (mark: Mark) => mark.name });
  }
}
