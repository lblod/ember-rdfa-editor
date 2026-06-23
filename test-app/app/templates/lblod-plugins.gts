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
import ArDesignSidebarWidget from '@lblod/say-ar-design-plugin/components/sidebar-widget';

import SampleToolbarResponsive from 'test-app/components/sample-toolbar-responsive';
import DevModeToggle from 'test-app/components/dev-mode-toggle';
import DummyContainer from 'test-app/components/dummy-container';
import type ArDesign from '@lblod/say-ar-design-plugin/plugin/models/ar-design';
import type { DesignInfo } from '@lblod/say-ar-design-plugin/plugin/types';

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
  ];

  @tracked nodeViews = (controller: SayController) => {
    return {
      link: linkView(this.linkOptions)(controller),
      image: imageView(controller),
      inline_rdfa: inlineRdfaWithConfigView({ rdfaAware: true })(controller),
      block_rdfa: (...args: Parameters<NodeViewConstructor>) =>
        // in tests in a consuming app, so there must be something wrong with the test-app config
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
          id: 'test',
          uri: 'test',
          name: 'test',
          date: new Date(),
          measureDesigns: Promise.resolve([
            {
              id: 'test',
              uri: 'test',
              trafficSignals: [
                {
                  id: 'test',
                  uri: 'test',
                  designStatus:
                    'https://data.vlaanderen.be/id/concept/Verkeerstekenontwerpstatus/fc1036e7-703b-4290-b732-49abb39d0588',
                  trafficSignalConcept: {
                    id: 'test',
                    uri: 'test',
                    code: 'Parkeerautomaat',
                    type: 'https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept',
                    categories: [
                      {
                        id: 'test',
                        uri: 'http://data.vlaanderen.be/id/concept/Verkeersbordcategorie/29ea3335e357e414d07229242607b352941c0c21e78760600cc0f5270f18c38b',
                        label: 'StilstaanParkeerBord',
                      },
                    ],
                  },
                },
              ],
              measureConcept: {
                id: 'test',
                uri: 'test',
                label: 'E9a-GVIId-GVIId-GXa-GXd-GXb-Parkeerautomaat',
                templateString:
                  '${locatie} \nhet parkeren is toegelaten; \nhet parkeren is voorbehouden voor ${categorie_voertuig}; \nhet parkeren is betalend; de parkeerreglementering is beperkt in de tijd ${maximumduur_betalend_parkeren}; \nhet begin van de parkeerreglementering wordt aangeduid; \nde parkeerreglementering geldt over een afstand van meer dan 300 meter; \nhet einde van de parkeerreglementering wordt aangeduid; \nbestuurders moeten parkeren op de wijze en onder de voorwaarden die op de parkeerautomaat zijn vermeld.',
                rawTemplateString:
                  '${locatie} \n${E9a}; \n${GVIId}; \n${GVIId2}; \n${GXa}; \n${GXd}; \n${GXb}; \n${Parkeerautomaat}.',
              },
              unusedSignalConcepts: [],
              unIncludedSignalConcepts: [],
              variableInstances: [
                {
                  id: 'test1',
                  uri: 'test1',
                  variable: {
                    id: 'test1',
                    uri: 'test1',
                    type: 'codelist',
                    label: 'categorie_voertuig',
                    source: 'https://roadsigns.lblod.info/sparql',
                    codelist:
                      'http://lblod.data.gift/concept-schemes/61AE3534BF5C750009000050',
                  },
                },
                {
                  id: 'test2',
                  uri: 'test2',
                  variable: {
                    id: 'test2',
                    uri: 'test2',
                    type: 'codelist',
                    label: 'maximumduur_betalend_parkeren',
                    source: 'https://roadsigns.lblod.info/sparql',
                    codelist:
                      'http://lblod.data.gift/concept-schemes/98ce0acb-a92d-4641-860e-d7f581810686',
                  },
                },
                {
                  id: 'test3',
                  uri: 'test3',
                  variable: {
                    id: 'test3',
                    uri: 'test3',
                    type: 'location',
                    label: 'locatie',
                    source: 'https://roadsigns.lblod.info/sparql',
                  },
                },
              ],
            },
          ]),
        },
      ],
      inDocs: {
        test: Promise.resolve(1),
      },
    });
  processDocumentHeadlessly = () => {
    console.warn('Not implemented');
    return 'Not implemented';
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
