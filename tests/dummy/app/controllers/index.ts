import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import {
  ProseController,
  WidgetSpec,
} from '@lblod/ember-rdfa-editor/core/prosemirror';
import { Plugin } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';
import {
  em,
  link,
  strikethrough,
  strong,
  underline,
} from '@lblod/ember-rdfa-editor/marks';
import {
  block_rdfa,
  blockquote,
  bullet_list,
  code_block,
  doc,
  hard_break,
  heading,
  horizontal_rule,
  image,
  inline_rdfa,
  list_item,
  ordered_list,
  paragraph,
  placeholder,
  repaired_block,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import {
  tableKeymap,
  tableMenu,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { code } from 'dummy/dummy-plugins/code-mark-plugin';
import applyDevTools from 'prosemirror-dev-tools';
import { invisible_rdfa } from '@lblod/ember-rdfa-editor/nodes/inline-rdfa';
import {
  subscript,
  subscriptWidget,
} from '@lblod/ember-rdfa-editor/plugins/subscript';
import {
  superscript,
  superscriptWidget,
} from '@lblod/ember-rdfa-editor/plugins/superscript';

const nodes = {
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
};
const marks = {
  inline_rdfa,
  code,
  link,
  em,
  strong,
  underline,
  strikethrough,
  subscript,
  superscript,
};
const dummySchema = new Schema({ nodes, marks });

export default class IndexController extends Controller {
  @tracked rdfaEditor?: ProseController;
  @tracked plugins: Plugin[] = [tablePlugin, tableKeymap];
  @tracked widgets: WidgetSpec[] = [
    tableMenu,
    subscriptWidget,
    superscriptWidget,
  ];
  schema: Schema = dummySchema;

  @action
  rdfaEditorInit(rdfaEditor: ProseController) {
    const presetContent = localStorage.getItem('EDITOR_CONTENT') ?? '';
    this.rdfaEditor = rdfaEditor;
    this.rdfaEditor.setHtmlContent(presetContent);
    applyDevTools(rdfaEditor.view);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }

  @action
  togglePlugin() {
    console.warn('Live toggling plugins is currently not supported');
  }
}
