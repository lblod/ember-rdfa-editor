import Component from '@glimmer/component';
import { hash } from '@ember/helper';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import applyDevTools from 'prosemirror-dev-tools';
import { restartableTask, timeout } from 'ember-concurrency';
import t from 'ember-intl/helpers/t';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { getOwner } from '@ember/owner';

import { Schema, type NodeViewConstructor } from '@lblod/ember-rdfa-editor';
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
  orderedListWithConfig,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import {
  link,
  linkPasteHandler,
  linkView,
} from '@lblod/ember-rdfa-editor/plugins/link';
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
import {
  isSome,
  optionMap,
  unwrap,
} from '@lblod/ember-rdfa-editor/utils/option';
import VisualiserCard from '@lblod/ember-rdfa-editor/components/_private/rdfa-visualiser/visualiser-card';
import type { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import {
  getNodeByRdfaId,
  rdfaInfoPlugin,
  type DisplayGenerator,
  type RdfaVisualizerConfig,
} from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import {
  getOutgoingTriple,
  namespace,
} from '@lblod/ember-rdfa-editor/utils/namespace';
import CreateRelationshipButton from '@lblod/ember-rdfa-editor/components/_private/relationship-editor/create-button';
import LinkPointerButton from '@lblod/ember-rdfa-editor/components/_private/relationship-editor/link-pointer-button';
import {
  combineConfigs,
  documentConfig,
  lovConfig,
} from '@lblod/ember-rdfa-editor/components/_private/relationship-editor/configs';
import type {
  OptionGeneratorConfig,
  PredicateOptionGeneratorArgs,
  TargetOptionGeneratorArgs,
} from '@lblod/ember-rdfa-editor/components/_private/relationship-editor/types';
import EditorContainer from '@lblod/ember-rdfa-editor/components/editor-container';
import Sidebar from '@lblod/ember-rdfa-editor/components/sidebar';
import Editor from '@lblod/ember-rdfa-editor/components/editor';
import DebugTools from '@lblod/ember-rdfa-editor/components/debug-tools';
import LinkSidebarWidget from '@lblod/ember-rdfa-editor/components/plugins/link/link-sidebar-widget';
import { link_input_rule } from '@lblod/ember-rdfa-editor/plugins/link/input-rule';
import { EditorState, ProseParser } from '@lblod/ember-rdfa-editor';
import { htmlToDoc } from '@lblod/ember-rdfa-editor/utils/_private/html-utils';
import type { TransactionCombinatorResult } from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import SaySerializer from '@lblod/ember-rdfa-editor/core/say-serializer';
import { removePropertiesOfDeletedNodes } from '@lblod/ember-rdfa-editor/plugins/remove-properties-of-deleted-nodes';
import { defaultAttributeValueGeneration } from '@lblod/ember-rdfa-editor/plugins/default-attribute-value-generation';
import { onChangedPlugin } from '@lblod/ember-rdfa-editor/plugins/on-changed/plugin';
import { v4 as uuidv4 } from 'uuid';

import {
  number,
  text_variable,
  location,
  textVariableView,
  numberView,
  locationView,
  personVariableView,
  person_variable,
  autofilled_variable,
  autofilledVariableView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables';
import {
  date,
  dateView,
  type DateOptions,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables/date';
import {
  type LocationPluginConfig,
  osloLocation,
  osloLocationView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/node';
import {
  codelist,
  codelist_option,
  codelistView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables/codelist';
import {
  legacy_codelist,
  legacyCodelistView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables/legacy-codelist';
import { BESLUIT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  structureWithConfig,
  structureViewWithConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/node';
import type { StructurePluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/structure-types';
import RoadsignRegulationCard from '@lblod/say-roadsign-regulation-plugin/components/roadsign-regulation-card';
import { roadsign_regulation } from '@lblod/say-roadsign-regulation-plugin/plugin/nodes';
import type { RoadsignRegulationPluginOptions } from '@lblod/say-roadsign-regulation-plugin/plugin/types';
import type { Variable } from '@lblod/say-roadsign-regulation-plugin/plugin/schemas/variable';
import ArDesignSidebarWidget from '@lblod/say-ar-design-plugin/components/sidebar-widget';

import SampleToolbarResponsive from 'test-app/components/sample-toolbar-responsive';
import DevModeToggle from 'test-app/components/dev-mode-toggle';
import DummyContainer from 'test-app/components/dummy-container';
import type { DesignInfo } from '@lblod/say-ar-design-plugin/plugin/types';
import { emptyBlockPlaceholder } from '@lblod/ember-rdfa-editor/plugins/empty-block-placeholder';

const humanReadablePredicateDisplay: DisplayGenerator<OutgoingTriple> = (
  triple,
) => {
  // if (RDF('type').matches(triple.predicate)) {
  //   return [{ hidden: true }];
  // }
  return {
    meta: { title: triple.predicate },
    elements: [
      { strong: 'predicate:' },
      triple.predicate.split(/[/#]/).at(-1) ?? triple.predicate,
    ],
  };
};

const humanReadableNamedNodeDisplay: DisplayGenerator<OutgoingTriple> = (
  triple,
) => {
  return {
    meta: { title: triple.object.value },
    elements: [{ strong: 'object:' }, triple.object.value],
  };
};

const ELI = namespace('http://data.europa.eu/eli/ontology#', 'eli');
const RDF = namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'rdf');

const humanReadableResourceName: DisplayGenerator<PNode> = (
  node,
  { controller, isTopLevel },
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
    } else if (
      type === 'http://mu.semte.ch/vocabularies/ext/Snippet' &&
      isTopLevel
    ) {
      return [{ hidden: true }];
    } else {
      return [{ strong: `${type.split(/[/#]/).at(-1)}:` }, subject];
    }
  }
  return [subject];
};

export default class LblodPluginsTemplate extends Component {
  pluginConfig = {
    roadsignRegulation: {
      endpoint: 'https://dev.roadsigns.lblod.info/sparql',
      imageBaseUrl: 'https://dev.roadsigns.lblod.info/',
    } satisfies RoadsignRegulationPluginOptions,
    date: {
      formats: [
        {
          key: 'short',
          dateFormat: 'dd/MM/yy',
          dateTimeFormat: 'dd/MM/yy HH:mm',
        },
        {
          key: 'long',
          dateFormat: 'EEEE dd MMMM yyyy',
          dateTimeFormat: 'PPPPp',
        },
      ],
      allowCustomFormat: true,
    } satisfies DateOptions,
    location: {
      defaultPointUriRoot:
        'https://publicatie.gelinkt-notuleren.vlaanderen.be/id/geometrie/',
      defaultPlaceUriRoot:
        'https://publicatie.gelinkt-notuleren.vlaanderen.be/id/plaats/',
      defaultAddressUriRoot:
        'https://publicatie.gelinkt-notuleren.vlaanderen.be/id/adres/',
      subjectTypesToLinkTo: [BESLUIT('Artikel'), BESLUIT('Besluit')],
      explicitSubjectToLinkTo: 'http://example.org/foo-decision',
    } satisfies LocationPluginConfig,
    structure: {
      fullLengthArticles: false,
      onlyArticleSpecialName: true,
    } satisfies StructurePluginOptions,
    arDesign: {
      decision: {
        decisionUri: 'decisionUri',
        decisionType:
          'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/fc1036e7-703b-4290-b732-49abb39d0588',
      },
    },
  };

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
        NamedNode: humanReadableNamedNodeDisplay,
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
      structure: structureWithConfig(this.pluginConfig.structure),

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
      heading: headingWithConfig({ rdfaAware: true }),
      blockquote,

      date: date(this.pluginConfig.date),
      text_variable,
      person_variable,
      autofilled_variable,
      number,
      location,
      legacy_codelist,
      codelist,
      codelist_option,
      oslo_location: osloLocation(this.pluginConfig.location),
      roadsign_regulation,

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
        link_input_rule({ nodeType: this.schema.nodes.link }),
      ],
    }),
    emberApplication({ application: unwrap(getOwner(this)) }),
    editableNodePlugin(),
    emptyBlockPlaceholder(),
  ];

  @tracked nodeViews = (controller: SayController) => {
    return {
      link: linkView(this.linkOptions)(controller),
      image: imageView(controller),
      inline_rdfa: inlineRdfaWithConfigView({ rdfaAware: true })(controller),
      block_rdfa: (...args: Parameters<NodeViewConstructor>) =>
        new BlockRDFaView(args, controller),
      text_variable: textVariableView(controller),
      person_variable: personVariableView(controller),
      number: numberView(controller),
      codelist: codelistView(controller),
      legacy_codelist: legacyCodelistView(controller),
      location: locationView(controller),
      date: dateView(this.pluginConfig.date)(controller),
      oslo_location: osloLocationView(this.pluginConfig.location)(controller),
      structure: structureViewWithConfig(this.pluginConfig.structure)(
        controller,
      ),
      autofilled_variable: autofilledVariableView(controller),
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
    applyDevTools(rdfaEditor.mainEditorView);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }

  @action
  togglePlugin() {
    console.warn('Live toggling plugins is currently not supported');
  }

  get optionGeneratorConfig() {
    if (this.rdfaEditor) {
      return combineConfigs(documentConfig(this.rdfaEditor), lovConfig());
    }
  }

  subjectOptionGeneratorTask = restartableTask(
    async (args?: TargetOptionGeneratorArgs) => {
      await timeout(200);
      const result = (await this.optionGeneratorConfig?.subjects?.(args)) ?? [];
      return result;
    },
  );
  predicateOptionGeneratorTask = restartableTask(
    async (args?: PredicateOptionGeneratorArgs) => {
      await timeout(200);
      const result =
        (await this.optionGeneratorConfig?.predicates?.(args)) ?? [];
      return result;
    },
  );
  objectOptionGeneratorTask = restartableTask(
    async (args?: TargetOptionGeneratorArgs) => {
      await timeout(200);
      const result = (await this.optionGeneratorConfig?.objects?.(args)) ?? [];
      return result;
    },
  );
  pointerSourcesOptionGeneratorTask = restartableTask(
    async (args?: TargetOptionGeneratorArgs) => {
      await timeout(200);
      const result =
        (await this.optionGeneratorConfig?.pointerSources?.(args)) ?? [];
      return result;
    },
  );
  pointerTargetsOptionGeneratorTask = restartableTask(
    async (args?: TargetOptionGeneratorArgs) => {
      await timeout(200);
      const result =
        (await this.optionGeneratorConfig?.pointerTargets?.(args)) ?? [];
      return result;
    },
  );

  optionGeneratorConfigTaskified: OptionGeneratorConfig = {
    subjects: this.subjectOptionGeneratorTask.perform.bind(this),
    predicates: this.predicateOptionGeneratorTask.perform.bind(this),
    objects: this.objectOptionGeneratorTask.perform.bind(this),
    pointerSources: this.pointerSourcesOptionGeneratorTask.perform.bind(this),
    pointerTargets: this.pointerTargetsOptionGeneratorTask.perform.bind(this),
  };

  arDesignTest = (): Promise<DesignInfo> =>
    Promise.resolve({
      designs: [
        {
          id: 'test-ar-design',
          uri: 'https://data.vlaanderen.be/ns/mobiliteit#aanvullendreglementontwerp/test-ar-design',
          name: 'Test AR design',
          date: new Date(),
          measureDesigns: Promise.resolve([
            {
              id: 'test-measure-design',
              uri: 'https://data.vlaanderen.be/ns/mobiliteit#maatregelontwerp/test-measure-design',
              trafficSignals: [
                {
                  id: 'test-traffic-signal-e9a',
                  position: 0,
                  uri: 'https://data.vlaanderen.be/ns/mobiliteit#ontwerpverkeersteken/test-traffic-signal-e9a',
                  designStatus:
                    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/fc1036e7-703b-4290-b732-49abb39d0588',
                  trafficSignalConcept: {
                    id: '0b8edba107bc181f01ea9fcf241c76f6befff04e15a697acf1c6cdeb49e71868',
                    uri: 'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/0b8edba107bc181f01ea9fcf241c76f6befff04e15a697acf1c6cdeb49e71868',
                    code: 'E9a',
                    meaning: 'Parkeren toegestaan.',
                    image:
                      'https://dev.roadsigns.lblod.info/files/5c98fafe-4f1e-421a-bf77-0e8570ff3ab2/download',
                    type: 'https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept',
                    categories: [
                      {
                        id: '29ea3335e357e414d07229242607b352941c0c21e78760600cc0f5270f18c38b',
                        uri: 'http://data.vlaanderen.be/id/concept/Verkeersbordcategorie/29ea3335e357e414d07229242607b352941c0c21e78760600cc0f5270f18c38b',
                        label: 'StilstaanParkeerBord',
                      },
                    ],
                    instructions: [
                      {
                        id: '4a8189f4-f70a-46b6-bc84-2e7cf95a8a03',
                        uri: 'http://data.lblod.info/templates/4a8189f4-f70a-46b6-bc84-2e7cf95a8a03',
                        value: 'het parkeren is toegelaten',
                        preview: 'het parkeren is toegelaten',
                      },
                    ],
                    mainSigns: [],
                  },
                },
                {
                  id: 'test-traffic-signal-gviid',
                  position: 1,
                  uri: 'https://data.vlaanderen.be/ns/mobiliteit#ontwerpverkeersteken/test-traffic-signal-gviid',
                  designStatus:
                    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/467e89ae-0cfc-4a91-b29f-82c3cfc2bc6a',
                  trafficSignalConcept: {
                    id: '84567323c818fdb559cc3df4dbc141d3e24efcf6f528473c5c0ec20e180e56e2',
                    uri: 'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/84567323c818fdb559cc3df4dbc141d3e24efcf6f528473c5c0ec20e180e56e2',
                    code: 'GVIId',
                    meaning:
                      'Beperkt de maatregel tot bepaalde categorieën van voertuigen.',
                    image:
                      'https://dev.roadsigns.lblod.info/files/fa6b6163-5ad6-4e50-87e9-bbbdebbbedb5/download',
                    type: 'https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept',
                    categories: [
                      {
                        id: '991b04b477b77bc7cf1414fb5d255cc4435dd9c1681e8de66f770710c1c83ad0',
                        uri: 'http://data.vlaanderen.be/id/concept/Verkeersbordcategorie/991b04b477b77bc7cf1414fb5d255cc4435dd9c1681e8de66f770710c1c83ad0',
                        label: 'Onderbord',
                      },
                    ],
                    instructions: [
                      {
                        id: '65C258C0F87130BD276778A8',
                        uri: 'http://data.lblod.info/templates/65C258C0F87130BD276778A8',
                        value:
                          'de plaats is voorbehouden voor het laden en lossen van goederen; de plaats is voorbehouden tijdens volgende periode: ${tijdsvenster}',
                        preview:
                          'de plaats is voorbehouden voor het laden en lossen van goederen; de plaats is voorbehouden tijdens volgende periode: ${tijdsvenster}',
                      },
                      {
                        id: 'a32403ae-c6ad-4d7e-8738-7045ead2f6a8',
                        uri: 'http://data.lblod.info/templates/a32403ae-c6ad-4d7e-8738-7045ead2f6a8',
                        value: 'het parkeren is betalend',
                        preview: 'het parkeren is betalend',
                      },
                      {
                        id: 'dc1d89f0-4b05-44eb-b89a-8de9523e9d9f',
                        uri: 'http://data.lblod.info/templates/dc1d89f0-4b05-44eb-b89a-8de9523e9d9f',
                        value:
                          'het parkeren is voorbehouden voor ${categorie_voertuig}; \nhet parkeren is voorbehouden tijdens volgende periode: ${tijdsvenster}',
                        preview:
                          'het parkeren is voorbehouden voor ${categorie_voertuig}; \nhet parkeren is voorbehouden tijdens volgende periode: ${tijdsvenster}',
                      },
                      {
                        id: '86d2400d-85f2-45e5-b4c3-70191e2929ab',
                        uri: 'http://data.lblod.info/templates/86d2400d-85f2-45e5-b4c3-70191e2929ab',
                        value:
                          'het parkeren is voorbehouden voor ${categorie_voertuig}',
                        preview:
                          'het parkeren is voorbehouden voor ${categorie_voertuig}',
                      },
                      {
                        id: '6abf69b7-fd07-4d2b-beea-b91fb3e4e3d6',
                        uri: 'http://data.lblod.info/templates/6abf69b7-fd07-4d2b-beea-b91fb3e4e3d6',
                        value: 'het verbod geldt voor ${categorie_voertuig}',
                        preview: 'het verbod geldt voor ${categorie_voertuig}',
                      },
                      {
                        id: '61AE3ADFBF5C75000900005C',
                        uri: 'http://data.lblod.info/templates/61AE3ADFBF5C75000900005C',
                        value:
                          'het parkeren is betalend; \nhet betalend parkeren geldt niet voor personen in het bezit van een ${type_parkeerkaart}',
                        preview:
                          'het parkeren is betalend; \nhet betalend parkeren geldt niet voor personen in het bezit van een ${type_parkeerkaart}',
                      },
                      {
                        id: '65C241F3F87130BD27677883',
                        uri: 'http://data.lblod.info/templates/65C241F3F87130BD27677883',
                        value:
                          'de plaats is voorbehouden voor het laden en lossen van goederen',
                        preview:
                          'de plaats is voorbehouden voor het laden en lossen van goederen',
                      },
                      {
                        id: 'a33dcf31-db5a-4acf-b8e3-77d8acef914c',
                        uri: 'http://data.lblod.info/templates/a33dcf31-db5a-4acf-b8e3-77d8acef914c',
                        value:
                          'het parkeren is betalend; de parkeerreglementering is beperkt in de tijd ${maximumduur_betalend_parkeren}',
                        preview:
                          'het parkeren is betalend; de parkeerreglementering is beperkt in de tijd ${maximumduur_betalend_parkeren}',
                      },
                    ],
                    mainSigns: [
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/0b8edba107bc181f01ea9fcf241c76f6befff04e15a697acf1c6cdeb49e71868',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/137112aad6b994f965bfd6ceb7e88bf0162db8ac885e57439ef8cbee363fe579',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/4666c7f416e910d3b442c51c1c32bbe3ce9ad324c2f07badfad9610431bf1484',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/47c9ffa15a0316eb8144e48eed44bef295c2ea742b37ab6675268611cbbb5b64',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/4a2ec210cf9459059de87c11a70b40d957edeb78f302963e1a526a47406d11ec',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/5446d50a99626e166d9c93fa1a1be0a5be5cb038388d837a5efdc316a441c5c0',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/9a99ae7486d2f485d6540fb82b5c12d732788b46dcc66a2a5fcd0966929c6a43',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/b667a243b8ec32abc8cae6ff5cdff6dafb667cf1ddec6ff015824b451895d4d2',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/bd68717b59b32f5cfc66e459f72f7fef6ff8bc33d9276dcc2ca7c8ca7e860371',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/c013a71f9cd0f6084cd5beac514f11edb27aeb99cb9ed375150567c71db3b061',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/f74b9e8e4ddd1760f32d54063f96a3964846464bed031a942863f59f5187a268',
                    ],
                  },
                },
                {
                  id: 'test-traffic-signal-gxa',
                  position: 2,
                  uri: 'https://data.vlaanderen.be/ns/mobiliteit#ontwerpverkeersteken/test-traffic-signal-gxa',
                  designStatus:
                    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/467e89ae-0cfc-4a91-b29f-82c3cfc2bc6a',
                  trafficSignalConcept: {
                    id: '44354ebf53e7112f55f992b3290d810f5291438b536af1f3ca8e5c630e25c75d',
                    uri: 'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/44354ebf53e7112f55f992b3290d810f5291438b536af1f3ca8e5c630e25c75d',
                    code: 'GXa',
                    meaning: 'Begin van de reglementering.',
                    image:
                      'https://dev.roadsigns.lblod.info/files/be5c04ca-ac23-4d8a-8180-24790ae817d2/download',
                    type: 'https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept',
                    categories: [
                      {
                        id: '991b04b477b77bc7cf1414fb5d255cc4435dd9c1681e8de66f770710c1c83ad0',
                        uri: 'http://data.vlaanderen.be/id/concept/Verkeersbordcategorie/991b04b477b77bc7cf1414fb5d255cc4435dd9c1681e8de66f770710c1c83ad0',
                        label: 'Onderbord',
                      },
                    ],
                    instructions: [
                      {
                        id: '61ADE792BF5C750009000021',
                        uri: 'http://data.lblod.info/templates/61ADE792BF5C750009000021',
                        value:
                          'het begin van de parkeerreglementering wordt aangeduid',
                        preview:
                          'het begin van de parkeerreglementering wordt aangeduid',
                      },
                    ],
                    mainSigns: [
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/0b8edba107bc181f01ea9fcf241c76f6befff04e15a697acf1c6cdeb49e71868',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/137112aad6b994f965bfd6ceb7e88bf0162db8ac885e57439ef8cbee363fe579',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/4666c7f416e910d3b442c51c1c32bbe3ce9ad324c2f07badfad9610431bf1484',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/47c9ffa15a0316eb8144e48eed44bef295c2ea742b37ab6675268611cbbb5b64',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/4a2ec210cf9459059de87c11a70b40d957edeb78f302963e1a526a47406d11ec',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/4f857c0f9709924a47488596aee4387e2729c35b5dd512c5492a9b78715bd326',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/5446d50a99626e166d9c93fa1a1be0a5be5cb038388d837a5efdc316a441c5c0',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/9a99ae7486d2f485d6540fb82b5c12d732788b46dcc66a2a5fcd0966929c6a43',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/b5e9f13d81ac78f0002aac342f4eb866394598088cfe0276013b928afd1560f8',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/b667a243b8ec32abc8cae6ff5cdff6dafb667cf1ddec6ff015824b451895d4d2',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/bd68717b59b32f5cfc66e459f72f7fef6ff8bc33d9276dcc2ca7c8ca7e860371',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/c013a71f9cd0f6084cd5beac514f11edb27aeb99cb9ed375150567c71db3b061',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/f74b9e8e4ddd1760f32d54063f96a3964846464bed031a942863f59f5187a268',
                    ],
                  },
                },
                {
                  id: 'test-traffic-signal-gxd',
                  position: 3,
                  uri: 'https://data.vlaanderen.be/ns/mobiliteit#ontwerpverkeersteken/test-traffic-signal-gxd',
                  designStatus:
                    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/467e89ae-0cfc-4a91-b29f-82c3cfc2bc6a',
                  trafficSignalConcept: {
                    id: 'd6994e5d8b2cfedffaad046aa1a0701e892b2f4feb901fadbf7814f678ae5663',
                    uri: 'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/d6994e5d8b2cfedffaad046aa1a0701e892b2f4feb901fadbf7814f678ae5663',
                    code: 'GXd',
                    meaning:
                      'In verkeerscode gelabeld als "FLE-D". Dubbele pijl bij verkeersborden betreffende het stilstaan en parkeren.',
                    image:
                      'https://dev.roadsigns.lblod.info/files/bd64a496-8dc5-4b68-bb8a-00f67ca89553/download',
                    type: 'https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept',
                    categories: [
                      {
                        id: '991b04b477b77bc7cf1414fb5d255cc4435dd9c1681e8de66f770710c1c83ad0',
                        uri: 'http://data.vlaanderen.be/id/concept/Verkeersbordcategorie/991b04b477b77bc7cf1414fb5d255cc4435dd9c1681e8de66f770710c1c83ad0',
                        label: 'Onderbord',
                      },
                    ],
                    instructions: [
                      {
                        id: '61ADEC0BBF5C750009000025',
                        uri: 'http://data.lblod.info/templates/61ADEC0BBF5C750009000025',
                        value:
                          'de parkeerreglementering geldt over een afstand van meer dan 300 meter',
                        preview:
                          'de parkeerreglementering geldt over een afstand van meer dan 300 meter',
                      },
                    ],
                    mainSigns: [
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/0b8edba107bc181f01ea9fcf241c76f6befff04e15a697acf1c6cdeb49e71868',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/137112aad6b994f965bfd6ceb7e88bf0162db8ac885e57439ef8cbee363fe579',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/4666c7f416e910d3b442c51c1c32bbe3ce9ad324c2f07badfad9610431bf1484',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/47c9ffa15a0316eb8144e48eed44bef295c2ea742b37ab6675268611cbbb5b64',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/4a2ec210cf9459059de87c11a70b40d957edeb78f302963e1a526a47406d11ec',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/4f857c0f9709924a47488596aee4387e2729c35b5dd512c5492a9b78715bd326',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/5446d50a99626e166d9c93fa1a1be0a5be5cb038388d837a5efdc316a441c5c0',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/9a99ae7486d2f485d6540fb82b5c12d732788b46dcc66a2a5fcd0966929c6a43',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/b5e9f13d81ac78f0002aac342f4eb866394598088cfe0276013b928afd1560f8',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/b667a243b8ec32abc8cae6ff5cdff6dafb667cf1ddec6ff015824b451895d4d2',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/bd68717b59b32f5cfc66e459f72f7fef6ff8bc33d9276dcc2ca7c8ca7e860371',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/c013a71f9cd0f6084cd5beac514f11edb27aeb99cb9ed375150567c71db3b061',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/f74b9e8e4ddd1760f32d54063f96a3964846464bed031a942863f59f5187a268',
                    ],
                  },
                },
                {
                  id: 'test-traffic-signal-gxb',
                  position: 4,
                  uri: 'https://data.vlaanderen.be/ns/mobiliteit#ontwerpverkeersteken/test-traffic-signal-gxb',
                  designStatus:
                    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/467e89ae-0cfc-4a91-b29f-82c3cfc2bc6a',
                  trafficSignalConcept: {
                    id: '3536ac197567d5c95e40959ec4f822bc54c2726e405cea617bffa2117d80b9c8',
                    uri: 'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/3536ac197567d5c95e40959ec4f822bc54c2726e405cea617bffa2117d80b9c8',
                    code: 'GXb',
                    meaning: 'Einde van de reglementering.',
                    image:
                      'https://dev.roadsigns.lblod.info/files/35302f5c-034e-48f0-a4d7-baa28335ef4f/download',
                    type: 'https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept',
                    categories: [
                      {
                        id: '991b04b477b77bc7cf1414fb5d255cc4435dd9c1681e8de66f770710c1c83ad0',
                        uri: 'http://data.vlaanderen.be/id/concept/Verkeersbordcategorie/991b04b477b77bc7cf1414fb5d255cc4435dd9c1681e8de66f770710c1c83ad0',
                        label: 'Onderbord',
                      },
                    ],
                    instructions: [
                      {
                        id: '61ADE81BBF5C750009000022',
                        uri: 'http://data.lblod.info/templates/61ADE81BBF5C750009000022',
                        value:
                          'het einde van de parkeerreglementering wordt aangeduid',
                        preview:
                          'het einde van de parkeerreglementering wordt aangeduid',
                      },
                    ],
                    mainSigns: [
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/0b8edba107bc181f01ea9fcf241c76f6befff04e15a697acf1c6cdeb49e71868',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/137112aad6b994f965bfd6ceb7e88bf0162db8ac885e57439ef8cbee363fe579',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/4666c7f416e910d3b442c51c1c32bbe3ce9ad324c2f07badfad9610431bf1484',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/47c9ffa15a0316eb8144e48eed44bef295c2ea742b37ab6675268611cbbb5b64',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/4a2ec210cf9459059de87c11a70b40d957edeb78f302963e1a526a47406d11ec',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/4f857c0f9709924a47488596aee4387e2729c35b5dd512c5492a9b78715bd326',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/5446d50a99626e166d9c93fa1a1be0a5be5cb038388d837a5efdc316a441c5c0',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/9a99ae7486d2f485d6540fb82b5c12d732788b46dcc66a2a5fcd0966929c6a43',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/b5e9f13d81ac78f0002aac342f4eb866394598088cfe0276013b928afd1560f8',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/b667a243b8ec32abc8cae6ff5cdff6dafb667cf1ddec6ff015824b451895d4d2',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/bd68717b59b32f5cfc66e459f72f7fef6ff8bc33d9276dcc2ca7c8ca7e860371',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/c013a71f9cd0f6084cd5beac514f11edb27aeb99cb9ed375150567c71db3b061',
                      'http://data.vlaanderen.be/id/concept/Verkeersbordconcept/f74b9e8e4ddd1760f32d54063f96a3964846464bed031a942863f59f5187a268',
                    ],
                  },
                },
                {
                  id: 'test-traffic-signal-parkeerautomaat',
                  position: 5,
                  uri: 'https://data.vlaanderen.be/ns/mobiliteit#ontwerpverkeersteken/test-traffic-signal-parkeerautomaat',
                  designStatus:
                    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/467e89ae-0cfc-4a91-b29f-82c3cfc2bc6a',
                  trafficSignalConcept: {
                    id: '618ECD027BD6C80008000005',
                    uri: 'http://data.lblod.info/traffic-sign-concepts/618ECD027BD6C80008000005',
                    code: 'Parkeerautomaat',
                    meaning:
                      '1° Op plaatsen met parkeermeters of parkeerautomaten geschiedt het parkeren op de wijze en onder de voorwaarden die op deze toestellen zijn vermeld.\n\nWanneer meer dan één motorfiets binnen een afgebakend parkeervak bedoeld voor één auto wordt geparkeerd, dan moet voor dat parkeervak slechts één maal betaald worden.\n\n2° Is de parkeermeter of parkeerautomaat buiten gebruik, dan moet de parkeerschijf worden gebruikt volgens de nadere regels van 27.1.\n\n3° Het gebruik van de parkeerschijf is niet verplicht bij het parkeren op plaatsen met parkeermeters of parkeerautomaten, wanneer zij in een zone met beperkte parkeertijd liggen, behalve in het geval bedoeld in 27.3.1.2°.',
                    image:
                      'https://dev.roadsigns.lblod.info/files/61b20bcfb82487000d00000c/download',
                    type: 'https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept',
                    categories: [
                      {
                        id: '29ea3335e357e414d07229242607b352941c0c21e78760600cc0f5270f18c38b',
                        uri: 'http://data.vlaanderen.be/id/concept/Verkeersbordcategorie/29ea3335e357e414d07229242607b352941c0c21e78760600cc0f5270f18c38b',
                        label: 'StilstaanParkeerBord',
                      },
                    ],
                    instructions: [
                      {
                        id: '9ab97cfc-be37-4ecc-b346-01015ae8977b',
                        uri: 'http://data.lblod.info/templates/9ab97cfc-be37-4ecc-b346-01015ae8977b',
                        value:
                          'bestuurders moeten parkeren op de wijze en onder de voorwaarden die op de parkeerautomaat zijn vermeld',
                        preview:
                          'bestuurders moeten parkeren op de wijze en onder de voorwaarden die op de parkeerautomaat zijn vermeld',
                      },
                    ],
                    mainSigns: [],
                  },
                },
              ],
              measureConcept: {
                id: '61C091F2E324910008000630',
                uri: 'http://data.lblod.info/traffic-measure-concepts/61C091F2E324910008000630',
                label: 'E9a-GVIId-GVIId-GXa-GXd-GXb-Parkeerautomaat',
                templateString:
                  '${locatie} \nhet parkeren is toegelaten; \nhet parkeren is voorbehouden voor ${categorie_voertuig}; \nhet parkeren is betalend; \nhet begin van de parkeerreglementering wordt aangeduid; \nde parkeerreglementering geldt over een afstand van meer dan 300 meter; \nhet einde van de parkeerreglementering wordt aangeduid; \nbestuurders moeten parkeren op de wijze en onder de voorwaarden die op de parkeerautomaat zijn vermeld.\n',
                rawTemplateString:
                  '${locatie} \n${E9a}; \n${GVIId}; \n${GVIId2}; \n${GXa}; \n${GXd}; \n${GXb}; \n${Parkeerautomaat}.\n',
              },
              unusedSignalConcepts: [],
              unIncludedSignalConcepts: [],
              variableInstances: [
                {
                  id: 'test-variable-instance-categorie-voertuig',
                  uri: 'test-variable-instance-categorie-voertuig',
                  variable: {
                    id: '61AE3580BF5C750009000054',
                    uri: 'http://data.lblod.info/mappings/61AE3580BF5C750009000054',
                    type: 'codelist',
                    label: 'categorie_voertuig',
                    source: 'https://dev.roadsigns.lblod.info/sparql',
                    codelist:
                      'http://lblod.data.gift/concept-schemes/61AE3534BF5C750009000050',
                  },
                },
              ],
            },
            {
              id: 'test-measure-design-vl',
              uri: 'https://data.vlaanderen.be/ns/mobiliteit#maatregelontwerp/test-measure-design-vl',
              trafficSignals: [
                {
                  id: 'test-traffic-signal-vl611',
                  position: 0,
                  uri: 'https://data.vlaanderen.be/ns/mobiliteit#ontwerpverkeersteken/test-traffic-signal-vl611',
                  designStatus:
                    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/467e89ae-0cfc-4a91-b29f-82c3cfc2bc6a',
                  trafficSignalConcept: {
                    id: '45c13c91557317dd6b7b2b37023a3825',
                    uri: 'http://data.vlaanderen.be/id/concept/Verkeerslichtconcept/45c13c91557317dd6b7b2b37023a3825',
                    code: 'VL61.1',
                    meaning: 'Driekleurige verkeerslichten.',
                    image:
                      'https://dev.roadsigns.lblod.info/files/5e7e411d-84eb-4e7f-8e47-bc85b037eca7/download',
                    type: 'https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept',
                    categories: [],
                    instructions: [
                      {
                        id: '0857b80c-4a7e-448a-b727-a13d8725a474',
                        uri: 'http://data.lblod.info/templates/0857b80c-4a7e-448a-b727-a13d8725a474',
                        value:
                          'de bestuurders moeten de lichten van de  driekleurige verkeerslichten naleven',
                        preview:
                          'de bestuurders moeten de lichten van de  driekleurige verkeerslichten naleven',
                      },
                    ],
                    mainSigns: [],
                  },
                },
                {
                  id: 'test-traffic-signal-vl6119',
                  position: 1,
                  uri: 'https://data.vlaanderen.be/ns/mobiliteit#ontwerpverkeersteken/test-traffic-signal-vl6119',
                  designStatus:
                    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/fc1036e7-703b-4290-b732-49abb39d0588',
                  trafficSignalConcept: {
                    id: '43beae352a411bbaa01df58701348e0c',
                    uri: 'http://data.vlaanderen.be/id/concept/Verkeerslichtconcept/43beae352a411bbaa01df58701348e0c',
                    code: 'VL61.1.9',
                    meaning:
                      'Bijkomend oranjegeel knipperend verkeerslicht met fietssilhouet voor fietsers en bestuurders van tweewielige bromfietsen. Zij mogen het rood of oranjegeel verkeerslicht in de richting van de pijl voorbijrijden, mits voorrang te verlenen aan de andere weggebruikers. ',
                    image:
                      'https://dev.roadsigns.lblod.info/files/8a6f36ea-0a08-4824-8ae9-05c2356a5c6e/download',
                    type: 'https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept',
                    categories: [],
                    instructions: [
                      {
                        id: '64301A785BDCDA240120BDFD',
                        uri: 'http://data.lblod.info/templates/64301A785BDCDA240120BDFD',
                        value:
                          'wanneer het bijkomend oranjegeel knipperend licht met fietssilhouet en pijl tegelijk met een rood  of een oranjegeel licht brandt, mogen fietsers en bestuurders van tweewielige bromfietsen in de richting van de pijl verder rijden, op voorwaarde dat voorrang verleend wordt aan de bestuurders die op regelmatige wijze uit andere richtingen komen en aan voetgangers.',
                        preview:
                          'wanneer het bijkomend oranjegeel knipperend licht met fietssilhouet en pijl tegelijk met een rood  of een oranjegeel licht brandt, mogen fietsers en bestuurders van tweewielige bromfietsen in de richting van de pijl verder rijden, op voorwaarde dat voorrang verleend wordt aan de bestuurders die op regelmatige wijze uit andere richtingen komen en aan voetgangers.',
                      },
                    ],
                    mainSigns: [],
                  },
                },
              ],
              measureConcept: {
                id: '64301B335BDCDA240120BE07',
                uri: 'http://data.lblod.info/traffic-measure-concepts/64301B335BDCDA240120BE07',
                label: 'VL61.1-VL61.1.9',
                templateString:
                  '${locatie} \nde bestuurders moeten de lichten van de  driekleurige verkeerslichten naleven.\nwanneer het bijkomend oranjegeel knipperend licht met fietssilhouet en pijl tegelijk met een rood  of een oranjegeel licht brandt, mogen fietsers en bestuurders van tweewielige bromfietsen in de richting van de pijl verder rijden, op voorwaarde dat voorrang verleend wordt aan de bestuurders die op regelmatige wijze uit andere richtingen komen en aan voetgangers..',
                rawTemplateString: '${locatie} \n${VL61.1}.\n${VL61.1.9}.',
              },
              unusedSignalConcepts: [],
              unIncludedSignalConcepts: [],
              variableInstances: [],
            },
          ]),
        },
      ],
      inDocs: {
        'test-ar-design': Promise.resolve(1),
      },
    });
  instructionVariableQuery = (uri: string): Promise<Variable[]> => {
    if (!uri) {
      return Promise.resolve([]);
    }
    return Promise.resolve([
      {
        uri: 'http://data.lblod.info/mappings/61AE360CBF5C750009000055',
        label: 'categorie_voertuig',
        type: 'text',
        source: 'https://dev.roadsigns.lblod.info/sparql',
      },
      {
        uri: 'http://data.lblod.info/mappings/61AE3580BF5C750009000054',
        label: 'categorie_voertuig',
        type: 'codelist',
        codelistUri:
          'http://lblod.data.gift/concept-schemes/61AE3534BF5C750009000050',
        source: 'https://dev.roadsigns.lblod.info/sparql',
      },
      {
        uri: 'http://data.lblod.info/mappings/61AE3772BF5C750009000056',
        label: 'categorie_voertuig',
        type: 'codelist',
        codelistUri:
          'http://lblod.data.gift/concept-schemes/61AE3534BF5C750009000050',
        source: 'https://dev.roadsigns.lblod.info/sparql',
      },
      {
        uri: 'http://data.lblod.info/mappings/61AE3A86BF5C75000900005B',
        label: 'maximumduur_betalend_parkeren',
        type: 'codelist',
        codelistUri:
          'http://lblod.data.gift/concept-schemes/98ce0acb-a92d-4641-860e-d7f581810686',
        source: 'https://dev.roadsigns.lblod.info/sparql',
      },
      {
        uri: 'http://data.lblod.info/mappings/65C258C1F87130BD276778A9',
        label: 'tijdsvenster',
        type: 'codelist',
        codelistUri:
          'http://lblod.data.gift/concept-schemes/1a6fa842-0b50-4d41-9922-934cef57ed26',
        source: 'https://dev.roadsigns.lblod.info/sparql',
      },
      {
        uri: 'http://data.lblod.info/mappings/61AE3772BF5C750009000057',
        label: 'tijdsvenster',
        type: 'codelist',
        codelistUri:
          'http://lblod.data.gift/concept-schemes/1a6fa842-0b50-4d41-9922-934cef57ed26',
        source: 'https://dev.roadsigns.lblod.info/sparql',
      },
      {
        uri: 'http://data.lblod.info/mappings/61AE3AE0BF5C75000900005D',
        label: 'type_parkeerkaart',
        type: 'codelist',
        codelistUri:
          'http://lblod.data.gift/concept-schemes/cfde5b00-332a-4e0f-8791-413a40cec703',
        source: 'https://dev.roadsigns.lblod.info/sparql',
      },
    ]);
  };
  getState = (html: string) => {
    const schema = this.schema;
    const plugins =
      this.plugins instanceof Array ? this.plugins : this.plugins.plugins;
    const parser = ProseParser.fromSchema(schema);
    const doc = htmlToDoc(html, {
      schema: schema,
      parser,
    });

    const state = EditorState.create({
      doc,
      // We need to configure some additional (default) plugins for the headless editor
      // (they are already configured by default on the headful one)
      plugins: [
        defaultAttributeValueGeneration([
          {
            attribute: '__guid',
            generator() {
              return uuidv4();
            },
          },
          {
            attribute: '__rdfaId',
            generator() {
              return uuidv4();
            },
          },
        ]),
        removePropertiesOfDeletedNodes(),
        rdfaInfoPlugin(),
        onChangedPlugin,
        ...plugins,
      ],
    });
    return state;
  };

  // TODO ideally this function would be pulled into the editor. This way it could be unified with
  // the copy that exists in embeddable. This would require ideally passing in the schema and
  // plugins, but it could also be getState() that is passed in.
  /**
   * Use a headless prosemirror instance to load the given HTML, pass the state to the generator to
   * produce some transactions, then apply those transactions to the instance and pass back the
   * resulting HTML
   */
  processDocumentHeadlessly = (
    html: string,
    transactionGenerator: (
      state: EditorState,
    ) => TransactionCombinatorResult<boolean>,
  ): string => {
    let state = this.getState(html);
    const combResult = transactionGenerator(state);
    if (combResult.result.every((ok) => ok)) {
      state = state.applyTransaction(combResult.transaction).state;
    }
    const serializer = SaySerializer.fromSchema(state.schema, () => state);
    const div = document.createElement('div');
    const doc = serializer.serializeNode(state.doc, undefined);
    div.appendChild(doc);

    return div.innerHTML;
  };

  <template>
    <DummyContainer>
      <:header>
        <DebugTools @controller={{this.rdfaEditor}} />
      </:header>
      <:content>
        <EditorContainer
          @controller={{this.rdfaEditor}}
          @editorOptions={{hash showPaper=true}}
        >
          <:toolbar as |container|>
            <SampleToolbarResponsive
              @controller={{container.controller}}
              @enableHierarchicalList={{true}}
            >
              <DevModeToggle
                @enabled={{this.devMode}}
                @onToggle={{this.onDevModeToggle}}
              />
            </SampleToolbarResponsive>
          </:toolbar>
          <:default>
            <Editor
              @plugins={{this.plugins}}
              @schema={{this.schema}}
              @nodeViews={{this.nodeViews}}
              @rdfaEditorInit={{this.rdfaEditorInit}}
            />
          </:default>
          <:sidebarRight as |container|>
            <Sidebar as |Sb|>
              <Sb.Collapsible
                @title={{t "ember-rdfa-editor.insert"}}
                @expanded={{true}}
                as |Item|
              >
                <Item>
                  <CreateRelationshipButton
                    @controller={{container.controller}}
                    @node={{this.activeNode}}
                    @optionGeneratorConfig={{this.optionGeneratorConfigTaskified}}
                    @devMode={{this.devMode}}
                  />
                </Item>
                <Item>
                  <LinkPointerButton
                    @controller={{container.controller}}
                    @node={{this.activeNode}}
                    @optionGeneratorConfig={{this.optionGeneratorConfigTaskified}}
                  />
                </Item>
                <Item>
                  <RoadsignRegulationCard
                    @controller={{container.controller}}
                    @options={{this.pluginConfig.roadsignRegulation}}
                  />
                </Item>
                <Item>
                  <ArDesignSidebarWidget
                    @controller={{container.controller}}
                    @designQuery={{this.arDesignTest}}
                    @instructionVariableQuery={{this.instructionVariableQuery}}
                    @processDocumentHeadlessly={{this.processDocumentHeadlessly}}
                  />
                </Item>
              </Sb.Collapsible>
              <LinkSidebarWidget @controller={{container.controller}} />
              {{#if this.devMode}}
                <div class="au-u-flex au-u-flex--column au-u-flex--spaced-tiny">
                  <VisualiserCard
                    @controller={{container.controller}}
                    @config={{this.rdfa.visualizerConfig}}
                  />
                  <NodeControlsCard
                    @node={{this.activeNode}}
                    @controller={{container.controller}}
                  />
                  {{#if this.activeNode}}
                    <RelationshipEditorCard
                      @node={{this.activeNode}}
                      @controller={{container.controller}}
                      @optionGeneratorConfig={{this.optionGeneratorConfigTaskified}}
                    />
                    <DocImportedResourceEditorCard
                      @controller={{container.controller}}
                      @optionGeneratorConfig={{this.optionGeneratorConfigTaskified}}
                    />
                    <ImportedResourceLinkerCard
                      @node={{this.activeNode}}
                      @controller={{container.controller}}
                    />
                    <ExternalTripleEditorCard
                      @node={{this.activeNode}}
                      @controller={{container.controller}}
                    />
                    <DebugInfo @node={{this.activeNode}} />
                    <AttributeEditor
                      @node={{this.activeNode}}
                      @controller={{container.controller}}
                    />
                  {{/if}}
                </div>
              {{/if}}
            </Sidebar>
          </:sidebarRight>
        </EditorContainer>
      </:content>
    </DummyContainer>
  </template>
}
