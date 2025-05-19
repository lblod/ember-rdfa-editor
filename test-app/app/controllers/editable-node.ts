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
import NodeControlsCard from '@lblod/ember-rdfa-editor/components/_private/node-controls/card';
import DocImportedResourceEditorCard from '@lblod/ember-rdfa-editor/components/_private/doc-imported-resource-editor/card';
import ImportedResourceLinkerCard from '@lblod/ember-rdfa-editor/components/_private/imported-resource-linker/card';
import ExternalTripleEditorCard from '@lblod/ember-rdfa-editor/components/_private/external-triple-editor/card';
import RelationshipEditorCard from '@lblod/ember-rdfa-editor/components/_private/relationship-editor/card';
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
import DevModeToggle from 'test-app/components/dev-mode-toggle';
import CreateRelationshipButton from '@lblod/ember-rdfa-editor/components/_private/relationship-editor/create-button';
import { documentConfig } from '@lblod/ember-rdfa-editor/components/_private/relationship-editor/configs';
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
  VisualiserCard = VisualiserCard;
  CreateRelationshipButton = CreateRelationshipButton;
  NodeControlsCard = NodeControlsCard;
  DocImportedResourceEditorCard = DocImportedResourceEditorCard;
  ImportedResourceLinkerCard = ImportedResourceLinkerCard;
  ExternalTripleEditorCard = ExternalTripleEditorCard;
  RelationshipEditorCard = RelationshipEditorCard;
  DevModeToggle = DevModeToggle;

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
  @tracked devMode = true;

  onDevModeToggle = (enabled: boolean) => {
    this.devMode = enabled;
  };

  @service declare intl: IntlService;
  schema = new Schema({
    nodes: {
      doc: docWithConfig({
        defaultLanguage: 'nl-BE',
        rdfaAware: true,
        hasResourceImports: true,
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

  get optionGeneratorConfig() {
    return this.rdfaEditor && documentConfig(this.rdfaEditor);
  }
}
