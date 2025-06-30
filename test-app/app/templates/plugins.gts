import { action } from '@ember/object';
import { inputRules, type PluginConfig } from '@lblod/ember-rdfa-editor';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import { inline_rdfa } from '@lblod/ember-rdfa-editor/marks';
import {
  blockRdfaWithConfig,
  docWithConfig,
  hard_break,
  horizontal_rule,
  invisibleRdfaWithConfig,
  paragraph,
  repairedBlockWithConfig,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import { chromeHacksPlugin } from '@lblod/ember-rdfa-editor/plugins/chrome-hacks-plugin';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import { code } from '@lblod/ember-rdfa-editor/plugins/code/marks/code';
import { color } from '@lblod/ember-rdfa-editor/plugins/color/marks/color';
import { emberApplication } from '@lblod/ember-rdfa-editor/plugins/ember-application';
import { firefoxCursorFix } from '@lblod/ember-rdfa-editor/plugins/firefox-cursor-fix';
import { highlight } from '@lblod/ember-rdfa-editor/plugins/highlight/marks/highlight';
import { image, imageView } from '@lblod/ember-rdfa-editor/plugins/image';
import {
  createInvisiblesPlugin,
  hardBreak,
  heading as headingInvisible,
  paragraph as paragraphInvisible,
} from '@lblod/ember-rdfa-editor/plugins/invisibles';
import {
  link,
  linkPasteHandler,
  linkView,
} from '@lblod/ember-rdfa-editor/plugins/link';
import {
  bulletListWithConfig,
  listItemWithConfig,
  orderedListWithConfig,
} from '@lblod/ember-rdfa-editor/plugins/list';
import {
  bullet_list_input_rule,
  ordered_list_input_rule,
} from '@lblod/ember-rdfa-editor/plugins/list/input_rules';
import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import {
  tableKeymap,
  tableNodes,
  tablePlugins,
} from '@lblod/ember-rdfa-editor/plugins/table';
import {
  em,
  strikethrough,
  strong,
  subscript,
  superscript,
  underline,
} from '@lblod/ember-rdfa-editor/plugins/text-style/index';
import type { SayNodeViewConstructor } from '@lblod/ember-rdfa-editor/utils/ember-node';
import { Schema } from '@lblod/ember-rdfa-editor';
import { tracked } from 'tracked-built-ins';
import {
  card,
  cardView,
  counter,
  counterView,
  dropdown,
  dropdownView,
} from '../dummy-nodes';
import { heading } from '@lblod/ember-rdfa-editor/plugins/heading/nodes/heading';
import { getOwner } from '@ember/owner';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { modifier } from 'ember-modifier';
import {
  sample_block,
  sampleBlockView,
} from 'test-app/dummy-nodes/sample-block';
import Component from '@glimmer/component';
import DummyContainer from 'test-app/components/dummy-container';
import EditorContainer from '@lblod/ember-rdfa-editor/components/editor-container';
import { hash } from '@ember/helper';
import SampleToolbarResponsive from 'test-app/components/sample-toolbar-responsive';
import Sidebar from 'test-app/components/sample-ember-nodes/sidebar';
import DebugTools from '@lblod/ember-rdfa-editor/components/debug-tools';
import Editor from '@lblod/ember-rdfa-editor/components/editor';

const DEFAULT_SIDEBAR_EXPANDED = true;
const SIDEBAR_EXPANDED_LOCAL_STORAGE_KEY = 'editor-sidebar-expanded';

export default class extends Component {
  @tracked sidebarExpanded: boolean = DEFAULT_SIDEBAR_EXPANDED;

  loadConfig = modifier(() => {
    const sidebarExpandedStr = localStorage.getItem(
      SIDEBAR_EXPANDED_LOCAL_STORAGE_KEY,
    );
    if (sidebarExpandedStr) {
      this.sidebarExpanded = JSON.parse(sidebarExpandedStr) as boolean;
    }
  });

  @action
  onSidebarToggle(expanded: boolean) {
    this.sidebarExpanded = expanded;
    localStorage.setItem(
      SIDEBAR_EXPANDED_LOCAL_STORAGE_KEY,
      JSON.stringify(expanded),
    );
  }

  @tracked rdfaEditor?: SayController;

  schema = new Schema({
    nodes: {
      doc: docWithConfig({
        defaultLanguage: 'nl-BE',
      }),
      paragraph,

      repaired_block: repairedBlockWithConfig(),

      list_item: listItemWithConfig(),
      ordered_list: orderedListWithConfig(),
      bullet_list: bulletListWithConfig(),
      placeholder,
      ...tableNodes({
        tableGroup: 'block',
        cellContent: 'block+',
        inlineBorderStyle: { width: '0.5px', color: '#CCD1D9' },
      }),
      heading,
      blockquote,

      horizontal_rule,
      code_block,

      text,

      image,

      hard_break,
      invisible_rdfa: invisibleRdfaWithConfig(),
      block_rdfa: blockRdfaWithConfig(),
      card,
      counter,
      dropdown,
      sample_block,
      link: link(this.linkOptions),
    },
    marks: {
      inline_rdfa,
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
    };
  }

  @tracked nodeViews: (
    proseController: SayController,
  ) => Record<string, SayNodeViewConstructor> = (proseController) => {
    return {
      card: cardView(proseController),
      counter: counterView(proseController),
      dropdown: dropdownView(proseController),
      link: linkView(this.linkOptions)(proseController),
      image: imageView(proseController),
      sample_block: sampleBlockView(proseController),
    };
  };
  @tracked plugins: PluginConfig = [
    firefoxCursorFix(),
    chromeHacksPlugin(),
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
  ];

  @action
  rdfaEditorInit(rdfaEditor: SayController) {
    const presetContent = localStorage.getItem('EDITOR_CONTENT') ?? '';
    this.rdfaEditor = rdfaEditor;
    this.rdfaEditor.initialize(presetContent, { doNotClean: true });
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }

  @action
  togglePlugin() {
    console.warn('Live toggling plugins is currently not supported');
  }

  <template>
    <DummyContainer {{this.loadConfig}}>
      <:header>
        <DebugTools @controller={{this.rdfaEditor}} />
      </:header>
      <:content>
        <EditorContainer
          @controller={{this.rdfaEditor}}
          @editorOptions={{hash showPaper=true}}
        >
          <:toolbar as |container|>
            <SampleToolbarResponsive @controller={{container.controller}} />
          </:toolbar>
          <:default>
            <Editor
              @plugins={{this.plugins}}
              @schema={{this.schema}}
              {{! @glint-expect-error }}
              @nodeViews={{this.nodeViews}}
              @rdfaEditorInit={{this.rdfaEditorInit}}
            />
          </:default>
          <:sidebarRight as |container|>
            <Sidebar
              @expanded={{this.sidebarExpanded}}
              @onToggle={{this.onSidebarToggle}}
              @controller={{container.controller}}
            />
          </:sidebarRight>
        </EditorContainer>
      </:content>
    </DummyContainer>
  </template>
}
