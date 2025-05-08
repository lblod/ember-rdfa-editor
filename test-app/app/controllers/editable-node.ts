import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { Schema } from '@lblod/ember-rdfa-editor';
import {
  em,
  strikethrough,
  strong,
  subscript,
  superscript,
  underline,
} from '@lblod/ember-rdfa-editor/plugins/text-style/index';
import {
  blockRdfaWithConfig,
  docWithConfig,
  hard_break,
  horizontal_rule,
  paragraph,
  repairedBlockWithConfig,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import { code } from '@lblod/ember-rdfa-editor/plugins/code/marks/code';
import {
  tableKeymap,
  tableNodes,
  tablePlugins,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { image, imageView } from '@lblod/ember-rdfa-editor/plugins/image';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import { headingWithConfig } from '@lblod/ember-rdfa-editor/plugins/heading';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import {
  bulletListWithConfig,
  listItemWithConfig,
  listTrackingPlugin,
  orderedListWithConfig,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import {
  link,
  linkPasteHandler,
  linkView,
} from '@lblod/ember-rdfa-editor/plugins/link';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import {
  createInvisiblesPlugin,
  hardBreak,
  heading as headingInvisible,
  paragraph as paragraphInvisible,
} from '@lblod/ember-rdfa-editor/plugins/invisibles';
import { highlight } from '@lblod/ember-rdfa-editor/plugins/highlight/marks/highlight';
import { color } from '@lblod/ember-rdfa-editor/plugins/color/marks/color';
import { lastKeyPressedPlugin } from '@lblod/ember-rdfa-editor/plugins/last-key-pressed';
import { firefoxCursorFix } from '@lblod/ember-rdfa-editor/plugins/firefox-cursor-fix';
import {
  bullet_list_input_rule,
  ordered_list_input_rule,
} from '@lblod/ember-rdfa-editor/plugins/list/input_rules';
import { inputRules, PNode, type PluginConfig } from '@lblod/ember-rdfa-editor';
import { chromeHacksPlugin } from '@lblod/ember-rdfa-editor/plugins/chrome-hacks-plugin';
import { emberApplication } from '@lblod/ember-rdfa-editor/plugins/ember-application';
import {
  editableNodePlugin,
  getActiveEditableNode,
} from '@lblod/ember-rdfa-editor/plugins/_private/editable-node';
import DebugInfo from '@lblod/ember-rdfa-editor/components/_private/debug-info';
import AttributeEditor from '@lblod/ember-rdfa-editor/components/_private/attribute-editor';
import RdfaEditor from '@lblod/ember-rdfa-editor/components/_private/rdfa-editor';
import LinkRdfaNodeButton from '@lblod/ember-rdfa-editor/components/_private/link-rdfa-node-poc/button';
import {
  inlineRdfaWithConfigView,
  inlineRdfaWithConfig,
} from '@lblod/ember-rdfa-editor/nodes/inline-rdfa';
import { BlockRDFaView } from '@lblod/ember-rdfa-editor/nodes/block-rdfa';
import { getOwner } from '@ember/owner';
import {
  isSome,
  optionMap,
  unwrap,
} from '@lblod/ember-rdfa-editor/utils/_private/option';

import type {
  PredicateOptionGenerator,
  TargetOptionGenerator,
  TermOption,
  PredicateOption,
} from '@lblod/ember-rdfa-editor/components/_private/link-rdfa-node-poc/modal';
import {
  ResourceNodeTerm,
  sayDataFactory,
} from '@lblod/ember-rdfa-editor/core/say-data-factory';
import VisualiserCard from '@lblod/ember-rdfa-editor/components/_private/rdfa-visualiser/visualiser-card';
import type { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import {
  getNodeByRdfaId,
  type DisplayGenerator,
  type RdfaVisualizerConfig,
} from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import {
  getOutgoingTriple,
  namespace,
} from '@lblod/ember-rdfa-editor/utils/namespace';

const humanReadablePredicateDisplay: DisplayGenerator<OutgoingTriple> = (
  triple,
) => {
  return {
    meta: { title: triple.predicate },
    elements: [
      { strong: 'predicate:' },
      triple.predicate.split(/[/#]/).at(-1) ?? triple.predicate,
    ],
  };
};

const ELI = namespace('http://data.europa.eu/eli/ontology#', 'eli');
const RDF = namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'rdf');

const humanReadableResourceName: DisplayGenerator<PNode> = (
  node,
  { controller },
) => {
  const subject = node.attrs['subject'] as string;
  const type = optionMap(
    (triple) => triple.object?.value,
    getOutgoingTriple(node.attrs, RDF('type')),
  );
  if (isSome(type)) {
    if (type === 'http://data.vlaanderen.be/ns/besluit#Besluit') {
      const title = optionMap(
        (triple) => triple.object?.value,
        getOutgoingTriple(node.attrs, ELI('title')),
      );
      const titleNode = title
        ? getNodeByRdfaId(controller.mainEditorState, title)
        : undefined;
      return [
        { pill: 'Besluit' },
        titleNode?.value.textContent ?? title ?? subject,
      ];
    } else {
      return [{ strong: `${type.split(/[/#]/).at(-1)}:` }, subject];
    }
  }
  return [subject];
};

export default class EditableBlockController extends Controller {
  DebugInfo = DebugInfo;
  AttributeEditor = AttributeEditor;
  RdfaEditor = RdfaEditor;
  VisualiserCard = VisualiserCard;
  LinkRdfaNodeButton = LinkRdfaNodeButton;

  rdfa = {
    propertyPredicates: [
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
      'http://www.w3.org/ns/prov#value',
    ],
    propertyObjects: [
      'http://data.vlaanderen.be/ns/besluit#BehandelingVanAgendapunt',
      'http://data.vlaanderen.be/ns/besluit#Agendapunt',
    ],
    backlinkPredicates: ['http://www.w3.org/ns/prov#wasGeneratedBy'],
    visualizerConfig: {
      displayConfig: {
        predicate: humanReadablePredicateDisplay,
        ResourceNode: humanReadableResourceName,
      },
    } as RdfaVisualizerConfig,
  };

  @tracked rdfaEditor?: SayController;
  @service declare intl: IntlService;
  schema = new Schema({
    nodes: {
      doc: docWithConfig({
        defaultLanguage: 'nl-BE',
        rdfaAware: true,
      }),
      paragraph,

      repaired_block: repairedBlockWithConfig({ rdfaAware: true }),

      list_item: listItemWithConfig({
        enableHierarchicalList: true,
      }),
      ordered_list: orderedListWithConfig({
        enableHierarchicalList: true,
      }),
      bullet_list: bulletListWithConfig({
        enableHierarchicalList: true,
      }),
      placeholder,
      ...tableNodes({
        tableGroup: 'block',
        cellContent: 'block+',
        inlineBorderStyle: { width: '0.5px', color: '#CCD1D9' },
      }),
      heading: headingWithConfig({ rdfaAware: false }),
      blockquote,

      horizontal_rule,
      code_block,

      text,

      image,

      hard_break,
      block_rdfa: blockRdfaWithConfig({ rdfaAware: true }),
      inline_rdfa: inlineRdfaWithConfig({ rdfaAware: true }),
      link: link(this.linkOptions),
    },
    marks: {
      code,
      em,
      strong,
      underline,
      strikethrough,
      subscript,
      superscript,
      highlight,
      color,
    },
  });

  get linkOptions() {
    return {
      interactive: true,
      rdfaAware: true,
    };
  }

  @tracked plugins: PluginConfig = [
    listTrackingPlugin(),
    firefoxCursorFix(),
    chromeHacksPlugin(),
    lastKeyPressedPlugin,
    ...tablePlugins,
    tableKeymap,
    linkPasteHandler(this.schema.nodes.link),
    createInvisiblesPlugin([hardBreak, paragraphInvisible, headingInvisible], {
      shouldShowInvisibles: false,
    }),
    inputRules({
      rules: [
        bullet_list_input_rule(this.schema.nodes.bullet_list),
        ordered_list_input_rule(this.schema.nodes.ordered_list),
      ],
    }),
    emberApplication({ application: unwrap(getOwner(this)) }),
    editableNodePlugin(),
  ];

  @tracked nodeViews = (controller: SayController) => {
    return {
      link: linkView(this.linkOptions)(controller),
      image: imageView(controller),
      inline_rdfa: inlineRdfaWithConfigView({ rdfaAware: true })(controller),
      block_rdfa: (node: PNode) => new BlockRDFaView(node),
    };
  };

  get activeNode() {
    if (this.rdfaEditor) {
      const result = getActiveEditableNode(this.rdfaEditor.activeEditorState);
      return result;
    }
    return;
  }

  @action
  rdfaEditorInit(rdfaEditor: SayController) {
    const presetContent = localStorage.getItem('EDITOR_CONTENT') ?? '';
    this.rdfaEditor = rdfaEditor;
    this.rdfaEditor.initialize(presetContent);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }

  @action
  togglePlugin() {
    console.warn('Live toggling plugins is currently not supported');
  }

  predicateOptionGenerator: PredicateOptionGenerator = ({
    searchString = '',
  } = {}) => {
    const options: PredicateOption[] = [
      {
        label: 'Titel',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        term: sayDataFactory.namedNode('eli:title'),
        direction: 'backlink',
      },
      {
        label: 'Has Titel',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        term: sayDataFactory.namedNode('eli:title'),
        direction: 'property',
      },
      {
        label: 'Beschrijving',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
        term: sayDataFactory.namedNode('dct:description'),
        direction: 'backlink',
      },
      {
        label: 'Motivering',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
        term: sayDataFactory.namedNode('besluit:motivering'),
        direction: 'backlink',
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

  subjectOptionGenerator: TargetOptionGenerator = ({
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
  objectOptionGenerator: TargetOptionGenerator = ({
    searchString = '',
  } = {}) => {
    const options: TermOption<ResourceNodeTerm>[] = [
      {
        label: 'Target 1',
        term: sayDataFactory.resourceNode('http://example.org/decisions/1'),
      },
      {
        label: 'Target 2',
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
}
