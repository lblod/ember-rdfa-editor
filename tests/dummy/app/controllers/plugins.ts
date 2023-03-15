import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { Plugin } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';
import {
  block_rdfa,
  doc,
  hard_break,
  horizontal_rule,
  invisible_rdfa,
  paragraph,
  repaired_block,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import { highlightPlugin } from 'dummy/dummy-plugins/highlight-plugin';
import { NodeViewConstructor } from 'prosemirror-view';
import applyDevTools from 'prosemirror-dev-tools';
import { code } from '@lblod/ember-rdfa-editor/plugins/code/marks/code';
import {
  card,
  cardView,
  counter,
  counterView,
  dropdown,
  dropdownView,
} from '../dummy-nodes';
import {
  tableKeymap,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { image } from '@lblod/ember-rdfa-editor/plugins/image';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import {
  em,
  strikethrough,
  strong,
  subscript,
  superscript,
  underline,
} from '@lblod/ember-rdfa-editor/plugins/text-style';
import { heading } from '@lblod/ember-rdfa-editor/plugins/heading';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import {
  bullet_list,
  list_item,
  ordered_list,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import { inline_rdfa } from '@lblod/ember-rdfa-editor/marks';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import {
  link,
  linkPasteHandler,
  linkView,
} from '@lblod/ember-rdfa-editor/plugins/link';
import { highlight } from '@lblod/ember-rdfa-editor/plugins/highlight/marks/highlight';

export default class IndexController extends Controller {
  @tracked rdfaEditor?: SayController;
  schema = new Schema({
    nodes: {
      doc,
      paragraph,

      repaired_block,

      list_item,
      ordered_list,
      bullet_list,
      placeholder,
      ...tableNodes({ tableGroup: 'block', cellContent: 'block+' }),
      heading,
      blockquote,

      horizontal_rule,
      code_block,

      text,

      image,

      hard_break,
      invisible_rdfa,
      block_rdfa,
      card,
      counter,
      dropdown,
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
    },
  });

  get linkOptions() {
    return {
      interactive: true,
    };
  }

  @tracked nodeViews: (
    proseController: SayController
  ) => Record<string, NodeViewConstructor> = (proseController) => {
    return {
      card: cardView(proseController),
      counter: counterView(proseController),
      dropdown: dropdownView(proseController),
      link: linkView(this.linkOptions)(proseController),
    };
  };
  @tracked plugins: Plugin[] = [
    highlightPlugin({ testKey: 'yeet' }),
    tablePlugin,
    tableKeymap,
    linkPasteHandler(this.schema.nodes.link),
    // disabled until https://binnenland.atlassian.net/browse/GN-4152 is fixed
    // createInvisiblesPlugin(
    //   [space, hardBreak, paragraphInvisible, headingInvisible],
    //   {
    //     shouldShowInvisibles: false,
    //   }
    // ),
  ];

  @action
  rdfaEditorInit(rdfaEditor: SayController) {
    const presetContent = localStorage.getItem('EDITOR_CONTENT') ?? '';
    this.rdfaEditor = rdfaEditor;
    this.rdfaEditor.setHtmlContent(presetContent);
    applyDevTools(rdfaEditor.mainEditorView);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }

  @action
  togglePlugin() {
    console.warn('Live toggling plugins is currently not supported');
  }
}
