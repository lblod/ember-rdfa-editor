import type { ContentLiteralTerm } from '#root/core/say-data-factory/prosemirror-terms/content-literal.ts';
import type { LiteralNodeTerm } from '#root/core/say-data-factory/prosemirror-terms/literal-node.ts';
import type { ResourceNodeTerm } from '#root/core/say-data-factory/prosemirror-terms/resource-node.ts';
import type { SayTerm } from '#root/core/say-data-factory/term.ts';
import type { Promisable } from '#root/utils/_private/types.ts';
import type { Literal, NamedNode } from '@rdfjs/types';

export type TermOption<TermType extends SayTerm> = {
  label?: string;
  description?: string;
  term: TermType;
};

export type Direction = 'backlink' | 'property';
export type PredicateOption<D extends Direction = Direction> =
  TermOption<NamedNode> & {
    direction: D;
    allowFreeTextTarget?: D extends 'property' ? boolean : never;
  };

export type PredicateOptionGeneratorArgs<D extends Direction = Direction> = {
  selectedSource?: SayTerm;
  searchString?: string;
  direction?: D;
};

export type PredicateOptionGenerator<D extends Direction = Direction> = (
  args?: PredicateOptionGeneratorArgs<D>,
) => Promisable<PredicateOption<D>[]>;

export type TargetOptionGeneratorArgs = {
  selectedSource?: SayTerm;
  selectedPredicate?: SayTerm;
  searchString?: string;
};

type TargetOptionGenerator<TermType extends SayTerm> = (
  args?: TargetOptionGeneratorArgs,
) => Promisable<TermOption<TermType>[]>;

type SubjectOptionTermType = ResourceNodeTerm | NamedNode;

export type SubjectOption = TermOption<SubjectOptionTermType>;

export type SubjectOptionGenerator =
  TargetOptionGenerator<SubjectOptionTermType>;

type ObjectOptionTermType =
  | ResourceNodeTerm
  | LiteralNodeTerm
  | NamedNode
  | Literal
  | ContentLiteralTerm;

export type ObjectOption = TermOption<ObjectOptionTermType>;

export type ObjectOptionGenerator = TargetOptionGenerator<ObjectOptionTermType>;

export type OptionGeneratorConfig = {
  subjects?: SubjectOptionGenerator;
  predicates?: PredicateOptionGenerator;
  objects?: ObjectOptionGenerator;
};

export type SubmissionBody =
  | {
      target: SubjectOption;
      predicate: PredicateOption<'backlink'>;
    }
  | {
      target: ObjectOption;
      predicate: PredicateOption<'property'>;
    };
