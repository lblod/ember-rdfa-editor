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
import { NodeViewConstructor } from '@lblod/ember-rdfa-editor';
import { inlineRdfaView } from '@lblod/ember-rdfa-editor/nodes/inline-rdfa';

const nodes = {
  doc,
  paragraph,

  repaired_block,

  list_item,
  ordered_list,
  bullet_list,
  placeholder,
  ...tableNodes({ tableGroup: 'block', cellContent: 'inline*' }),
  heading,
  blockquote,

  horizontal_rule,
  code_block,

  text,

  image,

  hard_break,
  inline_rdfa,
  block_rdfa,
};
const marks = {
  code,
  link,
  em,
  strong,
  underline,
  strikethrough,
};
const dummySchema = new Schema({ nodes, marks });

export default class IndexController extends Controller {
  @tracked rdfaEditor?: ProseController;
  @tracked plugins: Plugin[] = [tablePlugin, tableKeymap];
  @tracked widgets: WidgetSpec[] = [tableMenu];

  @tracked nodeViews: (
    proseController: ProseController
  ) => Record<string, NodeViewConstructor> = (proseController) => {
    return {
      inline_rdfa: inlineRdfaView(proseController),
    };
  };
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
