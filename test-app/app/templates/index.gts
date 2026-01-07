import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { Schema, type PluginConfig } from '@lblod/ember-rdfa-editor';
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
import { invisibleRdfaWithConfig } from '@lblod/ember-rdfa-editor/nodes/invisible-rdfa';
import {
  tableKeymap,
  tableNodes,
  tablePlugins,
} from '@lblod/ember-rdfa-editor/plugins/table';
import {
  imageWithConfig,
  imageView,
  checkPasteSize,
} from '@lblod/ember-rdfa-editor/plugins/image';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import {
  bulletListWithConfig,
  listItemWithConfig,
  orderedListWithConfig,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import { inline_rdfa } from '@lblod/ember-rdfa-editor/marks';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import {
  link,
  linkPasteHandler,
  linkView,
} from '@lblod/ember-rdfa-editor/plugins/link';
import { service } from '@ember/service';
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
import { inputRules } from '@lblod/ember-rdfa-editor';
import { chromeHacksPlugin } from '@lblod/ember-rdfa-editor/plugins/chrome-hacks-plugin';
import { emberApplication } from '@lblod/ember-rdfa-editor/plugins/ember-application';
import { headingWithConfig } from '@lblod/ember-rdfa-editor/plugins/heading/nodes/heading';
import { getOwner } from '@ember/owner';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import Component from '@glimmer/component';
import DummyContainer from 'test-app/components/dummy-container';
import SampleToolbarResponsive from 'test-app/components/sample-toolbar-responsive';

import DebugTools from '@lblod/ember-rdfa-editor/components/debug-tools';
import EditorContainer from '@lblod/ember-rdfa-editor/components/editor-container';
import Editor from '@lblod/ember-rdfa-editor/components/editor';
import Sidebar from '@lblod/ember-rdfa-editor/components/sidebar';
import LinkEditor from '@lblod/ember-rdfa-editor/components/plugins/link/link-editor';
import TableTooltip from '@lblod/ember-rdfa-editor/components/plugins/table/table-tooltip';

import { hash } from '@ember/helper';

export default class extends Component {
  @tracked rdfaEditor?: SayController;
  @service declare intl: IntlService;
  schema = new Schema({
    nodes: {
      doc: docWithConfig({
        defaultLanguage: 'nl-BE',
      }),
      paragraph,

      repaired_block: repairedBlockWithConfig(),

      list_item: listItemWithConfig({ enableHierarchicalList: true }),
      ordered_list: orderedListWithConfig({ enableHierarchicalList: true }),
      bullet_list: bulletListWithConfig({ enableHierarchicalList: true }),
      placeholder,
      ...tableNodes({
        tableGroup: 'block',
        cellContent: 'block+',
        inlineBorderStyle: { width: '0.5px', color: '#CCD1D9' },
        rowBackground: {
          odd: 'whitesmoke',
        },
      }),
      heading: headingWithConfig(),
      blockquote,

      horizontal_rule,
      code_block,

      text,

      image: imageWithConfig({ allowBase64Images: true }),

      hard_break,
      invisible_rdfa: invisibleRdfaWithConfig(),
      block_rdfa: blockRdfaWithConfig(),
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
      ],
    }),
    emberApplication({ application: unwrap(getOwner(this)) }),
    checkPasteSize({}),
  ];

  @tracked nodeViews = (controller: SayController) => {
    return {
      link: linkView(this.linkOptions)(controller),
      image: imageView(controller),
    };
  };

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
    <DummyContainer>
      <:header>
        <DebugTools @controller={{this.rdfaEditor}} />
      </:header>
      <:content>
        <EditorContainer
          @controller={{this.rdfaEditor}}
          @editorOptions={{hash
            showPaper=true
            showSidebarLeft=false
            showSidebarRight=false
          }}
        >
          <:toolbar as |container|>
            <SampleToolbarResponsive
              @controller={{container.controller}}
              @enableHierarchicalList={{true}}
            />
          </:toolbar>
          <:default>
            <Editor
              @plugins={{this.plugins}}
              @schema={{this.schema}}
              {{! @glint-expect-error }}
              @nodeViews={{this.nodeViews}}
              @rdfaEditorInit={{this.rdfaEditorInit}}
            />
            {{#if this.rdfaEditor}}
              <TableTooltip @controller={{this.rdfaEditor}} />
            {{/if}}
          </:default>
          <:sidebarRight as |container|>
            <Sidebar>
              <LinkEditor @controller={{container.controller}} />
            </Sidebar>
          </:sidebarRight>
        </EditorContainer>
      </:content>
    </DummyContainer>
  </template>
}
