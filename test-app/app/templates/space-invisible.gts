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
} from '@lblod/ember-rdfa-editor/plugins/text-style';
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
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { image, imageView } from '@lblod/ember-rdfa-editor/plugins/image';
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
  space,
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
import type { PluginConfig } from '@lblod/ember-rdfa-editor';
import { emberApplication } from '@lblod/ember-rdfa-editor/plugins/ember-application';
import { headingWithConfig } from '@lblod/ember-rdfa-editor/plugins/heading/nodes/heading';
import { getOwner } from '@ember/owner';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import Component from '@glimmer/component';
import DummyContainer from 'test-app/components/dummy-container';
import EditorContainer from '@lblod/ember-rdfa-editor/components/editor-container';
import SampleToolbarResponsive from 'test-app/components/sample-toolbar-responsive';
import Sidebar from '@lblod/ember-rdfa-editor/components/sidebar';
import DebugTools from '@lblod/ember-rdfa-editor/components/debug-tools';
import Editor from '@lblod/ember-rdfa-editor/components/editor';
import LinkEditor from '@lblod/ember-rdfa-editor/components/plugins/link/link-editor';
import { hash } from '@ember/helper';

export default class extends Component {
  @tracked rdfaEditor?: SayController;
  @tracked editable = true;
  @service declare intl: IntlService;
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
      heading: headingWithConfig(),
      blockquote,

      horizontal_rule,
      code_block,

      text,

      image,

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

  toggleEditable = () => {
    this.editable = !this.editable;
  };

  @tracked plugins: PluginConfig = [
    firefoxCursorFix(),
    chromeHacksPlugin(),
    lastKeyPressedPlugin,
    tablePlugin,
    tableKeymap,
    linkPasteHandler(this.schema.nodes.link),
    createInvisiblesPlugin(
      [hardBreak, paragraphInvisible, headingInvisible, space],
      {
        shouldShowInvisibles: false,
      },
    ),
    inputRules({
      rules: [
        bullet_list_input_rule(this.schema.nodes.bullet_list),
        ordered_list_input_rule(this.schema.nodes.ordered_list),
      ],
    }),
    emberApplication({ application: unwrap(getOwner(this)) }),
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
        <EditorContainer @editorOptions={{hash showPaper=true}}>
          <:top>
            {{#if this.rdfaEditor}}
              <SampleToolbarResponsive @controller={{this.rdfaEditor}} />
            {{/if}}
          </:top>
          <:default>
            <Editor
              @plugins={{this.plugins}}
              @schema={{this.schema}}
              {{! @glint-expect-error }}
              @nodeViews={{this.nodeViews}}
              @rdfaEditorInit={{this.rdfaEditorInit}}
            />
          </:default>
          <:aside>
            <Sidebar>
              <LinkEditor @controller={{this.rdfaEditor}} />
            </Sidebar>
          </:aside>
        </EditorContainer>
      </:content>
    </DummyContainer>
  </template>
}
