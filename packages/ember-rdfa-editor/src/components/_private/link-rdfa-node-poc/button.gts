import AuButton, {
  type AuButtonSignature,
} from '@appuniversum/ember-appuniversum/components/au-button';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import { on } from '@ember/modifier/on';
import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import LinkRdfaNodeModal, {
  type PredicateOptionGenerator,
  type SubjectOptionGenerator,
  type SubmissionBody,
  type TermOption,
} from './modal.gts';
import { sayDataFactory } from '#root/core/say-data-factory/data-factory.ts';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import type SayController from '#root/core/say-controller.ts';
import { isRdfaAttrs } from '#root/core/rdfa-types.ts';
import { addBacklinkToNode } from '#root/utils/rdfa-utils.ts';
import type { IncomingTriple } from '#root/core/rdfa-processor.ts';
import type {
  ResourceNodeTerm,
  SayNamedNode,
} from '#root/core/say-data-factory/index.ts';

type LinkRdfaNodeButtonSig = {
  Element: AuButtonSignature['Element'];
  Args: {
    controller: SayController;
    node: ResolvedPNode;
  };
};
export default class LinkRdfaNodeButton extends Component<LinkRdfaNodeButtonSig> {
  @tracked modalOpen = false;

  get controller() {
    return this.args.controller;
  }

  get node() {
    return this.args.node;
  }

  openModal = () => {
    this.modalOpen = true;
  };

  onFormSubmit = (body: SubmissionBody) => {
    const backlink: IncomingTriple = {
      subject: body.subject,
      predicate: body.predicate.value,
    };
    this.controller.withTransaction(
      () => {
        return addBacklinkToNode({
          rdfaId: this.node.value.attrs['__rdfaId'] as string,
          backlink,
        })(this.controller.mainEditorState).transaction;
      },
      { view: this.controller.mainEditorView },
    );
    this.modalOpen = false;
  };

  onFormCancel = () => {
    this.modalOpen = false;
  };

  get selectedObject() {
    const node = this.args.node;
    if (!isRdfaAttrs(node.value.attrs)) {
      throw new Error(`Expected node with pos ${node.pos} to be rdfa-aware`);
    }
    if (node.value.attrs.rdfaNodeType === 'resource') {
      return sayDataFactory.resourceNode(node.value.attrs.subject);
    } else {
      return sayDataFactory.literalNode(node.value.attrs.__rdfaId);
    }
  }

  predicateOptionGenerator: PredicateOptionGenerator = ({
    searchString = '',
  } = {}) => {
    const options: TermOption<SayNamedNode>[] = [
      {
        label: 'Titel',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        term: sayDataFactory.namedNode('eli:title'),
      },
      {
        label: 'Beschrijving',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
        term: sayDataFactory.namedNode('dct:description'),
      },
      {
        label: 'Motivering',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
        term: sayDataFactory.namedNode('besluit:motivering'),
      },
    ];
    return options.filter(
      (option) =>
        option.label?.toLowerCase().includes(searchString.toLowerCase()) ||
        option.description
          ?.toLowerCase()
          .includes(searchString.toLowerCase()) ||
        option.term.value.toLowerCase().includes(searchString.toLowerCase()),
    );
  };

  subjectOptionGenerator: SubjectOptionGenerator = ({
    searchString = '',
  } = {}) => {
    const options: TermOption<ResourceNodeTerm>[] = [
      {
        label: '(Besluit) Kennisname van de definitieve verkiezingsuitslag',
        term: sayDataFactory.resourceNode('http://example.org/decisions/1'),
      },
      {
        label: 'Artikel 1',
        term: sayDataFactory.resourceNode('http://example.org/articles/1'),
      },
    ];
    return options.filter(
      (option) =>
        option.label?.toLowerCase().includes(searchString.toLowerCase()) ||
        option.description
          ?.toLowerCase()
          .includes(searchString.toLowerCase()) ||
        option.term.value.toLowerCase().includes(searchString.toLowerCase()),
    );
  };

  <template>
    <AuButton
      @icon={{AddIcon}}
      @iconAlignment="left"
      @skin="link"
      {{on "click" this.openModal}}
      ...attributes
    >
      Link node
    </AuButton>
    {{#if this.modalOpen}}
      <LinkRdfaNodeModal
        @selectedObject={{this.selectedObject}}
        @onSubmit={{this.onFormSubmit}}
        @onCancel={{this.onFormCancel}}
        @predicateOptionGenerator={{this.predicateOptionGenerator}}
        @subjectOptionGenerator={{this.subjectOptionGenerator}}
      />
    {{/if}}
  </template>
}
